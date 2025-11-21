import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsData {
  date: string;
  goals: number;
  assists: number;
  yellowCards: number;
  minutesPlayed: number;
}

export const StatsEvolutionChart = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [statsData, setStatsData] = useState<StatsData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    if (selectedPlayerId) {
      loadPlayerStats(selectedPlayerId);
    }
  }, [selectedPlayerId]);

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

  const loadPlayerStats = async (playerId: string) => {
    try {
      setIsLoading(true);
      
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

      // Transformer les données pour le graphique
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

      setStatsData(chartData);
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

  const totalGoals = statsData.reduce((sum, d) => sum + d.goals, 0);
  const totalAssists = statsData.reduce((sum, d) => sum + d.assists, 0);
  const avgMinutes = statsData.length > 0 
    ? Math.round(statsData.reduce((sum, d) => sum + d.minutesPlayed, 0) / statsData.length)
    : 0;

  const goalsTrend = calculateTrend(statsData, 'goals');
  const assistsTrend = calculateTrend(statsData, 'assists');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📊 Évolution des statistiques</span>
          <div className="flex gap-2">
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
          <label className="text-sm font-medium">Sélectionner un joueur</label>
          <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
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
        </div>

        {selectedPlayerId && !isLoading && statsData.length > 0 && (
          <>
            {/* Résumé des tendances */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Buts</p>
                      <p className="text-2xl font-bold">{totalGoals}</p>
                    </div>
                    {goalsTrend === 'up' && <TrendingUp className="h-6 w-6 text-green-500" />}
                    {goalsTrend === 'down' && <TrendingDown className="h-6 w-6 text-red-500" />}
                    {goalsTrend === 'stable' && <Minus className="h-6 w-6 text-gray-500" />}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Passes</p>
                      <p className="text-2xl font-bold">{totalAssists}</p>
                    </div>
                    {assistsTrend === 'up' && <TrendingUp className="h-6 w-6 text-green-500" />}
                    {assistsTrend === 'down' && <TrendingDown className="h-6 w-6 text-red-500" />}
                    {assistsTrend === 'stable' && <Minus className="h-6 w-6 text-gray-500" />}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Moy. minutes</p>
                    <p className="text-2xl font-bold">{avgMinutes}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Graphique */}
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="goals" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Buts"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="assists" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      name="Passes"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="yellowCards" 
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={2}
                      name="Cartons"
                    />
                  </LineChart>
                ) : (
                  <BarChart data={statsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="goals" fill="hsl(var(--primary))" name="Buts" />
                    <Bar dataKey="assists" fill="hsl(var(--chart-2))" name="Passes" />
                    <Bar dataKey="yellowCards" fill="hsl(var(--chart-3))" name="Cartons" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </>
        )}

        {selectedPlayerId && !isLoading && statsData.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Aucune statistique disponible pour ce joueur
          </div>
        )}

        {!selectedPlayerId && (
          <div className="text-center py-12 text-muted-foreground">
            Sélectionnez un joueur pour voir l'évolution de ses statistiques
          </div>
        )}
      </CardContent>
    </Card>
  );
};
