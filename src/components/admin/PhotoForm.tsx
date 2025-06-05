
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoType } from "@/types/Photo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PhotoFormProps {
  photo?: PhotoType;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PhotoForm = ({ photo, onSuccess, onCancel }: PhotoFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: photo?.title || "",
    description: photo?.description || "",
    image_url: photo?.image_url || "",
    category: photo?.category || "",
    photographer: photo?.photographer || "",
    is_published: photo?.is_published || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (photo?.id) {
        // Update existing photo
        const { error } = await supabase
          .from('photos')
          .update(formData)
          .eq('id', photo.id);

        if (error) throw error;
        toast.success("Photo mise à jour avec succès");
      } else {
        // Create new photo
        const { error } = await supabase
          .from('photos')
          .insert([formData]);

        if (error) throw error;
        toast.success("Photo créée avec succès");
      }

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'enregistrement de la photo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {photo ? "Modifier la photo" : "Nouvelle photo"}
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
            <Label htmlFor="image_url">URL de l'image</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              required
            />
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
            <Label htmlFor="photographer">Photographe</Label>
            <Input
              id="photographer"
              value={formData.photographer}
              onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
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
