import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RotateCcw, Save, Users, Shield, Plus, Trash2 } from 'lucide-react';
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
import { PlayerCard } from './PlayerCard';
import { FormationSelector } from './FormationSelector';
import { FORMATIONS } from '@/types/Formation';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  competition: string;
}

interface FormationPlayer {
  id?: string;
  player_id?: string;
  opposing_player_id?: string;
  position_x: number;
  position_y: number;
  is_starter: boolean;
  jersey_number: number;
  player_name: string;
  player_position: string;
  player_image_url?: string;
  player_rating: number;
}

const DEFAULT_POSITIONS_433 = {
  "real_madrid": [
    { position_x: 50, position_y: 85, position: "GK" },
    { position_x: 20, position_y: 65, position: "LB" },
    { position_x: 40, position_y: 65, position: "CB" },
    { position_x: 60, position_y: 65, position: "CB" },
    { position_x: 80, position_y: 65, position: "RB" },
    { position_x: 30, position_y: 45, position: "CM" },
    { position_x: 50, position_y: 40, position: "CDM" },
    { position_x: 70, position_y: 45, position: "CM" },
    { position_x: 20, position_y: 20, position: "LW" },
    { position_x: 50, position_y: 15, position: "ST" },
    { position_x: 80, position_y: 20, position: "RW" }
  ],
  "opposing": [
    { position_x: 50, position_y: 15, position: "GK" },
    { position_x: 80, position_y: 35, position: "LB" },
    { position_x: 60, position_y: 35, position: "CB" },
    { position_x: 40, position_y: 35, position: "CB" },
    { position_x: 20, position_y: 35, position: "RB" },
    { position_x: 70, position_y: 55, position: "CM" },
    { position_x: 50, position_y: 60, position: "CDM" },
    { position_x: 30, position_y: 55, position: "CM" },
    { position_x: 80, position_y: 80, position: "LW" },
    { position_x: 50, position_y: 85, position: "ST" },
    { position_x: 20, position_y: 80, position: "RW" }
  ]
};

