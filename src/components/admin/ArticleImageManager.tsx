import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Upload, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          // Générer un nom de fichier unique
          const timestamp = new Date().getTime();
          const random = Math.floor(Math.random() * 1000);
          const fileExt = file.name.split('.').pop();
          const fileName = `article-${articleId}-${timestamp}-${random}.${fileExt}`;
          
          // Upload direct vers le bucket media
          const { error: uploadError, data } = await supabase.storage
            .from('media')
            .upload(fileName, file);
            
          if (uploadError) {
            console.error("Storage upload error:", uploadError);
            throw uploadError;
          }
          
          // Récupérer l'URL publique
          const { data: urlData } = supabase.storage
            .from('media')
            .getPublicUrl(fileName);
          
          if (!urlData.publicUrl) {
            throw new Error("Impossible d'obtenir l'URL du fichier");
          }
          
          // Ajouter l'image à la galerie
          const maxOrder = images.length + successCount;
          const { error: dbError } = await supabase
            .from("article_images")
            .insert({
              article_id: articleId,
              image_url: urlData.publicUrl,
              display_order: maxOrder,
            });

          if (dbError) {
            console.error("Database error:", dbError);
            throw dbError;
          }
          
          successCount++;
        } catch (error) {
          console.error("Error uploading file:", error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        fetchImages();
        toast({
          title: "Images ajoutées",
          description: `${successCount} image(s) ajoutée(s) à la galerie.`,
        });
      }

      if (errorCount > 0) {
        toast({
          title: "Erreur partielle",
          description: `${errorCount} image(s) n'ont pas pu être téléchargées.`,
          variant: "destructive",
        });
      }
    } finally {
      setUploading(false);
      e.target.value = '';
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
        <CardTitle>Galerie d'images - Album Photos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image-upload" className="text-base font-semibold">
              📸 Télécharger plusieurs images
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Sélectionnez plusieurs fichiers pour créer un album photo
            </p>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="cursor-pointer"
            />
            {uploading && (
              <p className="text-sm text-muted-foreground">
                Téléchargement en cours...
              </p>
            )}
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

          {images.length > 0 && (
            <div>
              <Label className="text-base font-semibold mb-3 block">
                🖼️ Album actuel ({images.length} {images.length > 1 ? 'images' : 'image'})
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.image_url}
                      alt="Gallery"
                      className="w-full h-40 object-cover rounded-lg border-2 border-border"
                    />
                    <div className="absolute top-2 left-2 bg-black/50 rounded px-2 py-1">
                      <GripVertical className="h-4 w-4 text-white" />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      onClick={() => deleteImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {images.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <p className="text-muted-foreground text-lg mb-2">
                📷 Aucune image dans l'album
              </p>
              <p className="text-sm text-muted-foreground">
                Téléchargez plusieurs images pour créer une belle galerie photo
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
