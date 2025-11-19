import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Save, Users, Shield, Trash2, Plus } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
}

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number;
  image_url?: string;
  profile_image_url?: string;
}

interface FormationPlayer {
  id?: string;
  player_id: string;
  player_name: string;
  player_position: string;
  jersey_number: number;
  player_image_url?: string;
  position_x: number;
  position_y: number;
  is_starter: boolean;
  player_rating: number;
}

const DroppableField = ({ children, id }: { children: React.ReactNode; id: string }) => {
  const { setNodeRef } = useDroppable({ id });
  
  return (
    <div ref={setNodeRef} className="w-full h-full">
      {children}
    </div>
  );
};

const DroppableSubstitutes = ({ children, id }: { children: React.ReactNode; id: string }) => {
  const { setNodeRef } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef}
      className="min-h-32 border-2 border-dashed border-border rounded-lg p-4 bg-muted/30"
    >
      {children}
    </div>
  );
};

export const FormationManagerV2: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [selectedFormation, setSelectedFormation] = useState<string>('4-3-3');
  const [activeTeam, setActiveTeam] = useState<"real_madrid" | "opposing">("real_madrid");
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [fieldPlayers, setFieldPlayers] = useState<FormationPlayer[]>([]);
  const [substitutes, setSubstitutes] = useState<FormationPlayer[]>([]);
  const [formationId, setFormationId] = useState<string | null>(null);

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
      fetchAvailablePlayers();
      fetchFormation();
    }
  }, [selectedMatch, activeTeam]);

  const fetchMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select('id, home_team, away_team, match_date')
      .order('match_date', { ascending: true });
    setMatches(data || []);
  };

  const fetchAvailablePlayers = async () => {
    if (activeTeam === "real_madrid") {
      const { data } = await supabase
        .from('players')
        .select('id, name, position, jersey_number, image_url, profile_image_url')
        .eq('is_active', true)
        .order('jersey_number');
      setAvailablePlayers(data || []);
    } else {
      const match = matches.find(m => m.id === selectedMatch);
      if (match) {
        const opposingTeamName = match.home_team === 'Real Madrid' ? match.away_team : match.home_team;
        const { data: teamData } = await supabase
          .from('opposing_teams')
          .select('id')
          .eq('name', opposingTeamName)
          .maybeSingle();

        if (teamData) {
          const { data } = await supabase
            .from('opposing_players')
            .select('id, name, position, jersey_number')
            .eq('team_id', teamData.id)
            .order('jersey_number');
          setAvailablePlayers(data || []);
        }
      }
    }
  };

  const fetchFormation = async () => {
    const { data } = await supabase
      .from('match_formations')
      .select(`
        id,
        formation,
        match_formation_players (
          id,
          player_id,
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
      .eq('match_id', selectedMatch)
      .eq('team_type', activeTeam)
      .maybeSingle();

    if (data) {
      setFormationId(data.id);
      setSelectedFormation(data.formation);
      const players = data.match_formation_players as any[] || [];
      setFieldPlayers(players.filter(p => p.is_starter));
      setSubstitutes(players.filter(p => !p.is_starter));
    } else {
      setFormationId(null);
      setFieldPlayers([]);
      setSubstitutes([]);
    }
  };

  const createFormation = async () => {
    if (!selectedMatch) return;

    const { data, error } = await supabase
      .from('match_formations')
      .insert({
        match_id: selectedMatch,
        team_type: activeTeam,
        formation: selectedFormation
      })
      .select()
      .single();

    if (error) {
      toast.error("Erreur lors de la création de la formation");
      return;
    }

    setFormationId(data.id);
    toast.success("Formation créée");
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !formationId) {
      setActiveId(null);
      return;
    }

    const activePlayerId = active.id as string;
    const isFromAvailable = availablePlayers.some(p => p.id === activePlayerId);
    const isFromField = fieldPlayers.some(p => p.player_id === activePlayerId || p.id === activePlayerId);
    const isFromSubstitutes = substitutes.some(p => p.player_id === activePlayerId || p.id === activePlayerId);

    // Drag from available players to field
    if (isFromAvailable && over.id === 'field') {
      const player = availablePlayers.find(p => p.id === activePlayerId);
      if (player) {
        const pitchElement = document.querySelector('[data-pitch="true"]');
        if (pitchElement) {
          const rect = pitchElement.getBoundingClientRect();
          const mouseX = event.activatorEvent ? (event.activatorEvent as PointerEvent).clientX : rect.left + rect.width / 2;
          const mouseY = event.activatorEvent ? (event.activatorEvent as PointerEvent).clientY : rect.top + rect.height / 2;
          
          const percentX = ((mouseX - rect.left) / rect.width) * 100;
          const percentY = ((mouseY - rect.top) / rect.height) * 100;

          const { data, error } = await supabase
            .from('match_formation_players')
            .insert({
              formation_id: formationId,
              player_id: activeTeam === "real_madrid" ? player.id : null,
              opposing_player_id: activeTeam === "opposing" ? player.id : null,
              player_name: player.name,
              player_position: player.position,
              jersey_number: player.jersey_number,
              player_image_url: activeTeam === "real_madrid" ? (player.profile_image_url || player.image_url) : null,
              position_x: Math.max(5, Math.min(95, percentX)),
              position_y: Math.max(5, Math.min(95, percentY)),
              is_starter: true,
              player_rating: 7.0
            })
            .select()
            .single();

          if (!error && data) {
            setFieldPlayers([...fieldPlayers, data as any]);
            toast.success("Joueur ajouté au terrain");
          }
        }
      }
    }

    // Drag from available players to substitutes
    if (isFromAvailable && over.id === 'substitutes') {
      const player = availablePlayers.find(p => p.id === activePlayerId);
      if (player) {
        const { data, error } = await supabase
          .from('match_formation_players')
          .insert({
            formation_id: formationId,
            player_id: activeTeam === "real_madrid" ? player.id : null,
            opposing_player_id: activeTeam === "opposing" ? player.id : null,
            player_name: player.name,
            player_position: player.position,
            jersey_number: player.jersey_number,
            player_image_url: activeTeam === "real_madrid" ? (player.profile_image_url || player.image_url) : null,
            position_x: 50,
            position_y: 50,
            is_starter: false,
            player_rating: 7.0
          })
          .select()
          .single();

        if (!error && data) {
          setSubstitutes([...substitutes, data as any]);
          toast.success("Joueur ajouté aux remplaçants");
        }
      }
    }

    // Move player on field
    if (isFromField && over.id === 'field') {
      const player = fieldPlayers.find(p => p.id === activePlayerId || p.player_id === activePlayerId);
      if (player && player.id) {
        const pitchElement = document.querySelector('[data-pitch="true"]');
        if (pitchElement) {
          const rect = pitchElement.getBoundingClientRect();
          const mouseX = event.activatorEvent ? (event.activatorEvent as PointerEvent).clientX : rect.left + rect.width / 2;
          const mouseY = event.activatorEvent ? (event.activatorEvent as PointerEvent).clientY : rect.top + rect.height / 2;
          
          const percentX = ((mouseX - rect.left) / rect.width) * 100;
          const percentY = ((mouseY - rect.top) / rect.height) * 100;

          await supabase
            .from('match_formation_players')
            .update({
              position_x: Math.max(5, Math.min(95, percentX)),
              position_y: Math.max(5, Math.min(95, percentY))
            })
            .eq('id', player.id);

          fetchFormation();
        }
      }
    }

    // Move from field to substitutes
    if (isFromField && over.id === 'substitutes') {
      const player = fieldPlayers.find(p => p.id === activePlayerId || p.player_id === activePlayerId);
      if (player && player.id) {
        await supabase
          .from('match_formation_players')
          .update({ is_starter: false })
          .eq('id', player.id);

        fetchFormation();
        toast.success("Joueur déplacé vers les remplaçants");
      }
    }

    // Move from substitutes to field
    if (isFromSubstitutes && over.id === 'field') {
      const player = substitutes.find(p => p.id === activePlayerId || p.player_id === activePlayerId);
      if (player && player.id) {
        const pitchElement = document.querySelector('[data-pitch="true"]');
        if (pitchElement) {
          const rect = pitchElement.getBoundingClientRect();
          const mouseX = event.activatorEvent ? (event.activatorEvent as PointerEvent).clientX : rect.left + rect.width / 2;
          const mouseY = event.activatorEvent ? (event.activatorEvent as PointerEvent).clientY : rect.top + rect.height / 2;
          
          const percentX = ((mouseX - rect.left) / rect.width) * 100;
          const percentY = ((mouseY - rect.top) / rect.height) * 100;

          await supabase
            .from('match_formation_players')
            .update({
              is_starter: true,
              position_x: Math.max(5, Math.min(95, percentX)),
              position_y: Math.max(5, Math.min(95, percentY))
            })
            .eq('id', player.id);

          fetchFormation();
          toast.success("Joueur déplacé sur le terrain");
        }
      }
    }

    setActiveId(null);
  };

  const deletePlayer = async (playerId: string) => {
    await supabase
      .from('match_formation_players')
      .delete()
      .eq('id', playerId);

    fetchFormation();
    toast.success("Joueur retiré");
  };

  const deleteFormation = async () => {
    if (!formationId) return;

    await supabase
      .from('match_formations')
      .delete()
      .eq('id', formationId);

    setFormationId(null);
    setFieldPlayers([]);
    setSubstitutes([]);
    toast.success("Formation supprimée");
  };

  const activeDragData = activeId ? 
    availablePlayers.find(p => p.id === activeId) ||
    fieldPlayers.find(p => p.id === activeId || p.player_id === activeId) ||
    substitutes.find(p => p.id === activeId || p.player_id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestion des Formations Tactiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Sélectionner un match</Label>
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
                  <TabsTrigger value="real_madrid">
                    <Users className="h-4 w-4 mr-2" />
                    Real Madrid
                  </TabsTrigger>
                  <TabsTrigger value="opposing">
                    <Shield className="h-4 w-4 mr-2" />
                    Équipe Adverse
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTeam} className="space-y-4 mt-4">
                  {!formationId ? (
                    <Button onClick={createFormation}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer la formation
                    </Button>
                  ) : (
                    <Button onClick={deleteFormation} variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer la formation
                    </Button>
                  )}

                  {formationId && (
                    <div className="grid grid-cols-12 gap-4">
                      {/* Liste des joueurs disponibles */}
                      <Card className="col-span-3">
                        <CardHeader>
                          <CardTitle className="text-sm">Joueurs disponibles</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[600px]">
                            <div className="space-y-2">
                              {availablePlayers
                                .filter(p => 
                                  !fieldPlayers.some(fp => fp.player_id === p.id) &&
                                  !substitutes.some(sp => sp.player_id === p.id)
                                )
                                .map((player) => (
                                  <div
                                    key={player.id}
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.effectAllowed = "move";
                                      setActiveId(player.id);
                                    }}
                                    className="p-2 bg-card border rounded cursor-move hover:bg-accent"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary">{player.jersey_number}</Badge>
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{player.name}</div>
                                        <div className="text-xs text-muted-foreground">{player.position}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>

                      {/* Terrain */}
                      <div className="col-span-9 space-y-4">
                        <DroppableField id="field">
                          <div 
                            className="relative w-full bg-gradient-to-b from-green-400 to-green-600 rounded-lg overflow-hidden shadow-lg" 
                            style={{ aspectRatio: "3/4", minHeight: "600px" }}
                            data-pitch="true"
                          >
                            {/* Lignes du terrain */}
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <rect x="5" y="5" width="90" height="90" fill="none" stroke="white" strokeWidth="0.3" />
                              <line x1="5" y1="50" x2="95" y2="50" stroke="white" strokeWidth="0.3" />
                              <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeWidth="0.3" />
                              <circle cx="50" cy="50" r="0.5" fill="white" />
                              <rect x="25" y="5" width="50" height="16" fill="none" stroke="white" strokeWidth="0.3" />
                              <rect x="35" y="5" width="30" height="8" fill="none" stroke="white" strokeWidth="0.3" />
                              <rect x="25" y="79" width="50" height="16" fill="none" stroke="white" strokeWidth="0.3" />
                              <rect x="35" y="87" width="30" height="8" fill="none" stroke="white" strokeWidth="0.3" />
                            </svg>

                            {/* Joueurs sur le terrain */}
                            {fieldPlayers.map((player) => (
                              <div
                                key={player.id}
                                draggable
                                onDragStart={() => setActiveId(player.id || player.player_id)}
                                className="absolute cursor-move"
                                style={{
                                  left: `${player.position_x}%`,
                                  top: `${player.position_y}%`,
                                  transform: 'translate(-50%, -50%)'
                                }}
                              >
                                <div className="relative">
                                  {player.player_image_url ? (
                                    <img 
                                      src={player.player_image_url} 
                                      alt={player.player_name}
                                      className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-lg"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 rounded-lg bg-white border-2 border-primary flex items-center justify-center shadow-lg">
                                      <span className="text-xl font-bold">{player.jersey_number}</span>
                                    </div>
                                  )}
                                  <Badge className="absolute -top-2 -right-2 text-xs">
                                    {player.jersey_number}
                                  </Badge>
                                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/70 text-white px-2 py-0.5 rounded text-xs">
                                    {player.player_name}
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    className="absolute -top-2 -left-2 h-5 w-5"
                                    onClick={() => deletePlayer(player.id!)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </DroppableField>

                        {/* Zone des remplaçants */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Remplaçants</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <DroppableSubstitutes id="substitutes">
                              <div className="flex flex-wrap gap-2">
                                {substitutes.length === 0 && (
                                  <p className="text-sm text-muted-foreground">Glissez des joueurs ici pour les ajouter aux remplaçants</p>
                                )}
                                {substitutes.map((player) => (
                                  <div
                                    key={player.id}
                                    draggable
                                    onDragStart={() => setActiveId(player.id || player.player_id)}
                                    className="p-2 bg-card border rounded cursor-move hover:bg-accent relative"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary">{player.jersey_number}</Badge>
                                      <div>
                                        <div className="font-medium text-sm">{player.player_name}</div>
                                        <div className="text-xs text-muted-foreground">{player.player_position}</div>
                                      </div>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 ml-2"
                                        onClick={() => deletePlayer(player.id!)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </DroppableSubstitutes>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      <DragOverlay>
        {activeDragData && (
          <div className="p-2 bg-card border rounded shadow-lg">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {'jersey_number' in activeDragData ? activeDragData.jersey_number : ''}
              </Badge>
              <div>
                <div className="font-medium text-sm">
                  {'name' in activeDragData ? activeDragData.name : (activeDragData as any).player_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {'position' in activeDragData ? activeDragData.position : (activeDragData as any).player_position}
                </div>
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
