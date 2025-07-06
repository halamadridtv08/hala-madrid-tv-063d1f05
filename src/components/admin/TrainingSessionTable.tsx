
import React, { useState } from "react";
import { TrainingSession } from "@/types/TrainingSession";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrainingSessionForm } from "./TrainingSessionForm";

interface TrainingSessionTableProps {
  trainingSessions: TrainingSession[];
  setTrainingSessions: React.Dispatch<React.SetStateAction<TrainingSession[]>>;
}

const TrainingSessionTable = ({ trainingSessions, setTrainingSessions }: TrainingSessionTableProps) => {
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('training_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTrainingSessions(prev => prev.filter(session => session.id !== id));
      toast.success('Séance d\'entraînement supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleTogglePublish = async (session: TrainingSession) => {
    try {
      const { error } = await supabase
        .from('training_sessions')
        .update({ is_published: !session.is_published })
        .eq('id', session.id);

      if (error) throw error;

      setTrainingSessions(prev => 
        prev.map(s => 
          s.id === session.id 
            ? { ...s, is_published: !s.is_published }
            : s
        )
      );
      
      toast.success(
        session.is_published 
          ? 'Séance dépubliée' 
          : 'Séance publiée'
      );
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      toast.error('Erreur lors de la publication');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Séances d'Entraînement</CardTitle>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Séance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSession ? 'Modifier' : 'Nouvelle'} Séance d'Entraînement
                </DialogTitle>
              </DialogHeader>
              <TrainingSessionForm
                session={editingSession}
                onSuccess={(session) => {
                  if (editingSession) {
                    setTrainingSessions(prev => 
                      prev.map(s => s.id === session.id ? session : s)
                    );
                  } else {
                    setTrainingSessions(prev => [session, ...prev]);
                  }
                  setIsFormOpen(false);
                  setEditingSession(null);
                }}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingSession(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainingSessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="font-medium">
                  {session.title}
                </TableCell>
                <TableCell>
                  {new Date(session.training_date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>{session.duration || 'N/A'}</TableCell>
                <TableCell>
                  <Badge 
                    variant={session.is_published ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => handleTogglePublish(session)}
                  >
                    {session.is_published ? 'Publié' : 'Brouillon'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setEditingSession(session);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TrainingSessionTable;
