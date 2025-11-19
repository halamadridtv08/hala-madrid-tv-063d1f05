import { Card, CardContent } from "@/components/ui/card";
import { Activity, Shield, Share2, Flag } from "lucide-react";

interface MatchStatisticsProps {
  matchDetails: any;
  homeTeam: string;
  awayTeam: string;
}

export const MatchStatistics = ({ matchDetails, homeTeam, awayTeam }: MatchStatisticsProps) => {
  if (!matchDetails) return null;

  console.log("Match details:", matchDetails);

  // Normaliser les noms d'équipe pour correspondre aux clés JSON
  const normalizeTeamName = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '_');
  };

  const homeKey = normalizeTeamName(homeTeam);
  const awayKey = normalizeTeamName(awayTeam);

  // Extraire les statistiques depuis la structure JSON correcte
  const statistics = matchDetails.statistics || {};
  const possession = matchDetails.possession || {};
  const cards = matchDetails.cards || {};

  console.log("Statistics:", statistics);
  console.log("Possession:", possession);
  console.log("Cards:", cards);

  // Parse possession percentages
  const parsePossession = (possessionStr: string) => {
    if (!possessionStr) return 0;
    return parseInt(possessionStr.replace('%', '').trim());
  };

  const homePossession = parsePossession(possession[homeKey] || '0%');
  const awayPossession = parsePossession(possession[awayKey] || '0%');

  // Get statistics data
  const stats = {
    attack: {
      totalShots: { 
        home: statistics.shots?.total?.[homeKey] || 0, 
        away: statistics.shots?.total?.[awayKey] || 0 
      },
      shotsOnTarget: { 
        home: statistics.shots?.on_target?.[homeKey] || 0, 
        away: statistics.shots?.on_target?.[awayKey] || 0 
      },
      shotsOffTarget: { 
        home: statistics.shots?.off_target?.[homeKey] || 0, 
        away: statistics.shots?.off_target?.[awayKey] || 0 
      }
    },
    defense: {
      saves: { 
        home: statistics.goalkeeper_saves?.[homeKey] || 0, 
        away: statistics.goalkeeper_saves?.[awayKey] || 0 
      },
      tackles: { 
        home: statistics.tackles?.[homeKey] || 0, 
        away: statistics.tackles?.[awayKey] || 0 
      }
    },
    distribution: {
      totalPasses: { 
        home: statistics.passes?.[homeKey]?.total || 0, 
        away: statistics.passes?.[awayKey]?.total || 0 
      },
      completedPasses: { 
        home: statistics.passes?.[homeKey]?.completed || 0, 
        away: statistics.passes?.[awayKey]?.completed || 0 
      },
      possession: {
        home: homePossession,
        away: awayPossession
      }
    },
    discipline: {
      fouls: { 
        home: statistics.fouls?.[homeKey] || 0, 
        away: statistics.fouls?.[awayKey] || 0 
      },
      yellowCards: { 
        home: cards.yellow?.[homeKey] || 0, 
        away: cards.yellow?.[awayKey] || 0 
      },
      redCards: { 
        home: cards.red?.[homeKey] || 0, 
        away: cards.red?.[awayKey] || 0 
      }
    }
  };

  const renderProgressBar = (homeValue: number, awayValue: number) => {
    const total = homeValue + awayValue;
    const homePercent = total === 0 ? 50 : Math.round((homeValue / total) * 100);
    const awayPercent = total === 0 ? 50 : 100 - homePercent;

    return (
      <div className="flex h-2 my-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="bg-madrid-blue" 
          style={{ width: `${homePercent}%` }}
        ></div>
        <div 
          className="bg-blue-500" 
          style={{ width: `${awayPercent}%` }}
        ></div>
      </div>
    );
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="space-y-8">
          {/* Statistiques d'attaque */}
          <div>
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <Activity className="mr-2 h-5 w-5 text-madrid-blue" />
              Attaque
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>{stats.attack.totalShots.home}</span>
                  <span className="font-medium">Tirs totaux</span>
                  <span>{stats.attack.totalShots.away}</span>
                </div>
                {renderProgressBar(stats.attack.totalShots.home, stats.attack.totalShots.away)}
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>{stats.attack.shotsOnTarget.home}</span>
                  <span className="font-medium">Tirs cadrés</span>
                  <span>{stats.attack.shotsOnTarget.away}</span>
                </div>
                {renderProgressBar(stats.attack.shotsOnTarget.home, stats.attack.shotsOnTarget.away)}
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>{stats.attack.shotsOffTarget.home}</span>
                  <span className="font-medium">Tirs non cadrés</span>
                  <span>{stats.attack.shotsOffTarget.away}</span>
                </div>
                {renderProgressBar(stats.attack.shotsOffTarget.home, stats.attack.shotsOffTarget.away)}
              </div>
            </div>
          </div>
          
          {/* Statistiques de défense */}
          <div>
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <Shield className="mr-2 h-5 w-5 text-madrid-blue" />
              Défense
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>{stats.defense.saves.home}</span>
                  <span className="font-medium">Arrêts du gardien</span>
                  <span>{stats.defense.saves.away}</span>
                </div>
                {renderProgressBar(stats.defense.saves.home, stats.defense.saves.away)}
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>{stats.defense.tackles.home}</span>
                  <span className="font-medium">Tacles</span>
                  <span>{stats.defense.tackles.away}</span>
                </div>
                {renderProgressBar(stats.defense.tackles.home, stats.defense.tackles.away)}
              </div>
            </div>
          </div>
          
          {/* Statistiques de passes */}
          <div>
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <Share2 className="mr-2 h-5 w-5 text-madrid-blue" />
              Distribution
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>{stats.distribution.possession.home}%</span>
                  <span className="font-medium">Possession du ballon</span>
                  <span>{stats.distribution.possession.away}%</span>
                </div>
                {renderProgressBar(stats.distribution.possession.home, stats.distribution.possession.away)}
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span>{stats.distribution.totalPasses.home}</span>
                  <span className="font-medium">Total des passes</span>
                  <span>{stats.distribution.totalPasses.away}</span>
                </div>
                {renderProgressBar(stats.distribution.totalPasses.home, stats.distribution.totalPasses.away)}
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>{stats.distribution.completedPasses.home}</span>
                  <span className="font-medium">Passes réussies</span>
                  <span>{stats.distribution.completedPasses.away}</span>
                </div>
                {renderProgressBar(stats.distribution.completedPasses.home, stats.distribution.completedPasses.away)}
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>
                    {Math.round((stats.distribution.completedPasses.home / stats.distribution.totalPasses.home) * 100) || 0}%
                  </span>
                  <span className="font-medium">Précision des passes</span>
                  <span>
                    {Math.round((stats.distribution.completedPasses.away / stats.distribution.totalPasses.away) * 100) || 0}%
                  </span>
                </div>
                {renderProgressBar(stats.distribution.completedPasses.home, stats.distribution.completedPasses.away)}
              </div>
            </div>
          </div>
          
          {/* Statistiques de discipline */}
          <div>
            <h3 className="text-lg font-semibold flex items-center mb-4">
              <Flag className="mr-2 h-5 w-5 text-madrid-blue" />
              Discipline
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>{stats.discipline.fouls.home}</span>
                  <span className="font-medium">Fautes</span>
                  <span>{stats.discipline.fouls.away}</span>
                </div>
                {renderProgressBar(stats.discipline.fouls.home, stats.discipline.fouls.away)}
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>{stats.discipline.yellowCards.home}</span>
                  <span className="font-medium">Cartons jaunes</span>
                  <span>{stats.discipline.yellowCards.away}</span>
                </div>
                {renderProgressBar(stats.discipline.yellowCards.home, stats.discipline.yellowCards.away)}
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>{stats.discipline.redCards.home}</span>
                  <span className="font-medium">Cartons rouges</span>
                  <span>{stats.discipline.redCards.away}</span>
                </div>
                {renderProgressBar(stats.discipline.redCards.home, stats.discipline.redCards.away)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
