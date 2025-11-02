import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Upload, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/utils/fileUpload";

interface ArticleImage {
  id: string;
  article_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

interface ArticleImageManagerProps {
  articleId: string;
}

export const ArticleImageManager = ({ articleId }: ArticleImageManagerProps) => {
  const [images, setImages] = useState<ArticleImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, [articleId]);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from("article_images")
      .select("*")
      .eq("article_id", articleId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching images:", error);
      return;
    }

    setImages(data || []);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadFile(file, "media");
      if ('url' in result) {
        setNewImageUrl(result.url);
      } else {
        throw new Error(result.error);
      }
      toast({
        title: "Image téléchargée",
        description: "Vous pouvez maintenant l'ajouter à la galerie.",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const addImage = async () => {
    if (!newImageUrl) {
      toast({
        title: "URL manquante",
        description: "Veuillez entrer une URL d'image.",
        variant: "destructive",
      });
      return;
    }

    const maxOrder = images.length > 0 
      ? Math.max(...images.map(img => img.display_order)) 
      : -1;

    const { error } = await supabase
      .from("article_images")
      .insert({
        article_id: articleId,
        image_url: newImageUrl,
        display_order: maxOrder + 1,
      });

    if (error) {
      console.error("Error adding image:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'image.",
        variant: "destructive",
      });
      return;
    }

    setNewImageUrl("");
    fetchImages();
    toast({
      title: "Image ajoutée",
      description: "L'image a été ajoutée à la galerie.",
    });
  };

  const deleteImage = async (id: string) => {
    const { error } = await supabase
      .from("article_images")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'image.",
        variant: "destructive",
      });
      return;
    }

    fetchImages();
    toast({
      title: "Image supprimée",
      description: "L'image a été supprimée de la galerie.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Galerie d'images</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Télécharger une image</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-url">Ou entrer une URL</Label>
            <div className="flex gap-2">
              <Input
                id="image-url"
                type="url"
                placeholder="https://..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <Button onClick={addImage} disabled={!newImageUrl}>
                <Upload className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.image_url}
                  alt="Gallery"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2">
                  <GripVertical className="h-4 w-4 text-white drop-shadow-lg" />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteImage(image.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {images.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Aucune image dans la galerie. Ajoutez-en une pour commencer.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
