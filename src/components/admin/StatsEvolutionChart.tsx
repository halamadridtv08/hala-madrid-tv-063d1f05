import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StatsData {
  date: string;
  goals: number;
  assists: number;
  yellowCards: number;
  minutesPlayed: number;
}

export const StatsEvolutionChart = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [statsData, setStatsData] = useState<Record<string, StatsData[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [comparisonMode, setComparisonMode] = useState(false);

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    if (selectedPlayerIds.length > 0) {
      loadMultiplePlayersStats(selectedPlayerIds);
    } else {
      setStatsData({});
    }
  }, [selectedPlayerIds]);

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, position')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des joueurs:', error);
    }
  };

  const loadMultiplePlayersStats = async (playerIds: string[]) => {
    try {
      setIsLoading(true);
      const allStats: Record<string, StatsData[]> = {};

      for (const playerId of playerIds) {
        const { data: stats, error } = await supabase
          .from('player_stats')
          .select(`
            *,
            matches (
              match_date,
              home_team,
              away_team
            )
          `)
          .eq('player_id', playerId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const chartData: StatsData[] = (stats || []).map(stat => ({
          date: new Date(stat.matches?.match_date || '').toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit' 
          }),
          goals: stat.goals || 0,
          assists: stat.assists || 0,
          yellowCards: stat.yellow_cards || 0,
          minutesPlayed: stat.minutes_played || 0
        }));

        allStats[playerId] = chartData;
      }

      setStatsData(allStats);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTrend = (data: StatsData[], key: keyof StatsData) => {
    if (data.length < 2) return 'stable';
    
    const recent = data.slice(-3);
    const older = data.slice(-6, -3);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, d) => sum + Number(d[key]), 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + Number(d[key]), 0) / older.length;
    
    const diff = ((recentAvg - olderAvg) / (olderAvg || 1)) * 100;
    
    if (diff > 15) return 'up';
    if (diff < -15) return 'down';
    return 'stable';
  };

  const handlePlayerSelection = (playerId: string) => {
    if (comparisonMode) {
      setSelectedPlayerIds(prev => {
        if (prev.includes(playerId)) {
          return prev.filter(id => id !== playerId);
        } else if (prev.length < 4) {
          return [...prev, playerId];
        }
        return prev;
      });
    } else {
      setSelectedPlayerIds([playerId]);
    }
  };

  const getPlayerData = (playerId: string) => {
    const data = statsData[playerId] || [];
    return {
      totalGoals: data.reduce((sum, d) => sum + d.goals, 0),
      totalAssists: data.reduce((sum, d) => sum + d.assists, 0),
      avgMinutes: data.length > 0 
        ? Math.round(data.reduce((sum, d) => sum + d.minutesPlayed, 0) / data.length)
        : 0,
      goalsTrend: calculateTrend(data, 'goals'),
      assistsTrend: calculateTrend(data, 'assists')
    };
  };

  const mergedChartData = () => {
    if (selectedPlayerIds.length === 0) return [];
    
    const allDates = new Set<string>();
    Object.values(statsData).forEach(playerStats => {
      playerStats.forEach(stat => allDates.add(stat.date));
    });
    
    const sortedDates = Array.from(allDates).sort((a, b) => {
      const [dayA, monthA] = a.split('/').map(Number);
      const [dayB, monthB] = b.split('/').map(Number);
      return (monthA * 100 + dayA) - (monthB * 100 + dayB);
    });

    return sortedDates.map(date => {
      const dataPoint: any = { date };
      selectedPlayerIds.forEach(playerId => {
        const player = players.find(p => p.id === playerId);
        const playerStats = statsData[playerId] || [];
        const stat = playerStats.find(s => s.date === date);
        
        if (player) {
          dataPoint[`${player.name}_goals`] = stat?.goals || 0;
          dataPoint[`${player.name}_assists`] = stat?.assists || 0;
          dataPoint[`${player.name}_yellowCards`] = stat?.yellowCards || 0;
        }
      });
      return dataPoint;
    });
  };

  const colors = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📊 Évolution des statistiques</span>
          <div className="flex gap-2">
            <Button
              variant={comparisonMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setComparisonMode(!comparisonMode);
                if (comparisonMode) {
                  setSelectedPlayerIds(prev => prev.slice(0, 1));
                }
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              Comparaison
            </Button>
            <Select value={chartType} onValueChange={(v) => setChartType(v as any)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Courbe</SelectItem>
                <SelectItem value="bar">Barres</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {comparisonMode ? "Sélectionner des joueurs (max 4)" : "Sélectionner un joueur"}
          </label>
          {comparisonMode ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {selectedPlayerIds.map(playerId => {
                  const player = players.find(p => p.id === playerId);
                  return player ? (
                    <Badge key={playerId} variant="default" className="cursor-pointer" onClick={() => handlePlayerSelection(playerId)}>
                      {player.name} ×
                    </Badge>
                  ) : null;
                })}
              </div>
              <Select value="" onValueChange={handlePlayerSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Ajouter un joueur..." />
                </SelectTrigger>
                <SelectContent>
                  {players.filter(p => !selectedPlayerIds.includes(p.id)).map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name} - {player.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Select value={selectedPlayerIds[0] || ""} onValueChange={handlePlayerSelection}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un joueur..." />
              </SelectTrigger>
              <SelectContent>
                {players.map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} - {player.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {selectedPlayerIds.length > 0 && !isLoading && Object.keys(statsData).length > 0 && (
          <>
            {/* Résumé des tendances - Mode comparaison ou unique */}
            {!comparisonMode && selectedPlayerIds.length === 1 && (() => {
              const playerData = getPlayerData(selectedPlayerIds[0]);
              return (
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Buts</p>
                          <p className="text-2xl font-bold">{playerData.totalGoals}</p>
                        </div>
                        {playerData.goalsTrend === 'up' && <TrendingUp className="h-6 w-6 text-green-500" />}
                        {playerData.goalsTrend === 'down' && <TrendingDown className="h-6 w-6 text-red-500" />}
                        {playerData.goalsTrend === 'stable' && <Minus className="h-6 w-6 text-gray-500" />}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Passes</p>
                          <p className="text-2xl font-bold">{playerData.totalAssists}</p>
                        </div>
                        {playerData.assistsTrend === 'up' && <TrendingUp className="h-6 w-6 text-green-500" />}
                        {playerData.assistsTrend === 'down' && <TrendingDown className="h-6 w-6 text-red-500" />}
                        {playerData.assistsTrend === 'stable' && <Minus className="h-6 w-6 text-gray-500" />}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Moy. minutes</p>
                        <p className="text-2xl font-bold">{playerData.avgMinutes}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}

            {comparisonMode && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedPlayerIds.map(playerId => {
                  const player = players.find(p => p.id === playerId);
                  const playerData = getPlayerData(playerId);
                  return (
                    <Card key={playerId}>
                      <CardContent className="p-4">
                        <p className="text-sm font-medium mb-2">{player?.name}</p>
                        <div className="space-y-1 text-sm">
                          <p>Buts: <span className="font-bold">{playerData.totalGoals}</span></p>
                          <p>Passes: <span className="font-bold">{playerData.totalAssists}</span></p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Graphique */}
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={mergedChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedPlayerIds.map((playerId, index) => {
                      const player = players.find(p => p.id === playerId);
                      return player ? (
                        <Line
                          key={`${playerId}_goals`}
                          type="monotone"
                          dataKey={`${player.name}_goals`}
                          stroke={colors[index % colors.length]}
                          strokeWidth={2}
                          name={`${player.name} - Buts`}
                        />
                      ) : null;
                    })}
                  </LineChart>
                ) : (
                  <BarChart data={mergedChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedPlayerIds.map((playerId, index) => {
                      const player = players.find(p => p.id === playerId);
                      return player ? (
                        <Bar
                          key={`${playerId}_goals`}
                          dataKey={`${player.name}_goals`}
                          fill={colors[index % colors.length]}
                          name={`${player.name} - Buts`}
                        />
                      ) : null;
                    })}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </>
        )}

        {selectedPlayerIds.length > 0 && !isLoading && Object.keys(statsData).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Aucune statistique disponible pour {comparisonMode ? "ces joueurs" : "ce joueur"}
          </div>
        )}

        {selectedPlayerIds.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Sélectionnez {comparisonMode ? "des joueurs" : "un joueur"} pour voir l'évolution des statistiques
          </div>
        )}
      </CardContent>
    </Card>
  );
};
