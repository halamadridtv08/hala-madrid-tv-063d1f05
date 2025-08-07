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

export const TacticalFormation = ({ matchId, matchData }: TacticalFormationProps) => {
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
            player_rating
          )
        `)
        .eq('match_id', matchId);

      if (error) {
        console.error('Erreur lors du chargement des formations:', error);
        return;
      }

      const formationsData: { [key: string]: Formation } = {};
      data?.forEach(formation => {
        formationsData[formation.team_type] = {
          id: formation.id,
          team_type: formation.team_type,
          formation: formation.formation,
          players: (formation.match_formation_players || []).sort((a, b) => 
            b.is_starter === a.is_starter ? a.jersey_number - b.jersey_number : (b.is_starter ? 1 : 0) - (a.is_starter ? 1 : 0)
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
            <p className="text-sm mt-2">Les compositions peuvent être configurées depuis l'interface d'administration</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const realMadridFormation = formations.real_madrid;
  const opposingFormation = formations.opposing;

  return (
    <div className="space-y-6">
      {/* Vue tactique principale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Compositions officielles
          </CardTitle>
          <div className="flex items-center gap-4">
            {realMadridFormation && (
              <Badge variant="outline">
                Real Madrid: {realMadridFormation.formation}
              </Badge>
            )}
            {opposingFormation && (
              <Badge variant="outline">
                {matchData?.homeTeam?.name === 'Real Madrid' ? matchData?.awayTeam?.name : matchData?.homeTeam?.name}: {opposingFormation.formation}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full bg-gradient-to-b from-green-500 to-green-600 rounded-lg overflow-hidden shadow-lg" style={{ aspectRatio: "3/4", minHeight: "500px" }}>
            {/* Lignes du terrain de football */}
            <div className="absolute inset-0">
              {/* Ligne médiane */}
              <div className="absolute w-full h-0.5 bg-white top-1/2 transform -translate-y-0.5 opacity-80"></div>
              <div className="absolute w-0.5 h-full bg-white left-1/2 transform -translate-x-0.5 opacity-80"></div>
              
              {/* Cercle central */}
              <div className="absolute w-20 h-20 border-2 border-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-80"></div>
              <div className="absolute w-2 h-2 bg-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              
              {/* Surfaces de réparation supérieures */}
              <div className="absolute w-1/3 h-16 border-2 border-white top-0 left-1/2 transform -translate-x-1/2 opacity-80"></div>
              <div className="absolute w-1/5 h-8 border-2 border-white top-0 left-1/2 transform -translate-x-1/2 opacity-80"></div>
              
              {/* Surfaces de réparation inférieures */}
              <div className="absolute w-1/3 h-16 border-2 border-white bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></div>
              <div className="absolute w-1/5 h-8 border-2 border-white bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></div>
              
              {/* Points de penalty */}
              <div className="absolute w-2 h-2 bg-white rounded-full top-12 left-1/2 transform -translate-x-1/2"></div>
              <div className="absolute w-2 h-2 bg-white rounded-full bottom-12 left-1/2 transform -translate-x-1/2"></div>
              
              {/* Arcs de cercle des surfaces */}
              <div className="absolute w-12 h-6 border-2 border-white border-b-0 top-16 left-1/2 transform -translate-x-1/2 rounded-t-full opacity-80"></div>
              <div className="absolute w-12 h-6 border-2 border-white border-t-0 bottom-16 left-1/2 transform -translate-x-1/2 rounded-b-full opacity-80"></div>
            </div>

            {/* Joueurs Real Madrid */}
            {realMadridFormation?.players
              .filter(player => player.is_starter)
              .map((player) => (
              <div
                key={player.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${player.position_x}%`,
                  top: `${player.position_y}%`
                }}
              >
                <div className="relative">
                  {player.player_image_url ? (
                    <img
                      src={player.player_image_url}
                      alt={player.player_name}
                      className="w-14 h-14 rounded-full border-3 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full border-3 border-white bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{player.jersey_number}</span>
                    </div>
                  )}
                  
                  {/* Numéro du maillot */}
                  <div className="absolute -top-1 -right-1 bg-white text-blue-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    {player.jersey_number}
                  </div>
                  
                  {/* Note du joueur */}
                  <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    {player.player_rating.toFixed(1)}
                  </div>
                  
                  {/* Nom du joueur */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {player.player_name}
                  </div>
                  
                  {/* Position */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {player.player_position}
                  </div>
                </div>
              </div>
            ))}

            {/* Joueurs équipe adverse */}
            {opposingFormation?.players
              .filter(player => player.is_starter)
              .map((player) => (
              <div
                key={player.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${player.position_x}%`,
                  top: `${player.position_y}%`
                }}
              >
                <div className="relative">
                  {player.player_image_url ? (
                    <img
                      src={player.player_image_url}
                      alt={player.player_name}
                      className="w-14 h-14 rounded-full border-3 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full border-3 border-white bg-gradient-to-br from-red-600 to-red-700 shadow-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{player.jersey_number}</span>
                    </div>
                  )}
                  
                  {/* Numéro du maillot */}
                  <div className="absolute -top-1 -right-1 bg-white text-red-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    {player.jersey_number}
                  </div>
                  
                  {/* Note du joueur */}
                  <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    {player.player_rating.toFixed(1)}
                  </div>
                  
                  {/* Nom du joueur */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {player.player_name}
                  </div>
                  
                  {/* Position */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {player.player_position}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Remplaçants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Remplaçants Real Madrid */}
        {realMadridFormation && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Remplaçants Real Madrid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {realMadridFormation.players
                  .filter(player => !player.is_starter)
                  .map((player) => (
                  <div key={player.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {player.jersey_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{player.player_name}</p>
                      <p className="text-xs text-gray-500">{player.player_position}</p>
                    </div>
                    <div className="bg-yellow-400 text-black text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                      {player.player_rating.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Remplaçants équipe adverse */}
        {opposingFormation && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Remplaçants {matchData?.homeTeam?.name === 'Real Madrid' ? matchData?.awayTeam?.name : matchData?.homeTeam?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {opposingFormation.players
                  .filter(player => !player.is_starter)
                  .map((player) => (
                  <div key={player.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">
                      {player.jersey_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{player.player_name}</p>
                      <p className="text-xs text-gray-500">{player.player_position}</p>
                    </div>
                    <div className="bg-yellow-400 text-black text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
                      {player.player_rating.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};