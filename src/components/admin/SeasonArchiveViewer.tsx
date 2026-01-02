import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Archive, Download, Calendar, Users, Trophy, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Papa from "papaparse";

interface ArchivedSeason {
  season: string;
  archivedAt: string;
  statsCount: number;
  matchesCount: number;
}

export function SeasonArchiveViewer() {
  const [seasons, setSeasons] = useState<ArchivedSeason[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const [statsData, setStatsData] = useState<any[]>([]);
  const [matchesData, setMatchesData] = useState<any[]>([]);

  useEffect(() => {
    fetchArchivedSeasons();
  }, []);

  useEffect(() => {
    if (selectedSeason) {
      fetchSeasonData(selectedSeason);
    }
  }, [selectedSeason]);

  const fetchArchivedSeasons = async () => {
    try {
      const { data: statsSeasons } = await supabase
        .from("season_player_stats_archive")
        .select("season, archived_at")
        .order("archived_at", { ascending: false });

      const uniqueSeasons = new Map<string, ArchivedSeason>();
      
      if (statsSeasons) {
        for (const item of statsSeasons) {
          if (!uniqueSeasons.has(item.season)) {
            // Get counts for this season
            const [statsCount, matchesCount] = await Promise.all([
              supabase
                .from("season_player_stats_archive")
                .select("id", { count: "exact", head: true })
                .eq("season", item.season),
              supabase
                .from("season_matches_archive")
                .select("id", { count: "exact", head: true })
                .eq("season", item.season),
            ]);

            uniqueSeasons.set(item.season, {
              season: item.season,
              archivedAt: item.archived_at,
              statsCount: statsCount.count || 0,
              matchesCount: matchesCount.count || 0,
            });
          }
        }
      }

      setSeasons(Array.from(uniqueSeasons.values()));
    } catch (error) {
      console.error("Error fetching archived seasons:", error);
    }
  };

  const fetchSeasonData = async (season: string) => {
    setLoading(true);
    try {
      const [statsRes, matchesRes] = await Promise.all([
        supabase
          .from("season_player_stats_archive")
          .select("*")
          .eq("season", season)
          .limit(100),
        supabase
          .from("season_matches_archive")
          .select("*")
          .eq("season", season)
          .order("match_date", { ascending: false }),
      ]);

      setStatsData(statsRes.data || []);
      setMatchesData(matchesRes.data || []);
    } catch (error) {
      console.error("Error fetching season data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const exportSeasonData = async (type: "stats" | "matches") => {
    if (!selectedSeason) return;

    try {
      const table = type === "stats" ? "season_player_stats_archive" : "season_matches_archive";
      const { data } = await supabase.from(table).select("*").eq("season", selectedSeason);

      if (data && data.length > 0) {
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `archive-${type}-${selectedSeason.replace("/", "-")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Export téléchargé");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Erreur lors de l'export");
    }
  };

  if (seasons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Archives des Saisons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Aucune saison archivée. Les archives apparaîtront ici après la première réinitialisation de saison.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Archives des Saisons
        </CardTitle>
        <CardDescription>
          Consultez et exportez les données des saisons passées
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Season Selector */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une saison archivée" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((season) => (
                  <SelectItem key={season.season} value={season.season}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{season.season}</span>
                      <Badge variant="secondary" className="ml-2">
                        {season.statsCount} stats
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedSeason && (
          <>
            {/* Season Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-muted rounded-lg text-center">
                <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xl font-bold">{statsData.length}</p>
                <p className="text-xs text-muted-foreground">Stats joueurs</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <Trophy className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xl font-bold">{matchesData.length}</p>
                <p className="text-xs text-muted-foreground">Matchs</p>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportSeasonData("stats")}>
                <Download className="h-4 w-4 mr-2" />
                Exporter stats
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportSeasonData("matches")}>
                <Download className="h-4 w-4 mr-2" />
                Exporter matchs
              </Button>
            </div>

            {/* Data Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="stats">
                  <Users className="h-4 w-4 mr-2" />
                  Statistiques
                </TabsTrigger>
                <TabsTrigger value="matches">
                  <Trophy className="h-4 w-4 mr-2" />
                  Matchs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="mt-4">
                {statsData.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Joueur ID</TableHead>
                          <TableHead className="text-center">Buts</TableHead>
                          <TableHead className="text-center">Passes D.</TableHead>
                          <TableHead className="text-center">Minutes</TableHead>
                          <TableHead className="text-center">Note</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statsData.slice(0, 10).map((stat) => (
                          <TableRow key={stat.id}>
                            <TableCell className="font-mono text-xs">
                              {stat.player_id?.slice(0, 8)}...
                            </TableCell>
                            <TableCell className="text-center">{stat.goals || 0}</TableCell>
                            <TableCell className="text-center">{stat.assists || 0}</TableCell>
                            <TableCell className="text-center">{stat.minutes_played || 0}</TableCell>
                            <TableCell className="text-center">{stat.rating || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {statsData.length > 10 && (
                      <p className="text-center text-sm text-muted-foreground py-2">
                        Et {statsData.length - 10} autres entrées...
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Aucune statistique archivée pour cette saison
                  </p>
                )}
              </TabsContent>

              <TabsContent value="matches" className="mt-4">
                {matchesData.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Match</TableHead>
                          <TableHead className="text-center">Score</TableHead>
                          <TableHead>Compétition</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matchesData.slice(0, 10).map((match) => (
                          <TableRow key={match.id}>
                            <TableCell className="text-sm">
                              {match.match_date ? new Date(match.match_date).toLocaleDateString("fr-FR") : "-"}
                            </TableCell>
                            <TableCell>
                              {match.home_team} vs {match.away_team}
                            </TableCell>
                            <TableCell className="text-center font-bold">
                              {match.home_score ?? "-"} - {match.away_score ?? "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{match.competition || "-"}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {matchesData.length > 10 && (
                      <p className="text-center text-sm text-muted-foreground py-2">
                        Et {matchesData.length - 10} autres matchs...
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Aucun match archivé pour cette saison
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
