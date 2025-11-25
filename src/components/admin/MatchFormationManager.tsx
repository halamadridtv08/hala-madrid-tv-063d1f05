import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Save, Plus, Users } from "lucide-react";

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  competition: string;
}

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number;
  image_url?: string;
}

interface OpposingPlayer {
  id: string;
  name: string;
  position: string;
  jersey_number: number;
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

const FORMATIONS = [
  { value: "4-3-3", label: "4-3-3" },
  { value: "4-4-2", label: "4-4-2" },
  { value: "3-5-2", label: "3-5-2" },
  { value: "4-2-3-1", label: "4-2-3-1" },
  { value: "3-4-3", label: "3-4-3" },
  { value: "4-1-4-1", label: "4-1-4-1" },
  { value: "5-3-2", label: "5-3-2" },
  { value: "4-3-2-1", label: "4-3-2-1" },
  { value: "5-4-1", label: "5-4-1" },
  { value: "3-4-2-1", label: "3-4-2-1" },
  { value: "4-1-2-1-2", label: "4-1-2-1-2" }
];

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

export const MatchFormationManager = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [opposingPlayers, setOpposingPlayers] = useState<OpposingPlayer[]>([]);
  const [formations, setFormations] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeTeam, setActiveTeam] = useState<"real_madrid" | "opposing">("real_madrid");

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      fetchFormations();
      fetchOpposingPlayersForMatch();
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

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('id, name, position, jersey_number, image_url')
      .eq('is_active', true)
      .order('jersey_number');

    if (error) {
      console.error('Erreur:', error);
      return;
    }

    setPlayers(data || []);
  };

  const fetchOpposingPlayersForMatch = async () => {
    if (!selectedMatch) return;

    const match = matches.find(m => m.id === selectedMatch);
    if (!match) return;

    const opposingTeamName = match.home_team === 'Real Madrid' ? match.away_team : match.home_team;

    const { data: teamData, error: teamError } = await supabase
      .from('opposing_teams')
      .select('id')
      .eq('name', opposingTeamName)
      .maybeSingle();

    if (teamError || !teamData) {
      setOpposingPlayers([]);
      return;
    }

    const { data: playersData, error: playersError } = await supabase
      .from('opposing_players')
      .select('id, name, position, jersey_number')
      .eq('team_id', teamData.id)
      .order('jersey_number');

    if (playersError) {
      console.error('Erreur:', playersError);
      return;
    }

    setOpposingPlayers(playersData || []);
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
      // Créer la formation
      const { data: formationData, error: formationError } = await supabase
        .from('match_formations')
        .insert({
          match_id: selectedMatch,
          team_type: teamType,
          formation: "4-3-3"
        })
        .select()
        .single();

      if (formationError) throw formationError;

      // Créer les positions par défaut
      const defaultPositions = DEFAULT_POSITIONS_433[teamType];
      const availablePlayers = teamType === "real_madrid" ? players : opposingPlayers;
      
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
          player_image_url: teamType === "real_madrid" ? (player as Player)?.image_url : null,
          player_rating: 7.0
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestionnaire de Compositions
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
                <TabsTrigger value="real_madrid">Real Madrid</TabsTrigger>
                <TabsTrigger value="opposing">Équipe Adverse</TabsTrigger>
              </TabsList>

              {["real_madrid", "opposing"].map((teamType) => (
                <TabsContent key={teamType} value={teamType} className="space-y-4">
                  {formations[teamType] ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          Formation: {formations[teamType].formation}
                        </Badge>
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

                      <div className="relative w-full bg-green-600 rounded-lg overflow-hidden" style={{ aspectRatio: "3/4", minHeight: "300px", maxHeight: "600px" }}>
                        {/* Lignes du terrain */}
                        <div className="absolute inset-0">
                          <div className="absolute w-full h-0.5 bg-white top-1/2 transform -translate-y-0.5"></div>
                          <div className="absolute w-0.5 h-full bg-white left-1/2 transform -translate-x-0.5"></div>
                          <div className="absolute w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border-2 border-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                          
                          {/* Surface de réparation */}
                          <div className="absolute w-12 h-8 sm:w-14 sm:h-9 md:w-16 md:h-10 border-2 border-white top-0 left-1/2 transform -translate-x-1/2"></div>
                          <div className="absolute w-12 h-8 sm:w-14 sm:h-9 md:w-16 md:h-10 border-2 border-white bottom-0 left-1/2 transform -translate-x-1/2"></div>
                          
                          {/* Petite surface */}
                          <div className="absolute w-6 h-4 sm:w-7 sm:h-5 md:w-8 md:h-6 border-2 border-white top-0 left-1/2 transform -translate-x-1/2"></div>
                          <div className="absolute w-6 h-4 sm:w-7 sm:h-5 md:w-8 md:h-6 border-2 border-white bottom-0 left-1/2 transform -translate-x-1/2"></div>
                        </div>

                        {/* Joueurs */}
                        {formations[teamType].players
                          .filter((player: FormationPlayer) => player.is_starter)
                          .map((player: FormationPlayer) => (
                          <div
                            key={player.id}
                            className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transform -translate-x-1/2 -translate-y-1/2 cursor-move"
                            style={{
                              left: `${player.position_x}%`,
                              top: `${player.position_y}%`
                            }}
                            draggable
                            onDragEnd={(e) => {
                              const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                              if (rect) {
                                const x = ((e.clientX - rect.left) / rect.width) * 100;
                                const y = ((e.clientY - rect.top) / rect.height) * 100;
                                updatePlayerPosition(player.id!, Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
                              }
                            }}
                          >
                            <div className="relative w-full h-full">
                              {player.player_image_url ? (
                                <img
                                  src={player.player_image_url}
                                  alt={player.player_name}
                                  className="w-full h-full rounded-full border-2 border-white object-cover"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                                  {player.jersey_number}
                                </div>
                              )}
                              <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white text-[9px] sm:text-xs px-1 py-0.5 rounded whitespace-nowrap max-w-[80px] truncate">
                                {player.player_name}
                              </div>
                              <div className="absolute -top-1 sm:-top-2 -right-0.5 sm:-right-1 bg-yellow-400 text-black text-[9px] sm:text-xs font-bold rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center">
                                {player.player_rating.toFixed(1)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Remplaçants */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm sm:text-base">Remplaçants</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {formations[teamType].players
                            .filter((player: FormationPlayer) => !player.is_starter)
                            .map((player: FormationPlayer) => (
                            <div key={player.id} className="flex items-center space-x-1.5 sm:space-x-2 p-1.5 sm:p-2 border rounded">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {player.jersey_number}
                              </div>
                              <span className="text-xs sm:text-sm truncate">{player.player_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        Aucune formation configurée pour {teamType === "real_madrid" ? "Real Madrid" : "l'équipe adverse"}
                      </p>
                      <Button
                        onClick={() => createDefaultFormation(teamType as "real_madrid" | "opposing")}
                        disabled={loading}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Créer une formation par défaut
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