export const FormationManager: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [selectedFormation, setSelectedFormation] = useState<string>('4-3-3');
  const [formations, setFormations] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeTeam, setActiveTeam] = useState<"real_madrid" | "opposing">("real_madrid");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      fetchFormations();
    }
  }, [selectedMatch]);

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('id, home_team, away_team, match_date, competition')
      .order('match_date', { ascending: true });

    if (error) {
      console.error('Erreur:', error);
      return;
    }

    setMatches(data || []);
  };

  const fetchFormations = async () => {
    if (!selectedMatch) return;

    const { data, error } = await supabase
      .from('match_formations')
      .select(`
        id,
        team_type,
        formation,
        match_formation_players (
          id,
          player_id,
          opposing_player_id,
          position_x,
          position_y,
          is_starter,
          jersey_number,
          player_name,
          player_position,
          player_image_url,
          player_rating
        )
      `)
      .eq('match_id', selectedMatch);

    if (error) {
      console.error('Erreur:', error);
      return;
    }

    const formationsData: any = {};
    data?.forEach(formation => {
      formationsData[formation.team_type] = {
        id: formation.id,
        formation: formation.formation,
        players: formation.match_formation_players || []
      };
    });

    setFormations(formationsData);
  };

  const createDefaultFormation = async (teamType: "real_madrid" | "opposing") => {
    if (!selectedMatch) return;

    setLoading(true);
    try {
      // Récupérer les joueurs disponibles
      let availablePlayers: any[] = [];
      
      if (teamType === "real_madrid") {
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('id, name, position, jersey_number, image_url, profile_image_url')
          .eq('is_active', true)
          .order('jersey_number');

        if (playersError) throw playersError;
        availablePlayers = playersData || [];
      } else {
        // Pour l'équipe adverse, récupérer depuis opposing_players
        const match = matches.find(m => m.id === selectedMatch);
        if (match) {
          const opposingTeamName = match.home_team === 'Real Madrid' ? match.away_team : match.home_team;
          
          const { data: teamData } = await supabase
            .from('opposing_teams')
            .select('id')
            .eq('name', opposingTeamName)
            .maybeSingle();

          if (teamData) {
            const { data: playersData } = await supabase
              .from('opposing_players')
              .select('id, name, position, jersey_number')
              .eq('team_id', teamData.id)
              .order('jersey_number');

            availablePlayers = playersData || [];
          }
        }
      }

      // Créer la formation
      const { data: formationData, error: formationError } = await supabase
        .from('match_formations')
        .insert({
          match_id: selectedMatch,
          team_type: teamType,
          formation: selectedFormation
        })
        .select()
        .single();

      if (formationError) throw formationError;

      // Créer les positions par défaut
      const defaultPositions = DEFAULT_POSITIONS_433[teamType];
      
      const formationPlayers = defaultPositions.map((pos, index) => {
        const player = availablePlayers[index];
        return {
          formation_id: formationData.id,
          player_id: teamType === "real_madrid" ? player?.id : null,
          opposing_player_id: teamType === "opposing" ? player?.id : null,
          position_x: pos.position_x,
          position_y: pos.position_y,
          is_starter: index < 11,
          jersey_number: player?.jersey_number || index + 1,
          player_name: player?.name || `Joueur ${index + 1}`,
          player_position: pos.position,
          player_image_url: teamType === "real_madrid" ? (player?.profile_image_url || player?.image_url) : null,
          player_rating: 8.0
        };
      });

      const { error: playersError } = await supabase
        .from('match_formation_players')
        .insert(formationPlayers);

      if (playersError) throw playersError;

      toast.success(`Formation ${teamType === "real_madrid" ? "Real Madrid" : "équipe adverse"} créée`);
      fetchFormations();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la création de la formation");
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerPosition = async (playerId: string, x: number, y: number) => {
    const { error } = await supabase
      .from('match_formation_players')
      .update({ position_x: x, position_y: y })
      .eq('id', playerId);

    if (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteFormation = async (teamType: "real_madrid" | "opposing") => {
    if (!formations[teamType]?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('match_formations')
        .delete()
        .eq('id', formations[teamType].id);

      if (error) throw error;

      toast.success("Formation supprimée");
      fetchFormations();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const handleFormationChange = (formation: string) => {
    setSelectedFormation(formation);
    toast.success(`Formation changée vers ${formation}`);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    
    if (!formations[activeTeam]?.players) return;
    
    const activePlayer = formations[activeTeam].players.find((p: FormationPlayer) => p.id === active.id);
    if (!activePlayer) return;

    // Si on fait un drop sur un autre joueur, échanger les positions
    if (over && over.id !== active.id) {
      const targetPlayer = formations[activeTeam].players.find((p: FormationPlayer) => p.id === over.id);
      if (targetPlayer) {
        handleSwapPlayers(String(active.id), String(over.id));
      }
    } 
    // Sinon, déplacer le joueur selon le delta
    else if (delta.x !== 0 || delta.y !== 0) {
      const pitchElement = document.querySelector('[data-pitch="true"]');
      if (pitchElement) {
        const rect = pitchElement.getBoundingClientRect();
        const newX = Math.max(5, Math.min(95, activePlayer.position_x + (delta.x / rect.width) * 100));
        const newY = Math.max(5, Math.min(95, activePlayer.position_y + (delta.y / rect.height) * 100));
        
        updatePlayerPosition(activePlayer.id!, newX, newY);
        
        // Mettre à jour localement pour un feedback immédiat
        setFormations(prev => ({
          ...prev,
          [activeTeam]: {
            ...prev[activeTeam],
            players: prev[activeTeam].players.map((p: FormationPlayer) => 
              p.id === activePlayer.id ? { ...p, position_x: newX, position_y: newY } : p
            )
          }
        }));
      }
    }
    
    setActiveId(null);
  };

  const handleSwapPlayers = async (playerId1: string, playerId2: string) => {
    if (!formations[activeTeam]?.players) return;
    
    const player1 = formations[activeTeam].players.find((p: FormationPlayer) => p.id === playerId1);
    const player2 = formations[activeTeam].players.find((p: FormationPlayer) => p.id === playerId2);
    
    if (player1 && player2) {
      try {
        // Échanger les positions dans la base de données
        await Promise.all([
          supabase.from('match_formation_players').update({ 
            position_x: player2.position_x, 
            position_y: player2.position_y 
          }).eq('id', player1.id),
          supabase.from('match_formation_players').update({ 
            position_x: player1.position_x, 
            position_y: player1.position_y 
          }).eq('id', player2.id)
        ]);

        // Mettre à jour localement
        setFormations(prev => ({
          ...prev,
          [activeTeam]: {
            ...prev[activeTeam],
            players: prev[activeTeam].players.map((p: FormationPlayer) => {
              if (p.id === player1.id) {
                return { ...p, position_x: player2.position_x, position_y: player2.position_y };
              }
              if (p.id === player2.id) {
                return { ...p, position_x: player1.position_x, position_y: player1.position_y };
              }
              return p;
            })
          }
        }));

        toast.success('Positions échangées');
      } catch (error) {
        console.error('Erreur:', error);
        toast.error("Erreur lors de l'échange des positions");
      }
    }
  };

  const activeDragPlayer = activeId && formations[activeTeam]?.players ? 
    formations[activeTeam].players.find((p: FormationPlayer) => p.id === activeId) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Composition Real Madrid
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="match-select">Sélectionner un match</Label>
            <Select value={selectedMatch} onValueChange={setSelectedMatch}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un match" />
              </SelectTrigger>
              <SelectContent>
                {matches.map((match) => (
                  <SelectItem key={match.id} value={match.id}>
                    {match.home_team} vs {match.away_team} - {new Date(match.match_date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMatch && (
            <Tabs value={activeTeam} onValueChange={(value) => setActiveTeam(value as "real_madrid" | "opposing")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="real_madrid" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Real Madrid
                </TabsTrigger>
                <TabsTrigger value="opposing" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Équipe Adverse
                </TabsTrigger>
              </TabsList>

              {["real_madrid", "opposing"].map((teamType) => (
                <TabsContent key={teamType} value={teamType} className="space-y-4">
                  {formations[teamType] ? (
                    <div className="space-y-4">
                      {/* Sélecteur de formation et boutons */}
                      <div className="space-y-4">
                        <FormationSelector
                          selectedFormation={formations[teamType].formation || selectedFormation}
                          onFormationChange={handleFormationChange}
                        />
                        
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Réinitialiser
                          </Button>
                          <Button variant="default" size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteFormation(teamType as "real_madrid" | "opposing")}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </div>

                      {/* Information sur la formation */}
                      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                        <Badge variant="default" className="text-lg px-3 py-1">
                          {formations[teamType].formation}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          Formation classique offensive
                        </div>
                      </div>

                      {/* Terrain de football avec drag & drop */}
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      >
                        <div 
                          className="relative w-full bg-gradient-to-b from-green-400 to-green-600 rounded-lg overflow-hidden shadow-lg" 
                          style={{ aspectRatio: "3/4", minHeight: "500px" }}
                          data-pitch="true"
                        >
                          {/* Lignes du terrain */}
                          <div className="absolute inset-0">
                            {/* Ligne centrale */}
                            <div className="absolute w-full h-0.5 bg-white top-1/2 transform -translate-y-0.5"></div>
                            <div className="absolute w-0.5 h-full bg-white left-1/2 transform -translate-x-0.5"></div>
                            
                            {/* Cercle central */}
                            <div className="absolute w-24 h-24 border-2 border-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute w-2 h-2 bg-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                            
                            {/* Surface de réparation supérieure */}
                            <div className="absolute w-32 h-16 border-2 border-white top-0 left-1/2 transform -translate-x-1/2"></div>
                            <div className="absolute w-16 h-8 border-2 border-white top-0 left-1/2 transform -translate-x-1/2"></div>
                            
                            {/* Surface de réparation inférieure */}
                            <div className="absolute w-32 h-16 border-2 border-white bottom-0 left-1/2 transform -translate-x-1/2"></div>
                            <div className="absolute w-16 h-8 border-2 border-white bottom-0 left-1/2 transform -translate-x-1/2"></div>
                            
                            {/* Buts */}
                            <div className="absolute w-12 h-2 bg-white top-0 left-1/2 transform -translate-x-1/2"></div>
                            <div className="absolute w-12 h-2 bg-white bottom-0 left-1/2 transform -translate-x-1/2"></div>
                            
                            {/* Coins */}
                            <div className="absolute w-4 h-4 border-2 border-white rounded-full top-0 left-0"></div>
                            <div className="absolute w-4 h-4 border-2 border-white rounded-full top-0 right-0"></div>
                            <div className="absolute w-4 h-4 border-2 border-white rounded-full bottom-0 left-0"></div>
                            <div className="absolute w-4 h-4 border-2 border-white rounded-full bottom-0 right-0"></div>
                          </div>

                          {/* Joueurs */}
                          {formations[teamType].players
                            .filter((player: FormationPlayer) => player.is_starter)
                            .map((player: FormationPlayer) => (
                            <div
                              key={player.id}
                              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move"
                              style={{
                                left: `${player.position_x}%`,
                                top: `${player.position_y}%`
                              }}
                            >
                              <PlayerCard
                                player={{
                                  id: player.id!,
                                  name: player.player_name,
                                  position: player.player_position,
                                  jerseyNumber: player.jersey_number,
                                  imageUrl: player.player_image_url,
                                  rating: player.player_rating,
                                  isStarter: player.is_starter
                                }}
                                position={{ x: player.position_x, y: player.position_y }}
                                onUpdatePlayer={() => {}}
                                isDragOverlay={false}
                              />
                            </div>
                          ))}
                        </div>

                        <DragOverlay>
                          {activeDragPlayer && (
                            <PlayerCard
                              player={{
                                id: activeDragPlayer.id!,
                                name: activeDragPlayer.player_name,
                                position: activeDragPlayer.player_position,
                                jerseyNumber: activeDragPlayer.jersey_number,
                                imageUrl: activeDragPlayer.player_image_url,
                                rating: activeDragPlayer.player_rating,
                                isStarter: activeDragPlayer.is_starter
                              }}
                              position={{ x: activeDragPlayer.position_x, y: activeDragPlayer.position_y }}
                              onUpdatePlayer={() => {}}
                              isDragOverlay={true}
                            />
                          )}
                        </DragOverlay>
                      </DndContext>

                      {/* Instructions */}
                      <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Instructions :</h4>
                        <ul className="space-y-1 text-xs">
                          <li>• Glissez-déposez les joueurs pour modifier leur position</li>
                          <li>• Faites glisser un joueur sur un autre pour échanger leurs positions</li>
                          <li>• Utilisez le sélecteur pour changer de formation</li>
                          <li>• Sauvegardez vos compositions personnalisées par match</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Aucune composition configurée pour {teamType === "real_madrid" ? "Real Madrid" : "l'équipe adverse"}
                      </p>
                      <Button
                        onClick={() => createDefaultFormation(teamType as "real_madrid" | "opposing")}
                        disabled={loading}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Créer une composition par défaut
                      </Button>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};