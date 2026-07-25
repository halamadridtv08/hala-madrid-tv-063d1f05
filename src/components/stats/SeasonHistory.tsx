import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Archive } from "lucide-react";

interface ArchivedMatch {
  id: string;
  season: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  match_date: string;
  competition: string | null;
}

interface ArchivedStat {
  season: string;
  player_id: string;
  goals: number | null;
  assists: number | null;
  minutes_played: number | null;
  yellow_cards: number | null;
  red_cards: number | null;
}

const REAL = "Real Madrid";

export const SeasonHistory = () => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<ArchivedMatch[]>([]);
  const [stats, setStats] = useState<ArchivedStat[]>([]);
  const [players, setPlayers] = useState<Record<string, string>>({});
  const [season, setSeason] = useState<string>("");
  const [competition, setCompetition] = useState<string>("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: m }, { data: s }, { data: p }] = await Promise.all([
        supabase
          .from("season_matches_archive")
          .select("id,season,home_team,away_team,home_score,away_score,match_date,competition")
          .order("match_date", { ascending: false })
          .limit(1000),
        supabase
          .from("season_player_stats_archive")
          .select("season,player_id,goals,assists,minutes_played,yellow_cards,red_cards")
          .limit(5000),
        supabase.from("players").select("id,name"),
      ]);
      setMatches(m || []);
      setStats(s || []);
      setPlayers(Object.fromEntries((p || []).map((x: any) => [x.id, x.name])));
      const firstSeason = (m && m[0]?.season) || (s && s[0]?.season) || "";
      setSeason(firstSeason);
      setLoading(false);
    })();
  }, []);

  const seasons = useMemo(() => {
    const set = new Set<string>();
    matches.forEach((x) => set.add(x.season));
    stats.forEach((x) => set.add(x.season));
    return Array.from(set).sort().reverse();
  }, [matches, stats]);

  const competitions = useMemo(() => {
    const set = new Set<string>();
    matches.filter((m) => m.season === season).forEach((m) => m.competition && set.add(m.competition));
    return Array.from(set).sort();
  }, [matches, season]);

  const filteredMatches = useMemo(
    () =>
      matches.filter(
        (m) => m.season === season && (competition === "all" || m.competition === competition)
      ),
    [matches, season, competition]
  );

  const overview = useMemo(() => {
    let w = 0, d = 0, l = 0, gf = 0, ga = 0;
    filteredMatches.forEach((m) => {
      if (m.home_score == null || m.away_score == null) return;
      const isHome = m.home_team === REAL;
      const ours = isHome ? m.home_score : m.away_score;
      const theirs = isHome ? m.away_score : m.home_score;
      gf += ours; ga += theirs;
      if (ours > theirs) w++;
      else if (ours === theirs) d++;
      else l++;
    });
    return { played: filteredMatches.length, w, d, l, gf, ga };
  }, [filteredMatches]);

  const topScorers = useMemo(() => {
    const agg: Record<string, { goals: number; assists: number; minutes: number }> = {};
    stats
      .filter((s) => s.season === season)
      .forEach((s) => {
        if (!s.player_id) return;
        const a = (agg[s.player_id] ||= { goals: 0, assists: 0, minutes: 0 });
        a.goals += s.goals || 0;
        a.assists += s.assists || 0;
        a.minutes += s.minutes_played || 0;
      });
    return Object.entries(agg)
      .map(([pid, v]) => ({ name: players[pid] || "Joueur", ...v }))
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
      .slice(0, 10);
  }, [stats, season, players]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (seasons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Historique des saisons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aucune saison archivée pour le moment. Les données apparaîtront ici après un archivage de saison.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-primary" />
          <span className="font-semibold">Saison</span>
        </div>
        <Select value={season} onValueChange={setSeason}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {seasons.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={competition} onValueChange={setCompetition}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Toutes compétitions" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes compétitions</SelectItem>
            {competitions.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle>Bilan — Saison {season}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              ["Matchs", overview.played],
              ["Victoires", overview.w],
              ["Nuls", overview.d],
              ["Défaites", overview.l],
              ["Buts pour", overview.gf],
              ["Buts contre", overview.ga],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-lg bg-muted/50 p-3 text-center">
                <div className="text-2xl font-bold">{v as number}</div>
                <div className="text-xs text-muted-foreground">{k}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top buteurs — {season}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topScorers.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucune statistique joueur pour cette saison.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border/60">
                    <th className="py-2">Joueur</th>
                    <th className="py-2 text-right">Buts</th>
                    <th className="py-2 text-right">Passes D.</th>
                    <th className="py-2 text-right">Minutes</th>
                  </tr>
                </thead>
                <tbody>
                  {topScorers.map((p) => (
                    <tr key={p.name} className="border-b border-border/40">
                      <td className="py-2 font-medium">{p.name}</td>
                      <td className="py-2 text-right">{p.goals}</td>
                      <td className="py-2 text-right">{p.assists}</td>
                      <td className="py-2 text-right">{p.minutes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Matchs archivés ({filteredMatches.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border/60">
                  <th className="py-2">Date</th>
                  <th className="py-2">Compétition</th>
                  <th className="py-2">Match</th>
                  <th className="py-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((m) => (
                  <tr key={m.id} className="border-b border-border/40">
                    <td className="py-2 whitespace-nowrap">{new Date(m.match_date).toLocaleDateString("fr-FR")}</td>
                    <td className="py-2">{m.competition || "-"}</td>
                    <td className="py-2">{m.home_team} vs {m.away_team}</td>
                    <td className="py-2 text-right font-semibold">
                      {m.home_score ?? "-"} - {m.away_score ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeasonHistory;