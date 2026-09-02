import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  StoryDisplaySettings,
  useStoryDisplaySettings,
  useUpdateStoryDisplaySettings,
} from '@/hooks/useStories';

export function StoryDisplaySettingsPanel() {
  const { toast } = useToast();
  const { settings, isLoading } = useStoryDisplaySettings();
  const update = useUpdateStoryDisplaySettings();
  const [form, setForm] = useState<StoryDisplaySettings>(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const save = async () => {
    try {
      const { id, ...patch } = form;
      await update.mutateAsync(patch);
      toast({ title: 'Affichage mis à jour' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Affichage sur l'accueil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Fond de la barre de stories</Label>
            <Select
              value={form.bar_background}
              onValueChange={(v) => setForm((f) => ({ ...f, bar_background: v as StoryDisplaySettings['bar_background'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Carte (par défaut)</SelectItem>
                <SelectItem value="muted">Gris doux</SelectItem>
                <SelectItem value="transparent">Transparent</SelectItem>
                <SelectItem value="gradient">Dégradé club</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Style des cercles</Label>
            <Select
              value={form.ring_style}
              onValueChange={(v) => setForm((f) => ({ ...f, ring_style: v as StoryDisplaySettings['ring_style'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gradient">Dégradé</SelectItem>
                <SelectItem value="solid">Couleur unie</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Arrière-plan de la visionneuse</Label>
            <Select
              value={form.viewer_backdrop}
              onValueChange={(v) => setForm((f) => ({ ...f, viewer_backdrop: v as StoryDisplaySettings['viewer_backdrop'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blur">Flou aux couleurs du média (Instagram)</SelectItem>
                <SelectItem value="gradient">Dégradé club</SelectItem>
                <SelectItem value="dark">Sombre uni</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cadrage du média</Label>
            <Select
              value={form.viewer_fit}
              onValueChange={(v) => setForm((f) => ({ ...f, viewer_fit: v as StoryDisplaySettings['viewer_fit'] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contain">Entier + fond flou</SelectItem>
                <SelectItem value="cover">Plein cadre (rogné)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Taille des cercles : {form.ring_size}px</Label>
          <Slider
            min={48}
            max={96}
            step={4}
            value={[form.ring_size]}
            onValueChange={([v]) => setForm((f) => ({ ...f, ring_size: v }))}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="font-medium">Afficher les titres</p>
            <p className="text-sm text-muted-foreground">Sous chaque cercle sur l'accueil</p>
          </div>
          <Switch
            checked={form.show_titles}
            onCheckedChange={(v) => setForm((f) => ({ ...f, show_titles: v }))}
          />
        </div>

        <Button onClick={save} disabled={update.isPending}>
          {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Enregistrer
        </Button>
      </CardContent>
    </Card>
  );
}
