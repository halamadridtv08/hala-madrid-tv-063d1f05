
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

interface Coach {
  id: string;
  name: string;
  role: string;
  nationality: string | null;
  age: number | null;
  experience_years: number | null;
  image_url: string | null;
  bio: string | null;
  profile_image_url: string | null;
  biography: string | null;
  social_media: any;
  is_active: boolean;
}

interface CoachEditFormProps {
  coach: Coach;
  onCoachUpdated: () => void;
}

export function CoachEditForm({ coach, onCoachUpdated }: CoachEditFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: coach.name,
    role: coach.role,
    nationality: coach.nationality || "",
    age: coach.age?.toString() || "",
    experience_years: coach.experience_years?.toString() || "",
    image_url: coach.image_url || "",
    bio: coach.bio || "",
    profile_image_url: coach.profile_image_url || "",
    biography: coach.biography || "",
    social_media: coach.social_media || { twitter: "", instagram: "", facebook: "" },
    is_active: coach.is_active
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('coaches')
        .update({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
          experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        })
        .eq('id', coach.id);

      if (error) throw error;

      toast({
        title: "Coach modifié",
        description: "Les informations ont été mises à jour avec succès"
      });

      setIsOpen(false);
      onCoachUpdated();
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
        <Button variant="ghost" size="icon" title="Modifier le coach">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier {coach.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-coach-name">Nom*</Label>
              <Input
                id="edit-coach-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-coach-role">Rôle*</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entraîneur principal">Entraîneur principal</SelectItem>
                  <SelectItem value="Entraîneur adjoint">Entraîneur adjoint</SelectItem>
                  <SelectItem value="Entraîneur des gardiens">Entraîneur des gardiens</SelectItem>
                  <SelectItem value="Préparateur physique">Préparateur physique</SelectItem>
                  <SelectItem value="Analyste vidéo">Analyste vidéo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-coach-nationality">Nationalité</Label>
              <Input
                id="edit-coach-nationality"
                value={formData.nationality}
                onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-coach-age">Âge</Label>
              <Input
                id="edit-coach-age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-coach-experience">Années d'expérience</Label>
              <Input
                id="edit-coach-experience"
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-coach-image">URL de l'image</Label>
              <Input
                id="edit-coach-image"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="edit-coach-bio">Biographie courte</Label>
              <Textarea
                id="edit-coach-bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="edit-coach-biography">Biographie complète</Label>
              <Textarea
                id="edit-coach-biography"
                value={formData.biography}
                onChange={(e) => setFormData(prev => ({ ...prev, biography: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-coach-active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4"
              />
              <Label htmlFor="edit-coach-active">Coach actif</Label>
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
