import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { Video, Loader2 } from "lucide-react";

export function HeroBackgroundManager() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [tempVideoUrl, setTempVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["hero_background_video_enabled", "hero_background_video_url"]);

      if (error) throw error;

      data?.forEach((item) => {
        if (item.setting_key === "hero_background_video_enabled") {
          setIsEnabled(item.setting_value === "true");
        }
        if (item.setting_key === "hero_background_video_url") {
          setVideoUrl(item.setting_value || "");
          setTempVideoUrl(item.setting_value || "");
        }
      });
    } catch (error) {
      console.error("Error fetching hero settings:", error);
      toast.error("Erreur lors du chargement des paramètres");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ setting_value: enabled.toString() })
        .eq("setting_key", "hero_background_video_enabled");

      if (error) throw error;

      setIsEnabled(enabled);
      toast.success(enabled ? "Mode arrière-plan vidéo activé" : "Mode arrière-plan vidéo désactivé");
    } catch (error) {
      console.error("Error toggling hero background:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVideoUpload = (url: string) => {
    setTempVideoUrl(url);
  };

  const handleSave = async () => {
    if (!tempVideoUrl) {
      toast.error("Veuillez d'abord télécharger une vidéo");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ setting_value: tempVideoUrl })
        .eq("setting_key", "hero_background_video_url");

      if (error) throw error;

      setVideoUrl(tempVideoUrl);
      toast.success("Vidéo d'arrière-plan sauvegardée");
    } catch (error) {
      console.error("Error saving video URL:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Vidéo d'arrière-plan Hero
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle activation */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="space-y-1">
            <Label htmlFor="hero-bg-toggle" className="font-medium">
              Mode arrière-plan vidéo
            </Label>
            <p className="text-sm text-muted-foreground">
              Active une vidéo plein écran en arrière-plan de la section Hero.
              Désactive automatiquement la vidéo mockup iPhone.
            </p>
          </div>
          <Switch
            id="hero-bg-toggle"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isSaving}
          />
        </div>

        {/* Video uploader */}
        <div className="space-y-4">
          <Label>Vidéo d'arrière-plan (MP4 recommandé)</Label>
          <MediaUploader
            onSuccess={handleVideoUpload}
            acceptTypes="video/*"
            maxSizeMB={100}
            folderPath="hero-backgrounds"
          />
        </div>

        {/* Preview */}
        {tempVideoUrl && (
          <div className="space-y-2">
            <Label>Aperçu</Label>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <video
                src={tempVideoUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-sm bg-black/50 px-3 py-1 rounded">
                  Aperçu avec overlay
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        {tempVideoUrl && tempVideoUrl !== videoUrl && (
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              "Sauvegarder la vidéo"
            )}
          </Button>
        )}

        {/* Current video info */}
        {videoUrl && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Vidéo actuelle : </span>
            <span className="truncate">{videoUrl.split("/").pop()?.split("?")[0]}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
