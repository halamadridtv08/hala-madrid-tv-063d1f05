import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FootballPitch } from '@/components/admin/formation/FootballPitch';
import { PlayerOnField } from './PlayerOnField';
import { Users } from 'lucide-react';

interface PlayerType {
  name: string;
  position: string;
  number: number;
}

interface ProbableLineupFormationProps {
  realMadridLineup: PlayerType[];
  realMadridSubs: PlayerType[];
  opposingLineup: PlayerType[];
  opposingSubs: PlayerType[];
  opposingTeamName: string;
  homeTeamName: string;
}

// Default positions for 4-3-3 formation
const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  'GK': { x: 50, y: 90 },
  'LB': { x: 15, y: 72 },
  'CB_L': { x: 35, y: 75 },
  'CB_R': { x: 65, y: 75 },
  'RB': { x: 85, y: 72 },
  'CDM': { x: 50, y: 60 },
  'CM_L': { x: 30, y: 50 },
  'CM_R': { x: 70, y: 50 },
  'LW': { x: 20, y: 30 },
  'ST': { x: 50, y: 20 },
  'RW': { x: 80, y: 30 },
};

// Map positions to field coordinates
const getPositionCoordinates = (position: string, index: number): { x: number; y: number } => {
  const positionMap: Record<string, { x: number; y: number }> = {
    'GK': { x: 50, y: 90 },
    'LB': { x: 15, y: 72 },
    'CB': { x: index % 2 === 0 ? 35 : 65, y: 75 },
    'RB': { x: 85, y: 72 },
    'CDM': { x: 50, y: 60 },
    'CM': { x: 30 + (index % 3) * 20, y: 50 },
    'CAM': { x: 50, y: 42 },
    'LM': { x: 20, y: 50 },
    'RM': { x: 80, y: 50 },
    'LW': { x: 20, y: 28 },
    'RW': { x: 80, y: 28 },
    'ST': { x: 50, y: 18 },
    'CF': { x: 50, y: 25 },
  };

  return positionMap[position] || { x: 50, y: 50 };
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
    // Count positions for proper distribution
    const positionCounts: Record<string, number> = {};
    
    return players.map((player) => {
      const pos = player.position;
      positionCounts[pos] = (positionCounts[pos] || 0);
      const coords = getPositionCoordinates(pos, positionCounts[pos]);
      positionCounts[pos]++;
      
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
                  key={`${player.name}-${index}`}
                  player={{
                    id: `player-${index}`,
                    player_name: player.name,
                    player_position: player.position,
                    jersey_number: player.number,
                    player_image_url: undefined,
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
                  key={`${player.name}-${index}`}
                  className="flex items-center gap-2 md:gap-3 bg-background p-2 rounded-lg border min-w-0 flex-shrink-0"
                >
                  {/* Player initials */}
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-blue-600 flex-shrink-0 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">
                      {player.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
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
