
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/Player";
import { PlayerForm } from "./PlayerForm";
import { Plus, Edit, Trash2, User } from "lucide-react";
import { toast } from "sonner";

interface PlayerTableProps {
  players: Player[];
  setPlayers: (players: Player[]) => void;
}

const PlayerTable = ({ players, setPlayers }: PlayerTableProps) => {
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | undefined>(undefined);

  const refreshPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Erreur lors du rechargement des joueurs:', error);
      toast.error("Erreur lors du rechargement des joueurs");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce joueur ?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPlayers(players.filter(player => player.id !== id));
      toast.success("Joueur supprimé avec succès");
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error("Erreur lors de la suppression du joueur");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('players')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setPlayers(players.map(player => 
        player.id === id 
          ? { ...player, is_active: !currentStatus }
          : player
      ));
      toast.success("Statut du joueur mis à jour");
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = () => {
    setEditingPlayer(undefined);
    setIsFormOpen(true);
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingPlayer(undefined);
    refreshPlayers();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingPlayer(undefined);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Joueurs ({players.length})</CardTitle>
            <Button onClick={handleAddPlayer}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau joueur
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {players.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-4 border rounded">
                <div className="flex items-center gap-4 flex-1">
                  {player.image_url && (
                    <img 
                      src={player.image_url} 
                      alt={player.name}
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{player.name}</h3>
                    <p className="text-sm text-gray-600">{player.position}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={player.is_active ? "default" : "secondary"}>
                        {player.is_active ? "Actif" : "Inactif"}
                      </Badge>
                      {player.jersey_number && (
                        <Badge variant="outline">#{player.jersey_number}</Badge>
                      )}
                      {player.nationality && (
                        <span className="text-xs text-gray-500">{player.nationality}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(player.id, player.is_active)}
                    disabled={loading}
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditPlayer(player)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(player.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {players.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun joueur trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlayer ? "Modifier le joueur" : "Nouveau joueur"}
            </DialogTitle>
          </DialogHeader>
          <PlayerForm
            player={editingPlayer}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlayerTable;
