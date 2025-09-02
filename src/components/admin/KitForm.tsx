import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Kit } from "@/types/Kit";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MediaUploader } from "./MediaUploader";

interface KitFormProps {
  kit?: Kit;
  onSuccess: () => void;
  onCancel: () => void;
}

export const KitForm = ({ kit, onSuccess, onCancel }: KitFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: kit?.title || "",
    type: kit?.type || "domicile" as const,
    season: kit?.season || "2025/26",
    image_url: kit?.image_url || "",
    description: kit?.description || "",
    price: kit?.price || 0,
    is_featured: kit?.is_featured || false,
    is_published: kit?.is_published ?? true,
    display_order: kit?.display_order || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (kit?.id) {
        // Update existing kit
        const { error } = await supabase
          .from('kits')
          .update(formData)
          .eq('id', kit.id);

        if (error) throw error;
        toast.success("Maillot mis à jour avec succès");
      } else {
        // Create new kit
        const { error } = await supabase
          .from('kits')
          .insert([formData]);

        if (error) throw error;
        toast.success("Maillot créé avec succès");
      }

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'enregistrement du maillot");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {kit ? "Modifier le maillot" : "Nouveau maillot"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Domicile 25/26"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de maillot</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domicile">Domicile</SelectItem>
                  <SelectItem value="exterieur">Extérieur</SelectItem>
                  <SelectItem value="third">Troisième</SelectItem>
                  <SelectItem value="fourth">Quatrième</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">Saison</Label>
              <Input
                id="season"
                value={formData.season}
                onChange={(e) => setFormData(prev => ({ ...prev, season: e.target.value }))}
                placeholder="Ex: 2025/26"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Prix (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="Ex: 89.99"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Ordre d'affichage</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du maillot..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Image du maillot</Label>
            <MediaUploader
              onSuccess={handleImageUpload}
              acceptTypes="image/*"
              currentValue={formData.image_url}
              buttonText="Ajouter une image"
              showPreview={true}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
              />
              <Label htmlFor="is_featured">Maillot en vedette</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
              />
              <Label htmlFor="is_published">Publié</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
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