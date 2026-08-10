import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { loadCompetitionAliases } from "@/utils/competitionNormalizer";

export interface PlayerStatAggregate {
  player_id: string;
  name: string;
  image: string;
  image_url: string | null;
  goals: number;
  assists: number;
  minutes: number;
  minutes_played: number;
  yellow_cards: number;
  red_cards: number;
  matches: number;
  matches_played: number;
}

export interface CompetitionStats {
  topScorers: PlayerStatAggregate[];
  topAssists: PlayerStatAggregate[];
  mostPlayed: PlayerStatAggregate[];
  wins: number;
  draws: number;
  losses: number;
  totalMatches: number;
  totalGoals: number;
  goalsAgainst: number;
  cleanSheets: number;
}

export const COMPETITION_KEYS = [
  "global",
  "laliga",
  "cl",
  "copaDelRey",
  "supercoupeEurope",
  "supercoupeEspagne",
] as const;

export type CompetitionKey = (typeof COMPETITION_KEYS)[number];

const COMPETITION_MAPPING: Record<Exclude<CompetitionKey, "global">, string> = {
  laliga: "LALIGA",
  cl: "UEFA CHAMPIONS LEAGUE",
  copaDelRey: "COPA DEL REY",
  supercoupeEurope: "UEFA SUPER CUP",
  supercoupeEspagne: "SUPERCOPA DE ESPAÑA",
};

const emptyStats = (): CompetitionStats => ({
  topScorers: [],
  topAssists: [],
  mostPlayed: [],
  wins: 0,
  draws: 0,
  losses: 0,
  totalMatches: 0,
  totalGoals: 0,
  goalsAgainst: 0,
  cleanSheets: 0,
});

// Supabase renvoie 1000 lignes max par requête : on pagine pour tout récupérer.
const fetchAllRows = async <T>(
  table: "matches" | "player_stats",
  select: string
): Promise<T[]> => {
  const pageSize = 1000;
  const rows: T[] = [];
  for (let page = 0; ; page++) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(page * pageSize, page * pageSize + pageSize - 1);
    if (error) throw error;
    const chunk = (data ?? []) as unknown as T[];
    rows.push(...chunk);
    if (chunk.length < pageSize) break;
  }
  return rows;
};

type MatchRow = {
  id: string;
  competition: string | null;
  status: string | null;
  home_team: string | null;
  away_team: string | null;
  home_score: number | null;
  away_score: number | null;
};

type StatRow = {
  player_id: string;
  match_id: string;
  goals: number | null;
  assists: number | null;
  minutes_played: number | null;
  yellow_cards: number | null;
  red_cards: number | null;
  players: { name: string | null; image_url: string | null } | null;
};

const aggregatePlayers = (stats: StatRow[]) => {
  const map = new Map<string, PlayerStatAggregate>();

  stats.forEach((stat) => {
    const name = stat.players?.name;
    if (!stat.player_id || !name) return;

    let player = map.get(stat.player_id);
    if (!player) {
      player = {
        player_id: stat.player_id,
        name,
        image: stat.players?.image_url || "/placeholder.svg",
        image_url: stat.players?.image_url ?? null,
        goals: 0,
        assists: 0,
        minutes: 0,
        minutes_played: 0,
        yellow_cards: 0,
        red_cards: 0,
        matches: 0,
        matches_played: 0,
      };
      map.set(stat.player_id, player);
    }

    player.goals += stat.goals || 0;
    player.assists += stat.assists || 0;
    player.minutes += stat.minutes_played || 0;
    player.minutes_played = player.minutes;
    player.yellow_cards += stat.yellow_cards || 0;
    player.red_cards += stat.red_cards || 0;
    if ((stat.minutes_played || 0) > 0) {
      player.matches += 1;
      player.matches_played = player.matches;
    }
  });

  const players = Array.from(map.values());

  return {
    topScorers: players
      .filter((p) => p.goals > 0)
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
      .slice(0, 10),
    topAssists: players
      .filter((p) => p.assists > 0)
      .sort((a, b) => b.assists - a.assists || b.goals - a.goals)
      .slice(0, 10),
    mostPlayed: players
      .filter((p) => p.matches > 0)
      .sort((a, b) => b.matches - a.matches || b.minutes - a.minutes)
      .slice(0, 10),
  };
};

const buildStats = (matches: MatchRow[], statsByMatch: Map<string, StatRow[]>): CompetitionStats => {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let totalGoals = 0;
  let goalsAgainst = 0;
  let cleanSheets = 0;
  const relatedStats: StatRow[] = [];

  matches.forEach((match) => {
    const isHome = match.home_team === "Real Madrid";
    const ourScore = (isHome ? match.home_score : match.away_score) ?? 0;
    const theirScore = (isHome ? match.away_score : match.home_score) ?? 0;

    totalGoals += ourScore;
    goalsAgainst += theirScore;
    if (theirScore === 0) cleanSheets += 1;

    if (ourScore > theirScore) wins++;
    else if (ourScore === theirScore) draws++;
    else losses++;

    const matchStats = statsByMatch.get(match.id);
    if (matchStats) relatedStats.push(...matchStats);
  });

  return {
    ...aggregatePlayers(relatedStats),
    wins,
    draws,
    losses,
    totalMatches: matches.length,
    totalGoals,
    goalsAgainst,
    cleanSheets,
  };
};

/**
 * Récupère une seule fois matchs + stats joueurs, puis calcule
 * les agrégats de toutes les compétitions côté client (mise en cache React Query).
 */
export const useAllCompetitionStats = () => {
  return useQuery({
    queryKey: ["all-competition-stats"],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Record<CompetitionKey, CompetitionStats>> => {
      const [matches, playerStats, aliasMap] = await Promise.all([
        fetchAllRows<MatchRow>(
          "matches",
          "id, competition, status, home_team, away_team, home_score, away_score"
        ),
        fetchAllRows<StatRow>(
          "player_stats",
          "player_id, match_id, goals, assists, minutes_played, yellow_cards, red_cards, players(name, image_url)"
        ),
        loadCompetitionAliases(),
      ]);

      const statsByMatch = new Map<string, StatRow[]>();
      playerStats.forEach((stat) => {
        if (!stat.match_id) return;
        const list = statsByMatch.get(stat.match_id);
        if (list) list.push(stat);
        else statsByMatch.set(stat.match_id, [stat]);
      });

      const playedMatches = matches.filter(
        (m) =>
          (m.home_team === "Real Madrid" || m.away_team === "Real Madrid") &&
          m.home_score !== null &&
          m.away_score !== null
      );

      const normalized = playedMatches.map((match) => ({
        match,
        competition:
          aliasMap.get((match.competition || "").trim().toLowerCase()) ||
          (match.competition || "").trim(),
      }));

      const result = {} as Record<CompetitionKey, CompetitionStats>;
      result.global = buildStats(playedMatches, statsByMatch);

      (Object.keys(COMPETITION_MAPPING) as Array<keyof typeof COMPETITION_MAPPING>).forEach((key) => {
        const canonical = COMPETITION_MAPPING[key];
        const subset = normalized
          .filter((entry) => entry.competition.toUpperCase() === canonical)
          .map((entry) => entry.match);
        result[key] = subset.length ? buildStats(subset, statsByMatch) : emptyStats();
      });

      return result;
    },
  });
};
