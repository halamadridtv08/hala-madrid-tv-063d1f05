import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/Player";
import { PlayerForm } from "./PlayerForm";
import { Plus, Edit, Trash2, User, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface PlayerPositionManagerProps {
  players: Player[];
  setPlayers: (players: Player[]) => void;
}

interface PositionGroup {
  id: string;
  name: string;
  players: Player[];
  color: string;
}

const PlayerPositionManager = ({ players, setPlayers }: PlayerPositionManagerProps) => {
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | undefined>(undefined);
  const [positionGroups, setPositionGroups] = useState<PositionGroup[]>([]);
  const [draggedGroup, setDraggedGroup] = useState<string | null>(null);
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    organizePlayersByPosition();
  }, [players]);

  const organizePlayersByPosition = () => {
    console.log('Organizing players:', players.map(p => ({ name: p.name, position: p.position })));
    
    const positions = [
      { id: 'gardien', name: 'Gardiens', color: 'bg-green-100 border-green-300' },
      { id: 'defenseur', name: 'Défenseurs', color: 'bg-blue-100 border-blue-300' },
      { id: 'milieu', name: 'Milieux', color: 'bg-yellow-100 border-yellow-300' },
      { id: 'attaquant', name: 'Attaquants', color: 'bg-red-100 border-red-300' }
    ];

    const groups = positions.map(pos => {
      let filteredPlayers: Player[] = [];
      
      // Logique de filtrage améliorée pour correspondre aux données réelles
      switch (pos.id) {
        case 'gardien':
          filteredPlayers = players.filter(player => 
            player.position.toLowerCase().includes('gardien') ||
            player.position.toLowerCase().includes('goalkeeper')
          );
          break;
        case 'defenseur':
          filteredPlayers = players.filter(player => 
            player.position.toLowerCase().includes('défenseur') ||
            player.position.toLowerCase().includes('defenseur') ||
            player.position.toLowerCase().includes('arrière') ||
            player.position.toLowerCase().includes('latéral') ||
            player.position.toLowerCase().includes('lateral') ||
            player.position.toLowerCase().includes('central') ||
            player.position.toLowerCase().includes('defender')
          );
          break;
        case 'milieu':
          filteredPlayers = players.filter(player => 
            player.position.toLowerCase().includes('milieu') ||
            player.position.toLowerCase().includes('midfielder') ||
            player.position.toLowerCase().includes('centre') ||
            player.position.toLowerCase().includes('médian') ||
            player.position.toLowerCase().includes('median')
          );
          break;
        case 'attaquant':
          filteredPlayers = players.filter(player => 
            player.position.toLowerCase().includes('attaquant') ||
            player.position.toLowerCase().includes('ailier') ||
            player.position.toLowerCase().includes('avant') ||
            player.position.toLowerCase().includes('striker') ||
            player.position.toLowerCase().includes('forward') ||
            player.position.toLowerCase().includes('winger')
          );
          break;
      }
      
      console.log(`${pos.name}:`, filteredPlayers.map(p => p.name));
      
      return {
        ...pos,
        players: filteredPlayers
      };
    });

    setPositionGroups(groups);
  };

  const refreshPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('position_group_order', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Erreur lors du rechargement des joueurs:', error);
      toast.error("Erreur lors du rechargement des joueurs");
    }
  };

  const savePlayerOrder = async (playerId: string, newGroupOrder: number, newDisplayOrder: number) => {
    try {
      const { error } = await supabase
        .from('players')
        .update({ 
          position_group_order: newGroupOrder,
          display_order: newDisplayOrder 
        })
        .eq('id', playerId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error("Erreur lors de la sauvegarde de l'ordre");
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

  const handleDragStart = (e: React.DragEvent, groupId: string) => {
    setDraggedGroup(groupId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    
    if (!draggedGroup || draggedGroup === targetGroupId) {
      setDraggedGroup(null);
      return;
    }

    const draggedIndex = positionGroups.findIndex(g => g.id === draggedGroup);
    const targetIndex = positionGroups.findIndex(g => g.id === targetGroupId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newGroups = [...positionGroups];
    const [draggedItem] = newGroups.splice(draggedIndex, 1);
    newGroups.splice(targetIndex, 0, draggedItem);

    setPositionGroups(newGroups);
    setDraggedGroup(null);
    
    toast.success("Ordre des positions mis à jour");
  };

  const handleDragEnd = () => {
    setDraggedGroup(null);
    setDraggedPlayer(null);
  };

  const handlePlayerDragStart = (e: React.DragEvent, player: Player) => {
    setDraggedPlayer(player);
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  };

  const handlePlayerDrop = async (e: React.DragEvent, targetGroupId: string, targetIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedPlayer) return;

    const sourceGroupId = getPlayerGroupId(draggedPlayer);
    const targetGroupIndex = positionGroups.findIndex(g => g.id === targetGroupId);
    
    if (targetGroupIndex === -1) return;

    const targetGroup = positionGroups[targetGroupIndex];
    const newGroupOrder = targetGroupIndex + 1;
    let newDisplayOrder = targetIndex !== undefined ? targetIndex + 1 : targetGroup.players.length + 1;

    // Si c'est le même groupe, ajuster l'ordre
    if (sourceGroupId === targetGroupId) {
      const currentIndex = targetGroup.players.findIndex(p => p.id === draggedPlayer.id);
      if (currentIndex < newDisplayOrder - 1) {
        newDisplayOrder--;
      }
    }

    // Sauvegarder en base
    await savePlayerOrder(draggedPlayer.id, newGroupOrder, newDisplayOrder);
    
    // Rafraîchir les données
    await refreshPlayers();
    
    setDraggedPlayer(null);
    toast.success("Ordre du joueur mis à jour");
  };

  const getPlayerGroupId = (player: Player): string => {
    const position = player.position.toLowerCase();
    if (position.includes('gardien') || position.includes('goalkeeper')) return 'gardien';
    if (position.includes('défenseur') || position.includes('defenseur') || position.includes('arrière') || 
        position.includes('latéral') || position.includes('lateral') || position.includes('central') || 
        position.includes('defender')) return 'defenseur';
    if (position.includes('milieu') || position.includes('midfielder') || position.includes('centre') || 
        position.includes('médian') || position.includes('median')) return 'milieu';
    if (position.includes('attaquant') || position.includes('ailier') || position.includes('avant') || 
        position.includes('striker') || position.includes('forward') || position.includes('winger')) return 'attaquant';
    return 'other';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Joueurs par Poste ({players.length})</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Glissez-déposez les sections pour réorganiser l'affichage
              </p>
            </div>
            <Button onClick={handleAddPlayer}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau joueur
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {positionGroups.map((group) => (
              <div
                key={group.id}
                draggable
                onDragStart={(e) => handleDragStart(e, group.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, group.id)}
                onDragEnd={handleDragEnd}
                className={`${group.color} border-2 border-dashed rounded-lg p-4 cursor-move transition-all duration-200 ${
                  draggedGroup === group.id ? 'opacity-50 scale-95' : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                  <Badge variant="outline">{group.players.length}</Badge>
                </div>
                
                <div 
                  className="space-y-3"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handlePlayerDrop(e, group.id)}
                >
                  {group.players.map((player, index) => (
                    <div 
                      key={player.id} 
                      draggable
                      onDragStart={(e) => handlePlayerDragStart(e, player)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handlePlayerDrop(e, group.id, index)}
                      className={`flex items-center justify-between p-3 bg-white rounded border cursor-move transition-all duration-200 ${
                        draggedPlayer?.id === player.id ? 'opacity-50 scale-95' : 'hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        {player.image_url && (
                          <img 
                            src={player.image_url} 
                            alt={player.name}
                            className="w-10 h-10 object-cover rounded-full"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{player.name}</h4>
                          <p className="text-sm text-gray-600">{player.position}</p>
                          <div className="flex items-center gap-2 mt-1">
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
                  {group.players.length === 0 && (
                    <div 
                      className="text-center py-8 text-gray-500 bg-white rounded border border-dashed"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handlePlayerDrop(e, group.id)}
                    >
                      Aucun joueur dans cette position - Glissez un joueur ici
                    </div>
                  )}
                </div>
              </div>
            ))}
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

export default PlayerPositionManager;
