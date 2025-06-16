
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Trophy, Users } from "lucide-react";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  description?: string;
}

interface Achievement {
  id: string;
  title: string;
  year: string;
  description?: string;
}

export const StaffAndAchievements = () => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    { id: "1", name: "Francesco Mauri", role: "Préparateur Physique", description: "Spécialiste en conditionnement physique" },
    { id: "2", name: "Luis Llopis", role: "Entraîneur des Gardiens", description: "Expert en techniques de gardien de but" }
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "1", title: "Ligue des Champions", year: "2022, 2024", description: "Victoires en Champions League" },
    { id: "2", title: "Liga", year: "2022, 2024", description: "Championnats d'Espagne" },
    { id: "3", title: "Supercoupe d'Espagne", year: "2022, 2024", description: "Trophées nationaux" },
    { id: "4", title: "Supercoupe d'Europe", year: "2022", description: "Victoire européenne" },
    { id: "5", title: "Coupe du Monde des Clubs FIFA", year: "2022", description: "Championnat du monde des clubs" }
  ]);

  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

  const [staffForm, setStaffForm] = useState({
    name: "",
    role: "",
    description: ""
  });

  const [achievementForm, setAchievementForm] = useState({
    title: "",
    year: "",
    description: ""
  });

  const handleAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({ name: "", role: "", description: "" });
    setIsStaffDialogOpen(true);
  };

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setStaffForm({
      name: staff.name,
      role: staff.role,
      description: staff.description || ""
    });
    setIsStaffDialogOpen(true);
  };

  const handleSaveStaff = () => {
    if (!staffForm.name || !staffForm.role) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (editingStaff) {
      setStaffMembers(prev => prev.map(staff => 
        staff.id === editingStaff.id 
          ? { ...staff, ...staffForm }
          : staff
      ));
      toast.success("Membre du staff modifié avec succès");
    } else {
      const newStaff: StaffMember = {
        id: Date.now().toString(),
        ...staffForm
      };
      setStaffMembers(prev => [...prev, newStaff]);
      toast.success("Membre du staff ajouté avec succès");
    }

    setIsStaffDialogOpen(false);
    setEditingStaff(null);
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce membre du staff ?")) {
      setStaffMembers(prev => prev.filter(staff => staff.id !== id));
      toast.success("Membre du staff supprimé avec succès");
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
      {/* Staff Technique Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Technique ({staffMembers.length} membres)
            </CardTitle>
            <Button onClick={handleAddStaff}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un membre
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staffMembers.map((staff) => (
              <div key={staff.id} className="flex items-center justify-between p-4 border rounded">
                <div className="flex-1">
                  <h3 className="font-semibold">{staff.name}</h3>
                  <p className="text-sm text-gray-600">{staff.role}</p>
                  {staff.description && (
                    <p className="text-xs text-gray-500 mt-1">{staff.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditStaff(staff)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteStaff(staff.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {staffMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun membre du staff technique trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Palmarès Section */}
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
            {achievements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun titre trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Staff Dialog */}
      <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "Modifier le membre du staff" : "Nouveau membre du staff"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="staff-name">Nom *</Label>
              <Input
                id="staff-name"
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                placeholder="Nom du membre du staff"
              />
            </div>
            <div>
              <Label htmlFor="staff-role">Rôle *</Label>
              <Input
                id="staff-role"
                value={staffForm.role}
                onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                placeholder="Ex: Préparateur Physique, Analyste Vidéo..."
              />
            </div>
            <div>
              <Label htmlFor="staff-description">Description</Label>
              <Textarea
                id="staff-description"
                value={staffForm.description}
                onChange={(e) => setStaffForm({ ...staffForm, description: e.target.value })}
                placeholder="Description optionnelle du rôle"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsStaffDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveStaff}>
                {editingStaff ? "Modifier" : "Ajouter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Achievement Dialog */}
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
