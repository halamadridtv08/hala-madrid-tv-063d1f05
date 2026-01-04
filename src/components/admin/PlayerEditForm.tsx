
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X } from "lucide-react";
import { MediaUploader } from "./MediaUploader";

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number | null;
  nationality: string | null;
  age: number | null;
  height: string | null;
  weight: string | null;
  image_url: string | null;
  bio: string | null;
  profile_image_url: string | null;
  biography: string | null;
  social_media: any;
  is_active: boolean;
  is_featured?: boolean;
}

interface PlayerEditFormProps {
  player: Player;
  onPlayerUpdated: () => void;
}

export function PlayerEditForm({ player, onPlayerUpdated }: PlayerEditFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: player.name,
    position: player.position,
    jersey_number: player.jersey_number?.toString() || "",
    nationality: player.nationality || "",
    age: player.age?.toString() || "",
    height: player.height || "",
    weight: player.weight || "",
    image_url: player.image_url || "",
    bio: player.bio || "",
    profile_image_url: player.profile_image_url || "",
    biography: player.biography || "",
    social_media: player.social_media || { twitter: "", instagram: "", facebook: "" },
    is_active: player.is_active,
    is_featured: player.is_featured || false
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('players')
        .update({
          ...formData,
          jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : null,
          age: formData.age ? parseInt(formData.age) : null,
        })
        .eq('id', player.id);

      if (error) throw error;

      toast({
        title: "Joueur modifié",
        description: "Les informations ont été mises à jour avec succès"
      });

      setIsOpen(false);
      onPlayerUpdated();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Modifier le joueur">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier {player.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Nom*</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-position">Position*</Label>
              <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gardien">Gardien</SelectItem>
                  <SelectItem value="Défenseur">Défenseur</SelectItem>
                  <SelectItem value="Milieu">Milieu</SelectItem>
                  <SelectItem value="Attaquant">Attaquant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-jersey">Numéro de maillot</Label>
              <Input
                id="edit-jersey"
                type="number"
                value={formData.jersey_number}
                onChange={(e) => setFormData(prev => ({ ...prev, jersey_number: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-nationality">Nationalité</Label>
              <Input
                id="edit-nationality"
                value={formData.nationality}
                onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-age">Âge</Label>
              <Input
                id="edit-age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-height">Taille</Label>
              <Input
                id="edit-height"
                value={formData.height}
                onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-weight">Poids</Label>
              <Input
                id="edit-weight"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-image">Image du joueur</Label>
              <div className="space-y-2">
                <Input
                  id="edit-image"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="URL de l'image ou utilisez l'uploader ci-dessous"
                />
                <MediaUploader
                  onSuccess={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
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

            <div className="md:col-span-2">
              <Label htmlFor="edit-bio">Biographie courte</Label>
              <Textarea
                id="edit-bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="edit-biography">Biographie complète</Label>
              <Textarea
                id="edit-biography"
                value={formData.biography}
                onChange={(e) => setFormData(prev => ({ ...prev, biography: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="edit-active">Joueur actif</Label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="edit-featured">Joueur Vedette (plusieurs joueurs peuvent être vedettes)</Label>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-6">
                  Les joueurs vedettes apparaîtront dans le carrousel sur la page d'accueil
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
