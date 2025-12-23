import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSplineSettings } from "@/hooks/useSplineSettings";
import { useSiteVisibility } from "@/hooks/useSiteVisibility";
import { toast } from "sonner";
import { Loader2, Save, ExternalLink, Box } from "lucide-react";

export function SplineManager() {
  const { splineUrl, loading, updateSplineUrl } = useSplineSettings();
  const { isVisible, toggleVisibility } = useSiteVisibility();

  const [url, setUrl] = useState(splineUrl);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Sync URL state when splineUrl changes
  useEffect(() => {
    if (splineUrl) setUrl(splineUrl);
  }, [splineUrl]);

  // Accept either a raw URL or the full <script>+<spline-viewer> snippet,
  // but always store ONLY the URL in the database.
  const normalizeSplineInput = (input: string): { url: string; wasExtracted: boolean } => {
    const value = (input || "").trim();
    if (!value) return { url: "", wasExtracted: false };

    // Direct URL
    if (value.startsWith("https://prod.spline.design/") || value.startsWith("https://my.spline.design/")) {
      return { url: value, wasExtracted: false };
    }

    // Extract from <spline-viewer url="...">
    const viewerMatch = value.match(/url="([^"]+)"/);
    if (viewerMatch?.[1]) {
      return { url: viewerMatch[1], wasExtracted: true };
    }

    // Fallback: find any Spline URL inside the pasted text
    const anyUrlMatch = value.match(/(https:\/\/(?:prod|my)\.spline\.design\/[^\s"<>]+)/);
    if (anyUrlMatch?.[1]) {
      return { url: anyUrlMatch[1], wasExtracted: true };
    }

    return { url: value, wasExtracted: false };
  };

  const handleSaveUrl = async () => {
    const normalized = normalizeSplineInput(url);

    if (!normalized.url) {
      toast.error("Veuillez entrer une URL Spline valide");
      return;
    }

    setSaving(true);
    try {
      await updateSplineUrl(normalized.url);
      setUrl(normalized.url);

      toast.success(
        normalized.wasExtracted ? "Code détecté : URL extraite et enregistrée" : "URL Spline mise à jour"
      );
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async () => {
    setToggling(true);
    try {
      await toggleVisibility("footer_spline");
      toast.success(isVisible("footer_spline") ? "Animation Spline désactivée" : "Animation Spline activée");
    } catch (error) {
      toast.error("Erreur lors du changement de visibilité");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Box className="h-5 w-5" />
          Animation 3D Spline
        </CardTitle>
        <CardDescription>
          Configurez l'animation 3D qui s'affiche en superposition dans le footer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle visibility */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="spline-toggle">Activer l'animation</Label>
            <p className="text-sm text-muted-foreground">Afficher l'animation Spline dans le footer</p>
          </div>
          <Switch
            id="spline-toggle"
            checked={isVisible("footer_spline")}
            onCheckedChange={handleToggleVisibility}
            disabled={toggling}
          />
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="spline-url">URL de la scène Spline</Label>
          <div className="flex gap-2">
            <Input
              id="spline-url"
              placeholder="https://prod.spline.design/.../scene.splinecode"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveUrl} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Vous pouvez coller soit l'URL (prod.spline.design / my.spline.design), soit le code
            &lt;spline-viewer&gt; : on n'enregistre que l'URL.
          </p>
        </div>

        {/* Preview link */}
        {url && (
          <div className="pt-4 border-t">
            <a
              href="https://spline.design"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Créer/modifier des animations sur Spline
            </a>
          </div>
        )}

        {/* Current URL display */}
        {splineUrl && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-xs text-muted-foreground mb-1">URL actuelle:</p>
            <p className="text-sm font-mono break-all">{splineUrl}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
