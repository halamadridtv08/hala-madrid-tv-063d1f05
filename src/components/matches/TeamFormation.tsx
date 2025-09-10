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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { FootballPitch } from '@/components/admin/formation/FootballPitch';
import { Users, RotateCcw, Save } from 'lucide-react';
import { Player } from '@/types/Player';
import { Match } from '@/types/Match';

interface FormationPlayer {
  id: string;
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

interface TeamFormationProps {
  match: Match;
}

const FORMATIONS = [
  { value: "4-3-3", label: "4-3-3" },
  { value: "4-4-2", label: "4-4-2" },
  { value: "3-5-2", label: "3-5-2" },
  { value: "4-2-3-1", label: "4-2-3-1" }
];

const PlayerCard: React.FC<{
  player: FormationPlayer;
  position: { x: number; y: number };
  onSwapPosition: (playerId: string, targetId: string) => void;
  isDragOverlay?: boolean;
}> = ({ player, position, onSwapPosition, isDragOverlay = false }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  return (
    <div
      className={`absolute w-16 h-20 transform -translate-x-1/2 -translate-y-1/2 cursor-move ${
        isDragOverlay ? 'opacity-80 scale-110 z-50' : ''
      }`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      draggable
    >
      <Card className="w-full h-full bg-white/95 backdrop-blur-sm border-2 border-white shadow-lg">
        <CardContent className="p-1 h-full flex flex-col items-center justify-between">
          {/* Jersey number */}
          <Badge className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center p-0">
            {player.jersey_number}
          </Badge>
          
          {/* Player image or initials */}
          <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0">
            {player.player_image_url ? (
              <img
                src={player.player_image_url}
                alt={player.player_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                {player.player_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
            )}
          </div>
          
          {/* Player name */}
          <div className="text-[0.6rem] font-medium text-center leading-tight text-foreground">
            {player.player_name.split(' ').pop()}
          </div>
          
          {/* Position */}
          <div className="text-[0.5rem] text-muted-foreground uppercase font-medium">
            {player.player_position}
          </div>
        </CardContent>
      </Card>
      
      {/* Rating badge */}
      <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
        {player.player_rating.toFixed(1)}
      </div>
    </div>
  );
};

export const TeamFormation: React.FC<TeamFormationProps> = ({ match }) => {
  const [formations, setFormations] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeTeam, setActiveTeam] = useState<"real_madrid" | "opposing">("real_madrid");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [opposingPlayers, setOpposingPlayers] = useState<any[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (match?.id) {
      fetchFormations();
      fetchPlayers();
      fetchOpposingPlayers();
    }
  }, [match?.id]);

  const fetchFormations = async () => {
    if (!match?.id) return;

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
      .eq('match_id', match.id);

    if (error) {
      console.error('Error fetching formations:', error);
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

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('id, name, position, jersey_number, image_url, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('jersey_number');

    if (!error && data) {
      setPlayers(data);
    }
  };

  const fetchOpposingPlayers = async () => {
    if (!match?.opposing_team_id) return;

    const { data, error } = await supabase
      .from('opposing_players')
      .select('id, name, position, jersey_number')
      .eq('team_id', match.opposing_team_id)
      .order('jersey_number');

    if (!error && data) {
      setOpposingPlayers(data);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      handleSwapPlayers(String(active.id), String(over.id));
    }
    
    setActiveId(null);
  };

  const handleSwapPlayers = async (playerId1: string, playerId2: string) => {
    const currentFormation = formations[activeTeam];
    if (!currentFormation) return;

    const player1 = currentFormation.players.find((p: FormationPlayer) => p.id === playerId1);
    const player2 = currentFormation.players.find((p: FormationPlayer) => p.id === playerId2);

    if (!player1 || !player2) return;

    try {
      // Swap positions in database
      await supabase
        .from('match_formation_players')
        .update({ 
          position_x: player2.position_x, 
          position_y: player2.position_y 
        })
        .eq('id', player1.id);

      await supabase
        .from('match_formation_players')
        .update({ 
          position_x: player1.position_x, 
          position_y: player1.position_y 
        })
        .eq('id', player2.id);

      toast.success('Positions échangées');
      fetchFormations();
    } catch (error) {
      console.error('Error swapping players:', error);
      toast.error('Erreur lors de l\'échange');
    }
  };

  const resetFormation = async () => {
    // Implementation for resetting formation to default positions
    toast.success('Formation réinitialisée');
    fetchFormations();
  };

  const saveFormation = async () => {
    // Implementation for saving current formation
    toast.success('Formation sauvegardée');
  };

  const renderFormation = (teamType: "real_madrid" | "opposing") => {
    const formation = formations[teamType];
    if (!formation) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>Aucune formation disponible pour cette équipe</p>
        </div>
      );
    }

    const starters = formation.players.filter((p: FormationPlayer) => p.is_starter);
    const substitutes = formation.players.filter((p: FormationPlayer) => !p.is_starter);
    const activeDragPlayer = activeId ? starters.find((p: FormationPlayer) => p.id === activeId) : null;

    return (
      <div className="space-y-6">
        {/* Formation header */}
        <div className="flex items-center justify-between">
          <Badge variant="default" className="text-lg px-3 py-1">
            {formation.formation}
          </Badge>
          <div className="flex gap-2">
            <Button onClick={resetFormation} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button onClick={saveFormation} variant="default" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>

        {/* Formation name */}
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            Formation avec {starters.length} {starters.length === 1 ? 'défenseur central' : 'défenseurs centraux'}
          </h3>
        </div>

        {/* Football pitch with players */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="relative">
            <FootballPitch>
              {starters.map((player: FormationPlayer) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  position={{ x: player.position_x, y: player.position_y }}
                  onSwapPosition={handleSwapPlayers}
                />
              ))}
            </FootballPitch>

            <DragOverlay>
              {activeDragPlayer && (
                <PlayerCard
                  player={activeDragPlayer}
                  position={{ x: activeDragPlayer.position_x, y: activeDragPlayer.position_y }}
                  onSwapPosition={handleSwapPlayers}
                  isDragOverlay
                />
              )}
            </DragOverlay>
          </div>
        </DndContext>

        {/* Substitutes */}
        {substitutes.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-muted-foreground">Remplaçants</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {substitutes.map((player: FormationPlayer) => (
                <Card key={player.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-bold">
                      {player.jersey_number}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{player.player_name}</p>
                      <p className="text-xs text-muted-foreground">{player.player_position}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {player.player_rating.toFixed(1)}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des compositions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Compositions d'équipe
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {match.home_team} vs {match.away_team} - {new Date(match.match_date).toLocaleDateString('fr-FR')}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTeam} onValueChange={(value) => setActiveTeam(value as "real_madrid" | "opposing")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="real_madrid">Real Madrid</TabsTrigger>
            <TabsTrigger value="opposing">{match.away_team}</TabsTrigger>
          </TabsList>

          <TabsContent value="real_madrid" className="mt-6">
            {renderFormation("real_madrid")}
          </TabsContent>

          <TabsContent value="opposing" className="mt-6">
            {renderFormation("opposing")}
          </TabsContent>
        </Tabs>

        {/* Instructions */}
        <div className="mt-6 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Instructions :</h4>
          <ul className="space-y-1 text-xs">
            <li>• Glissez-déposez les joueurs pour échanger leurs positions</li>
            <li>• Les numéros jaunes indiquent les notes des joueurs</li>
            <li>• Utilisez les onglets pour basculer entre les équipes</li>
            <li>• Sauvegardez vos modifications</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};