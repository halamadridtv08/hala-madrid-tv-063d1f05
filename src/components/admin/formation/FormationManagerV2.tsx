import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Save, Users, Shield, Trash2, Plus, Grid3x3, Layout } from 'lucide-react';
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
import { useDroppable } from '@dnd-kit/core';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DraggablePlayer } from './DraggablePlayer';
import { DroppableFieldPlayer } from './DroppableFieldPlayer';
import { FORMATION_TEMPLATES, snapToGrid } from './FormationTemplates';
import { Copy } from 'lucide-react';

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
  const [formationVariant, setFormationVariant] = useState<string>("principale");
  const [showGrid, setShowGrid] = useState<boolean>(true);
  
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [fieldPlayers, setFieldPlayers] = useState<FormationPlayer[]>([]);
  const [substitutes, setSubstitutes] = useState<FormationPlayer[]>([]);
  const [formationId, setFormationId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [previousMatches, setPreviousMatches] = useState<Match[]>([]);

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
      fetchPreviousMatchFormations();
    }
  }, [selectedMatch, activeTeam]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!formationId) return;

    const autoSaveInterval = setInterval(() => {
      setLastSaved(new Date());
      toast.success("Formation sauvegardée automatiquement", { duration: 2000 });
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [formationId]);

  const fetchMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select('id, home_team, away_team, match_date')
      .order('match_date', { ascending: true });
    setMatches(data || []);
  };

  const fetchPreviousMatchFormations = async () => {
    const { data } = await supabase
      .from('match_formations')
      .select(`
        id,
        match_id,
        matches!inner(id, home_team, away_team, match_date)
      `)
      .eq('team_type', activeTeam)
      .neq('match_id', selectedMatch)
      .order('matches.match_date', { ascending: false })
      .limit(10);

    if (data) {
      const matchesWithFormations = data.map((f: any) => ({
        id: f.match_id,
        home_team: f.matches.home_team,
        away_team: f.matches.away_team,
        match_date: f.matches.match_date,
        formation_id: f.id
      }));
      setPreviousMatches(matchesWithFormations as any);
    }
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

  const applyFormationTemplate = async () => {
    if (!formationId) return;

    const template = FORMATION_TEMPLATES.find(t => t.formation === selectedFormation);
    if (!template) return;

    // Clear existing field players
    if (fieldPlayers.length > 0) {
      const playerIds = fieldPlayers.map(p => p.id).filter(Boolean);
      if (playerIds.length > 0) {
        await supabase
          .from('match_formation_players')
          .delete()
          .in('id', playerIds);
      }
    }

    // Get available players sorted by position preference
    const sortedPlayers = [...availablePlayers].sort((a, b) => {
      const aNum = a.jersey_number || 999;
      const bNum = b.jersey_number || 999;
      return aNum - bNum;
    });

    // Assign players to template positions
    const newPlayers = [];
    for (let i = 0; i < Math.min(template.positions.length, sortedPlayers.length); i++) {
      const player = sortedPlayers[i];
      const templatePos = template.positions[i];
      
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
          position_x: templatePos.x,
          position_y: templatePos.y,
          is_starter: true,
          player_rating: 0
        })
        .select()
        .single();

      if (!error && data) {
        newPlayers.push(data);
      }
    }

    fetchFormation();
    toast.success("Template de formation appliqué");
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

    // Check if dragging a substitute onto a field player (swap them)
    const targetFieldPlayer = fieldPlayers.find(p => p.id === over.id || p.player_id === over.id);
    if (isFromSubstitutes && targetFieldPlayer) {
      const substitutePlayer = substitutes.find(p => p.id === activePlayerId || p.player_id === activePlayerId);
      if (substitutePlayer && substitutePlayer.id && targetFieldPlayer.id) {
        // Swap positions: substitute becomes starter at field player's position, field player becomes substitute
        await supabase
          .from('match_formation_players')
          .update({
            is_starter: true,
            position_x: targetFieldPlayer.position_x,
            position_y: targetFieldPlayer.position_y
          })
          .eq('id', substitutePlayer.id);

        await supabase
          .from('match_formation_players')
          .update({ is_starter: false })
          .eq('id', targetFieldPlayer.id);

        fetchFormation();
        toast.success("Joueurs échangés");
        setActiveId(null);
        return;
      }
    }

    // Drag from available players to field - Check 11 players limit
    if (isFromAvailable && over.id === 'field') {
      if (fieldPlayers.length >= 11) {
        toast.error("Maximum 11 joueurs sur le terrain");
        setActiveId(null);
        return;
      }

      const player = availablePlayers.find(p => p.id === activePlayerId);
      if (player) {
        const pitchElement = document.querySelector('[data-pitch="true"]');
        if (pitchElement) {
          const rect = pitchElement.getBoundingClientRect();
          const mouseX = event.activatorEvent ? (event.activatorEvent as PointerEvent).clientX : rect.left + rect.width / 2;
          const mouseY = event.activatorEvent ? (event.activatorEvent as PointerEvent).clientY : rect.top + rect.height / 2;
          
          let percentX = ((mouseX - rect.left) / rect.width) * 100;
          let percentY = ((mouseY - rect.top) / rect.height) * 100;

          // Apply grid snapping if enabled
          if (showGrid) {
            const snapped = snapToGrid(percentX, percentY);
            percentX = snapped.x;
            percentY = snapped.y;
          }

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
              position_y: Math.max(10, Math.min(90, percentY)),
              is_starter: true,
              player_rating: 0
            })
            .select()
            .single();

          if (!error) {
            fetchFormation();
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
            position_x: 0,
            position_y: 0,
            is_starter: false,
            player_rating: 0
          })
          .select()
          .single();

        if (!error) {
          fetchFormation();
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
          
          let percentX = ((mouseX - rect.left) / rect.width) * 100;
          let percentY = ((mouseY - rect.top) / rect.height) * 100;

          // Apply grid snapping if enabled
          if (showGrid) {
            const snapped = snapToGrid(percentX, percentY);
            percentX = snapped.x;
            percentY = snapped.y;
          }

          await supabase
            .from('match_formation_players')
            .update({
              position_x: Math.max(5, Math.min(95, percentX)),
              position_y: Math.max(10, Math.min(90, percentY))
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

    // Move from substitutes to field - Check 11 players limit
    if (isFromSubstitutes && over.id === 'field') {
      if (fieldPlayers.length >= 11) {
        toast.error("Maximum 11 joueurs sur le terrain");
        setActiveId(null);
        return;
      }

      const player = substitutes.find(p => p.id === activePlayerId || p.player_id === activePlayerId);
      if (player && player.id) {
        const pitchElement = document.querySelector('[data-pitch="true"]');
        if (pitchElement) {
          const rect = pitchElement.getBoundingClientRect();
          const mouseX = event.activatorEvent ? (event.activatorEvent as PointerEvent).clientX : rect.left + rect.width / 2;
          const mouseY = event.activatorEvent ? (event.activatorEvent as PointerEvent).clientY : rect.top + rect.height / 2;
          
          let percentX = ((mouseX - rect.left) / rect.width) * 100;
          let percentY = ((mouseY - rect.top) / rect.height) * 100;

          // Apply grid snapping if enabled
          if (showGrid) {
            const snapped = snapToGrid(percentX, percentY);
            percentX = snapped.x;
            percentY = snapped.y;
          }

          await supabase
            .from('match_formation_players')
            .update({
              is_starter: true,
              position_x: Math.max(5, Math.min(95, percentX)),
              position_y: Math.max(10, Math.min(90, percentY))
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

  const copyFormationFromPrevious = async (sourceFormationId: string) => {
    if (!formationId) return;

    // Fetch source formation players
    const { data: sourcePlayers } = await supabase
      .from('match_formation_players')
      .select('*')
      .eq('formation_id', sourceFormationId);

    if (!sourcePlayers) return;

    // Delete current formation players
    await supabase
      .from('match_formation_players')
      .delete()
      .eq('formation_id', formationId);

    // Copy players to new formation
    const newPlayers = sourcePlayers.map(player => ({
      formation_id: formationId,
      player_id: player.player_id,
      opposing_player_id: player.opposing_player_id,
      player_name: player.player_name,
      player_position: player.player_position,
      jersey_number: player.jersey_number,
      player_image_url: player.player_image_url,
      position_x: player.position_x,
      position_y: player.position_y,
      is_starter: player.is_starter,
      player_rating: player.player_rating
    }));

    await supabase
      .from('match_formation_players')
      .insert(newPlayers);

    fetchFormation();
    toast.success("Formation copiée avec succès");
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
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestion des Formations Tactiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <Label>Formation</Label>
                <Select value={selectedFormation} onValueChange={setSelectedFormation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATION_TEMPLATES.map((template) => (
                      <SelectItem key={template.formation} value={template.formation}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                    <Button onClick={createFormation} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Créer la formation
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={applyFormationTemplate} size="sm" variant="outline">
                          <Layout className="h-4 w-4 mr-2" />
                          Appliquer template {selectedFormation}
                        </Button>
                        <Button 
                          onClick={() => setShowGrid(!showGrid)} 
                          size="sm" 
                          variant={showGrid ? "default" : "outline"}
                        >
                          <Grid3x3 className="h-4 w-4 mr-2" />
                          {showGrid ? "Grille active" : "Grille désactivée"}
                        </Button>
                        <Button onClick={deleteFormation} variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                      
                      {previousMatches.length > 0 && (
                        <Alert>
                          <Copy className="h-4 w-4" />
                          <AlertDescription>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm">Copier depuis:</span>
                              <Select onValueChange={(value) => copyFormationFromPrevious(value)}>
                                <SelectTrigger className="w-[250px] h-8">
                                  <SelectValue placeholder="Sélectionner un match" />
                                </SelectTrigger>
                                <SelectContent>
                                  {previousMatches.map((match: any) => (
                                    <SelectItem key={match.formation_id} value={match.formation_id}>
                                      {match.home_team} vs {match.away_team}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {lastSaved && (
                        <p className="text-xs text-muted-foreground">
                          Dernière sauvegarde: {lastSaved.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  )}

                  {formationId && (
                    <div className="grid grid-cols-4 gap-4">
                      {/* Liste des joueurs disponibles - Plus compact */}
                      <Card className="col-span-1">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm">Joueurs disponibles</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2">
                          <ScrollArea className="h-[500px]">
                            <div className="space-y-1">
                              {availablePlayers
                                .filter(p => 
                                  !fieldPlayers.some(fp => fp.player_id === p.id) &&
                                  !substitutes.some(sp => sp.player_id === p.id)
                                )
                                .map((player) => (
                                  <DraggablePlayer
                                    key={player.id}
                                    id={player.id}
                                    name={player.name}
                                    position={player.position}
                                    jerseyNumber={player.jersey_number}
                                    variant="list"
                                  />
                                ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>

                      {/* Terrain + Remplaçants en disposition horizontale */}
                      <div className="col-span-3">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant={fieldPlayers.length === 11 ? "default" : "secondary"} className="text-sm">
                            {fieldPlayers.length}/11 joueurs sur le terrain
                          </Badge>
                          {fieldPlayers.length < 11 && (
                            <span className="text-xs text-muted-foreground">
                              Glissez {11 - fieldPlayers.length} joueur{11 - fieldPlayers.length > 1 ? 's' : ''} de plus
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          {/* Terrain - 2 colonnes */}
                          <div className="col-span-2">
                            <DroppableField id="field">
                              <div 
                                className="relative w-full bg-gradient-to-b from-green-400 to-green-600 rounded-lg overflow-hidden shadow-lg" 
                                style={{ aspectRatio: "16/11", maxHeight: "380px" }}
                                data-pitch="true"
                              >
                                {/* Lignes du terrain */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  <rect x="5" y="5" width="90" height="90" fill="none" stroke="white" strokeWidth="0.3" opacity="0.7" />
                                  <line x1="5" y1="50" x2="95" y2="50" stroke="white" strokeWidth="0.3" opacity="0.7" />
                                  <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeWidth="0.3" opacity="0.7" />
                                  <circle cx="50" cy="50" r="0.5" fill="white" opacity="0.7" />
                                  <rect x="28" y="5" width="44" height="15" fill="none" stroke="white" strokeWidth="0.3" opacity="0.7" />
                                  <rect x="38" y="5" width="24" height="7" fill="none" stroke="white" strokeWidth="0.3" opacity="0.7" />
                                  <rect x="28" y="80" width="44" height="15" fill="none" stroke="white" strokeWidth="0.3" opacity="0.7" />
                                  <rect x="38" y="88" width="24" height="7" fill="none" stroke="white" strokeWidth="0.3" opacity="0.7" />
                                  
                                  {/* Grille magnétique */}
                                  {showGrid && (
                                    <>
                                      {[...Array(20)].map((_, i) => (
                                        <line 
                                          key={`v-${i}`} 
                                          x1={5 + (i * 4.5)} 
                                          y1="5" 
                                          x2={5 + (i * 4.5)} 
                                          y2="95" 
                                          stroke="white" 
                                          strokeWidth="0.1" 
                                          opacity="0.2" 
                                        />
                                      ))}
                                      {[...Array(20)].map((_, i) => (
                                        <line 
                                          key={`h-${i}`} 
                                          x1="5" 
                                          y1={5 + (i * 4.5)} 
                                          x2="95" 
                                          y2={5 + (i * 4.5)} 
                                          stroke="white" 
                                          strokeWidth="0.1" 
                                          opacity="0.2" 
                                        />
                                      ))}
                                    </>
                                  )}
                                </svg>

                                {/* Joueurs sur le terrain */}
                                {fieldPlayers.map((player) => (
                                  <DroppableFieldPlayer
                                    key={player.id}
                                    player={player}
                                    onDelete={() => deletePlayer(player.id!)}
                                    style={{
                                      left: `${player.position_x}%`,
                                      top: `${player.position_y}%`,
                                      transform: 'translate(-50%, -50%)',
                                      zIndex: 10
                                    }}
                                  />
                                ))}
                              </div>
                            </DroppableField>
                          </div>

                          {/* Remplaçants - 1 colonne */}
                          <Card className="col-span-1">
                            <CardHeader className="py-2">
                              <CardTitle className="text-sm">Remplaçants</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2">
                              <DroppableSubstitutes id="substitutes">
                                <ScrollArea className="h-[380px]">
                                  <div className="space-y-1.5">
                                    {substitutes.length === 0 && (
                                      <p className="text-xs text-muted-foreground p-2">Glissez des joueurs ici</p>
                                    )}
                                    {substitutes.map((player) => (
                                      <DraggablePlayer
                                        key={player.id}
                                        id={player.id || player.player_id}
                                        name={player.player_name}
                                        position={player.player_position}
                                        jerseyNumber={player.jersey_number}
                                        variant="list"
                                        showDelete
                                        onDelete={() => deletePlayer(player.id!)}
                                      />
                                    ))}
                                  </div>
                                </ScrollArea>
                              </DroppableSubstitutes>
                            </CardContent>
                          </Card>
                        </div>
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
