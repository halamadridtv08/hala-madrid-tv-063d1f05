import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { FootballPitch } from '@/components/admin/formation/FootballPitch';
import { PlayerOnField } from './PlayerOnField';
import { Users } from 'lucide-react';
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
export const TeamFormation: React.FC<TeamFormationProps> = ({
  match
}) => {
  const [formations, setFormations] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeTeam, setActiveTeam] = useState<"real_madrid" | "opposing">("real_madrid");
  useEffect(() => {
    if (match?.id) {
      fetchFormations();
    }
  }, [match?.id]);
  const fetchFormations = async () => {
    if (!match?.id) return;
    setLoading(true);

    // Fetch formations with players
    const {
      data,
      error
    } = await supabase.from('match_formations').select(`
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
      `).eq('match_id', match.id);
    if (error) {
      console.error('Error fetching formations:', error);
      setLoading(false);
      return;
    }

    // Collect all opposing_player_ids to fetch their photos
    const opposingPlayerIds: string[] = [];
    const playerIds: string[] = [];
    data?.forEach(formation => {
      formation.match_formation_players?.forEach((player: any) => {
        if (player.opposing_player_id) {
          opposingPlayerIds.push(player.opposing_player_id);
        }
        if (player.player_id) {
          playerIds.push(player.player_id);
        }
      });
    });

    // Fetch opposing players photos
    let opposingPlayersMap: Record<string, string> = {};
    if (opposingPlayerIds.length > 0) {
      const {
        data: opposingPlayers
      } = await supabase.from('opposing_players').select('id, photo_url').in('id', opposingPlayerIds);
      opposingPlayers?.forEach(p => {
        if (p.photo_url) {
          opposingPlayersMap[p.id] = p.photo_url;
        }
      });
    }

    // Fetch Real Madrid players photos
    let playersMap: Record<string, string> = {};
    if (playerIds.length > 0) {
      const {
        data: players
      } = await supabase.from('players').select('id, profile_image_url').in('id', playerIds);
      players?.forEach(p => {
        if (p.profile_image_url) {
          playersMap[p.id] = p.profile_image_url;
        }
      });
    }
    const formationsData: any = {};
    data?.forEach(formation => {
      formationsData[formation.team_type] = {
        id: formation.id,
        formation: formation.formation,
        players: (formation.match_formation_players || []).map((player: any) => ({
          ...player,
          player_image_url: player.player_image_url || (player.opposing_player_id ? opposingPlayersMap[player.opposing_player_id] : null) || (player.player_id ? playersMap[player.player_id] : null) || null
        }))
      };
    });
    setFormations(formationsData);
    setLoading(false);
  };
  const getOpposingTeamName = () => {
    // Support both formats: direct properties and nested object format
    const homeTeam = match.home_team || (match as any).homeTeam?.name;
    const awayTeam = match.away_team || (match as any).awayTeam?.name;
    if (homeTeam === 'Real Madrid') {
      return awayTeam || 'Équipe adverse';
    }
    return homeTeam || 'Équipe adverse';
  };
  const renderFormation = (teamType: "real_madrid" | "opposing") => {
    const formation = formations[teamType];
    if (!formation) {
      return <div className="text-center py-8 text-muted-foreground">
          <p>Aucune formation disponible pour cette équipe</p>
        </div>;
    }
    const starters = formation.players.filter((p: FormationPlayer) => p.is_starter);
    const substitutes = formation.players.filter((p: FormationPlayer) => !p.is_starter);
    return <div className="space-y-6">
        {/* Formation header */}
        <div className="flex items-center justify-between">
          <Badge variant="default" className="text-lg px-3 py-1">
            {formation.formation}
          </Badge>
        </div>

        {/* Football pitch with players */}
        <div className="relative w-full overflow-x-auto">
          <div className="min-w-[320px]">
            <FootballPitch>
              {starters.map((player: FormationPlayer) => <PlayerOnField key={player.id} player={{
              id: player.id,
              player_name: player.player_name,
              player_position: player.player_position,
              jersey_number: player.jersey_number,
              player_image_url: player.player_image_url,
              player_rating: player.player_rating
            }} style={{
              left: `${player.position_x}%`,
              top: `${player.position_y}%`,
              zIndex: 10
            }} />)}
            </FootballPitch>
          </div>
        </div>

        {/* Remplaçants - Affichage horizontal */}
        {substitutes.length > 0 && <div className="space-y-3">
            <h4 className="font-semibold text-muted-foreground flex items-center gap-2 text-sm md:text-base">
              <Users className="h-4 w-4" />
              Remplaçants ({substitutes.length})
            </h4>
            <div className="flex flex-wrap gap-2 md:gap-3 p-3 md:p-4 bg-muted/50 rounded-lg">
              {substitutes.map((player: FormationPlayer) => <div key={player.id} className="flex items-center gap-2 md:gap-3 bg-background p-2 rounded-lg border min-w-0 flex-shrink-0">
                  {/* Photo du joueur */}
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-blue-600 flex-shrink-0">
                    {player.player_image_url ? <img src={player.player_image_url} alt={player.player_name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-foreground">
                          {player.player_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>}
                  </div>
                  
                  {/* Numéro */}
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs md:text-sm font-bold text-white">
                      {player.jersey_number}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0 hidden sm:block">
                    <p className="text-xs md:text-sm font-medium truncate">{player.player_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{player.player_position}</p>
                  </div>
                  
                  {/* Note */}
                  {player.player_rating > 0 && <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs md:text-sm font-bold text-gray-900">
                        {player.player_rating?.toFixed(1)}
                      </span>
                    </div>}
                </div>)}
            </div>
          </div>}
      </div>;
  };
  if (loading) {
    return <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des compositions...</p>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Compositions d'équipe
        </CardTitle>
        
      </CardHeader>
      <CardContent>
        <Tabs value={activeTeam} onValueChange={value => setActiveTeam(value as "real_madrid" | "opposing")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="real_madrid" className="text-xs sm:text-sm">Real Madrid</TabsTrigger>
            <TabsTrigger value="opposing" className="text-xs sm:text-sm">
              {getOpposingTeamName()}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="real_madrid" className="mt-6">
            {renderFormation("real_madrid")}
          </TabsContent>

          <TabsContent value="opposing" className="mt-6">
            {renderFormation("opposing")}
          </TabsContent>
        </Tabs>

        {/* Instructions */}
        
      </CardContent>
    </Card>;
};