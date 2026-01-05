import { useState, useEffect } from "react";
import { useLiveMatchBarSettings } from "@/hooks/useLiveMatchBarSettings";
import { useMatches } from "@/hooks/useMatches";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Eye, Image, Link, Palette, MessageSquare, Play, Monitor } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
export function LiveMatchBarManager() {
  const {
    settings,
    loading,
    updateSettings
  } = useLiveMatchBarSettings();
  const {
    matches,
    loading: matchesLoading
  } = useMatches();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    active_match_id: "",
    is_forced_active: false,
    custom_message: "",
    background_image_url: "",
    promo_image_url: "",
    promo_link: "",
    show_scores: true,
    show_timer: true,
    custom_cta_text: "",
    custom_cta_link: "",
    theme_color: "#1e3a5f"
  });

  // Load settings into form when available
  useEffect(() => {
    if (settings) {
      setFormData({
        active_match_id: settings.active_match_id || "",
        is_forced_active: settings.is_forced_active,
        custom_message: settings.custom_message || "",
        background_image_url: settings.background_image_url || "",
        promo_image_url: settings.promo_image_url || "",
        promo_link: settings.promo_link || "",
        show_scores: settings.show_scores,
        show_timer: settings.show_timer,
        custom_cta_text: settings.custom_cta_text || "",
        custom_cta_link: settings.custom_cta_link || "",
        theme_color: settings.theme_color || "#1e3a5f"
      });
    }
  }, [settings]);
  const handleSave = async () => {
    setSaving(true);
    const result = await updateSettings({
      active_match_id: formData.active_match_id || null,
      is_forced_active: formData.is_forced_active,
      custom_message: formData.custom_message || null,
      background_image_url: formData.background_image_url || null,
      promo_image_url: formData.promo_image_url || null,
      promo_link: formData.promo_link || null,
      show_scores: formData.show_scores,
      show_timer: formData.show_timer,
      custom_cta_text: formData.custom_cta_text || null,
      custom_cta_link: formData.custom_cta_link || null,
      theme_color: formData.theme_color
    });
    setSaving(false);
    if (result.success) {
      toast.success("Paramètres de la barre live enregistrés");
    } else {
      toast.error("Erreur lors de la sauvegarde");
    }
  };
  const handleImageUpload = async (file: File, field: 'background_image_url' | 'promo_image_url') => {
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `live-bar-${field}-${Date.now()}.${fileExt}`;
      const filePath = `live-match-bar/${fileName}`;
      const {
        error: uploadError
      } = await supabase.storage.from('media').upload(filePath, file);
      if (uploadError) throw uploadError;
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('media').getPublicUrl(filePath);
      setFormData(prev => ({
        ...prev,
        [field]: publicUrl
      }));
      toast.success("Image uploadée avec succès");
    } catch (error: any) {
      toast.error("Erreur lors de l'upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Get selected match details for preview
  const selectedMatch = matches?.find(m => m.id === formData.active_match_id);
  if (loading || matchesLoading) {
    return <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Barre Live Match</h2>
          <p className="text-muted-foreground">
            Configurez la barre de match en direct affichée en haut du site
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Enregistrer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-6">
          {/* Activation Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Activation
              </CardTitle>
              <CardDescription>
                Contrôlez quand la barre apparaît
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="forced-active">Forcer l'activation</Label>
                  <p className="text-xs text-muted-foreground">
                    Afficher la barre même si aucun match n'est en cours
                  </p>
                </div>
                <Switch id="forced-active" checked={formData.is_forced_active} onCheckedChange={checked => setFormData(prev => ({
                ...prev,
                is_forced_active: checked
              }))} />
              </div>

              <div className="space-y-2">
                <Label>Match à afficher</Label>
                <Select value={formData.active_match_id || "__auto__"} onValueChange={value => setFormData(prev => ({
                ...prev,
                active_match_id: value === "__auto__" ? "" : value
              }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un match (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__auto__">Auto-détection</SelectItem>
                    {matches?.map(match => <SelectItem key={match.id} value={match.id}>
                        {match.home_team} vs {match.away_team} - {format(new Date(match.match_date), "dd/MM/yyyy HH:mm", {
                      locale: fr
                    })}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Laissez vide pour la détection automatique (15min avant/après le match)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Display Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Options d'affichage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-scores">Afficher les scores</Label>
                <Switch id="show-scores" checked={formData.show_scores} onCheckedChange={checked => setFormData(prev => ({
                ...prev,
                show_scores: checked
              }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-timer">Afficher le minuteur</Label>
                <Switch id="show-timer" checked={formData.show_timer} onCheckedChange={checked => setFormData(prev => ({
                ...prev,
                show_timer: checked
              }))} />
              </div>
            </CardContent>
          </Card>

          {/* Custom Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message personnalisé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Ex: Match de gala! Ne manquez pas ce classique..." value={formData.custom_message} onChange={e => setFormData(prev => ({
              ...prev,
              custom_message: e.target.value
            }))} rows={3} />
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Image de fond</Label>
                <div className="flex gap-2">
                  <Input placeholder="URL de l'image de fond" value={formData.background_image_url} onChange={e => setFormData(prev => ({
                  ...prev,
                  background_image_url: e.target.value
                }))} />
                  <Button variant="outline" size="icon" disabled={uploading} onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = e => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleImageUpload(file, 'background_image_url');
                  };
                  input.click();
                }}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                  </Button>
                </div>
                {formData.background_image_url && <img src={formData.background_image_url} alt="Fond" className="h-20 w-full object-cover rounded border" />}
              </div>

              <div className="space-y-2">
                <Label>Image promo (optionnel)</Label>
                <div className="flex gap-2">
                  <Input placeholder="URL de l'image promo" value={formData.promo_image_url} onChange={e => setFormData(prev => ({
                  ...prev,
                  promo_image_url: e.target.value
                }))} />
                  <Button variant="outline" size="icon" disabled={uploading} onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = e => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleImageUpload(file, 'promo_image_url');
                  };
                  input.click();
                }}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                  </Button>
                </div>
                {formData.promo_image_url && <img src={formData.promo_image_url} alt="Promo" className="h-16 w-auto object-contain rounded border" />}
              </div>

              <div className="space-y-2">
                <Label>Lien de l'image promo</Label>
                <Input placeholder="https://..." value={formData.promo_link} onChange={e => setFormData(prev => ({
                ...prev,
                promo_link: e.target.value
              }))} />
              </div>
            </CardContent>
          </Card>

          {/* Custom CTA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Bouton personnalisé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Texte du bouton</Label>
                <Input placeholder="Suivre le match" value={formData.custom_cta_text} onChange={e => setFormData(prev => ({
                ...prev,
                custom_cta_text: e.target.value
              }))} />
              </div>
              <div className="space-y-2">
                <Label>Lien du bouton</Label>
                <Input placeholder="/live-blog/[match-id]" value={formData.custom_cta_link} onChange={e => setFormData(prev => ({
                ...prev,
                custom_cta_link: e.target.value
              }))} />
              </div>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Thème
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Label>Couleur de fond</Label>
                <input type="color" value={formData.theme_color} onChange={e => setFormData(prev => ({
                ...prev,
                theme_color: e.target.value
              }))} className="w-12 h-10 rounded border cursor-pointer" />
                <Input value={formData.theme_color} onChange={e => setFormData(prev => ({
                ...prev,
                theme_color: e.target.value
              }))} className="w-32" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Prévisualisation
              </CardTitle>
              <CardDescription>
                Aperçu de la barre avec les paramètres actuels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden text-white relative" style={{
              backgroundColor: formData.theme_color,
              backgroundImage: formData.background_image_url ? `url(${formData.background_image_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
                {formData.background_image_url && <div className="absolute inset-0 bg-black/50" />}
                <div className="relative p-4">
                  {formData.custom_message && <p className="text-sm text-white/90 mb-3 text-center font-medium">
                      {formData.custom_message}
                    </p>}
                  
                  <div className="flex items-center justify-between gap-4">
                    {/* Promo image */}
                    {formData.promo_image_url && <a href={formData.promo_link || '#'} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <img src={formData.promo_image_url} alt="Promo" className="h-12 w-auto object-contain" />
                      </a>}

                    {/* Match info */}
                    <div className="flex items-center gap-4 flex-1 justify-center">
                      <span className="font-bold text-lg">
                        {selectedMatch?.home_team || 'Équipe A'}
                      </span>
                      
                      {formData.show_scores && <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{selectedMatch?.home_score ?? 0}</span>
                          <span className="text-white/50">-</span>
                          <span className="text-2xl font-bold">{selectedMatch?.away_score ?? 0}</span>
                        </div>}
                      
                      <span className="font-bold text-lg">
                        {selectedMatch?.away_team || 'Équipe B'}
                      </span>
                    </div>

                    {/* Timer */}
                    {formData.show_timer && <div className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full">
                        <span className="text-sm font-bold text-red-400 animate-pulse">45'</span>
                      </div>}

                    {/* CTA Button */}
                    <Button variant="outline" size="sm" className="border-white bg-white/10 text-white hover:bg-white hover:text-[hsl(222,47%,20%)] font-medium">
                      {formData.custom_cta_text || 'Suivre le match'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Status:</strong>{' '}
                  {formData.is_forced_active ? <span className="text-green-500">Forcée active</span> : formData.active_match_id ? <span className="text-blue-500">Match sélectionné</span> : <span className="text-orange-500">Auto-détection</span>}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => {
              setFormData(prev => ({
                ...prev,
                is_forced_active: true
              }));
              toast.info("N'oubliez pas d'enregistrer pour appliquer les changements");
            }}>
                <Play className="h-4 w-4 mr-2" />
                Activer maintenant
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
              setFormData(prev => ({
                ...prev,
                is_forced_active: false,
                active_match_id: ""
              }));
              toast.info("N'oubliez pas d'enregistrer pour appliquer les changements");
            }}>
                <Monitor className="h-4 w-4 mr-2" />
                Repasser en auto-détection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}