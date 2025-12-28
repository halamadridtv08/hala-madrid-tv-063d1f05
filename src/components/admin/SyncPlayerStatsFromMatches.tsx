import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { findBestPlayerMatchSync } from '@/utils/playerNameMatcher';

interface SyncResult {
  matchId: string;
  matchInfo: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
  statsUpdated: number;
}

interface PlayerData {
  id: string;
  name: string;
  jersey_number: number | null;
  position: string;
}

interface PlayerStats {
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  minutes_played: number;
  clean_sheets: number;
  goals_conceded: number;
  saves: number;
  isGoalkeeper: boolean;
  wasStarter: boolean;
  subMinuteIn: number | null;
  subMinuteOut: number | null;
}

const isGoalkeeperPosition = (position: string): boolean => {
  const lowerPos = position.toLowerCase();
  return lowerPos.includes('gardien') || 
         lowerPos.includes('goal') || 
         lowerPos.includes('gk') || 
         lowerPos === 'portero' ||
         lowerPos.includes('keeper');
};

export const SyncPlayerStatsFromMatches = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<SyncResult[]>([]);

  const extractPlayerStats = (
    matchDetails: any, 
    players: PlayerData[], 
    homeScore: number | null,
    awayScore: number | null,
    homeTeam: string,
    awayTeam: string
  ) => {
    const statsMap: Map<string, PlayerStats> = new Map();
    const starterIds = new Set<string>();
    const substitutedOutIds = new Set<string>();
    const substitutedInIds = new Map<string, number>(); // playerId -> minute in
    const substitutedOutMinutes = new Map<string, number>(); // playerId -> minute out

    // Initialize stats for all players
    players.forEach(player => {
      statsMap.set(player.id, {
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_cards: 0,
        minutes_played: 0,
        clean_sheets: 0,
        goals_conceded: 0,
        saves: 0,
        isGoalkeeper: isGoalkeeperPosition(player.position),
        wasStarter: false,
        subMinuteIn: null,
        subMinuteOut: null
      });
    });

    // Determine if Real Madrid is home or away
    const isRealMadridHome = homeTeam.toLowerCase().includes('real madrid');
    const realMadridGoalsConceded = isRealMadridHome ? (awayScore || 0) : (homeScore || 0);

    // Process lineup to identify starters
    const lineup = matchDetails?.lineup?.real_madrid || matchDetails?.real_madrid_lineup || [];
    lineup.forEach((playerEntry: any) => {
      const playerName = typeof playerEntry === 'string' ? playerEntry : playerEntry.name || playerEntry.player;
      if (playerName) {
        const player = findBestPlayerMatchSync(playerName, players);
        if (player) {
          starterIds.add(player.id);
          const stats = statsMap.get(player.id)!;
          stats.wasStarter = true;
          stats.minutes_played = 90; // Default, will be adjusted for substitutions
        }
      }
    });

    // Process substitutions
    const substitutions = matchDetails?.substitutions || [];
    substitutions.forEach((sub: any) => {
      if (sub.team === 'real_madrid' || sub.team === 'Real Madrid') {
        const minute = sub.minute || 45;

        // Player coming in (substitute)
        const playerInName = sub.in || sub.player_in;
        if (playerInName) {
          const playerIn = findBestPlayerMatchSync(playerInName, players);
          if (playerIn) {
            substitutedInIds.set(playerIn.id, minute);
            const stats = statsMap.get(playerIn.id)!;
            stats.subMinuteIn = minute;
            stats.minutes_played = 90 - minute; // Minutes from sub to end
          }
        }

        // Player going out (substituted)
        const playerOutName = sub.out || sub.player_out;
        if (playerOutName) {
          const playerOut = findBestPlayerMatchSync(playerOutName, players);
          if (playerOut) {
            substitutedOutIds.add(playerOut.id);
            substitutedOutMinutes.set(playerOut.id, minute);
            const stats = statsMap.get(playerOut.id)!;
            stats.subMinuteOut = minute;
            stats.minutes_played = minute; // Played until minute of substitution
          }
        }
      }
    });

    // Adjust minutes for starters who weren't substituted
    starterIds.forEach(playerId => {
      if (!substitutedOutIds.has(playerId)) {
        const stats = statsMap.get(playerId)!;
        stats.minutes_played = 90;
      }
    });

    // Process goals
    const goals = matchDetails?.goals || [];
    goals.forEach((goal: any) => {
      if (goal.team === 'real_madrid' || goal.team === 'Real Madrid') {
        // Find scorer
        const scorerName = goal.scorer || goal.player;
        if (scorerName) {
          const scorer = findBestPlayerMatchSync(scorerName, players);
          if (scorer) {
            const stats = statsMap.get(scorer.id)!;
            stats.goals += 1;
            // Ensure they have minutes if they scored
            if (stats.minutes_played === 0) {
              stats.minutes_played = 90;
            }
          }
        }

        // Find assister
        const assistName = goal.assist;
        if (assistName) {
          const assister = findBestPlayerMatchSync(assistName, players);
          if (assister) {
            const stats = statsMap.get(assister.id)!;
            stats.assists += 1;
            if (stats.minutes_played === 0) {
              stats.minutes_played = 90;
            }
          }
        }
      }
    });

    // Process yellow cards from events
    const yellowCards = matchDetails?.events?.yellow_cards || matchDetails?.yellow_cards || matchDetails?.cards?.yellow?.real_madrid || [];
    const processYellowCards = (cardList: any) => {
      if (Array.isArray(cardList)) {
        cardList.forEach((card: any) => {
          let playerName: string | null = null;
          if (typeof card === 'string') {
            // Parse "player_name (minute')" format
            const match = card.match(/^([^(]+)/);
            if (match) playerName = match[1].trim().replace(/_/g, ' ');
          } else if (card.player) {
            playerName = card.player;
          }
          
          if (playerName) {
            const player = findBestPlayerMatchSync(playerName, players);
            if (player) {
              const stats = statsMap.get(player.id)!;
              stats.yellow_cards += 1;
              if (stats.minutes_played === 0) {
                stats.minutes_played = 90;
              }
            }
          }
        });
      }
    };
    processYellowCards(yellowCards);

    // Process red cards from events
    const redCards = matchDetails?.events?.red_cards || matchDetails?.red_cards || matchDetails?.cards?.red?.real_madrid || [];
    const processRedCards = (cardList: any) => {
      if (Array.isArray(cardList)) {
        cardList.forEach((card: any) => {
          let playerName: string | null = null;
          if (typeof card === 'string') {
            const match = card.match(/^([^(]+)/);
            if (match) playerName = match[1].trim().replace(/_/g, ' ');
          } else if (card.player) {
            playerName = card.player;
          }
          
          if (playerName) {
            const player = findBestPlayerMatchSync(playerName, players);
            if (player) {
              const stats = statsMap.get(player.id)!;
              stats.red_cards += 1;
              if (stats.minutes_played === 0) {
                stats.minutes_played = 90;
              }
            }
          }
        });
      }
    };
    processRedCards(redCards);

    // Process goalkeeper saves
    const goalkeeperSaves = matchDetails?.goalkeeper_saves?.real_madrid || 
                           matchDetails?.statistics?.goalkeeper_saves?.real_madrid || 0;

    // Calculate goalkeeper stats (clean sheets, goals conceded, saves)
    for (const [playerId, stats] of statsMap.entries()) {
      if (stats.isGoalkeeper && stats.minutes_played > 0) {
        // Check if goalkeeper kept a clean sheet (no goals conceded while playing)
        if (realMadridGoalsConceded === 0) {
          stats.clean_sheets = 1;
          stats.goals_conceded = 0;
        } else {
          stats.clean_sheets = 0;
          // Attribute goals to goalkeeper based on when they were on field
          // For simplicity, if they played full match, they get all goals conceded
          // If substituted, we'd need goal timing data (not always available)
          if (stats.wasStarter && !substitutedOutIds.has(playerId)) {
            stats.goals_conceded = realMadridGoalsConceded;
          } else if (stats.wasStarter && substitutedOutIds.has(playerId)) {
            // Was substituted - could have conceded some goals
            stats.goals_conceded = Math.min(realMadridGoalsConceded, 
              Math.ceil(realMadridGoalsConceded * (stats.minutes_played / 90)));
          } else if (substitutedInIds.has(playerId)) {
            // Came on as sub
            stats.goals_conceded = Math.min(realMadridGoalsConceded,
              Math.ceil(realMadridGoalsConceded * (stats.minutes_played / 90)));
          }
        }
        
        // Distribute saves to playing goalkeeper(s)
        if (typeof goalkeeperSaves === 'number' && goalkeeperSaves > 0) {
          stats.saves = goalkeeperSaves;
        }
      }
    }

    return statsMap;
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setProgress(0);
    setResults([]);

    try {
      // Fetch all matches with details
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id, home_team, away_team, match_date, home_score, away_score, match_details')
        .not('match_details', 'is', null)
        .order('match_date', { ascending: false });

      if (matchesError) throw matchesError;

      // Fetch all active players with position
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, name, jersey_number, position')
        .eq('is_active', true);

      if (playersError) throw playersError;

      const allResults: SyncResult[] = [];
      const totalMatches = matches?.length || 0;

      for (let i = 0; i < totalMatches; i++) {
        const match = matches![i];
        const matchInfo = `${match.home_team} vs ${match.away_team} (${new Date(match.match_date).toLocaleDateString('fr-FR')})`;

        try {
          const matchDetails = typeof match.match_details === 'string' 
            ? JSON.parse(match.match_details) 
            : match.match_details;

          if (!matchDetails || Object.keys(matchDetails).length === 0) {
            allResults.push({
              matchId: match.id,
              matchInfo,
              status: 'skipped',
              message: 'Pas de détails dans le JSON',
              statsUpdated: 0
            });
            continue;
          }

          const statsMap = extractPlayerStats(
            matchDetails, 
            players || [], 
            match.home_score,
            match.away_score,
            match.home_team,
            match.away_team
          );
          let statsUpdated = 0;

          // Update or insert stats for each player who participated
          for (const [playerId, stats] of statsMap.entries()) {
            // Only update if player has some activity
            if (stats.goals > 0 || stats.assists > 0 || stats.yellow_cards > 0 || 
                stats.red_cards > 0 || stats.minutes_played > 0 || 
                stats.clean_sheets > 0 || stats.saves > 0) {
              
              // Check if stats already exist for this player and match
              const { data: existingStats } = await supabase
                .from('player_stats')
                .select('id, goals, assists, yellow_cards, red_cards, minutes_played, clean_sheets, goals_conceded, saves')
                .eq('player_id', playerId)
                .eq('match_id', match.id)
                .maybeSingle();

              if (existingStats) {
                // Update with new/better data
                const updateData: Record<string, any> = {
                  updated_at: new Date().toISOString()
                };
                
                // Always update these if we have better values
                if (stats.goals > (existingStats.goals || 0)) updateData.goals = stats.goals;
                if (stats.assists > (existingStats.assists || 0)) updateData.assists = stats.assists;
                if (stats.yellow_cards > (existingStats.yellow_cards || 0)) updateData.yellow_cards = stats.yellow_cards;
                if (stats.red_cards > (existingStats.red_cards || 0)) updateData.red_cards = stats.red_cards;
                if (stats.minutes_played > (existingStats.minutes_played || 0)) updateData.minutes_played = stats.minutes_played;
                if (stats.clean_sheets > (existingStats.clean_sheets || 0)) updateData.clean_sheets = stats.clean_sheets;
                if (stats.goals_conceded !== undefined) updateData.goals_conceded = stats.goals_conceded;
                if (stats.saves > (existingStats.saves || 0)) updateData.saves = stats.saves;

                if (Object.keys(updateData).length > 1) { // More than just updated_at
                  await supabase
                    .from('player_stats')
                    .update(updateData)
                    .eq('id', existingStats.id);
                  statsUpdated++;
                }
              } else {
                // Insert new stats
                await supabase
                  .from('player_stats')
                  .insert({
                    player_id: playerId,
                    match_id: match.id,
                    goals: stats.goals,
                    assists: stats.assists,
                    yellow_cards: stats.yellow_cards,
                    red_cards: stats.red_cards,
                    minutes_played: stats.minutes_played,
                    clean_sheets: stats.clean_sheets,
                    goals_conceded: stats.goals_conceded,
                    saves: stats.saves
                  });
                statsUpdated++;
              }
            }
          }

          allResults.push({
            matchId: match.id,
            matchInfo,
            status: 'success',
            message: `${statsUpdated} stats mises à jour`,
            statsUpdated
          });

        } catch (error) {
          console.error(`Error processing match ${match.id}:`, error);
          allResults.push({
            matchId: match.id,
            matchInfo,
            status: 'error',
            message: error instanceof Error ? error.message : 'Erreur inconnue',
            statsUpdated: 0
          });
        }

        setProgress(((i + 1) / totalMatches) * 100);
        setResults([...allResults]);
      }

      const successCount = allResults.filter(r => r.status === 'success').length;
      const totalStats = allResults.reduce((sum, r) => sum + r.statsUpdated, 0);
      
      toast.success(`Synchronisation terminée: ${successCount}/${totalMatches} matchs, ${totalStats} stats mises à jour`);

    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Synchroniser les stats depuis les matchs passés
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Analyse tous les matchs avec des données JSON et met à jour les statistiques des joueurs:
          buts, passes, cartons, <strong>minutes jouées</strong> (avec remplacements), 
          <strong>clean sheets</strong>, <strong>buts encaissés</strong> et <strong>arrêts</strong> pour les gardiens.
        </p>

        <Button 
          onClick={handleSync} 
          disabled={isSyncing}
          className="w-full"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Synchronisation en cours...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Lancer la synchronisation
            </>
          )}
        </Button>

        {isSyncing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              {Math.round(progress)}% complété
            </p>
          </div>
        )}

        {results.length > 0 && (
          <ScrollArea className="h-64 border rounded-lg p-3">
            <div className="space-y-2">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {result.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                    {result.status === 'skipped' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    <span className="truncate max-w-[200px]">{result.matchInfo}</span>
                  </div>
                  <Badge variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}>
                    {result.message}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
