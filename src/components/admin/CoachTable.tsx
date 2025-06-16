
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Coach } from "@/types/Coach";
import { CoachForm } from "./CoachForm";
import { StaffAndAchievements } from "./StaffAndAchievements";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

interface CoachTableProps {
  coaches: Coach[];
  setCoaches: (coaches: Coach[]) => void;
}

const CoachTable = ({ coaches, setCoaches }: CoachTableProps) => {
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | undefined>(undefined);

  const refreshCoaches = async () => {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCoaches(data || []);
    } catch (error) {
      console.error('Erreur lors du rechargement des entraîneurs:', error);
      toast.error("Erreur lors du rechargement des entraîneurs");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet entraîneur ?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('coaches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCoaches(coaches.filter(coach => coach.id !== id));
      toast.success("Entraîneur supprimé avec succès");
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error("Erreur lors de la suppression de l'entraîneur");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('coaches')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setCoaches(coaches.map(coach => 
        coach.id === id 
          ? { ...coach, is_active: !currentStatus }
          : coach
      ));
      toast.success("Statut de l'entraîneur mis à jour");
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoach = () => {
    setEditingCoach(undefined);
    setIsFormOpen(true);
  };

  const handleEditCoach = (coach: Coach) => {
    setEditingCoach(coach);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingCoach(undefined);
    refreshCoaches();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingCoach(undefined);
  };

  return (
    <>
      <Tabs defaultValue="coaches" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="coaches">Entraîneurs</TabsTrigger>
          <TabsTrigger value="staff">Staff & Palmarès</TabsTrigger>
        </TabsList>

        <TabsContent value="coaches">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Entraîneurs ({coaches.length})</CardTitle>
                <Button onClick={handleAddCoach}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel entraîneur
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coaches.map((coach) => (
                  <div key={coach.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex items-center gap-4 flex-1">
                      {coach.image_url && (
                        <img 
                          src={coach.image_url} 
                          alt={coach.name}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{coach.name}</h3>
                        <p className="text-sm text-gray-600">{coach.role}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={coach.is_active ? "default" : "secondary"}>
                            {coach.is_active ? "Actif" : "Inactif"}
                          </Badge>
                          {coach.experience_years && (
                            <Badge variant="outline">{coach.experience_years} ans d'exp.</Badge>
                          )}
                          {coach.nationality && (
                            <span className="text-xs text-gray-500">{coach.nationality}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(coach.id, coach.is_active)}
                        disabled={loading}
                        title={coach.is_active ? "Désactiver" : "Activer"}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCoach(coach)}
                        title="Modifier l'entraîneur"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(coach.id)}
                        disabled={loading}
                        title="Supprimer l'entraîneur"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {coaches.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucun entraîneur trouvé
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <StaffAndAchievements />
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCoach ? "Modifier l'entraîneur" : "Nouvel entraîneur"}
            </DialogTitle>
          </DialogHeader>
          <CoachForm
            coach={editingCoach}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CoachTable;
