import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSoundSettings, useUpdateSoundSettings } from "@/hooks/useSoundSettings";
import { MediaUploader } from "./MediaUploader";
import { Volume2, VolumeX, Play, Upload, Globe, LogIn, LogOut, Home } from "lucide-react";

export const SoundSettingsManager = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = useSoundSettings();
  const updateSettings = useUpdateSoundSettings();
  const [testingSound, setTestingSound] = useState<string | null>(null);

  const handleToggle = async (field: string, value: boolean) => {
    try {
      await updateSettings.mutateAsync({ [field]: value });
      toast({
        title: "Paramètre mis à jour",
        description: "Le paramètre a été sauvegardé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le paramètre.",
        variant: "destructive",
      });
    }
  };

  const handleVolumeChange = async (value: number[]) => {
    try {
      await updateSettings.mutateAsync({ volume: value[0] });
    } catch (error) {
      console.error("Error updating volume:", error);
    }
  };

  const handleSoundUpload = async (field: string, url: string) => {
    try {
      await updateSettings.mutateAsync({ [field]: url });
      toast({
        title: "Son uploadé",
        description: "Le fichier audio a été sauvegardé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le fichier audio.",
        variant: "destructive",
      });
    }
  };

  const testSound = async (url: string | null, type: string) => {
    if (!url) {
      toast({
        title: "Aucun son",
        description: "Aucun fichier audio n'est configuré pour ce son.",
        variant: "destructive",
      });
      return;
    }

    setTestingSound(type);
    try {
      const audio = new Audio(url);
      audio.volume = settings?.volume ?? 0.5;
      await audio.play();
      audio.onended = () => setTestingSound(null);
    } catch (error) {
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire le fichier audio.",
        variant: "destructive",
      });
      setTestingSound(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Paramètres des sons
          </CardTitle>
          <CardDescription>
            Configurez les sons de bienvenue, connexion et déconnexion avec détection automatique de la langue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              {settings?.is_enabled ? (
                <Volume2 className="h-5 w-5 text-primary" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label className="text-base font-medium">Activer les sons</Label>
                <p className="text-sm text-muted-foreground">
                  Active/désactive tous les sons du site
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.is_enabled ?? false}
              onCheckedChange={(checked) => handleToggle("is_enabled", checked)}
            />
          </div>

          {/* Volume Control */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Volume général: {Math.round((settings?.volume ?? 0.5) * 100)}%
            </Label>
            <Slider
              value={[settings?.volume ?? 0.5]}
              onValueChange={handleVolumeChange}
              max={1}
              min={0}
              step={0.05}
              className="w-full"
              disabled={!settings?.is_enabled}
            />
          </div>

          {/* Auto Language Detection */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-blue-500" />
              <div>
                <Label className="text-base font-medium">Détection automatique de la langue</Label>
                <p className="text-sm text-muted-foreground">
                  Joue le son français pour les visiteurs francophones, anglais pour les autres
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.auto_language_detection ?? true}
              onCheckedChange={(checked) => handleToggle("auto_language_detection", checked)}
              disabled={!settings?.is_enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Welcome Sound */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-green-500" />
            Son de bienvenue
          </CardTitle>
          <CardDescription>
            Joué au premier clic du visiteur sur le site (respect des règles navigateur).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Activer le son de bienvenue</Label>
            <Switch
              checked={settings?.welcome_sound_enabled ?? true}
              onCheckedChange={(checked) => handleToggle("welcome_sound_enabled", checked)}
              disabled={!settings?.is_enabled}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* French */}
            <div className="space-y-2 p-4 border rounded-lg">
              <Label className="flex items-center gap-2">
                🇫🇷 Version française
              </Label>
              <div className="flex gap-2">
                <MediaUploader
                  onSuccess={(url) => handleSoundUpload("welcome_sound_url_fr", url)}
                  acceptTypes="audio/*"
                  maxSizeMB={10}
                  folderPath="welcome"
                  bucketName="sounds"
                  buttonText="Uploader"
                  showPreview={false}
                  currentValue={settings?.welcome_sound_url_fr || ""}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => testSound(settings?.welcome_sound_url_fr || null, "welcome-fr")}
                  disabled={!settings?.welcome_sound_url_fr || testingSound === "welcome-fr"}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              {settings?.welcome_sound_url_fr && (
                <p className="text-xs text-muted-foreground truncate">
                  {settings.welcome_sound_url_fr.split("/").pop()}
                </p>
              )}
            </div>

            {/* English */}
            <div className="space-y-2 p-4 border rounded-lg">
              <Label className="flex items-center gap-2">
                🇬🇧 Version anglaise
              </Label>
              <div className="flex gap-2">
                <MediaUploader
                  onSuccess={(url) => handleSoundUpload("welcome_sound_url_en", url)}
                  acceptTypes="audio/*"
                  maxSizeMB={10}
                  folderPath="welcome"
                  bucketName="sounds"
                  buttonText="Uploader"
                  showPreview={false}
                  currentValue={settings?.welcome_sound_url_en || ""}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => testSound(settings?.welcome_sound_url_en || null, "welcome-en")}
                  disabled={!settings?.welcome_sound_url_en || testingSound === "welcome-en"}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              {settings?.welcome_sound_url_en && (
                <p className="text-xs text-muted-foreground truncate">
                  {settings.welcome_sound_url_en.split("/").pop()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Sound */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5 text-blue-500" />
            Son de connexion
          </CardTitle>
          <CardDescription>
            Joué lorsqu'un utilisateur se connecte avec succès.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Activer le son de connexion</Label>
            <Switch
              checked={settings?.login_sound_enabled ?? true}
              onCheckedChange={(checked) => handleToggle("login_sound_enabled", checked)}
              disabled={!settings?.is_enabled}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* French */}
            <div className="space-y-2 p-4 border rounded-lg">
              <Label className="flex items-center gap-2">
                🇫🇷 Version française
              </Label>
              <div className="flex gap-2">
                <MediaUploader
                  onSuccess={(url) => handleSoundUpload("login_sound_url_fr", url)}
                  acceptTypes="audio/*"
                  maxSizeMB={10}
                  folderPath="login"
                  bucketName="sounds"
                  buttonText="Uploader"
                  showPreview={false}
                  currentValue={settings?.login_sound_url_fr || ""}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => testSound(settings?.login_sound_url_fr || null, "login-fr")}
                  disabled={!settings?.login_sound_url_fr || testingSound === "login-fr"}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              {settings?.login_sound_url_fr && (
                <p className="text-xs text-muted-foreground truncate">
                  {settings.login_sound_url_fr.split("/").pop()}
                </p>
              )}
            </div>

            {/* English */}
            <div className="space-y-2 p-4 border rounded-lg">
              <Label className="flex items-center gap-2">
                🇬🇧 Version anglaise
              </Label>
              <div className="flex gap-2">
                <MediaUploader
                  onSuccess={(url) => handleSoundUpload("login_sound_url_en", url)}
                  acceptTypes="audio/*"
                  maxSizeMB={10}
                  folderPath="login"
                  bucketName="sounds"
                  buttonText="Uploader"
                  showPreview={false}
                  currentValue={settings?.login_sound_url_en || ""}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => testSound(settings?.login_sound_url_en || null, "login-en")}
                  disabled={!settings?.login_sound_url_en || testingSound === "login-en"}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              {settings?.login_sound_url_en && (
                <p className="text-xs text-muted-foreground truncate">
                  {settings.login_sound_url_en.split("/").pop()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout Sound */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-orange-500" />
            Son de déconnexion
          </CardTitle>
          <CardDescription>
            Joué lorsqu'un utilisateur se déconnecte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Activer le son de déconnexion</Label>
            <Switch
              checked={settings?.logout_sound_enabled ?? true}
              onCheckedChange={(checked) => handleToggle("logout_sound_enabled", checked)}
              disabled={!settings?.is_enabled}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* French */}
            <div className="space-y-2 p-4 border rounded-lg">
              <Label className="flex items-center gap-2">
                🇫🇷 Version française
              </Label>
              <div className="flex gap-2">
                <MediaUploader
                  onSuccess={(url) => handleSoundUpload("logout_sound_url_fr", url)}
                  acceptTypes="audio/*"
                  maxSizeMB={10}
                  folderPath="logout"
                  bucketName="sounds"
                  buttonText="Uploader"
                  showPreview={false}
                  currentValue={settings?.logout_sound_url_fr || ""}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => testSound(settings?.logout_sound_url_fr || null, "logout-fr")}
                  disabled={!settings?.logout_sound_url_fr || testingSound === "logout-fr"}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              {settings?.logout_sound_url_fr && (
                <p className="text-xs text-muted-foreground truncate">
                  {settings.logout_sound_url_fr.split("/").pop()}
                </p>
              )}
            </div>

            {/* English */}
            <div className="space-y-2 p-4 border rounded-lg">
              <Label className="flex items-center gap-2">
                🇬🇧 Version anglaise
              </Label>
              <div className="flex gap-2">
                <MediaUploader
                  onSuccess={(url) => handleSoundUpload("logout_sound_url_en", url)}
                  acceptTypes="audio/*"
                  maxSizeMB={10}
                  folderPath="logout"
                  bucketName="sounds"
                  buttonText="Uploader"
                  showPreview={false}
                  currentValue={settings?.logout_sound_url_en || ""}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => testSound(settings?.logout_sound_url_en || null, "logout-en")}
                  disabled={!settings?.logout_sound_url_en || testingSound === "logout-en"}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              {settings?.logout_sound_url_en && (
                <p className="text-xs text-muted-foreground truncate">
                  {settings.logout_sound_url_en.split("/").pop()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
