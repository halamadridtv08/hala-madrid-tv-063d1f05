
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
        <div className="space-y-3">
          {trainingSessions.map((session) => (
            <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm sm:text-base truncate">{session.title}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {new Date(session.training_date).toLocaleDateString('fr-FR')}
                  </span>
                  {session.duration && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">• {session.duration}</span>
                  )}
                  <Badge
                    variant={session.is_published ? "default" : "secondary"}
                    className="cursor-pointer text-xs"
                    onClick={() => handleTogglePublish(session)}
                  >
                    {session.is_published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 justify-end sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingSession(session);
                    setIsFormOpen(true);
                  }}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(session.id)}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingSessionTable;
