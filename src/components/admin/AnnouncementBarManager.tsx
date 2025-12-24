import { useState, useEffect } from "react";
import { useAnnouncementBarAdmin } from "@/hooks/useAnnouncementBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Megaphone, Save, Eye } from "lucide-react";

export function AnnouncementBarManager() {
  const { announcement, loading, updateAnnouncement } = useAnnouncementBarAdmin();
  const [formData, setFormData] = useState({
    message: "",
    emoji: "🚀",
    cta_text: "",
    cta_link: "",
    is_active: false,
    background_color: "linear-gradient(to right, hsl(240, 10%, 10%), hsl(280, 30%, 15%))",
    text_color: "#ffffff"
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (announcement) {
      setFormData({
        message: announcement.message || "",
        emoji: announcement.emoji || "🚀",
        cta_text: announcement.cta_text || "",
        cta_link: announcement.cta_link || "",
        is_active: announcement.is_active || false,
        background_color: announcement.background_color || "linear-gradient(to right, hsl(240, 10%, 10%), hsl(280, 30%, 15%))",
        text_color: announcement.text_color || "#ffffff"
      });
    }
  }, [announcement]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAnnouncement(formData);
      toast.success("Barre d'annonce mise à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
    try {
      await updateAnnouncement({ is_active: checked });
      toast.success(checked ? "Barre d'annonce activée" : "Barre d'annonce désactivée");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Barre d'annonce
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview */}
        <div className="rounded-lg overflow-hidden border">
          <div 
            className="w-full py-2.5 px-4 flex items-center justify-center gap-3 text-sm"
            style={{
              background: formData.background_color,
              color: formData.text_color
            }}
          >
            {formData.emoji && <span className="text-base">{formData.emoji}</span>}
            <span className="font-medium">{formData.message || "Votre message ici..."}</span>
            {formData.cta_text && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-xs font-medium border border-white/20">
                {formData.cta_text} →
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="is_active" className="font-medium">Afficher la barre</Label>
          </div>
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={handleToggleActive}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emoji">Emoji</Label>
            <Input
              id="emoji"
              value={formData.emoji}
              onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
              placeholder="🚀"
              className="text-center text-xl"
            />
          </div>

          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Votre message d'annonce..."
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cta_text">Texte du bouton</Label>
            <Input
              id="cta_text"
              value={formData.cta_text}
              onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
              placeholder="Découvrir"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta_link">Lien de redirection</Label>
            <Input
              id="cta_link"
              value={formData.cta_link}
              onChange={(e) => setFormData(prev => ({ ...prev, cta_link: e.target.value }))}
              placeholder="/news ou https://..."
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="background_color">Couleur de fond (CSS)</Label>
            <Input
              id="background_color"
              value={formData.background_color}
              onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
              placeholder="linear-gradient(to right, #1a1a2e, #2d1b4e)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="text_color">Couleur du texte</Label>
            <Input
              id="text_color"
              type="color"
              value={formData.text_color}
              onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
              className="h-10"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </CardContent>
    </Card>
  );
}
