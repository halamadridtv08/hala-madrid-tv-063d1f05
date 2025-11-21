
import React, { useState } from "react";
import { PressConference } from "@/types/PressConference";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
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
import { PressConferenceForm } from "./PressConferenceForm";

interface PressConferenceTableProps {
  pressConferences: PressConference[];
  setPressConferences: React.Dispatch<React.SetStateAction<PressConference[]>>;
}

const PressConferenceTable = ({ pressConferences, setPressConferences }: PressConferenceTableProps) => {
  const [editingConference, setEditingConference] = useState<PressConference | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('press_conferences')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPressConferences(prev => prev.filter(conf => conf.id !== id));
      toast.success('Conférence de presse supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleTogglePublish = async (conference: PressConference) => {
    try {
      const { error } = await supabase
        .from('press_conferences')
        .update({ is_published: !conference.is_published })
        .eq('id', conference.id);

      if (error) throw error;

      setPressConferences(prev => 
        prev.map(conf => 
          conf.id === conference.id 
            ? { ...conf, is_published: !conf.is_published }
            : conf
        )
      );
      
      toast.success(
        conference.is_published 
          ? 'Conférence dépubliée' 
          : 'Conférence publiée'
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
          <CardTitle>Conférences de Presse</CardTitle>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Conférence
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingConference ? 'Modifier' : 'Nouvelle'} Conférence de Presse
                </DialogTitle>
              </DialogHeader>
              <PressConferenceForm
                conference={editingConference}
                onSuccess={(conference) => {
                  if (editingConference) {
                    setPressConferences(prev => 
                      prev.map(conf => conf.id === conference.id ? conference : conf)
                    );
                  } else {
                    setPressConferences(prev => [conference, ...prev]);
                  }
                  setIsFormOpen(false);
                  setEditingConference(null);
                }}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingConference(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pressConferences.map((conference) => (
            <div key={conference.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm sm:text-base truncate">{conference.title}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {new Date(conference.conference_date).toLocaleDateString('fr-FR')}
                  </span>
                  {conference.duration && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">• {conference.duration}</span>
                  )}
                  <Badge
                    variant={conference.is_published ? "default" : "secondary"}
                    className="cursor-pointer text-xs"
                    onClick={() => handleTogglePublish(conference)}
                  >
                    {conference.is_published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 justify-end sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingConference(conference);
                    setIsFormOpen(true);
                  }}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(conference.id)}
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

export default PressConferenceTable;
