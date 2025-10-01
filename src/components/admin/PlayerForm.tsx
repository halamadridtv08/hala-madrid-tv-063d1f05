
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Player } from "@/types/Player";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlayerFormProps {
  player?: Player;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PlayerForm = ({ player, onSuccess, onCancel }: PlayerFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: player?.name || "",
    position: player?.position || "",
    jersey_number: player?.jersey_number || 0,
    age: player?.age || 0,
    nationality: player?.nationality || "",
    height: player?.height || "",
    weight: player?.weight || "",
    image_url: player?.image_url || "",
    bio: player?.bio || "",
    is_active: player?.is_active !== false,
    is_featured: player?.is_featured || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (player?.id) {
        // Update existing player
        const { error } = await supabase
          .from('players')
          .update(formData)
          .eq('id', player.id);

        if (error) throw error;
        toast.success("Joueur mis à jour avec succès");
      } else {
        // Create new player
        const { error } = await supabase
          .from('players')
          .insert([formData]);

        if (error) throw error;
        toast.success("Joueur créé avec succès");
      }

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'enregistrement du joueur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {player ? "Modifier le joueur" : "Nouveau joueur"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="jersey_number">Numéro de maillot</Label>
            <Input
              id="jersey_number"
              type="number"
              value={formData.jersey_number}
              onChange={(e) => setFormData({ ...formData, jersey_number: parseInt(e.target.value) || 0 })}
            />
          </div>
          
          <div>
            <Label htmlFor="age">Âge</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
            />
          </div>
          
          <div>
            <Label htmlFor="nationality">Nationalité</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="height">Taille</Label>
            <Input
              id="height"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="weight">Poids</Label>
            <Input
              id="weight"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="image_url">URL de l'image</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="bio">Biographie</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <Label htmlFor="is_active">Actif</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
            />
            <Label htmlFor="is_featured">Joueur Vedette</Label>
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
