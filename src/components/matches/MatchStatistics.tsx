import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";

interface MatchStatisticsProps {
  matchDetails: any;
  homeTeam: string;
  awayTeam: string;
}

export const MatchStatistics = ({ matchDetails, homeTeam, awayTeam }: MatchStatisticsProps) => {
  if (!matchDetails || !matchDetails.statistics) return null;

  const stats = matchDetails.statistics;

  const formatTeamName = (team: string) => {
    if (team === 'real_madrid') return 'Real Madrid';
    return team.replace(/_/g, ' ').split(' ').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getTeamKey = (teamName: string) => {
    const normalized = teamName.toLowerCase().replace(/\s+/g, '_');
    if (normalized === 'real_madrid') return 'real_madrid';
    return Object.keys(stats.possession || {})[0] === 'real_madrid' 
      ? Object.keys(stats.possession || {})[1] 
      : Object.keys(stats.possession || {})[0];
  };

  const homeKey = getTeamKey(homeTeam);
  const awayKey = getTeamKey(awayTeam);

  const StatRow = ({ 
    label, 
    homeValue, 
    awayValue, 
    isPercentage = false 
  }: { 
    label: string; 
    homeValue: number | string; 
    awayValue: number | string;
    isPercentage?: boolean;
  }) => {
    const homeNum = typeof homeValue === 'string' ? parseInt(homeValue) : homeValue;
    const awayNum = typeof awayValue === 'string' ? parseInt(awayValue) : awayValue;
    const total = homeNum + awayNum;
    const homePercent = total > 0 ? (homeNum / total) * 100 : 50;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold">{homeValue}{isPercentage ? '%' : ''}</span>
          <span className="text-muted-foreground">{label}</span>
          <span className="font-semibold">{awayValue}{isPercentage ? '%' : ''}</span>
        </div>
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="absolute left-0 h-full bg-madrid-blue transition-all"
            style={{ width: `${homePercent}%` }}
          />
          <div 
            className="absolute right-0 h-full bg-gray-400 transition-all"
            style={{ width: `${100 - homePercent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Statistiques du match
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* En-tête avec les noms des équipes */}
        <div className="flex justify-between text-sm font-medium pb-4 border-b">
          <span>{formatTeamName(homeTeam)}</span>
          <span>{formatTeamName(awayTeam)}</span>
        </div>

        {/* Possession */}
        {stats.possession && (
          <StatRow
            label="Possession"
            homeValue={stats.possession[homeKey] || '0%'}
            awayValue={stats.possession[awayKey] || '0%'}
            isPercentage={true}
          />
        )}

        {/* Tirs */}
        {stats.shots?.total && (
          <>
            <StatRow
              label="Tirs totaux"
              homeValue={stats.shots.total[homeKey] || 0}
              awayValue={stats.shots.total[awayKey] || 0}
            />
            {stats.shots.on_target && (
              <StatRow
                label="Tirs cadrés"
                homeValue={stats.shots.on_target[homeKey] || 0}
                awayValue={stats.shots.on_target[awayKey] || 0}
              />
            )}
          </>
        )}

        {/* Passes */}
        {stats.passes && (
          <>
            <StatRow
              label="Passes réussies"
              homeValue={stats.passes[homeKey]?.completed || 0}
              awayValue={stats.passes[awayKey]?.completed || 0}
            />
            <StatRow
              label="Précision des passes"
              homeValue={stats.passes[homeKey]?.accuracy || '0%'}
              awayValue={stats.passes[awayKey]?.accuracy || '0%'}
              isPercentage={true}
            />
          </>
        )}

        {/* Autres statistiques */}
        {stats.corners && (
          <StatRow
            label="Corners"
            homeValue={stats.corners[homeKey] || 0}
            awayValue={stats.corners[awayKey] || 0}
          />
        )}

        {stats.fouls && (
          <StatRow
            label="Fautes"
            homeValue={stats.fouls[homeKey] || 0}
            awayValue={stats.fouls[awayKey] || 0}
          />
        )}

        {stats.offsides && (
          <StatRow
            label="Hors-jeu"
            homeValue={stats.offsides[homeKey] || 0}
            awayValue={stats.offsides[awayKey] || 0}
          />
        )}

        {stats.goalkeeper_saves && (
          <StatRow
            label="Arrêts du gardien"
            homeValue={stats.goalkeeper_saves[homeKey] || 0}
            awayValue={stats.goalkeeper_saves[awayKey] || 0}
          />
        )}

        {stats.tackles && (
          <StatRow
            label="Tacles"
            homeValue={stats.tackles[homeKey] || 0}
            awayValue={stats.tackles[awayKey] || 0}
          />
        )}
      </CardContent>
    </Card>
  );
};
