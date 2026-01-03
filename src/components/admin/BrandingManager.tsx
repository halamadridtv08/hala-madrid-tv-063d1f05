import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2, Upload, Palette, Info } from "lucide-react";
import { MediaUploader } from "./MediaUploader";

interface BrandingSettings {
  id: string;
  logo_url: string | null;
  favicon_url: string | null;
  site_name: string;
}

// Couleurs réelles du site (définies dans index.css)
const SITE_COLORS = {
  primary: { hex: '#1976D2', name: 'Bleu Madrid', css: '210 79% 46%' },
  secondary: { hex: '#FFD700', name: 'Or Madrid', css: '47 100% 50%' },
  accent: { hex: '#F59E0B', name: 'Ambre', css: '38 92% 50%' }
};

export function BrandingManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('branding_settings')
        .select('id, logo_url, favicon_url, site_name')
        .limit(1)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('branding_settings')
        .update({
          logo_url: settings.logo_url,
          favicon_url: settings.favicon_url,
          site_name: settings.site_name
        })
        .eq('id', settings.id);

      if (error) throw error;
      toast({ title: "Succès", description: "Branding sauvegardé avec succès" });
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return <p className="text-muted-foreground">Aucun paramètre trouvé</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Branding</h2>
          <p className="text-muted-foreground">Personnalisez l'apparence de votre site</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Sauvegarder
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identity Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Identité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Nom du site</Label>
              <Input
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                placeholder="HalaMadrid TV"
              />
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <MediaUploader
                onSuccess={(url) => setSettings({ ...settings, logo_url: url })}
                bucketName="media"
                acceptTypes="image/*"
              />
              {settings.logo_url && (
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <img src={settings.logo_url} alt="Logo" className="h-12 object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Favicon</Label>
              <MediaUploader
                onSuccess={(url) => setSettings({ ...settings, favicon_url: url })}
                bucketName="media"
                acceptTypes="image/*"
              />
              {settings.favicon_url && (
                <div className="mt-2 p-4 bg-muted rounded-lg flex items-center gap-2">
                  <img src={settings.favicon_url} alt="Favicon" className="h-8 w-8 object-contain" />
                  <span className="text-sm text-muted-foreground">32x32 recommandé</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Colors - Read Only */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Couleurs du site
              <span className="text-xs font-normal text-muted-foreground ml-2">(lecture seule)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Couleur principale</Label>
              <div className="flex items-center gap-2">
                <div 
                  className="h-10 w-14 rounded border border-border"
                  style={{ backgroundColor: SITE_COLORS.primary.hex }}
                />
                <Input
                  value={`${SITE_COLORS.primary.hex} - ${SITE_COLORS.primary.name}`}
                  readOnly
                  className="flex-1 bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Couleur secondaire</Label>
              <div className="flex items-center gap-2">
                <div 
                  className="h-10 w-14 rounded border border-border"
                  style={{ backgroundColor: SITE_COLORS.secondary.hex }}
                />
                <Input
                  value={`${SITE_COLORS.secondary.hex} - ${SITE_COLORS.secondary.name}`}
                  readOnly
                  className="flex-1 bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Couleur d'accent</Label>
              <div className="flex items-center gap-2">
                <div 
                  className="h-10 w-14 rounded border border-border"
                  style={{ backgroundColor: SITE_COLORS.accent.hex }}
                />
                <Input
                  value={`${SITE_COLORS.accent.hex} - ${SITE_COLORS.accent.name}`}
                  readOnly
                  className="flex-1 bg-muted"
                />
              </div>
            </div>

            {/* Color Preview */}
            <div className="space-y-2">
              <Label>Aperçu des couleurs</Label>
              <div className="flex gap-2">
                <div 
                  className="flex-1 h-16 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                  style={{ backgroundColor: SITE_COLORS.primary.hex }}
                >
                  Principale
                </div>
                <div 
                  className="flex-1 h-16 rounded-lg flex items-center justify-center text-gray-900 font-medium text-sm"
                  style={{ backgroundColor: SITE_COLORS.secondary.hex }}
                >
                  Secondaire
                </div>
                <div 
                  className="flex-1 h-16 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                  style={{ backgroundColor: SITE_COLORS.accent.hex }}
                >
                  Accent
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="pt-6 flex gap-3">
          <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300">
            Les couleurs du site sont définies dans le code CSS et ne peuvent pas être modifiées depuis cette interface. 
            Seuls le <strong>logo</strong>, le <strong>favicon</strong> et le <strong>nom du site</strong> sont appliqués dynamiquement au site public.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
