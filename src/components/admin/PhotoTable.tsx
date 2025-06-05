
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { PhotoType } from "@/types/Photo";
import { Plus, Edit, Trash2, Image } from "lucide-react";
import { toast } from "sonner";

interface PhotoTableProps {
  photos: PhotoType[];
  setPhotos: (photos: PhotoType[]) => void;
}

const PhotoTable = ({ photos, setPhotos }: PhotoTableProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette photo ?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPhotos(photos.filter(photo => photo.id !== id));
      toast.success("Photo supprimée avec succès");
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error("Erreur lors de la suppression de la photo");
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('photos')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setPhotos(photos.map(photo => 
        photo.id === id 
          ? { ...photo, is_published: !currentStatus }
          : photo
      ));
      toast.success("Statut de publication mis à jour");
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Photos ({photos.length})</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle photo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {photos.map((photo) => (
            <div key={photo.id} className="flex items-center justify-between p-4 border rounded">
              <div className="flex items-center gap-4 flex-1">
                {photo.image_url && (
                  <img 
                    src={photo.image_url} 
                    alt={photo.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{photo.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{photo.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={photo.is_published ? "default" : "secondary"}>
                      {photo.is_published ? "Publié" : "Brouillon"}
                    </Badge>
                    {photo.category && <Badge variant="outline">{photo.category}</Badge>}
                    {photo.photographer && (
                      <span className="text-xs text-gray-500">Par {photo.photographer}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePublished(photo.id, photo.is_published)}
                  disabled={loading}
                >
                  <Image className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(photo.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {photos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune photo trouvée
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoTable;
