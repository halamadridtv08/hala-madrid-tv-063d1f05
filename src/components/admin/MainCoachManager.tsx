
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trophy, User, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Coach } from "@/types/Coach";

interface Achievement {
  id: string;
  title: string;
  year: string;
  description?: string;
}

export const MainCoachManager = () => {
  const [mainCoach, setMainCoach] = useState<Coach | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "1", title: "Ligue des Champions", year: "2022, 2024", description: "Victoires en Champions League" },
    { id: "2", title: "Liga", year: "2022, 2024", description: "Championnats d'Espagne" },
    { id: "3", title: "Supercoupe d'Espagne", year: "2022, 2024", description: "Trophées nationaux" },
    { id: "4", title: "Supercoupe d'Europe", year: "2022", description: "Victoire européenne" },
    { id: "5", title: "Coupe du Monde des Clubs FIFA", year: "2022", description: "Championnat du monde des clubs" }
  ]);

  const [isCoachDialogOpen, setIsCoachDialogOpen] = useState(false);
  const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

  const [coachForm, setCoachForm] = useState({
    name: "",
    nationality: "",
    bio: "",
    age: "",
    experience_years: "",
    image_url: ""
  });

  const [achievementForm, setAchievementForm] = useState({
    title: "",
    year: "",
    description: ""
  });

  // Charger l'entraîneur principal depuis Supabase
  useEffect(() => {
    const fetchMainCoach = async () => {
      try {
        const { data, error } = await supabase
          .from('coaches')
          .select('*')
          .eq('role', 'Entraîneur principal')
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setMainCoach(data);
          setCoachForm({
            name: data.name || "",
            nationality: data.nationality || "",
            bio: data.bio || "",
            age: data.age?.toString() || "",
            experience_years: data.experience_years?.toString() || "",
            image_url: data.image_url || ""
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'entraîneur principal:', error);
        toast.error("Erreur lors du chargement de l'entraîneur principal");
      }
    };

    fetchMainCoach();
  }, []);

  const handleEditCoach = () => {
    if (mainCoach) {
      setCoachForm({
        name: mainCoach.name || "",
        nationality: mainCoach.nationality || "",
        bio: mainCoach.bio || "",
        age: mainCoach.age?.toString() || "",
        experience_years: mainCoach.experience_years?.toString() || "",
        image_url: mainCoach.image_url || ""
      });
    }
    setIsCoachDialogOpen(true);
  };

  const handleSaveCoach = async () => {
    if (!coachForm.name) {
      toast.error("Le nom est obligatoire");
      return;
    }

    try {
      const coachData = {
        name: coachForm.name,
        role: "Entraîneur principal",
        nationality: coachForm.nationality || null,
        bio: coachForm.bio || null,
        age: coachForm.age ? parseInt(coachForm.age) : null,
        experience_years: coachForm.experience_years ? parseInt(coachForm.experience_years) : null,
        image_url: coachForm.image_url || null,
        is_active: true
      };

      if (mainCoach) {
        // Mettre à jour l'entraîneur existant
        const { error } = await supabase
          .from('coaches')
          .update(coachData)
          .eq('id', mainCoach.id);

        if (error) throw error;

        setMainCoach({ ...mainCoach, ...coachData });
        toast.success("Entraîneur principal modifié avec succès");
      } else {
        // Créer un nouvel entraîneur principal
        const { data, error } = await supabase
          .from('coaches')
          .insert([coachData])
          .select()
          .single();

        if (error) throw error;

        setMainCoach(data);
        toast.success("Entraîneur principal créé avec succès");
      }

      setIsCoachDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error("Erreur lors de la sauvegarde de l'entraîneur principal");
    }
  };

  const handleAddAchievement = () => {
    setEditingAchievement(null);
    setAchievementForm({ title: "", year: "", description: "" });
    setIsAchievementDialogOpen(true);
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setAchievementForm({
      title: achievement.title,
      year: achievement.year,
      description: achievement.description || ""
    });
    setIsAchievementDialogOpen(true);
  };

  const handleSaveAchievement = () => {
    if (!achievementForm.title || !achievementForm.year) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (editingAchievement) {
      setAchievements(prev => prev.map(achievement => 
        achievement.id === editingAchievement.id 
          ? { ...achievement, ...achievementForm }
          : achievement
      ));
      toast.success("Titre modifié avec succès");
    } else {
      const newAchievement: Achievement = {
        id: Date.now().toString(),
        ...achievementForm
      };
      setAchievements(prev => [...prev, newAchievement]);
      toast.success("Titre ajouté avec succès");
    }

    setIsAchievementDialogOpen(false);
    setEditingAchievement(null);
  };

  const handleDeleteAchievement = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce titre ?")) {
      setAchievements(prev => prev.filter(achievement => achievement.id !== id));
      toast.success("Titre supprimé avec succès");
    }
  };

  return (
    <div className="space-y-6">
      {/* Informations de l'entraîneur principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Entraîneur Principal
            </CardTitle>
            <Button onClick={handleEditCoach}>
              <Edit className="h-4 w-4 mr-2" />
              {mainCoach ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mainCoach ? (
            <div className="flex items-center gap-4 p-4 border rounded">
              {mainCoach.image_url && (
                <img 
                  src={mainCoach.image_url} 
                  alt={mainCoach.name}
                  className="w-16 h-16 object-cover rounded-full"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{mainCoach.name}</h3>
                <p className="text-sm text-gray-600">{mainCoach.role}</p>
                {mainCoach.nationality && (
                  <p className="text-sm text-gray-500">Nationalité: {mainCoach.nationality}</p>
                )}
                {mainCoach.age && (
                  <p className="text-sm text-gray-500">Âge: {mainCoach.age} ans</p>
                )}
                {mainCoach.experience_years && (
                  <p className="text-sm text-gray-500">Expérience: {mainCoach.experience_years} ans</p>
                )}
                {mainCoach.bio && (
                  <p className="text-sm text-gray-600 mt-2">{mainCoach.bio}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={mainCoach.is_active ? "default" : "secondary"}>
                    {mainCoach.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucun entraîneur principal configuré
            </div>
          )}
        </CardContent>
      </Card>

      {/* Palmarès avec le Real Madrid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Palmarès avec le Real Madrid ({achievements.length} titres)
            </CardTitle>
            <Button onClick={handleAddAchievement}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un titre
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center justify-between p-4 border rounded">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <Badge variant="outline">{achievement.year}</Badge>
                  </div>
                  {achievement.description && (
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditAchievement(achievement)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteAchievement(achievement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour modifier l'entraîneur */}
      <Dialog open={isCoachDialogOpen} onOpenChange={setIsCoachDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {mainCoach ? "Modifier l'entraîneur principal" : "Ajouter l'entraîneur principal"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="coach-name">Nom *</Label>
              <Input
                id="coach-name"
                value={coachForm.name}
                onChange={(e) => setCoachForm({ ...coachForm, name: e.target.value })}
                placeholder="Nom de l'entraîneur"
              />
            </div>
            <div>
              <Label htmlFor="coach-nationality">Nationalité</Label>
              <Input
                id="coach-nationality"
                value={coachForm.nationality}
                onChange={(e) => setCoachForm({ ...coachForm, nationality: e.target.value })}
                placeholder="Ex: Italie, Espagne..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coach-age">Âge</Label>
                <Input
                  id="coach-age"
                  type="number"
                  value={coachForm.age}
                  onChange={(e) => setCoachForm({ ...coachForm, age: e.target.value })}
                  placeholder="Âge"
                />
              </div>
              <div>
                <Label htmlFor="coach-experience">Années d'expérience</Label>
                <Input
                  id="coach-experience"
                  type="number"
                  value={coachForm.experience_years}
                  onChange={(e) => setCoachForm({ ...coachForm, experience_years: e.target.value })}
                  placeholder="Années d'expérience"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="coach-image">URL de l'image</Label>
              <Input
                id="coach-image"
                value={coachForm.image_url}
                onChange={(e) => setCoachForm({ ...coachForm, image_url: e.target.value })}
                placeholder="URL de l'image de profil"
              />
            </div>
            <div>
              <Label htmlFor="coach-bio">Biographie</Label>
              <Textarea
                id="coach-bio"
                value={coachForm.bio}
                onChange={(e) => setCoachForm({ ...coachForm, bio: e.target.value })}
                placeholder="Biographie de l'entraîneur"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCoachDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveCoach}>
                {mainCoach ? "Modifier" : "Ajouter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour les titres */}
      <Dialog open={isAchievementDialogOpen} onOpenChange={setIsAchievementDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAchievement ? "Modifier le titre" : "Nouveau titre"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="achievement-title">Titre *</Label>
              <Input
                id="achievement-title"
                value={achievementForm.title}
                onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                placeholder="Ex: Ligue des Champions, Liga..."
              />
            </div>
            <div>
              <Label htmlFor="achievement-year">Année(s) *</Label>
              <Input
                id="achievement-year"
                value={achievementForm.year}
                onChange={(e) => setAchievementForm({ ...achievementForm, year: e.target.value })}
                placeholder="Ex: 2022, 2024 ou 2022, 2023, 2024"
              />
            </div>
            <div>
              <Label htmlFor="achievement-description">Description</Label>
              <Textarea
                id="achievement-description"
                value={achievementForm.description}
                onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                placeholder="Description optionnelle du titre"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAchievementDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveAchievement}>
                {editingAchievement ? "Modifier" : "Ajouter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
