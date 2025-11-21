
import { useCompetitionStats } from "@/hooks/useCompetitionStats";

export const useRealStatsData = () => {
  // Récupérer les stats pour chaque compétition
  const { stats: globalStats, loading: globalLoading, error: globalError } = useCompetitionStats('global');
  const { stats: laligaStats, loading: laligaLoading } = useCompetitionStats('laliga');
  const { stats: clStats, loading: clLoading } = useCompetitionStats('cl');
  const { stats: copaStats, loading: copaLoading } = useCompetitionStats('copaDelRey');
  const { stats: superEuropeStats, loading: superEuropeLoading } = useCompetitionStats('supercoupeEurope');
  const { stats: superEspagneStats, loading: superEspagneLoading } = useCompetitionStats('supercoupeEspagne');

  const loading = globalLoading || laligaLoading || clLoading || copaLoading || superEuropeLoading || superEspagneLoading;

  const formatStatsForCompetition = (stats: typeof globalStats) => ({
    topScorers: stats.topScorers,
    topAssists: stats.topAssists,
    mostPlayed: stats.mostPlayed,
    teamPerformance: [
      { name: "Victoires", value: stats.wins },
      { name: "Nuls", value: stats.draws },
      { name: "Défaites", value: stats.losses }
    ],
    standings: [
      {
        position: 1,
        team: "Real Madrid",
        played: stats.totalMatches,
        won: stats.wins,
        drawn: stats.draws,
        lost: stats.losses,
        goalsFor: stats.totalGoals,
        goalsAgainst: 0, // TODO: calculer les buts encaissés
        points: stats.wins * 3 + stats.draws
      }
    ]
  });

  return {
    loading,
    error: globalError,
    globalStats,
    topScorers: {
      global: globalStats.topScorers,
      laliga: laligaStats.topScorers,
      cl: clStats.topScorers,
      copaDelRey: copaStats.topScorers,
      supercoupeEurope: superEuropeStats.topScorers,
      supercoupeEspagne: superEspagneStats.topScorers
    },
    topAssists: {
      global: globalStats.topAssists,
      laliga: laligaStats.topAssists,
      cl: clStats.topAssists,
      copaDelRey: copaStats.topAssists,
      supercoupeEurope: superEuropeStats.topAssists,
      supercoupeEspagne: superEspagneStats.topAssists
    },
    mostPlayed: {
      global: globalStats.mostPlayed,
      laliga: laligaStats.mostPlayed,
      cl: clStats.mostPlayed,
      copaDelRey: copaStats.mostPlayed,
      supercoupeEurope: superEuropeStats.mostPlayed,
      supercoupeEspagne: superEspagneStats.mostPlayed
    },
    teamPerformance: {
      global: formatStatsForCompetition(globalStats).teamPerformance,
      laliga: formatStatsForCompetition(laligaStats).teamPerformance,
      cl: formatStatsForCompetition(clStats).teamPerformance,
      copaDelRey: formatStatsForCompetition(copaStats).teamPerformance,
      supercoupeEurope: formatStatsForCompetition(superEuropeStats).teamPerformance,
      supercoupeEspagne: formatStatsForCompetition(superEspagneStats).teamPerformance
    },
    standings: {
      global: formatStatsForCompetition(globalStats).standings,
      laliga: formatStatsForCompetition(laligaStats).standings,
      cl: formatStatsForCompetition(clStats).standings,
      copaDelRey: formatStatsForCompetition(copaStats).standings,
      supercoupeEurope: formatStatsForCompetition(superEuropeStats).standings,
      supercoupeEspagne: formatStatsForCompetition(superEspagneStats).standings
    }
  };
};
