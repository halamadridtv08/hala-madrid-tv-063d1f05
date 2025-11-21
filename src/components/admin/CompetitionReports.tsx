import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Trophy, Award, Target, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { normalizeCompetitionName } from "@/utils/competitionNormalizer";

interface CompetitionStats {
  competition: string;
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  cleanSheets: number;
  winPercentage: number;
  topScorer: { name: string; goals: number } | null;
  topAssister: { name: string; assists: number } | null;
}

export const CompetitionReports = () => {
  const [competitions, setCompetitions] = useState<string[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [seasons, setSeasons] = useState<string[]>([]);
  const [competitionStats, setCompetitionStats] = useState<CompetitionStats | null>(null);
  const [playerStats, setPlayerStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCompetitionsAndSeasons();
  }, []);

  useEffect(() => {
    if (selectedCompetition && selectedSeason) {
      loadCompetitionStats();
    }
  }, [selectedCompetition, selectedSeason]);

  const loadCompetitionsAndSeasons = async () => {
    try {
      const { data: matches, error } = await supabase
        .from('matches')
        .select('competition, match_date');

      if (error) throw error;

      // Extract unique competitions with normalization
      const uniqueCompetitions = new Set<string>();
      const uniqueSeasons = new Set<string>();
      
      for (const match of matches || []) {
        if (match.competition) {
          const normalized = await normalizeCompetitionName(match.competition);
          uniqueCompetitions.add(normalized);
        }
        const year = new Date(match.match_date).getFullYear();
        uniqueSeasons.add(year.toString());
      }

      const sortedCompetitions = Array.from(uniqueCompetitions).sort();
      const sortedSeasons = Array.from(uniqueSeasons).sort((a, b) => parseInt(b) - parseInt(a));

      setCompetitions(sortedCompetitions);
      setSeasons(sortedSeasons);

      if (sortedCompetitions.length > 0) setSelectedCompetition(sortedCompetitions[0]);
      if (sortedSeasons.length > 0) setSelectedSeason(sortedSeasons[0]);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
  };

  const loadCompetitionStats = async () => {
    setIsLoading(true);
    try {
      // Get all matches for this season
      const { data: allMatches, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .gte('match_date', `${selectedSeason}-01-01`)
        .lte('match_date', `${selectedSeason}-12-31`);

      if (matchError) throw matchError;

      // Filter matches by normalized competition name
      const matchesWithNormalized = await Promise.all(
        (allMatches || []).map(async (match) => ({
          ...match,
          normalizedCompetition: await normalizeCompetitionName(match.competition || '')
        }))
      );

      const matches = matchesWithNormalized.filter(
        match => match.normalizedCompetition === selectedCompetition
      );

      const totalMatches = matches?.length || 0;
      let wins = 0, draws = 0, losses = 0, goalsScored = 0, goalsConceded = 0, cleanSheets = 0;

      matches?.forEach(match => {
        const isHome = match.home_team === 'Real Madrid';
        const ourScore = isHome ? match.home_score : match.away_score;
        const theirScore = isHome ? match.away_score : match.home_score;

        goalsScored += ourScore || 0;
        goalsConceded += theirScore || 0;

        if (ourScore > theirScore) wins++;
        else if (ourScore === theirScore) draws++;
        else losses++;

        if (theirScore === 0) cleanSheets++;
      });

      const winPercentage = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

      // Get player stats for this competition and season
      const matchIds = matches?.map(m => m.id) || [];
      
      const { data: stats, error: statsError } = await supabase
        .from('player_stats')
        .select(`
          *,
          players (
            name,
            image_url
          )
        `)
        .in('match_id', matchIds);

      if (statsError) throw statsError;

      // Aggregate player stats
      const playerAggregates = new Map();
      stats?.forEach(stat => {
        const playerId = stat.player_id;
        if (!playerAggregates.has(playerId)) {
          playerAggregates.set(playerId, {
            player_id: playerId,
            name: stat.players?.name || '',
            image_url: stat.players?.image_url || '',
            goals: 0,
            assists: 0,
            minutes_played: 0,
            yellow_cards: 0,
            red_cards: 0
          });
        }

        const agg = playerAggregates.get(playerId);
        agg.goals += stat.goals || 0;
        agg.assists += stat.assists || 0;
        agg.minutes_played += stat.minutes_played || 0;
        agg.yellow_cards += stat.yellow_cards || 0;
        agg.red_cards += stat.red_cards || 0;
      });

      const playerStatsArray = Array.from(playerAggregates.values())
        .sort((a, b) => b.goals - a.goals);

      setPlayerStats(playerStatsArray);

      const topScorer = playerStatsArray[0] 
        ? { name: playerStatsArray[0].name, goals: playerStatsArray[0].goals }
        : null;

      const topAssister = playerStatsArray
        .sort((a, b) => b.assists - a.assists)[0]
        ? { name: playerStatsArray.sort((a, b) => b.assists - a.assists)[0].name, assists: playerStatsArray.sort((a, b) => b.assists - a.assists)[0].assists }
        : null;

      setCompetitionStats({
        competition: selectedCompetition,
        totalMatches,
        wins,
        draws,
        losses,
        goalsScored,
        goalsConceded,
        cleanSheets,
        winPercentage,
        topScorer,
        topAssister
      });
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  const resultsData = competitionStats ? [
    { name: 'Victoires', value: competitionStats.wins },
    { name: 'Nuls', value: competitionStats.draws },
    { name: 'Défaites', value: competitionStats.losses }
  ] : [];

  const topScorersData = playerStats.slice(0, 10).map(p => ({
    name: p.name,
    goals: p.goals,
    assists: p.assists
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Rapports par Compétition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Compétition</label>
              <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {competitions.map(comp => (
                    <SelectItem key={comp} value={comp}>
                      {comp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Saison</label>
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map(season => (
                    <SelectItem key={season} value={season}>
                      {season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {competitionStats && !isLoading && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Matchs</p>
                        <p className="text-2xl font-bold">{competitionStats.totalMatches}</p>
                      </div>
                      <Target className="h-8 w-8 text-primary opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">% Victoires</p>
                        <p className="text-2xl font-bold">{competitionStats.winPercentage.toFixed(1)}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Buts</p>
                      <p className="text-2xl font-bold">{competitionStats.goalsScored}</p>
                      <p className="text-xs text-muted-foreground">Encaissés: {competitionStats.goalsConceded}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Clean Sheets</p>
                      <p className="text-2xl font-bold">{competitionStats.cleanSheets}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers */}
              {competitionStats.topScorer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Meilleurs Performeurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Meilleur Buteur</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{competitionStats.topScorer.goals} buts</Badge>
                          <span className="font-medium">{competitionStats.topScorer.name}</span>
                        </div>
                      </div>
                      {competitionStats.topAssister && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Meilleur Passeur</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">{competitionStats.topAssister.assists} passes</Badge>
                            <span className="font-medium">{competitionStats.topAssister.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Répartition des Résultats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={resultsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {resultsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Scorers Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top 10 Buteurs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topScorersData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip />
                          <Bar dataKey="goals" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {!competitionStats && !isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              Sélectionnez une compétition et une saison pour voir les statistiques
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
