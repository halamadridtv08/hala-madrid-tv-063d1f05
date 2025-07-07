
import { useRealStats } from "@/hooks/useRealStats";

export const useRealStatsData = () => {
  const { stats, loading, error } = useRealStats();

  // Transformer les données réelles au format attendu par les composants existants
  const getStatsForCompetition = (competition: string) => {
    // Pour l'instant, on utilise les mêmes données pour toutes les compétitions
    // Dans une version future, on pourrait filtrer par compétition
    return {
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
          goalsAgainst: Math.floor(stats.totalGoals * 0.3), // Estimation
          points: stats.wins * 3 + stats.draws
        }
      ]
    };
  };

  return {
    loading,
    error,
    globalStats: stats,
    topScorers: {
      global: stats.topScorers,
      laliga: getStatsForCompetition('laliga').topScorers,
      cl: getStatsForCompetition('cl').topScorers,
      copaDelRey: getStatsForCompetition('copaDelRey').topScorers,
      supercoupeEurope: getStatsForCompetition('supercoupeEurope').topScorers,
      supercoupeEspagne: getStatsForCompetition('supercoupeEspagne').topScorers
    },
    topAssists: {
      global: stats.topAssists,
      laliga: getStatsForCompetition('laliga').topAssists,
      cl: getStatsForCompetition('cl').topAssists,
      copaDelRey: getStatsForCompetition('copaDelRey').topAssists,
      supercoupeEurope: getStatsForCompetition('supercoupeEurope').topAssists,
      supercoupeEspagne: getStatsForCompetition('supercoupeEspagne').topAssists
    },
    mostPlayed: {
      global: stats.mostPlayed,
      laliga: getStatsForCompetition('laliga').mostPlayed,
      cl: getStatsForCompetition('cl').mostPlayed,
      copaDelRey: getStatsForCompetition('copaDelRey').mostPlayed,
      supercoupeEurope: getStatsForCompetition('supercoupeEurope').mostPlayed,
      supercoupeEspagne: getStatsForCompetition('supercoupeEspagne').mostPlayed
    },
    teamPerformance: {
      global: getStatsForCompetition('global').teamPerformance,
      laliga: getStatsForCompetition('laliga').teamPerformance,
      cl: getStatsForCompetition('cl').teamPerformance,
      copaDelRey: getStatsForCompetition('copaDelRey').teamPerformance,
      supercoupeEurope: getStatsForCompetition('supercoupeEurope').teamPerformance,
      supercoupeEspagne: getStatsForCompetition('supercoupeEspagne').teamPerformance
    },
    standings: {
      global: getStatsForCompetition('global').standings,
      laliga: getStatsForCompetition('laliga').standings,
      cl: getStatsForCompetition('cl').standings,
      copaDelRey: getStatsForCompetition('copaDelRey').standings,
      supercoupeEurope: getStatsForCompetition('supercoupeEurope').standings,
      supercoupeEspagne: getStatsForCompetition('supercoupeEspagne').standings
    }
  };
};
