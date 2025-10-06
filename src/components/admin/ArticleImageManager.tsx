import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    try {
      const { data, error } = await supabase
        .from('article_images')
        .select('*')
        .eq('article_id', articleId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
    }
  };

  const addImage = async () => {
    if (!newImageUrl.trim()) {
      toast.error("Veuillez entrer une URL d'image");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('article_images')
        .insert({
          article_id: articleId,
          image_url: newImageUrl,
          display_order: images.length
        });

      if (error) throw error;

      toast.success("Image ajoutée avec succès");
      setNewImageUrl("");
      fetchImages();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'image:', error);
      toast.error("Erreur lors de l'ajout de l'image");
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) return;

    try {
      const { error } = await supabase
        .from('article_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast.success("Image supprimée avec succès");
      fetchImages();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error("Erreur lors de la suppression de l'image");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Galerie d'images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ajouter une nouvelle image */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="new-image">URL de l'image</Label>
            <Input
              id="new-image"
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://exemple.com/image.jpg"
            />
          </div>
          <Button
            onClick={addImage}
            disabled={loading}
            className="mt-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {/* Liste des images */}
        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucune image dans la galerie
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden border"
              >
                <img
                  src={image.image_url}
                  alt="Article"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteImage(image.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};