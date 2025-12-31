import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Loader2, Crown, Trophy, Calendar, Star, Zap, Heart, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Feature {
  icon: string;
  label: string;
}

interface WelcomePopupSettings {
  id: string;
  is_enabled: boolean;
  title: string;
  subtitle: string;
  button_text: string;
  delay_ms: number;
  features: Feature[];
}

const ICON_OPTIONS = [
  { value: 'crown', label: 'Couronne', icon: Crown },
  { value: 'trophy', label: 'Trophée', icon: Trophy },
  { value: 'calendar', label: 'Calendrier', icon: Calendar },
  { value: 'star', label: 'Étoile', icon: Star },
  { value: 'zap', label: 'Éclair', icon: Zap },
  { value: 'heart', label: 'Cœur', icon: Heart },
];

export function WelcomePopupManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<WelcomePopupSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('welcome_popup_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      
      setSettings({
        ...data,
        features: (data.features as unknown as Feature[]) || []
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('welcome_popup_settings')
        .update({
          is_enabled: settings.is_enabled,
          title: settings.title,
          subtitle: settings.subtitle,
          button_text: settings.button_text,
          delay_ms: settings.delay_ms,
          features: JSON.parse(JSON.stringify(settings.features))
        })
        .eq('id', settings.id);

      if (error) throw error;
      toast({ title: "Succès", description: "Paramètres sauvegardés" });
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    if (!settings) return;
    const newFeatures = [...settings.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setSettings({ ...settings, features: newFeatures });
  };

  const addFeature = () => {
    if (!settings || settings.features.length >= 4) return;
    setSettings({
      ...settings,
      features: [...settings.features, { icon: 'star', label: 'Nouvelle fonctionnalité' }]
    });
  };

  const removeFeature = (index: number) => {
    if (!settings) return;
    const newFeatures = settings.features.filter((_, i) => i !== index);
    setSettings({ ...settings, features: newFeatures });
  };

  const getIconComponent = (iconName: string) => {
    const option = ICON_OPTIONS.find(o => o.value === iconName);
    return option ? option.icon : Star;
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres du Popup de Bienvenue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Activer le popup</Label>
              <p className="text-xs text-muted-foreground">Afficher le popup aux nouveaux visiteurs</p>
            </div>
            <Switch
              checked={settings.is_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, is_enabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label>Titre</Label>
            <Input
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              placeholder="¡Bienvenido Madridista!"
            />
          </div>

          <div className="space-y-2">
            <Label>Sous-titre</Label>
            <Input
              value={settings.subtitle}
              onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
              placeholder="Votre nouvelle destination..."
            />
          </div>

          <div className="space-y-2">
            <Label>Texte du bouton</Label>
            <Input
              value={settings.button_text}
              onChange={(e) => setSettings({ ...settings, button_text: e.target.value })}
              placeholder="¡Hala Madrid!"
            />
          </div>

          <div className="space-y-2">
            <Label>Délai d'affichage (ms)</Label>
            <Input
              type="number"
              value={settings.delay_ms}
              onChange={(e) => setSettings({ ...settings, delay_ms: parseInt(e.target.value) || 500 })}
              placeholder="500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Fonctionnalités affichées</Label>
              {settings.features.length < 4 && (
                <Button size="sm" variant="outline" onClick={addFeature}>
                  <Plus className="h-3 w-3 mr-1" />
                  Ajouter
                </Button>
              )}
            </div>
            
            {settings.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Select
                  value={feature.icon}
                  onValueChange={(v) => updateFeature(index, 'icon', v)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="h-4 w-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={feature.label}
                  onChange={(e) => updateFeature(index, 'label', e.target.value)}
                  className="flex-1"
                />
                <Button size="icon" variant="ghost" onClick={() => removeFeature(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Sauvegarder
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20 rounded-xl p-6 shadow-lg">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Crown className="h-10 w-10 text-primary" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-center mb-2">{settings.title}</h3>
            <p className="text-sm text-muted-foreground text-center mb-6">{settings.subtitle}</p>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              {settings.features.map((feature, index) => {
                const IconComponent = getIconComponent(feature.icon);
                return (
                  <div key={index} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-primary/5">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <span className="text-xs text-center">{feature.label}</span>
                  </div>
                );
              })}
            </div>
            
            <Button className="w-full" size="sm">
              {settings.button_text}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
