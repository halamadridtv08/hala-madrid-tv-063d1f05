import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users, Trophy, Star, ArrowDown, ArrowUp } from "lucide-react";
import { normalizePlayerName, calculateSimilarity } from "@/utils/playerNameMatcher";

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

interface Formation {
  id: string;
  team_type: string;
  formation: string;
  players: FormationPlayer[];
}

interface GoalEvent {
  minute: string | number;
  team: string;
  scorer: string;
  assist?: string;
}

interface SubstitutionEvent {
  minute: string | number;
  team: string;
  out: string;
  in: string;
}

interface CardEvent {
  minute: string | number;
  team: string;
  player: string;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (matchId) {
      fetchFormations();
    }
  }, [matchId]);

  const fetchFormations = async () => {
    setLoading(true);
    try {
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

      const { data: players } = await supabase
        .from('players')
        .select('id, profile_image_url, image_url');

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

  // Extraire les événements depuis match_details
  const matchDetailsEvents = useMemo(() => {
    const details = matchData?.match_details;
    if (!details) return { goals: [], substitutions: [], yellowCards: [], redCards: [], secondYellowCards: [] };
    
    return {
      goals: (details.goals || []) as GoalEvent[],
      substitutions: (details.substitutions || []) as SubstitutionEvent[],
      yellowCards: (details.events?.yellow_cards || []) as CardEvent[],
      redCards: (details.events?.red_cards || []) as CardEvent[],
      secondYellowCards: (details.events?.second_yellow_cards || []) as CardEvent[]
    };
  }, [matchData]);

  // Fonction de matching par nom de joueur
  const playerNameMatches = (eventPlayerName: string | undefined, formationPlayerName: string): boolean => {
    if (!eventPlayerName) return false;
    
    const normalized1 = normalizePlayerName(eventPlayerName);
    const normalized2 = normalizePlayerName(formationPlayerName);
    
    if (normalized1 === normalized2) return true;
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return true;
    
    // Vérifier par nom de famille
    const lastName1 = normalized1.split(' ').pop() || '';
    const lastName2 = normalized2.split(' ').pop() || '';
    if (lastName1.length > 2 && lastName2.length > 2 && lastName1 === lastName2) return true;
    
    // Utiliser la similarité
    return calculateSimilarity(eventPlayerName, formationPlayerName) > 0.6;
  };

  // Déterminer si un événement appartient à Real Madrid ou à l'équipe adverse
  const isRealMadridEvent = (eventTeam: string): boolean => {
    return eventTeam === 'real_madrid';
  };

  // Fonctions pour obtenir les événements d'un joueur depuis match_details
  const getPlayerGoalsFromDetails = (playerName: string, isOpposingTeam: boolean): GoalEvent[] => {
    return matchDetailsEvents.goals.filter(g => 
      playerNameMatches(g.scorer, playerName) && 
      (isOpposingTeam ? !isRealMadridEvent(g.team) : isRealMadridEvent(g.team))
    );
  };

  const getPlayerAssistsFromDetails = (playerName: string, isOpposingTeam: boolean): GoalEvent[] => {
    return matchDetailsEvents.goals.filter(g => 
      g.assist && playerNameMatches(g.assist, playerName) &&
      (isOpposingTeam ? !isRealMadridEvent(g.team) : isRealMadridEvent(g.team))
    );
  };

  const getPlayerSubstitutionFromDetails = (playerName: string, isOpposingTeam: boolean): SubstitutionEvent | undefined => {
    return matchDetailsEvents.substitutions.find(s => 
      (playerNameMatches(s.out, playerName) || playerNameMatches(s.in, playerName)) &&
      (isOpposingTeam ? !isRealMadridEvent(s.team) : isRealMadridEvent(s.team))
    );
  };

  const getPlayerCardsFromDetails = (playerName: string, isOpposingTeam: boolean): Array<CardEvent & { type: string }> => {
    const cards: Array<CardEvent & { type: string }> = [];
    
    matchDetailsEvents.yellowCards
      .filter(c => playerNameMatches(c.player, playerName) && (isOpposingTeam ? !isRealMadridEvent(c.team) : isRealMadridEvent(c.team)))
      .forEach(c => cards.push({ ...c, type: 'yellow' }));
    
    matchDetailsEvents.redCards
      .filter(c => playerNameMatches(c.player, playerName) && (isOpposingTeam ? !isRealMadridEvent(c.team) : isRealMadridEvent(c.team)))
      .forEach(c => cards.push({ ...c, type: 'red' }));
    
    matchDetailsEvents.secondYellowCards
      .filter(c => playerNameMatches(c.player, playerName) && (isOpposingTeam ? !isRealMadridEvent(c.team) : isRealMadridEvent(c.team)))
      .forEach(c => cards.push({ ...c, type: 'second_yellow' }));
    
    return cards;
  };

  // Déterminer l'homme du match (meilleure note >= 8)
  const manOfTheMatch = useMemo(() => {
    let bestPlayer: FormationPlayer | null = null;
    let bestRating = 0;
    
    Object.values(formations).forEach(formation => {
      formation.players.forEach(player => {
        if (player.player_rating > bestRating) {
          bestRating = player.player_rating;
          bestPlayer = player;
        }
      });
    });
    
    return bestRating >= 8 ? bestPlayer : null;
  }, [formations]);

  // Icône ballon de foot
  const FootballIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#1a1a1a" stroke="#333" strokeWidth="1"/>
      <path d="M12 2 L14 8 L20 8 L15 12 L17 19 L12 15 L7 19 L9 12 L4 8 L10 8 Z" fill="white"/>
    </svg>
  );

  // Icône chaussure de foot
  const FootballBootIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 19h2v2H2v-2zm4 0h12v2H6v-2zm14 0h2v2h-2v-2zM5 17V7.83C4.6 7.55 4.26 7.16 4.05 6.68L2 2h3l1.57 3.84c.21.44.61.76 1.07.92L19 10.5c1.1.4 1.8 1.46 1.8 2.61v.89c0 .55-.45 1-1 1H19v2H5zm4-4h2v2H9v-2zm4 0h2v2h-2v-2z"/>
    </svg>
  );

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
    
    // Utiliser les événements depuis match_details avec matching par nom
    const goals = getPlayerGoalsFromDetails(player.player_name, isOpposing);
    const assists = getPlayerAssistsFromDetails(player.player_name, isOpposing);
    const cards = getPlayerCardsFromDetails(player.player_name, isOpposing);
    const substitution = getPlayerSubstitutionFromDetails(player.player_name, isOpposing);
    
    // Vérifier si c'est l'homme du match
    const isManOfTheMatch = manOfTheMatch && manOfTheMatch.id === player.id;
    
    // Vérifier si le joueur est sorti ou entré
    const wasSubstitutedOut = substitution && playerNameMatches(substitution.out, player.player_name);
    const wasSubstitutedIn = substitution && playerNameMatches(substitution.in, player.player_name);

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

            {/* Numéro du maillot en bas à gauche (cercle ambre) */}
            <div className="absolute -bottom-0.5 -left-0.5 sm:-bottom-1 sm:-left-1 bg-amber-500 text-black text-[8px] sm:text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-md">
              {player.jersey_number}
            </div>

            {/* Note du joueur en haut à droite */}
            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-yellow-400 text-black text-[8px] sm:text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-md">
              {player.player_rating?.toFixed(1) || '0.0'}
            </div>

            {/* Étoile Homme du Match en haut à gauche */}
            {isManOfTheMatch && (
              <div className="absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-md">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              </div>
            )}
          </div>

          {/* Nom du joueur */}
          <div className="mt-0.5 sm:mt-1 bg-black/70 text-white text-[7px] sm:text-[9px] md:text-[10px] px-1 sm:px-1.5 py-0.5 rounded whitespace-nowrap max-w-[50px] sm:max-w-[70px] truncate text-center">
            {shortName}
          </div>

          {/* Événements en ligne sous le nom */}
          <div className="flex items-center gap-0.5 mt-0.5 flex-wrap justify-center max-w-[80px]">
            {/* Buts avec icône ballon */}
            {goals.map((goal, idx) => (
              <div key={`goal-${idx}`} className="flex items-center bg-black/60 rounded px-0.5">
                <FootballIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="text-[6px] sm:text-[7px] text-white font-medium ml-0.5">{goal.minute}'</span>
              </div>
            ))}

            {/* Passes décisives avec icône chaussure */}
            {assists.map((assist, idx) => (
              <div key={`assist-${idx}`} className="flex items-center bg-green-600/80 rounded px-0.5">
                <FootballBootIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                <span className="text-[6px] sm:text-[7px] text-white font-medium ml-0.5">{assist.minute}'</span>
              </div>
            ))}

            {/* Cartons */}
            {cards.map((card, idx) => (
              <div key={`card-${idx}`} className="flex items-center bg-black/60 rounded px-0.5">
                {card.type === 'second_yellow' ? (
                  <div className="relative w-2.5 h-3">
                    <div className="absolute w-2 h-2.5 rounded-sm bg-yellow-400 left-0 top-0" />
                    <div className="absolute w-2 h-2.5 rounded-sm bg-red-600 left-0.5 top-0.5" />
                  </div>
                ) : (
                  <div className={`w-2 h-2.5 sm:w-2.5 sm:h-3 rounded-sm ${card.type === 'red' ? 'bg-red-600' : 'bg-yellow-400'}`} />
                )}
                <span className="text-[6px] sm:text-[7px] text-white font-medium ml-0.5">{card.minute}'</span>
              </div>
            ))}

            {/* Remplacement sortie (flèche rouge) */}
            {wasSubstitutedOut && substitution && (
              <div className="flex items-center bg-red-600/80 rounded px-0.5">
                <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                <span className="text-[6px] sm:text-[7px] text-white font-medium ml-0.5">{substitution.minute}'</span>
              </div>
            )}

            {/* Remplacement entrée (flèche verte) - pour les remplaçants qui entrent */}
            {wasSubstitutedIn && substitution && (
              <div className="flex items-center bg-green-600/80 rounded px-0.5">
                <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                <span className="text-[6px] sm:text-[7px] text-white font-medium ml-0.5">{substitution.minute}'</span>
              </div>
            )}
          </div>
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
    
    const substitution = getPlayerSubstitutionFromDetails(player.player_name, isOpposing);
    const goals = getPlayerGoalsFromDetails(player.player_name, isOpposing);
    const assists = getPlayerAssistsFromDetails(player.player_name, isOpposing);
    const cards = getPlayerCardsFromDetails(player.player_name, isOpposing);
    
    const wasSubstitutedIn = substitution && playerNameMatches(substitution.in, player.player_name);

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
                  <FootballIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="text-[8px] text-muted-foreground ml-0.5">{goal.minute}'</span>
                </div>
              ))}
              {assists.map((assist, idx) => (
                <div key={`a-${idx}`} className="flex items-center">
                  <FootballBootIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500" />
                  <span className="text-[8px] text-muted-foreground ml-0.5">{assist.minute}'</span>
                </div>
              ))}
              {cards.map((card, idx) => (
                <div key={`c-${idx}`} className="flex items-center">
                  {card.type === 'second_yellow' ? (
                    <div className="relative w-2.5 h-3">
                      <div className="absolute w-2 h-2.5 rounded-sm bg-yellow-400 left-0 top-0" />
                      <div className="absolute w-2 h-2.5 rounded-sm bg-red-600 left-0.5 top-0.5" />
                    </div>
                  ) : (
                    <div className={`w-2 h-2.5 sm:w-2.5 sm:h-3 rounded-sm ${card.type === 'red' ? 'bg-red-600' : 'bg-yellow-400'}`} />
                  )}
                  <span className="text-[8px] text-muted-foreground ml-0.5">{card.minute}'</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">{player.player_position}</p>
          {/* Minute d'entrée */}
          {wasSubstitutedIn && substitution && (
            <p className="text-[9px] sm:text-[10px] text-green-500 flex items-center gap-0.5">
              <ArrowUp className="w-2 h-2" />
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
