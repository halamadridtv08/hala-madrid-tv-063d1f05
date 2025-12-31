import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2, Upload, Palette } from "lucide-react";
import { MediaUploader } from "./MediaUploader";

interface BrandingSettings {
  id: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  site_name: string;
}

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
        .select('*')
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
          primary_color: settings.primary_color,
          secondary_color: settings.secondary_color,
          accent_color: settings.accent_color,
          site_name: settings.site_name
        })
        .eq('id', settings.id);

      if (error) throw error;
      toast({ title: "Succès", description: "Branding sauvegardé" });
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
        {/* General Settings */}
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

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Couleurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Couleur principale</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="h-10 w-14 rounded cursor-pointer border-0"
                />
                <Input
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  placeholder="#8B5CF6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Couleur secondaire</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="h-10 w-14 rounded cursor-pointer border-0"
                />
                <Input
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  placeholder="#D946EF"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Couleur d'accent</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.accent_color}
                  onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                  className="h-10 w-14 rounded cursor-pointer border-0"
                />
                <Input
                  value={settings.accent_color}
                  onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                  placeholder="#F97316"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Color Preview */}
            <div className="space-y-2">
              <Label>Aperçu des couleurs</Label>
              <div className="flex gap-2">
                <div 
                  className="flex-1 h-16 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  Principale
                </div>
                <div 
                  className="flex-1 h-16 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                  style={{ backgroundColor: settings.secondary_color }}
                >
                  Secondaire
                </div>
                <div 
                  className="flex-1 h-16 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                  style={{ backgroundColor: settings.accent_color }}
                >
                  Accent
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Les changements de couleurs nécessitent une modification manuelle du fichier <code>index.css</code> pour être appliqués. 
            Les valeurs configurées ici sont sauvegardées pour référence.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
