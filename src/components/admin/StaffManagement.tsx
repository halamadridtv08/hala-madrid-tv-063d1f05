
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Trophy, Users } from "lucide-react";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

interface Achievement {
  id: string;
  title: string;
  years: string;
}

const StaffManagement = () => {
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: "1", name: "Xabi Alonso Olano", role: "Entraîneur principal" },
    { id: "2", name: "Francesco Mauri", role: "Préparateur Physique" },
    { id: "3", name: "Luis Llopis", role: "Entraîneur des Gardiens" },
  ]);
  
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "1", title: "Ligue des Champions", years: "(2022, 2024)" },
    { id: "2", title: "Liga", years: "(2022, 2024)" },
    { id: "3", title: "Supercoupe d'Espagne", years: "(2022, 2024)" },
    { id: "4", title: "Supercoupe d'Europe", years: "(2022)" },
    { id: "5", title: "Coupe du Monde des Clubs FIFA", years: "(2022)" },
  ]);

  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  
  const [staffForm, setStaffForm] = useState({ name: "", role: "" });
  const [achievementForm, setAchievementForm] = useState({ title: "", years: "" });

  const handleAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({ name: "", role: "" });
    setIsStaffDialogOpen(true);
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setStaffForm({ name: member.name, role: member.role });
    setIsStaffDialogOpen(true);
  };

  const handleSaveStaff = () => {
    if (!staffForm.name || !staffForm.role) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (editingStaff) {
      setStaff(staff.map(member => 
        member.id === editingStaff.id 
          ? { ...member, name: staffForm.name, role: staffForm.role }
          : member
      ));
      toast.success("Membre du staff modifié avec succès");
    } else {
      const newMember: StaffMember = {
        id: Date.now().toString(),
        name: staffForm.name,
        role: staffForm.role,
      };
      setStaff([...staff, newMember]);
      toast.success("Membre du staff ajouté avec succès");
    }
    
    setIsStaffDialogOpen(false);
    setStaffForm({ name: "", role: "" });
    setEditingStaff(null);
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce membre du staff ?")) {
      setStaff(staff.filter(member => member.id !== id));
      toast.success("Membre du staff supprimé avec succès");
    }
  };

  const handleAddAchievement = () => {
    setEditingAchievement(null);
    setAchievementForm({ title: "", years: "" });
    setIsAchievementDialogOpen(true);
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setAchievementForm({ title: achievement.title, years: achievement.years });
    setIsAchievementDialogOpen(true);
  };

  const handleSaveAchievement = () => {
    if (!achievementForm.title || !achievementForm.years) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (editingAchievement) {
      setAchievements(achievements.map(achievement => 
        achievement.id === editingAchievement.id 
          ? { ...achievement, title: achievementForm.title, years: achievementForm.years }
          : achievement
      ));
      toast.success("Palmarès modifié avec succès");
    } else {
      const newAchievement: Achievement = {
        id: Date.now().toString(),
        title: achievementForm.title,
        years: achievementForm.years,
      };
      setAchievements([...achievements, newAchievement]);
      toast.success("Palmarès ajouté avec succès");
    }
    
    setIsAchievementDialogOpen(false);
    setAchievementForm({ title: "", years: "" });
    setEditingAchievement(null);
  };

  const handleDeleteAchievement = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce palmarès ?")) {
      setAchievements(achievements.filter(achievement => achievement.id !== id));
      toast.success("Palmarès supprimé avec succès");
    }
  };

  return (
    <div className="space-y-6">
      {/* Staff Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Technique ({staff.length})
            </CardTitle>
            <Button onClick={handleAddStaff}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau membre
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staff.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditStaff(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteStaff(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Palmarès ({achievements.length})
            </CardTitle>
            <Button onClick={handleAddAchievement}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau titre
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.years}</p>
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

      {/* Staff Dialog */}
      <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "Modifier le membre" : "Nouveau membre du staff"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="staff-name">Nom</Label>
              <Input
                id="staff-name"
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                placeholder="Nom du membre du staff"
              />
            </div>
            <div>
              <Label htmlFor="staff-role">Rôle</Label>
              <Input
                id="staff-role"
                value={staffForm.role}
                onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                placeholder="Rôle (ex: Entraîneur principal)"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSaveStaff}>
                {editingStaff ? "Modifier" : "Ajouter"}
              </Button>
              <Button variant="outline" onClick={() => setIsStaffDialogOpen(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Achievement Dialog */}
      <Dialog open={isAchievementDialogOpen} onOpenChange={setIsAchievementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAchievement ? "Modifier le titre" : "Nouveau titre au palmarès"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="achievement-title">Titre</Label>
              <Input
                id="achievement-title"
                value={achievementForm.title}
                onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                placeholder="Nom du titre (ex: Ligue des Champions)"
              />
            </div>
            <div>
              <Label htmlFor="achievement-years">Années</Label>
              <Input
                id="achievement-years"
                value={achievementForm.years}
                onChange={(e) => setAchievementForm({ ...achievementForm, years: e.target.value })}
                placeholder="Années (ex: (2022, 2024))"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSaveAchievement}>
                {editingAchievement ? "Modifier" : "Ajouter"}
              </Button>
              <Button variant="outline" onClick={() => setIsAchievementDialogOpen(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement;
