import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useFooterBackground } from "@/hooks/useFooterBackground";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { Image, Video, Loader2, FootprintsIcon } from "lucide-react";

export function FooterBackgroundManager() {
  const { isEnabled, type, url, isLoading, updateSetting } = useFooterBackground();
  
  const [localEnabled, setLocalEnabled] = useState(false);
  const [localType, setLocalType] = useState<'image' | 'video' | 'none'>('none');
  const [localUrl, setLocalUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalEnabled(isEnabled);
    setLocalType(type);
    setLocalUrl(url);
  }, [isEnabled, type, url]);

  useEffect(() => {
    const changed = localEnabled !== isEnabled || localType !== type || localUrl !== url;
    setHasChanges(changed);
  }, [localEnabled, localType, localUrl, isEnabled, type, url]);

  const handleToggle = async (enabled: boolean) => {
    setLocalEnabled(enabled);
  };

  const handleTypeChange = (newType: 'image' | 'video') => {
    setLocalType(newType);
    if (newType !== type) {
      setLocalUrl("");
    }
  };

  const handleMediaUpload = (uploadedUrl: string) => {
    setLocalUrl(uploadedUrl);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const results = await Promise.all([
        updateSetting("footer_background_enabled", localEnabled.toString()),
        updateSetting("footer_background_type", localType),
        updateSetting("footer_background_url", localUrl)
      ]);

      if (results.every(Boolean)) {
        toast.success("Paramètres du fond footer sauvegardés");
        setHasChanges(false);
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving footer background settings:", error);
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
          <FootprintsIcon className="h-5 w-5" />
          Fond du Footer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle activation */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="space-y-1">
            <Label htmlFor="footer-bg-toggle" className="font-medium">
              Activer le fond personnalisé
            </Label>
            <p className="text-sm text-muted-foreground">
              Remplace le fond bleu par défaut et l'animation Spline par une image ou vidéo.
            </p>
          </div>
          <Switch
            id="footer-bg-toggle"
            checked={localEnabled}
            onCheckedChange={handleToggle}
          />
        </div>

        {/* Type selector */}
        {localEnabled && (
          <div className="space-y-3">
            <Label>Type de fond</Label>
            <RadioGroup
              value={localType === 'none' ? 'image' : localType}
              onValueChange={(value) => handleTypeChange(value as 'image' | 'video')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="footer-image" />
                <Label htmlFor="footer-image" className="flex items-center gap-2 cursor-pointer">
                  <Image className="h-4 w-4" />
                  Image
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="footer-video" />
                <Label htmlFor="footer-video" className="flex items-center gap-2 cursor-pointer">
                  <Video className="h-4 w-4" />
                  Vidéo
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Media uploader */}
        {localEnabled && localType !== 'none' && (
          <div className="space-y-4">
            <Label>
              {localType === 'image' ? 'Image de fond' : 'Vidéo de fond (MP4 recommandé)'}
            </Label>
            <MediaUploader
              onSuccess={handleMediaUpload}
              acceptTypes={localType === 'image' ? 'image/*' : 'video/*'}
              maxSizeMB={localType === 'image' ? 10 : 100}
              folderPath="footer-backgrounds"
              currentValue={localUrl}
            />
          </div>
        )}

        {/* Preview */}
        {localEnabled && localUrl && (
          <div className="space-y-2">
            <Label>Aperçu</Label>
            <div className="relative aspect-[21/9] rounded-lg overflow-hidden bg-black">
              {localType === 'image' ? (
                <img
                  src={localUrl}
                  alt="Footer background preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={localUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-sm bg-black/50 px-3 py-1 rounded">
                  Aperçu avec overlay
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        {hasChanges && (
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              "Sauvegarder les modifications"
            )}
          </Button>
        )}

        {/* Info note */}
        <p className="text-xs text-muted-foreground">
          Note : Le fond personnalisé a la priorité sur l'animation Spline et le fond bleu par défaut.
        </p>
      </CardContent>
    </Card>
  );
}
