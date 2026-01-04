import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FootballPitch } from '@/components/admin/formation/FootballPitch';
import { PlayerOnField } from './PlayerOnField';
import { Users } from 'lucide-react';

interface PlayerType {
  id?: string;
  name: string;
  position: string;
  number: number;
  imageUrl?: string;
}

interface ProbableLineupFormationProps {
  realMadridLineup: PlayerType[];
  realMadridSubs: PlayerType[];
  opposingLineup: PlayerType[];
  opposingSubs: PlayerType[];
  opposingTeamName: string;
  homeTeamName: string;
}

const stripDiacritics = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Normalise les libellés "position" venant de la BDD (ex: "Défenseur Central", "Milieu", "Gardien")
 * vers des codes courts utilisés par le placement sur le terrain.
 */
const normalizePosition = (raw: string): string => {
  const v = stripDiacritics(raw ?? '').toLowerCase().trim();
  const eq = (s: string) => v === s;
  const has = (s: string) => v.includes(s);

  // GK
  if (eq('gk') || eq('gb') || eq('gardien') || has('gardien') || has('goalkeeper') || has('portero')) return 'GK';

  // Défense
  if (eq('dc') || has('defenseur central') || has('central defender') || has('defensa central') || has('centre-back')) return 'CB';
  if (eq('dg') || has('lateral gauche') || has('arriere gauche') || has('left back')) return 'LB';
  if (eq('dd') || has('lateral droit') || has('arriere droit') || has('right back')) return 'RB';

  // Milieux
  if (eq('mdc') || has('milieu defensif') || has('defensive midfielder')) return 'CDM';
  if (eq('moc') || eq('cam') || has('milieu offensif') || has('attacking midfielder')) return 'CAM';
  if (eq('mg') || has('milieu gauche') || has('left midfielder')) return 'LM';
  if (eq('md') || has('milieu droit') || has('right midfielder')) return 'RM';
  if (eq('mc') || has('milieu central') || (has('milieu') && !has('offensif') && !has('defensif') && !has('gauche') && !has('droit'))) return 'CM';

  // Attaque (on distingue "attaquant gauche/droit" des 9)
  if (eq('ag') || has('ailier gauche') || has('left winger') || (has('attaquant') && has('gauche'))) return 'LW';
  if (eq('ad') || has('ailier droit') || has('right winger') || (has('attaquant') && has('droit'))) return 'RW';
  if (eq('sa') || has('second attaquant') || has('support striker')) return 'CF';
  if (eq('bu') || has('buteur') || has('avant-centre') || has('avant centre') || has('attaquant') || has('striker') || has('forward')) return 'ST';

  return stripDiacritics(raw ?? '').toUpperCase().trim();
};

// Get position coordinates based on position type and index for multiple same positions
const getPositionCoordinates = (
  normalizedPosition: string,
  samePositionIndex: number,
  totalSamePosition: number
): { x: number; y: number } => {
  const pos = normalizedPosition.toUpperCase();

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
  const spread = (i: number, total: number, minX: number, maxX: number) =>
    total <= 1 ? (minX + maxX) / 2 : minX + (i * (maxX - minX)) / (total - 1);

  const safeTotal = Math.max(1, totalSamePosition || 1);
  const safeIndex = clamp(samePositionIndex || 0, 0, safeTotal - 1);

  const finalize = (x: number, y: number) => ({
    x: clamp(x, 6, 94),
    y: clamp(y, 8, 92),
  });

  // Attaquants : si la BDD ne distingue pas "AG/BU/AD" et met juste "Attaquant",
  // on répartit quand même un trio en (gauche / axe / droite) pour un rendu cohérent.
  if (pos === 'ST') {
    if (safeTotal === 3) {
      const trio = [
        { x: 18, y: 32 }, // gauche
        { x: 50, y: 22 }, // axe
        { x: 82, y: 32 }, // droite
      ];
      return finalize(trio[safeIndex].x, trio[safeIndex].y);
    }

    const minX = safeTotal === 1 ? 50 : safeTotal === 2 ? 40 : safeTotal === 4 ? 22 : 16;
    const maxX = safeTotal === 1 ? 50 : safeTotal === 2 ? 60 : safeTotal === 4 ? 78 : 84;
    return finalize(spread(safeIndex, safeTotal, minX, maxX), 22);
  }

  if (pos === 'CF') {
    const minX = safeTotal === 1 ? 50 : 44;
    const maxX = safeTotal === 1 ? 50 : 56;
    return finalize(spread(safeIndex, safeTotal, minX, maxX), 28);
  }

  // Base positions for each role
  const basePositions: Record<string, { x: number; y: number }[]> = {
    // Goalkeeper
    GK: [{ x: 50, y: 92 }],

    // Defenders
    LB: [{ x: 12, y: 75 }],
    RB: [{ x: 88, y: 75 }],
    CB: [{ x: 35, y: 78 }, { x: 65, y: 78 }, { x: 50, y: 80 }],

    // Defensive midfielders
    CDM: [{ x: 40, y: 62 }, { x: 60, y: 62 }],

    // Midfielders
    CM: [{ x: 30, y: 50 }, { x: 50, y: 52 }, { x: 70, y: 50 }],
    LM: [{ x: 15, y: 50 }],
    RM: [{ x: 85, y: 50 }],
    CAM: [{ x: 50, y: 40 }],

    // Wingers
    LW: [{ x: 18, y: 32 }],
    RW: [{ x: 82, y: 32 }],
  };

  const positions = basePositions[pos];
  if (positions) {
    const index = Math.min(samePositionIndex, positions.length - 1);
    return positions[index];
  }

  // Fallback: distribute unknown positions across midfield
  const fallbackX = 25 + ((samePositionIndex * 25) % 50);
  return { x: fallbackX, y: 50 };
};

