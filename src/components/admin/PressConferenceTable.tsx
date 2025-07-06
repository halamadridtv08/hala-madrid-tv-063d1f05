
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
            {pressConferences.map((conference) => (
              <TableRow key={conference.id}>
                <TableCell className="font-medium">
                  {conference.title}
                </TableCell>
                <TableCell>
                  {new Date(conference.conference_date).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell>{conference.duration || 'N/A'}</TableCell>
                <TableCell>
                  <Badge 
                    variant={conference.is_published ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => handleTogglePublish(conference)}
                  >
                    {conference.is_published ? 'Publié' : 'Brouillon'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setEditingConference(conference);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(conference.id)}
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

export default PressConferenceTable;
