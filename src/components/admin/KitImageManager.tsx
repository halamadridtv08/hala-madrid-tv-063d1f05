import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MediaUploader } from "./MediaUploader";
import { supabase } from "@/integrations/supabase/client";
import { KitImage } from "@/types/Kit";
import { toast } from "sonner";
import { X, Star, StarOff, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KitImageManagerProps {
  kitId: string;
  onImagesChange?: () => void;
}

export const KitImageManager = ({ kitId, onImagesChange }: KitImageManagerProps) => {
  const [images, setImages] = useState<KitImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, [kitId]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('kit_images')
        .select('*')
        .eq('kit_id', kitId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages((data || []) as KitImage[]);
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (url: string) => {
    try {
      const maxOrder = images.length > 0 
        ? Math.max(...images.map(img => img.display_order))
        : -1;

      const { error } = await supabase
        .from('kit_images')
        .insert([{
          kit_id: kitId,
          image_url: url,
          display_order: maxOrder + 1,
          is_primary: images.length === 0
        }]);

      if (error) throw error;
      
      toast.success("Image ajoutée avec succès");
      fetchImages();
      onImagesChange?.();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'image:', error);
      toast.error("Erreur lors de l'ajout de l'image");
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) return;

    try {
      const { error } = await supabase
        .from('kit_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      
      toast.success("Image supprimée avec succès");
      fetchImages();
      onImagesChange?.();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error("Erreur lors de la suppression de l'image");
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      // Unset all as primary first
      await supabase
        .from('kit_images')
        .update({ is_primary: false })
        .eq('kit_id', kitId);

      // Set selected as primary
      const { error } = await supabase
        .from('kit_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (error) throw error;
      
      toast.success("Image principale définie");
      fetchImages();
      onImagesChange?.();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Galerie d'images</Label>
        <MediaUploader
          onSuccess={handleImageUpload}
          acceptTypes="image/*"
          buttonText="Ajouter une image"
          showPreview={false}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors"
            >
              <div className="aspect-square">
                <img
                  src={image.image_url}
                  alt="Kit"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
              
              {image.is_primary && (
                <Badge className="absolute top-2 left-2 bg-yellow-500">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Principale
                </Badge>
              )}

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!image.is_primary && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => handleSetPrimary(image.id)}
                    title="Définir comme image principale"
                  >
                    <StarOff className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() => handleDelete(image.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Badge variant="secondary">
                  Ordre: {image.display_order}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Aucune image ajoutée. Cliquez sur "Ajouter une image" pour commencer.
        </p>
      )}
    </div>
  );
};
