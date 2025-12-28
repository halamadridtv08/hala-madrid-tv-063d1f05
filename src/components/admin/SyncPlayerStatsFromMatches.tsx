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

  // Fetch starters from match_formation_players table
  const getStartersFromFormation = async (matchId: string): Promise<Map<string, { isStarter: boolean; position: string }>> => {
    const startersMap = new Map<string, { isStarter: boolean; position: string }>();
    
    // Get formation for this match
    const { data: formations } = await supabase
      .from('match_formations')
      .select('id')
      .eq('match_id', matchId)
      .eq('team_type', 'real_madrid');

    if (!formations || formations.length === 0) return startersMap;

    // Get players in formation
    const formationIds = formations.map(f => f.id);
    const { data: formationPlayers } = await supabase
      .from('match_formation_players')
      .select('player_id, player_name, is_starter, player_position')
      .in('formation_id', formationIds);

    if (formationPlayers) {
      formationPlayers.forEach(fp => {
        if (fp.player_id) {
          startersMap.set(fp.player_id, {
            isStarter: fp.is_starter === true,
            position: fp.player_position
          });
        }
      });
    }

    return startersMap;
  };

  const extractPlayerStats = async (
    matchDetails: any, 
    players: PlayerData[], 
    homeScore: number | null,
    awayScore: number | null,
    homeTeam: string,
    awayTeam: string,
    matchId: string
  ) => {
    const statsMap: Map<string, PlayerStats> = new Map();
    const substitutedOutMinutes = new Map<string, number>(); // playerId -> minute out
    const substitutedInMinutes = new Map<string, number>(); // playerId -> minute in

    // Get starters from formation table
    const formationData = await getStartersFromFormation(matchId);

    // Initialize stats for all players
    players.forEach(player => {
      const formationInfo = formationData.get(player.id);
      const wasStarter = formationInfo?.isStarter === true;
      
      statsMap.set(player.id, {
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_cards: 0,
        minutes_played: 0, // Will be calculated based on participation
        clean_sheets: 0,
        goals_conceded: 0,
        saves: 0,
        isGoalkeeper: isGoalkeeperPosition(formationInfo?.position || player.position),
        wasStarter,
        subMinuteIn: null,
        subMinuteOut: null
      });

      // If starter, set initial minutes to 90 (will be adjusted for subs)
      if (wasStarter) {
        const stats = statsMap.get(player.id)!;
        stats.minutes_played = 90;
      }
    });

    // Determine if Real Madrid is home or away
    const isRealMadridHome = homeTeam.toLowerCase().includes('real madrid');
    const realMadridGoalsConceded = isRealMadridHome ? (awayScore || 0) : (homeScore || 0);

    // Process substitutions from JSON
    const substitutions = matchDetails?.substitutions || [];
    substitutions.forEach((sub: any) => {
      const team = (sub.team || '').toLowerCase().replace(/[_\s]/g, '');
      if (team === 'realmadrid') {
        const minute = parseInt(sub.minute) || 45;

        // Player coming in (substitute)
        const playerInName = sub.in || sub.player_in;
        if (playerInName) {
          const playerIn = findBestPlayerMatchSync(playerInName, players);
          if (playerIn) {
            substitutedInMinutes.set(playerIn.id, minute);
            const stats = statsMap.get(playerIn.id)!;
            stats.subMinuteIn = minute;
            // Substitute plays from their entry minute to 90
            stats.minutes_played = 90 - minute;
          }
        }

        // Player going out (substituted)
        const playerOutName = sub.out || sub.player_out;
        if (playerOutName) {
          const playerOut = findBestPlayerMatchSync(playerOutName, players);
          if (playerOut) {
            substitutedOutMinutes.set(playerOut.id, minute);
            const stats = statsMap.get(playerOut.id)!;
            stats.subMinuteOut = minute;
            // Starter who was substituted plays from 0 to sub minute
            if (stats.wasStarter) {
              stats.minutes_played = minute;
            }
          }
        }
      }
    });

    // Process goals
    const goals = matchDetails?.goals || [];
    goals.forEach((goal: any) => {
      const team = (goal.team || '').toLowerCase().replace(/[_\s]/g, '');
      if (team === 'realmadrid') {
        const scorerName = goal.scorer || goal.player;
        if (scorerName) {
          const scorer = findBestPlayerMatchSync(scorerName, players);
          if (scorer) {
            const stats = statsMap.get(scorer.id)!;
            stats.goals += 1;
            // If they scored but have 0 minutes, they must have played
            if (stats.minutes_played === 0) {
              stats.minutes_played = 90;
              stats.wasStarter = true;
            }
          }
        }

        const assistName = goal.assist;
        if (assistName) {
          const assister = findBestPlayerMatchSync(assistName, players);
          if (assister) {
            const stats = statsMap.get(assister.id)!;
            stats.assists += 1;
            if (stats.minutes_played === 0) {
              stats.minutes_played = 90;
              stats.wasStarter = true;
            }
          }
        }
      }
    });

    // Process yellow cards
    const yellowCards = matchDetails?.cards?.yellow?.real_madrid || 
                       matchDetails?.events?.yellow_cards || 
                       matchDetails?.yellow_cards || [];
    
    const processCards = (cardList: any, isRed: boolean) => {
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
              if (isRed) {
                stats.red_cards += 1;
              } else {
                stats.yellow_cards += 1;
              }
              if (stats.minutes_played === 0) {
                stats.minutes_played = 90;
                stats.wasStarter = true;
              }
            }
          }
        });
      }
    };
    
    processCards(yellowCards, false);

    // Process red cards
    const redCards = matchDetails?.cards?.red?.real_madrid || 
                    matchDetails?.events?.red_cards || 
                    matchDetails?.red_cards || [];
    processCards(redCards, true);

    // Process goalkeeper saves from JSON
    const goalkeeperSaves = matchDetails?.goalkeeper_saves?.real_madrid || 
                           matchDetails?.statistics?.goalkeeper_saves?.real_madrid || 0;

    // Calculate goalkeeper-specific stats
    for (const [playerId, stats] of statsMap.entries()) {
      if (stats.isGoalkeeper && stats.minutes_played > 0) {
        // Clean sheet: no goals conceded while goalkeeper was playing
        if (realMadridGoalsConceded === 0) {
          stats.clean_sheets = 1;
          stats.goals_conceded = 0;
        } else {
          stats.clean_sheets = 0;
          
          // Calculate goals conceded based on time on field
          // Need to check if goals were scored while this keeper was playing
          const goalTimings = goals
            .filter((g: any) => {
              const team = (g.team || '').toLowerCase().replace(/[_\s]/g, '');
              return team !== 'realmadrid'; // Opposition goals
            })
            .map((g: any) => parseInt(g.minute) || 0);

          let goalsWhilePlaying = 0;
          const subIn = stats.subMinuteIn;
          const subOut = stats.subMinuteOut;

          goalTimings.forEach((goalMinute: number) => {
            if (stats.wasStarter) {
              // Starter: played from 0 to subOut (or 90 if not subbed)
              const endMinute = subOut !== null ? subOut : 90;
              if (goalMinute >= 0 && goalMinute <= endMinute) {
                goalsWhilePlaying++;
              }
            } else if (subIn !== null) {
              // Substitute: played from subIn to 90
              if (goalMinute >= subIn && goalMinute <= 90) {
                goalsWhilePlaying++;
              }
            }
          });

          stats.goals_conceded = goalsWhilePlaying > 0 ? goalsWhilePlaying : realMadridGoalsConceded;
        }
        
        // Distribute saves to playing goalkeeper(s) proportionally
        if (typeof goalkeeperSaves === 'number' && goalkeeperSaves > 0) {
          // If only one GK played full match, they get all saves
          // Otherwise distribute based on minutes
          stats.saves = Math.round(goalkeeperSaves * (stats.minutes_played / 90));
          if (stats.saves === 0 && goalkeeperSaves > 0 && stats.minutes_played > 0) {
            stats.saves = goalkeeperSaves; // Give all to the main keeper
          }
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

          const statsMap = await extractPlayerStats(
            matchDetails, 
            players || [], 
            match.home_score,
            match.away_score,
            match.home_team,
            match.away_team,
            match.id
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