export const ProbableLineupFormation: React.FC<ProbableLineupFormationProps> = ({
  realMadridLineup,
  realMadridSubs,
  opposingLineup,
  opposingSubs,
  opposingTeamName,
  homeTeamName,
}) => {
  const [activeTeam, setActiveTeam] = useState<'real_madrid' | 'opposing'>('real_madrid');

  const assignPositionsToPlayers = (players: PlayerType[]) => {
    // Count how many players have each normalized position
    const positionCounts: Record<string, number> = {};
    players.forEach((p) => {
      const pos = normalizePosition(p.position);
      positionCounts[pos] = (positionCounts[pos] || 0) + 1;
    });

    // Track current index for each position
    const positionIndexes: Record<string, number> = {};

    return players.map((player) => {
      const pos = normalizePosition(player.position);
      const currentIndex = positionIndexes[pos] || 0;
      const total = positionCounts[pos] || 1;

      const coords = getPositionCoordinates(pos, currentIndex, total);
      positionIndexes[pos] = currentIndex + 1;

      return {
        ...player,
        position_x: coords.x,
        position_y: coords.y,
      };
    });
  };

  const renderFormation = (lineup: PlayerType[], subs: PlayerType[], teamName: string) => {
    const playersWithPositions = assignPositionsToPlayers(lineup);

    return (
      <div className="space-y-6">
        {/* Formation badge */}
        <div className="flex items-center justify-between">
          <Badge variant="default" className="text-lg px-3 py-1 bg-madrid-blue">
            {teamName}
          </Badge>
        </div>

        {/* Football pitch with players */}
        <div className="relative w-full overflow-x-auto">
          <div className="min-w-[320px]">
            <FootballPitch>
              {playersWithPositions.map((player, index) => (
                <PlayerOnField
                  key={`${player.id || player.name}-${index}`}
                  player={{
                    id: player.id || `player-${index}`,
                    player_name: player.name,
                    player_position: player.position,
                    jersey_number: player.number,
                    player_image_url: player.imageUrl,
                    player_rating: 0,
                  }}
                  style={{
                    left: `${player.position_x}%`,
                    top: `${player.position_y}%`,
                    zIndex: 10,
                  }}
                />
              ))}
            </FootballPitch>
          </div>
        </div>

        {/* Substitutes */}
        {subs.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-muted-foreground flex items-center gap-2 text-sm md:text-base">
              <Users className="h-4 w-4" />
              Remplaçants ({subs.length})
            </h4>
            <div className="flex flex-wrap gap-2 md:gap-3 p-3 md:p-4 bg-muted/50 rounded-lg">
              {subs.map((player, index) => (
                <div
                  key={`${player.id || player.name}-${index}`}
                  className="flex items-center gap-2 md:gap-3 bg-background p-2 rounded-lg border min-w-0 flex-shrink-0"
                >
                  {/* Player avatar */}
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-blue-600 flex-shrink-0 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    {player.imageUrl ? (
                      <img
                        src={player.imageUrl}
                        alt={player.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="text-xs font-bold text-primary-foreground">
                        {player.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    )}
                  </div>

                  {/* Number */}
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs md:text-sm font-bold text-white">
                      {player.number}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 hidden sm:block">
                    <p className="text-xs md:text-sm font-medium truncate">{player.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{player.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const isRealMadridHome = homeTeamName === 'Real Madrid';

  return (
    <div className="space-y-4">
      <Tabs value={activeTeam} onValueChange={(value) => setActiveTeam(value as 'real_madrid' | 'opposing')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="real_madrid" className="text-xs sm:text-sm">
            Real Madrid
          </TabsTrigger>
          <TabsTrigger value="opposing" className="text-xs sm:text-sm">
            {opposingTeamName}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="real_madrid" className="mt-6">
          {realMadridLineup.length > 0 ? (
            renderFormation(realMadridLineup, realMadridSubs, 'Real Madrid')
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune composition probable disponible pour Real Madrid</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="opposing" className="mt-6">
          {opposingLineup.length > 0 ? (
            renderFormation(opposingLineup, opposingSubs, opposingTeamName)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune composition probable disponible pour {opposingTeamName}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
