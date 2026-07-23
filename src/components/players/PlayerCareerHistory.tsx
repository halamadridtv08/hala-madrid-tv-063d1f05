import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronRight, Trophy } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

interface Row {
  season: string;
  competition: string;
  matches: number;
  goals: number;
  assists: number;
  minutes: number;
  yellow: number;
  red: number;
}

interface Props {
  playerId: string;
}

/**
 * Historique carrière style Fotmob : union des stats de la saison en cours
 * (player_stats + matches) et des archives (season_player_stats_archive + season_matches_archive).
 * Agrégé par (saison, compétition), avec ligne "Toutes compétitions" par saison.
 */
export function PlayerCareerHistory({ playerId }: Props) {
  const { getContent } = useSiteContent();
  const currentSeason = getContent("current_season", "2025/26");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSeasons, setOpenSeasons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        // Saison en cours: player_stats jointe à matches
        const currentPromise = supabase
          .from("player_stats")
          .select("goals, assists, minutes_played, yellow_cards, red_cards, matches:match_id(competition)")
          .eq("player_id", playerId);

        // Archives: stats + matchs archivés
        const archiveStatsPromise = supabase
          .from("season_player_stats_archive")
          .select("season, match_id, goals, assists, minutes_played, yellow_cards, red_cards")
          .eq("player_id", playerId);

        const [currentRes, archiveStatsRes] = await Promise.all([currentPromise, archiveStatsPromise]);

        const map = new Map<string, Row>();
        const add = (season: string, competition: string, s: any) => {
          const key = `${season}||${competition}`;
          const existing = map.get(key) || {
            season, competition, matches: 0, goals: 0, assists: 0, minutes: 0, yellow: 0, red: 0,
          };
          existing.matches += 1;
          existing.goals += s.goals || 0;
          existing.assists += s.assists || 0;
          existing.minutes += s.minutes_played || 0;
          existing.yellow += s.yellow_cards || 0;
          existing.red += s.red_cards || 0;
          map.set(key, existing);
        };

        (currentRes.data || []).forEach((s: any) => {
          const comp = s.matches?.competition || "Autres";
          add(currentSeason, comp, s);
        });

        // Pour les archives, on doit récupérer les compétitions depuis season_matches_archive
        const archiveStats = archiveStatsRes.data || [];
        const archiveMatchIds = [...new Set(archiveStats.map((s: any) => s.match_id).filter(Boolean))];
        let matchCompMap = new Map<string, string>();
        if (archiveMatchIds.length > 0) {
          const { data: archiveMatches } = await supabase
            .from("season_matches_archive")
            .select("original_id, competition")
            .in("original_id", archiveMatchIds as string[]);
          (archiveMatches || []).forEach((m: any) => matchCompMap.set(m.original_id, m.competition));
        }
        archiveStats.forEach((s: any) => {
          const comp = matchCompMap.get(s.match_id) || "Autres";
          add(s.season, comp, s);
        });

        if (!cancelled) setRows(Array.from(map.values()));
      } catch (e) {
        console.error("PlayerCareerHistory load error", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [playerId, currentSeason]);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Carrière</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-40 w-full" /></CardContent>
      </Card>
    );
  }

  // Grouper par saison
  const seasons = [...new Set(rows.map(r => r.season))].sort().reverse();
  const totals = (season: string) => {
    const items = rows.filter(r => r.season === season);
    return items.reduce((acc, r) => ({
      matches: acc.matches + r.matches,
      goals: acc.goals + r.goals,
      assists: acc.assists + r.assists,
      minutes: acc.minutes + r.minutes,
      yellow: acc.yellow + r.yellow,
      red: acc.red + r.red,
    }), { matches: 0, goals: 0, assists: 0, minutes: 0, yellow: 0, red: 0 });
  };

  const toggle = (s: string) => setOpenSeasons(prev => ({ ...prev, [s]: !prev[s] }));

  if (seasons.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Carrière</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucune statistique enregistrée pour ce joueur.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Carrière par saison
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Saison / Compétition</TableHead>
              <TableHead className="text-center">MJ</TableHead>
              <TableHead className="text-center">Buts</TableHead>
              <TableHead className="text-center">Passes</TableHead>
              <TableHead className="text-center">Min.</TableHead>
              <TableHead className="text-center">🟨</TableHead>
              <TableHead className="text-center">🟥</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seasons.map(season => {
              const t = totals(season);
              const isOpen = openSeasons[season] ?? (season === currentSeason);
              const comps = rows.filter(r => r.season === season);
              return (
                <>
                  <TableRow
                    key={`s-${season}`}
                    className="cursor-pointer bg-muted/50 font-semibold hover:bg-muted"
                    onClick={() => toggle(season)}
                  >
                    <TableCell className="flex items-center gap-2">
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      {season} {season === currentSeason && <span className="text-xs text-primary ml-1">(en cours)</span>}
                    </TableCell>
                    <TableCell className="text-center">{t.matches}</TableCell>
                    <TableCell className="text-center">{t.goals}</TableCell>
                    <TableCell className="text-center">{t.assists}</TableCell>
                    <TableCell className="text-center">{t.minutes}</TableCell>
                    <TableCell className="text-center">{t.yellow}</TableCell>
                    <TableCell className="text-center">{t.red}</TableCell>
                  </TableRow>
                  {isOpen && comps.map(c => (
                    <TableRow key={`c-${season}-${c.competition}`} className="text-sm">
                      <TableCell className="pl-10 text-muted-foreground">{c.competition}</TableCell>
                      <TableCell className="text-center">{c.matches}</TableCell>
                      <TableCell className="text-center">{c.goals}</TableCell>
                      <TableCell className="text-center">{c.assists}</TableCell>
                      <TableCell className="text-center">{c.minutes}</TableCell>
                      <TableCell className="text-center">{c.yellow}</TableCell>
                      <TableCell className="text-center">{c.red}</TableCell>
                    </TableRow>
                  ))}
                </>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}