
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VideoType } from "@/types/Video";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MediaUploader } from "./MediaUploader";

interface VideoFormProps {
  video?: VideoType;
  onSuccess: () => void;
  onCancel: () => void;
}

export const VideoForm = ({ video, onSuccess, onCancel }: VideoFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: video?.title || "",
    description: video?.description || "",
    video_url: video?.video_url || "",
    thumbnail_url: video?.thumbnail_url || "",
    category: video?.category || "",
    duration: video?.duration || 0,
    is_published: video?.is_published || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (video?.id) {
        // Update existing video
        const { error } = await supabase
          .from('videos')
          .update(formData)
          .eq('id', video.id);

        if (error) throw error;
        toast.success("Vidéo mise à jour avec succès");
      } else {
        // Create new video
        const { error } = await supabase
          .from('videos')
          .insert([formData]);

        if (error) throw error;
        toast.success("Vidéo créée avec succès");
      }

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'enregistrement de la vidéo");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUploadSuccess = (url: string) => {
    setFormData({ ...formData, video_url: url });
  };

  const handleThumbnailUploadSuccess = (url: string) => {
    setFormData({ ...formData, thumbnail_url: url });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {video ? "Modifier la vidéo" : "Nouvelle vidéo"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="video_url">URL de la vidéo</Label>
            <div className="space-y-2">
              <Input
                id="video_url"
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://example.com/video.mp4 ou utilisez l'uploader ci-dessous"
                required
              />
              <MediaUploader
                onSuccess={handleVideoUploadSuccess}
                acceptTypes="video/*"
                buttonText="Télécharger une vidéo"
                folderPath="videos"
                currentValue={formData.video_url}
                showPreview={true}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="thumbnail_url">URL de la miniature</Label>
            <div className="space-y-2">
              <Input
                id="thumbnail_url"
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="https://example.com/thumbnail.jpg ou utilisez l'uploader ci-dessous"
              />
              <MediaUploader
                onSuccess={handleThumbnailUploadSuccess}
                acceptTypes="image/*"
                buttonText="Télécharger une miniature"
                folderPath="videos/thumbnails"
                currentValue={formData.thumbnail_url}
                showPreview={true}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="duration">Durée (secondes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
            />
            <Label htmlFor="is_published">Publié</Label>
          </div>
          
          <div className="flex space-x-2">
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
