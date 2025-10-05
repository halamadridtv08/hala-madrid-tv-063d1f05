import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { ArticleImage } from "@/types/Article";

interface ArticleImageManagerProps {
  articleId: string;
}

export const ArticleImageManager = ({ articleId }: ArticleImageManagerProps) => {
  const [images, setImages] = useState<ArticleImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, [articleId]);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('article_images')
      .select('*')
      .eq('article_id', articleId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching images:', error);
      return;
    }

    setImages(data || []);
  };

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      toast.error("Veuillez entrer une URL d'image");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('article_images')
        .insert([{
          article_id: articleId,
          image_url: newImageUrl,
          display_order: images.length
        }]);

      if (error) throw error;

      toast.success("Image ajoutée avec succès");
      setNewImageUrl("");
      fetchImages();
    } catch (error) {
      console.error('Error adding image:', error);
      toast.error("Erreur lors de l'ajout de l'image");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('article_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast.success("Image supprimée");
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Galerie d'images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="new-image-url">URL de l'image</Label>
            <Input
              id="new-image-url"
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <Button
            onClick={handleAddImage}
            disabled={loading}
            className="self-end"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-lg overflow-hidden border"
            >
              <img
                src={image.image_url}
                alt=""
                className="w-full h-48 object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteImage(image.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Aucune image dans la galerie
          </p>
        )}
      </CardContent>
    </Card>
  );
};
