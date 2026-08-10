import { useMemo } from "react";
import {
  useAllCompetitionStats,
  COMPETITION_KEYS,
  type CompetitionKey,
  type CompetitionStats,
} from "@/hooks/useAllCompetitionStats";

const teamPerformanceOf = (stats: CompetitionStats) => [
  { name: "Victoires", value: stats.wins },
  { name: "Nuls", value: stats.draws },
  { name: "Défaites", value: stats.losses },
];

const standingsOf = (stats: CompetitionStats) => [
  {
    position: 1,
    team: "Real Madrid",
    played: stats.totalMatches,
    won: stats.wins,
    drawn: stats.draws,
    lost: stats.losses,
    goalsFor: stats.totalGoals,
    goalsAgainst: stats.goalsAgainst,
    points: stats.wins * 3 + stats.draws,
  },
];

const pick = <T,>(
  data: Record<CompetitionKey, CompetitionStats> | undefined,
  selector: (stats: CompetitionStats) => T
) => {
  const result = {} as Record<CompetitionKey, T | undefined>;
  COMPETITION_KEYS.forEach((key) => {
    result[key] = data ? selector(data[key]) : undefined;
  });
  return result;
};

export const useRealStatsData = () => {
  const { data, isLoading, error, refetch, isFetching } = useAllCompetitionStats();

  return useMemo(
    () => ({
      loading: isLoading,
      isFetching,
      error: error ? (error as Error).message : null,
      refetch,
      globalStats: data?.global,
      topScorers: pick(data, (s) => s.topScorers),
      topAssists: pick(data, (s) => s.topAssists),
      mostPlayed: pick(data, (s) => s.mostPlayed),
      teamPerformance: pick(data, teamPerformanceOf),
      standings: pick(data, standingsOf),
    }),
    [data, isLoading, isFetching, error, refetch]
  );
};
