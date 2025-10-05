import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { YouTubeVideo } from "@/types/YouTubeVideo";
import { Switch } from "@/components/ui/switch";

interface YouTubeVideoFormProps {
  video?: YouTubeVideo;
  onSuccess: () => void;
  onCancel: () => void;
}

const YouTubeVideoForm = ({ video, onSuccess, onCancel }: YouTubeVideoFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: video?.title || "",
    thumbnail_url: video?.thumbnail_url || "",
    youtube_url: video?.youtube_url || "",
    is_published: video?.is_published ?? true,
  });

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title,
        thumbnail_url: video.thumbnail_url,
        youtube_url: video.youtube_url,
        is_published: video.is_published,
      });
    }
  }, [video]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (video) {
        const { error } = await supabase
          .from("youtube_videos")
          .update(formData)
          .eq("id", video.id);

        if (error) throw error;
        toast.success("Vidéo YouTube mise à jour");
      } else {
        const { error } = await supabase
          .from("youtube_videos")
          .insert([formData]);

        if (error) throw error;
        toast.success("Vidéo YouTube ajoutée");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving YouTube video:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{video ? "Modifier" : "Ajouter"} une vidéo YouTube</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre de la vidéo</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="youtube_url">URL YouTube</Label>
            <Input
              id="youtube_url"
              type="url"
              value={formData.youtube_url}
              onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              required
            />
          </div>

          <div>
            <Label htmlFor="thumbnail_url">URL de la miniature</Label>
            <Input
              id="thumbnail_url"
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              placeholder="https://i.ytimg.com/vi/..."
              required
            />
            {formData.thumbnail_url && (
              <img
                src={formData.thumbnail_url}
                alt="Aperçu"
                className="mt-2 rounded-lg max-h-32 object-cover"
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_published: checked })
              }
            />
            <Label htmlFor="is_published">Publiée</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default YouTubeVideoForm;
