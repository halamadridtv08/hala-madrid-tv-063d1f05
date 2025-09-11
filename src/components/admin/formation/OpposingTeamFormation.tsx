import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FootballPitch } from './FootballPitch';
import { PlayerCard } from './PlayerCard';
import { FormationSelector } from './FormationSelector';
import { FormationPlayerData, FORMATIONS, FormationPosition } from '@/types/Formation';
import { RotateCcw, Save, Users, Plus, Trash2 } from 'lucide-react';

interface OpposingTeamFormationProps {
  matchId?: string;
}

export const OpposingTeamFormation: React.FC<OpposingTeamFormationProps> = ({ matchId }) => {
  const [selectedFormation, setSelectedFormation] = useState<string>('4-4-2');
  const [players, setPlayers] = useState<FormationPlayerData[]>([]);
  const [playerPositions, setPlayerPositions] = useState<Record<string, FormationPosition>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [opposingTeams, setOpposingTeams] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: '',
    jerseyNumber: 1
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Charger les équipes adverses
  useEffect(() => {
    fetchOpposingTeams();
  }, []);

  const fetchOpposingTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('opposing_teams')
        .select('*')
        .order('name');

      if (error) throw error;
      setOpposingTeams(data || []);
    } catch (error) {
      console.error('Error fetching opposing teams:', error);
      toast.error('Erreur lors du chargement des équipes adverses');
    }
  };

  // Charger les joueurs de l'équipe adverse sélectionnée
  useEffect(() => {
    if (selectedTeamId) {
      fetchOpposingPlayers();
    }
  }, [selectedTeamId]);

  const fetchOpposingPlayers = async () => {
    if (!selectedTeamId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('opposing_players')
        .select('*')
        .eq('team_id', selectedTeamId)
        .order('jersey_number');

      if (error) throw error;

      if (data) {
        const formationPlayers: FormationPlayerData[] = data.map(player => ({
          id: player.id,
          name: player.name,
          position: player.position,
          jerseyNumber: player.jersey_number || 0,
          imageUrl: undefined, // Les joueurs adverses n'ont pas d'image par défaut
          rating: 7.0, // Note par défaut pour les adversaires
          isStarter: player.is_starter
        }));

        setPlayers(formationPlayers);
      }
    } catch (error) {
      console.error('Error fetching opposing players:', error);
      toast.error('Erreur lors du chargement des joueurs adverses');
    } finally {
      setLoading(false);
    }
  };

  // Initialiser les positions selon la formation
  useEffect(() => {
    const formation = FORMATIONS[selectedFormation];
    if (formation && players.length > 0) {
      const newPositions: Record<string, FormationPosition> = {};
      const startingPlayers = players.filter(p => p.isStarter).slice(0, 11);
      
      startingPlayers.forEach((player, index) => {
        if (formation.positions[index]) {
          newPositions[player.id] = formation.positions[index];
        }
      });
      
      setPlayerPositions(newPositions);
    }
  }, [selectedFormation, players]);

  const handleFormationChange = (formation: string) => {
    setSelectedFormation(formation);
    toast.success(`Formation changée vers ${formation}`);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    const playerId = String(active.id);
    
    if (over && over.id !== active.id) {
      const targetPlayerId = String(over.id);
      handleSwapPlayers(playerId, targetPlayerId);
    } else if (delta.x !== 0 || delta.y !== 0) {
      const currentPosition = playerPositions[playerId];
      if (currentPosition) {
        const pitchElement = document.querySelector('.relative.w-full.h-\\[600px\\]');
        if (pitchElement) {
          const rect = pitchElement.getBoundingClientRect();
          const newX = Math.max(5, Math.min(95, currentPosition.x + (delta.x / rect.width) * 100));
          const newY = Math.max(5, Math.min(95, currentPosition.y + (delta.y / rect.height) * 100));
          
          setPlayerPositions(prev => ({
            ...prev,
            [playerId]: { x: newX, y: newY }
          }));
        }
      }
    }
    
    setActiveId(null);
  };

  const handleSwapPlayers = (playerId1: string, playerId2: string) => {
    const pos1 = playerPositions[playerId1];
    const pos2 = playerPositions[playerId2];
    
    if (pos1 && pos2) {
      setPlayerPositions(prev => ({
        ...prev,
        [playerId1]: pos2,
        [playerId2]: pos1
      }));
      toast.success('Positions échangées');
    }
  };

  const handleUpdatePlayer = (playerId: string, updates: Partial<FormationPlayerData>) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId ? { ...player, ...updates } : player
    ));
    toast.success('Joueur mis à jour');
  };

  const handleCreatePlayer = async () => {
    if (!selectedTeamId || !newPlayer.name || !newPlayer.position) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('opposing_players')
        .insert({
          team_id: selectedTeamId,
          name: newPlayer.name,
          position: newPlayer.position,
          jersey_number: newPlayer.jerseyNumber,
          is_starter: true
        })
        .select()
        .single();

      if (error) throw error;

      const formationPlayer: FormationPlayerData = {
        id: data.id,
        name: data.name,
        position: data.position,
        jerseyNumber: data.jersey_number,
        imageUrl: undefined,
        rating: 7.0,
        isStarter: true
      };

      setPlayers(prev => [...prev, formationPlayer]);
      setNewPlayer({ name: '', position: '', jerseyNumber: 1 });
      setIsCreatingPlayer(false);
      toast.success('Joueur créé avec succès');
    } catch (error) {
      console.error('Error creating player:', error);
      toast.error('Erreur lors de la création du joueur');
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from('opposing_players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      setPlayers(prev => prev.filter(p => p.id !== playerId));
      setPlayerPositions(prev => {
        const newPositions = { ...prev };
        delete newPositions[playerId];
        return newPositions;
      });
      toast.success('Joueur supprimé');
    } catch (error) {
      console.error('Error deleting player:', error);
      toast.error('Erreur lors de la suppression du joueur');
    }
  };

  const handleResetFormation = () => {
    const formation = FORMATIONS[selectedFormation];
    if (formation) {
      const newPositions: Record<string, FormationPosition> = {};
      const startingPlayers = players.filter(p => p.isStarter).slice(0, 11);
      
      startingPlayers.forEach((player, index) => {
        if (formation.positions[index]) {
          newPositions[player.id] = formation.positions[index];
        }
      });
      
      setPlayerPositions(newPositions);
      toast.success('Formation réinitialisée');
    }
  };

  const activeDragPlayer = activeId ? players.find(p => p.id === activeId) : null;
  const activeDragPosition = activeId ? playerPositions[activeId] : null;
  const startingPlayers = players.filter(p => p.isStarter && playerPositions[p.id]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Composition Équipe Adverse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélecteur d'équipe */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Équipe adverse</label>
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une équipe adverse" />
              </SelectTrigger>
              <SelectContent>
                {opposingTeams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTeamId && (
            <>
              {/* Sélecteur de formation */}
              <FormationSelector
                selectedFormation={selectedFormation}
                onFormationChange={handleFormationChange}
              />

              {/* Boutons d'action */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleResetFormation} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
                <Button 
                  onClick={() => setIsCreatingPlayer(true)} 
                  variant="default" 
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter joueur
                </Button>
              </div>

              {/* Création de joueur */}
              {isCreatingPlayer && (
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Nouveau joueur</h4>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <Input
                      placeholder="Nom"
                      value={newPlayer.name}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Poste"
                      value={newPlayer.position}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, position: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="N°"
                      value={newPlayer.jerseyNumber}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, jerseyNumber: parseInt(e.target.value) || 1 }))}
                      min="1"
                      max="99"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreatePlayer} size="sm">
                      Créer
                    </Button>
                    <Button onClick={() => setIsCreatingPlayer(false)} variant="outline" size="sm">
                      Annuler
                    </Button>
                  </div>
                </Card>
              )}

              {/* Information sur la formation */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Badge variant="default" className="text-lg px-3 py-1">
                  {selectedFormation}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {FORMATIONS[selectedFormation]?.description} - {startingPlayers.length} joueurs titulaires
                </div>
              </div>

              {/* Terrain de football avec drag & drop */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <FootballPitch>
                  {startingPlayers.map((player) => {
                    const position = playerPositions[player.id];
                    if (!position) return null;
                    
                    return (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        position={position}
                        onUpdatePlayer={handleUpdatePlayer}
                      />
                    );
                  })}
                </FootballPitch>

                <DragOverlay>
                  {activeDragPlayer && activeDragPosition && (
                    <PlayerCard
                      player={activeDragPlayer}
                      position={activeDragPosition}
                      onUpdatePlayer={handleUpdatePlayer}
                      isDragOverlay
                    />
                  )}
                </DragOverlay>
              </DndContext>

              {/* Liste des joueurs */}
              <div className="space-y-2">
                <h4 className="font-medium">Joueurs de l'équipe ({players.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {players.map(player => (
                    <div key={player.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{player.jerseyNumber}</Badge>
                        <div>
                          <p className="font-medium text-sm">{player.name}</p>
                          <p className="text-xs text-muted-foreground">{player.position}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeletePlayer(player.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};