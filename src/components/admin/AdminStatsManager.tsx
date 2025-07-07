
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayerStatsManager } from "./PlayerStatsManager";
import { useRealStats } from "@/hooks/useRealStats";
import { User, BarChart3, Target, Trophy } from "lucide-react";

export function AdminStatsManager() {
  const { stats } = useRealStats();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>("");
  const [players, setPlayers] = useState<any[]>([]);

  React.useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, position')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handlePlayerSelect = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    setSelectedPlayerId(playerId);
    setSelectedPlayerName(player?.name || "");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Joueurs Actifs</p>
                <p className="text-3xl font-bold">{stats.activePlayers}</p>
              </div>
              <User className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Buts</p>
                <p className="text-3xl font-bold">{stats.totalGoals}</p>
              </div>
              <Target className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Victoires</p>
                <p className="text-3xl font-bold">{stats.wins}</p>
              </div>
              <Trophy className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Matchs Joués</p>
                <p className="text-3xl font-bold">{stats.totalMatches}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="players" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="players">Statistiques Joueurs</TabsTrigger>
          <TabsTrigger value="matches">Statistiques Matchs</TabsTrigger>
          <TabsTrigger value="team">Statistiques Équipe</TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gérer les statistiques des joueurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sélectionner un joueur
                  </label>
                  <Select value={selectedPlayerId} onValueChange={handlePlayerSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un joueur..." />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name} ({player.position})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPlayerId && (
                  <PlayerStatsManager 
                    playerId={selectedPlayerId}
                    playerName={selectedPlayerName}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques des Matchs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
                  <div className="text-sm text-gray-600">Victoires</div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.draws}</div>
                  <div className="text-sm text-gray-600">Nuls</div>
                </div>
                <div className="bg-red-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.losses}</div>
                  <div className="text-sm text-gray-600">Défaites</div>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalMatches}</div>
                  <div className="text-sm text-gray-600">Total Matchs</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-600">
                  Les statistiques des matchs sont mises à jour automatiquement
                  lorsque vous modifiez les résultats dans la section "Matchs".
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques de l'Équipe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-madrid-blue/10 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-madrid-blue">{stats.totalPlayers}</div>
                  <div className="text-sm text-gray-600">Joueurs Total</div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.activePlayers}</div>
                  <div className="text-sm text-gray-600">Joueurs Actifs</div>
                </div>
                <div className="bg-amber-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-amber-600">{stats.totalGoals}</div>
                  <div className="text-sm text-gray-600">Buts Marqués</div>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalAssists}</div>
                  <div className="text-sm text-gray-600">Passes Décisives</div>
                </div>
                <div className="bg-teal-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-teal-600">{stats.upcomingMatches}</div>
                  <div className="text-sm text-gray-600">Matchs à Venir</div>
                </div>
                <div className="bg-indigo-100 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-indigo-600">{stats.finishedMatches}</div>
                  <div className="text-sm text-gray-600">Matchs Terminés</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
