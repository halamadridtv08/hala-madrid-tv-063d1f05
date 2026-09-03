
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Player } from "@/types/Player";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MediaUploader } from "./MediaUploader";

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
    formation_image_url: player?.formation_image_url || "",
    bio: player?.bio || "",
    is_active: player?.is_active !== false,
    is_featured: player?.is_featured || false,
    squad_type: player?.squad_type || "pro",
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
    <Card className="border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="px-0 sm:px-6">
        <CardTitle>
          {player ? "Modifier le joueur" : "Nouveau joueur"}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="sm:col-span-2">
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
          </div>
          
          <div>
            <Label htmlFor="image_url">Image du joueur</Label>
            <div className="space-y-2">
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="URL de l'image ou utilisez l'uploader ci-dessous"
              />
              <MediaUploader
                onSuccess={(url) => setFormData({ ...formData, image_url: url })}
                acceptTypes="image/*"
                maxSizeMB={10}
                buttonText="Télécharger une image HD"
                folderPath="players"
                currentValue={formData.image_url}
                showPreview={true}
              />
              <p className="text-xs text-muted-foreground">
                Recommandé: image PNG ou JPG de haute résolution (min. 800x800px)
              </p>
            </div>
          </div>
          

          <div>
            <Label htmlFor="formation_image_url">Photo pour les compositions</Label>
            <div className="space-y-2">
              <Input
                id="formation_image_url"
                type="url"
                value={formData.formation_image_url}
                onChange={(e) => setFormData({ ...formData, formation_image_url: e.target.value })}
                placeholder="URL de la photo utilisée sur le terrain"
              />
              <MediaUploader
                onSuccess={(url) => setFormData({ ...formData, formation_image_url: url })}
                acceptTypes="image/*"
                maxSizeMB={10}
                buttonText="Télécharger une photo de compo"
                bucketName="compos"
                folderPath="players"
                currentValue={formData.formation_image_url}
                showPreview={true}
              />
              <p className="text-xs text-muted-foreground">
                Utilisée uniquement pour les têtes des joueurs dans les compositions. Sans photo, les initiales sont affichées.
              </p>
            </div>
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

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_featured">Joueur Vedette (plusieurs joueurs peuvent être vedettes)</Label>
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Les joueurs vedettes apparaîtront dans le carrousel sur la page d'accueil
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="squad_type">Effectif</Label>
            <select
              id="squad_type"
              value={formData.squad_type}
              onChange={(e) => setFormData({ ...formData, squad_type: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="pro">Équipe première (Pro)</option>
              <option value="castilla">Castilla / La Fábrica</option>
            </select>
            <p className="text-sm text-muted-foreground">
              Les joueurs Castilla apparaissent dans l'onglet dédié de la page Effectif
            </p>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
