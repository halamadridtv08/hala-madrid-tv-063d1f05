import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users, Trophy } from "lucide-react";

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
  substitution_minute?: number;
}

interface MatchEvent {
  id: string;
  entry_type: string;
  player_id?: string;
  assist_player_id?: string;
  substituted_player_id?: string;
  minute?: number;
  card_type?: string;
  team_side?: string;
}

interface Formation {
  id: string;
  team_type: string;
  formation: string;
  players: FormationPlayer[];
}

interface TacticalFormationProps {
  matchId: string;
  matchData: any;
}

export const TacticalFormation = ({
  matchId,
  matchData
}: TacticalFormationProps) => {
  const [formations, setFormations] = useState<{ [key: string]: Formation }>({});
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (matchId) {
      fetchFormations();
      fetchMatchEvents();
    }
  }, [matchId]);

  const fetchFormations = async () => {
    setLoading(true);
    try {
      // Récupérer les formations avec les joueurs
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
            player_rating,
            substitution_minute
          )
        `)
        .eq('match_id', matchId);

      if (error) {
        console.error('Erreur lors du chargement des formations:', error);
        return;
      }

      // Récupérer les photos des joueurs Real Madrid
      const { data: players } = await supabase
        .from('players')
        .select('id, profile_image_url, image_url');

      // Récupérer les photos des joueurs adverses
      const { data: opposingPlayers } = await supabase
        .from('opposing_players')
        .select('id, photo_url');

      const playerPhotos: { [key: string]: string } = {};
      players?.forEach(p => {
        if (p.profile_image_url || p.image_url) {
          playerPhotos[p.id] = p.profile_image_url || p.image_url || '';
        }
      });

      const opposingPlayerPhotos: { [key: string]: string } = {};
      opposingPlayers?.forEach(p => {
        if (p.photo_url) {
          opposingPlayerPhotos[p.id] = p.photo_url;
        }
      });

      const formationsData: { [key: string]: Formation } = {};
      data?.forEach(formation => {
        const playersWithPhotos = (formation.match_formation_players || []).map(player => {
          let imageUrl = player.player_image_url;
          
          // Si pas d'image, chercher dans les tables de référence
          if (!imageUrl && player.player_id && playerPhotos[player.player_id]) {
            imageUrl = playerPhotos[player.player_id];
          }
          if (!imageUrl && player.opposing_player_id && opposingPlayerPhotos[player.opposing_player_id]) {
            imageUrl = opposingPlayerPhotos[player.opposing_player_id];
          }
          
          return {
            ...player,
            player_image_url: imageUrl
          };
        });

        formationsData[formation.team_type] = {
          id: formation.id,
          team_type: formation.team_type,
          formation: formation.formation,
          players: playersWithPhotos.sort((a, b) =>
            b.is_starter === a.is_starter
              ? a.jersey_number - b.jersey_number
              : (b.is_starter ? 1 : 0) - (a.is_starter ? 1 : 0)
          )
        };
      });

      setFormations(formationsData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('live_blog_entries')
        .select('id, entry_type, player_id, assist_player_id, substituted_player_id, minute, card_type, team_side')
        .eq('match_id', matchId)
        .in('entry_type', ['goal', 'yellow_card', 'red_card', 'substitution', 'assist']);

      if (error) {
        console.error('Erreur lors du chargement des événements:', error);
        return;
      }

      setMatchEvents(data || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Fonctions pour obtenir les événements d'un joueur
  const getPlayerGoals = (playerId?: string) => {
    if (!playerId) return [];
    return matchEvents.filter(e => e.entry_type === 'goal' && e.player_id === playerId);
  };

  const getPlayerAssists = (playerId?: string) => {
    if (!playerId) return [];
    return matchEvents.filter(e => e.assist_player_id === playerId);
  };

  const getPlayerCards = (playerId?: string) => {
    if (!playerId) return [];
    return matchEvents.filter(e => 
      (e.entry_type === 'yellow_card' || e.entry_type === 'red_card') && 
      e.player_id === playerId
    );
  };

  const getPlayerSubstitution = (playerId?: string) => {
    if (!playerId) return null;
    return matchEvents.find(e => 
      e.entry_type === 'substitution' && 
      (e.player_id === playerId || e.substituted_player_id === playerId)
    );
  };

  // Composant pour afficher les icônes d'événements
  const PlayerEventIcons = ({ playerId, isOpposing = false }: { playerId?: string; isOpposing?: boolean }) => {
    const goals = getPlayerGoals(playerId);
    const assists = getPlayerAssists(playerId);
    const cards = getPlayerCards(playerId);
    const substitution = getPlayerSubstitution(playerId);

    if (goals.length === 0 && assists.length === 0 && cards.length === 0 && !substitution) {
      return null;
    }

    return (
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
        {/* Buts */}
        {goals.map((goal, idx) => (
          <div key={`goal-${idx}`} className="flex items-center gap-0.5">
            <div className="bg-white rounded-full p-0.5 shadow-md">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#1a1a1a" stroke="#333" strokeWidth="1"/>
                <path d="M12 2 L14 8 L20 8 L15 12 L17 19 L12 15 L7 19 L9 12 L4 8 L10 8 Z" fill="white"/>
              </svg>
            </div>
            {goal.minute && (
              <span className="text-[8px] text-white font-bold bg-black/60 px-0.5 rounded">
                {goal.minute}'
              </span>
            )}
          </div>
        ))}

        {/* Passes décisives */}
        {assists.map((assist, idx) => (
          <div key={`assist-${idx}`} className="flex items-center gap-0.5">
            <div className="bg-green-500 rounded-full p-0.5 shadow-md">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            {assist.minute && (
              <span className="text-[8px] text-white font-bold bg-black/60 px-0.5 rounded">
                {assist.minute}'
              </span>
            )}
          </div>
        ))}

        {/* Cartons */}
        {cards.map((card, idx) => (
          <div key={`card-${idx}`} className="flex items-center gap-0.5">
            <div className={`w-2.5 h-3.5 rounded-sm shadow-md ${
              card.entry_type === 'red_card' ? 'bg-red-600' : 'bg-yellow-400'
            }`} />
            {card.minute && (
              <span className="text-[8px] text-white font-bold bg-black/60 px-0.5 rounded">
                {card.minute}'
              </span>
            )}
          </div>
        ))}

        {/* Substitution (sortie) */}
        {substitution && substitution.substituted_player_id === playerId && (
          <div className="flex items-center gap-0.5">
            <div className="bg-red-500 rounded-full p-0.5 shadow-md">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 7l5-5 5 5H7zm10 10l-5 5-5-5h10z"/>
              </svg>
            </div>
            {substitution.minute && (
              <span className="text-[8px] text-white font-bold bg-black/60 px-0.5 rounded">
                {substitution.minute}'
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Chargement des compositions...</div>
        </CardContent>
      </Card>
    );
  }

  if (Object.keys(formations).length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune composition disponible pour ce match</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const realMadridFormation = formations.real_madrid;
  const opposingFormation = formations.opposing;

  const getOpposingTeamName = () => {
    if (matchData?.homeTeam?.name === 'Real Madrid') {
      return matchData?.awayTeam?.name || 'Équipe adverse';
    }
    return matchData?.homeTeam?.name || 'Équipe adverse';
  };

  // Composant pour afficher un joueur sur le terrain
  const PlayerOnPitch = ({ 
    player, 
    isOpposing = false,
    adjustedY
  }: { 
    player: FormationPlayer; 
    isOpposing?: boolean;
    adjustedY: number;
  }) => {
    const borderColor = isOpposing ? 'border-red-400' : 'border-white';
    const bgGradient = isOpposing ? 'from-red-600 to-red-700' : 'from-blue-600 to-blue-700';
    const goals = getPlayerGoals(player.player_id || player.opposing_player_id);
    const assists = getPlayerAssists(player.player_id || player.opposing_player_id);
    const cards = getPlayerCards(player.player_id || player.opposing_player_id);
    const substitution = getPlayerSubstitution(player.player_id || player.opposing_player_id);

    // Récupérer le nom court (nom de famille)
    const shortName = player.player_name.split(' ').pop() || player.player_name;

    return (
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
        style={{
          left: `${player.position_x}%`,
          top: `${adjustedY}%`
        }}
      >
        <div className="relative flex flex-col items-center">
          {/* Container photo avec événements */}
          <div className="relative">
            {/* Icônes d'événements à gauche */}
            <PlayerEventIcons playerId={player.player_id || player.opposing_player_id} isOpposing={isOpposing} />

            {/* Photo du joueur */}
            {player.player_image_url ? (
              <img
                src={player.player_image_url}
                alt={player.player_name}
                className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 ${borderColor} shadow-lg object-cover bg-gray-800`}
              />
            ) : (
              <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 ${borderColor} bg-gradient-to-br ${bgGradient} shadow-lg flex items-center justify-center`}>
                <span className="text-white text-[10px] sm:text-xs font-bold">{player.jersey_number}</span>
              </div>
            )}

            {/* Numéro du maillot en haut à gauche */}
            <div className={`absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-1 ${isOpposing ? 'bg-red-600 text-white' : 'bg-white text-blue-600'} text-[8px] sm:text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-md`}>
              {player.jersey_number}
            </div>

            {/* Note du joueur en haut à droite */}
            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-yellow-400 text-black text-[8px] sm:text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-md">
              {player.player_rating?.toFixed(1) || '0.0'}
            </div>

            {/* Substitution sortie (flèche rouge en bas) */}
            {substitution && substitution.substituted_player_id === (player.player_id || player.opposing_player_id) && (
              <div className="absolute -bottom-0.5 -left-0.5 bg-red-500 text-white text-[6px] sm:text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14l5 5 5-5H7z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Nom du joueur - toujours visible sur mobile */}
          <div className="mt-0.5 sm:mt-1 bg-black/70 text-white text-[7px] sm:text-[9px] md:text-[10px] px-1 sm:px-1.5 py-0.5 rounded whitespace-nowrap max-w-[50px] sm:max-w-[70px] truncate text-center">
            {shortName}
          </div>

          {/* Événements en ligne sous le nom */}
          {(goals.length > 0 || assists.length > 0 || cards.length > 0) && (
            <div className="flex items-center gap-0.5 mt-0.5">
              {goals.map((goal, idx) => (
                <div key={`goal-inline-${idx}`} className="flex items-center">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#1a1a1a" stroke="#333" strokeWidth="1"/>
                    <path d="M12 2 L14 8 L20 8 L15 12 L17 19 L12 15 L7 19 L9 12 L4 8 L10 8 Z" fill="white"/>
                  </svg>
                  <span className="text-[6px] text-white bg-black/60 px-0.5 rounded ml-0.5">{goal.minute}'</span>
                </div>
              ))}
              {assists.map((assist, idx) => (
                <div key={`assist-inline-${idx}`} className="flex items-center">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-[5px] sm:text-[6px] text-white font-bold">A</span>
                  </div>
                  <span className="text-[6px] text-white bg-black/60 px-0.5 rounded ml-0.5">{assist.minute}'</span>
                </div>
              ))}
              {cards.map((card, idx) => (
                <div key={`card-inline-${idx}`} className="flex items-center">
                  <div className={`w-2 h-2.5 sm:w-2.5 sm:h-3 rounded-sm ${card.entry_type === 'red_card' ? 'bg-red-600' : 'bg-yellow-400'}`} />
                  <span className="text-[6px] text-white bg-black/60 px-0.5 rounded ml-0.5">{card.minute}'</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Composant pour afficher un remplaçant
  const SubstitutePlayer = ({ 
    player, 
    isOpposing = false 
  }: { 
    player: FormationPlayer; 
    isOpposing?: boolean 
  }) => {
    const bgColor = isOpposing ? 'bg-red-600' : 'bg-blue-600';
    const substitution = getPlayerSubstitution(player.player_id || player.opposing_player_id);
    const goals = getPlayerGoals(player.player_id || player.opposing_player_id);
    const assists = getPlayerAssists(player.player_id || player.opposing_player_id);
    const cards = getPlayerCards(player.player_id || player.opposing_player_id);

    return (
      <div className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {/* Photo ou numéro */}
        {player.player_image_url ? (
          <img
            src={player.player_image_url}
            alt={player.player_name}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${isOpposing ? 'border-red-400' : 'border-blue-400'} object-cover bg-gray-700 flex-shrink-0`}
          />
        ) : (
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0`}>
            {player.jersey_number}
          </div>
        )}

        {/* Info joueur */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <p className="text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-none">{player.player_name}</p>
            {/* Icônes événements inline */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {goals.map((goal, idx) => (
                <div key={`g-${idx}`} className="flex items-center">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#1a1a1a" stroke="#333" strokeWidth="1"/>
                    <path d="M12 2 L14 8 L20 8 L15 12 L17 19 L12 15 L7 19 L9 12 L4 8 L10 8 Z" fill="white"/>
                  </svg>
                  <span className="text-[8px] text-muted-foreground ml-0.5">{goal.minute}'</span>
                </div>
              ))}
              {assists.map((assist, idx) => (
                <div key={`a-${idx}`} className="flex items-center">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-[5px] sm:text-[6px] text-white font-bold">A</span>
                  </div>
                  <span className="text-[8px] text-muted-foreground ml-0.5">{assist.minute}'</span>
                </div>
              ))}
              {cards.map((card, idx) => (
                <div key={`c-${idx}`} className="flex items-center">
                  <div className={`w-2 h-2.5 sm:w-2.5 sm:h-3 rounded-sm ${card.entry_type === 'red_card' ? 'bg-red-600' : 'bg-yellow-400'}`} />
                  <span className="text-[8px] text-muted-foreground ml-0.5">{card.minute}'</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">{player.player_position}</p>
          {/* Minute d'entrée */}
          {substitution && substitution.player_id === (player.player_id || player.opposing_player_id) && substitution.minute && (
            <p className="text-[9px] sm:text-[10px] text-green-500 flex items-center gap-0.5">
              <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 17l5-5-5-5v10zm10 0l-5-5 5-5v10z"/>
              </svg>
              Entré {substitution.minute}'
            </p>
          )}
        </div>

        {/* Note */}
        <div className="bg-yellow-400 text-black text-[10px] sm:text-xs font-bold rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center flex-shrink-0">
          {player.player_rating?.toFixed(1) || '0.0'}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Vue tactique principale - Les deux équipes sur le même terrain */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
            Compositions officielles
          </CardTitle>
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
            {realMadridFormation && (
              <Badge variant="outline" className="bg-blue-600/10 border-blue-600 text-xs sm:text-sm">
                Real Madrid: {realMadridFormation.formation}
              </Badge>
            )}
            {opposingFormation && (
              <Badge variant="outline" className="bg-red-600/10 border-red-600 text-xs sm:text-sm">
                {getOpposingTeamName()}: {opposingFormation.formation}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 pb-2 sm:pb-4">
          <div
            className="relative w-full bg-gradient-to-b from-green-600 via-green-500 to-green-600 rounded-lg overflow-hidden shadow-lg"
            style={{ aspectRatio: "9/16", minHeight: "500px", maxHeight: "85vh" }}
          >
            {/* Texture du terrain */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(0,0,0,0.1) 15px, rgba(0,0,0,0.1) 30px)'
              }}
            />

            {/* Lignes du terrain de football */}
            <div className="absolute inset-0">
              <div className="absolute inset-1 sm:inset-2 border border-white sm:border-2 opacity-80 rounded" />
              <div className="absolute w-full h-0.5 bg-white top-1/2 transform -translate-y-0.5 opacity-80" />
              <div className="absolute w-16 h-16 sm:w-24 sm:h-24 border border-white sm:border-2 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-80" />
              <div className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute w-2/5 h-[12%] border border-white sm:border-2 border-t-0 top-1 sm:top-2 left-1/2 transform -translate-x-1/2 opacity-80" />
              <div className="absolute w-1/5 h-[6%] border border-white sm:border-2 border-t-0 top-1 sm:top-2 left-1/2 transform -translate-x-1/2 opacity-80" />
              <div className="absolute w-2/5 h-[12%] border border-white sm:border-2 border-b-0 bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 opacity-80" />
              <div className="absolute w-1/5 h-[6%] border border-white sm:border-2 border-b-0 bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 opacity-80" />
              <div className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full top-[15%] left-1/2 transform -translate-x-1/2" />
              <div className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full bottom-[15%] left-1/2 transform -translate-x-1/2" />
              <div className="absolute w-12 h-6 sm:w-16 sm:h-8 border border-white sm:border-2 border-t-0 top-[12%] left-1/2 transform -translate-x-1/2 rounded-b-full opacity-80" />
              <div className="absolute w-12 h-6 sm:w-16 sm:h-8 border border-white sm:border-2 border-b-0 bottom-[12%] left-1/2 transform -translate-x-1/2 rounded-t-full opacity-80" />
            </div>

            {/* Équipe adverse (moitié supérieure - positions inversées) */}
            {opposingFormation?.players
              .filter(player => player.is_starter)
              .map(player => {
                const invertedY = 50 - (player.position_y - 50);
                const adjustedY = invertedY * 0.48;
                return (
                  <PlayerOnPitch
                    key={`opposing-${player.id}`}
                    player={player}
                    isOpposing={true}
                    adjustedY={adjustedY}
                  />
                );
              })}

            {/* Real Madrid (moitié inférieure) */}
            {realMadridFormation?.players
              .filter(player => player.is_starter)
              .map(player => {
                const adjustedY = 52 + (player.position_y * 0.48);
                return (
                  <PlayerOnPitch
                    key={`rm-${player.id}`}
                    player={player}
                    isOpposing={false}
                    adjustedY={adjustedY}
                  />
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Remplaçants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
        {/* Remplaçants Real Madrid */}
        {realMadridFormation && (
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-lg">Remplaçants Real Madrid</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-4">
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {realMadridFormation.players
                  .filter(player => !player.is_starter)
                  .map(player => (
                    <SubstitutePlayer key={player.id} player={player} isOpposing={false} />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Remplaçants équipe adverse */}
        {opposingFormation && (
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-lg">
                Remplaçants {getOpposingTeamName()}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-4">
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {opposingFormation.players
                  .filter(player => !player.is_starter)
                  .map(player => (
                    <SubstitutePlayer key={player.id} player={player} isOpposing={true} />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
