import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingUp, Trophy, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SeasonStats {
  season: string;
  totalGoals: number;
  totalAssists: number;
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  avgGoalsPerMatch: number;
  cleanSheets: number;
}

export const SeasonComparison = () => {
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [seasonStats, setSeasonStats] = useState<SeasonStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSeasons();
  }, []);

  useEffect(() => {
    if (selectedSeasons.length > 0) {
      loadSeasonStats();
    }
  }, [selectedSeasons]);

  const loadSeasons = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('match_date');

      if (error) throw error;

      const uniqueSeasons = new Set<string>();
      data?.forEach(match => {
        const year = new Date(match.match_date).getFullYear();
        uniqueSeasons.add(year.toString());
      });

      const sortedSeasons = Array.from(uniqueSeasons).sort((a, b) => parseInt(b) - parseInt(a));
      setSeasons(sortedSeasons);
      
      if (sortedSeasons.length > 0) {
        setSelectedSeasons([sortedSeasons[0]]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des saisons:', error);
    }
  };

  const loadSeasonStats = async () => {
    setIsLoading(true);
    try {
      const stats: SeasonStats[] = [];

      for (const season of selectedSeasons) {
        // Get matches for this season
        const { data: matches, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .gte('match_date', `${season}-01-01`)
          .lte('match_date', `${season}-12-31`);

        if (matchError) throw matchError;

        // Calculate stats
        const totalMatches = matches?.length || 0;
        let wins = 0, draws = 0, losses = 0, cleanSheets = 0;
        
        matches?.forEach(match => {
          const isHome = match.home_team === 'Real Madrid';
          const ourScore = isHome ? match.home_score : match.away_score;
          const theirScore = isHome ? match.away_score : match.home_score;

          if (ourScore > theirScore) wins++;
          else if (ourScore === theirScore) draws++;
          else losses++;

          if (theirScore === 0) cleanSheets++;
        });

        // Get player stats for this season
        const { data: playerStats, error: statsError } = await supabase
          .from('player_stats')
          .select(`
            goals,
            assists,
            matches!inner(match_date)
          `)
          .gte('matches.match_date', `${season}-01-01`)
          .lte('matches.match_date', `${season}-12-31`);

        if (statsError) throw statsError;

        const totalGoals = playerStats?.reduce((sum, s) => sum + (s.goals || 0), 0) || 0;
        const totalAssists = playerStats?.reduce((sum, s) => sum + (s.assists || 0), 0) || 0;

        stats.push({
          season,
          totalGoals,
          totalAssists,
          totalMatches,
          wins,
          draws,
          losses,
          avgGoalsPerMatch: totalMatches > 0 ? parseFloat((totalGoals / totalMatches).toFixed(2)) : 0,
          cleanSheets
        });
      }

      setSeasonStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeasonToggle = (season: string) => {
    setSelectedSeasons(prev => {
      if (prev.includes(season)) {
        return prev.filter(s => s !== season);
      } else if (prev.length < 3) {
        return [...prev, season];
      }
      return prev;
    });
  };

  const radarData = seasonStats.map(stat => ({
    season: stat.season,
    Buts: stat.totalGoals,
    Passes: stat.totalAssists,
    Victoires: stat.wins,
    'Clean Sheets': stat.cleanSheets
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Comparaison par Saison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Season Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Sélectionner les saisons à comparer (max 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {seasons.map(season => (
                <Badge
                  key={season}
                  variant={selectedSeasons.includes(season) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleSeasonToggle(season)}
                >
                  {season}
                </Badge>
              ))}
            </div>
          </div>

          {selectedSeasons.length > 0 && !isLoading && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {seasonStats.map(stat => (
                  <Card key={stat.season}>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium mb-2">Saison {stat.season}</p>
                      <div className="space-y-1 text-sm">
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">Buts:</span>
                          <span className="font-bold">{stat.totalGoals}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">Passes:</span>
                          <span className="font-bold">{stat.totalAssists}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-muted-foreground">V-N-D:</span>
                          <span className="font-bold">{stat.wins}-{stat.draws}-{stat.losses}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Bar Chart - Goals & Assists */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Buts et Passes Décisives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={seasonStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="season" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalGoals" fill="hsl(var(--primary))" name="Buts" />
                        <Bar dataKey="totalAssists" fill="hsl(var(--chart-2))" name="Passes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Line Chart - Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Évolution des Performances</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={seasonStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="season" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="wins" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="Victoires"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="avgGoalsPerMatch" 
                          stroke="hsl(var(--chart-2))" 
                          strokeWidth={2}
                          name="Buts/Match"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cleanSheets" 
                          stroke="hsl(var(--chart-3))" 
                          strokeWidth={2}
                          name="Clean Sheets"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Radar Chart - Overall Performance */}
              {selectedSeasons.length >= 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vue d'ensemble comparative</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="season" />
                          <PolarRadiusAxis />
                          <Tooltip />
                          <Legend />
                          <Radar 
                            name={seasonStats[0]?.season} 
                            dataKey="Buts" 
                            stroke="hsl(var(--primary))" 
                            fill="hsl(var(--primary))" 
                            fillOpacity={0.6} 
                          />
                          {seasonStats[1] && (
                            <Radar 
                              name={seasonStats[1].season} 
                              dataKey="Buts" 
                              stroke="hsl(var(--chart-2))" 
                              fill="hsl(var(--chart-2))" 
                              fillOpacity={0.6} 
                            />
                          )}
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {selectedSeasons.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Sélectionnez au moins une saison pour voir les comparaisons
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
