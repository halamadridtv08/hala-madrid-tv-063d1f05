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
}

export const SyncPlayerStatsFromMatches = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<SyncResult[]>([]);

  const extractPlayerStats = (matchDetails: any, players: PlayerData[], matchId: string) => {
    const statsMap: Map<string, {
      goals: number;
      assists: number;
      yellow_cards: number;
      red_cards: number;
      minutes_played: number;
    }> = new Map();

    // Initialize stats for all players
    players.forEach(player => {
      statsMap.set(player.id, {
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_cards: 0,
        minutes_played: 0
      });
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
            stats.minutes_played = 90;
          }
        }

        // Find assister
        const assistName = goal.assist;
        if (assistName) {
          const assister = findBestPlayerMatchSync(assistName, players);
          if (assister) {
            const stats = statsMap.get(assister.id)!;
            stats.assists += 1;
            stats.minutes_played = 90;
          }
        }
      }
    });

    // Process yellow cards from events
    const yellowCards = matchDetails?.events?.yellow_cards || matchDetails?.yellow_cards || [];
    yellowCards.forEach((card: any) => {
      if (card.team === 'real_madrid' || card.team === 'Real Madrid') {
        const playerName = card.player;
        if (playerName) {
          const player = findBestPlayerMatchSync(playerName, players);
          if (player) {
            const stats = statsMap.get(player.id)!;
            stats.yellow_cards += 1;
            stats.minutes_played = 90;
          }
        }
      }
    });

    // Process red cards from events
    const redCards = matchDetails?.events?.red_cards || matchDetails?.red_cards || [];
    redCards.forEach((card: any) => {
      if (card.team === 'real_madrid' || card.team === 'Real Madrid') {
        const playerName = card.player;
        if (playerName) {
          const player = findBestPlayerMatchSync(playerName, players);
          if (player) {
            const stats = statsMap.get(player.id)!;
            stats.red_cards += 1;
            stats.minutes_played = 90;
          }
        }
      }
    });

    // Process lineup to set minutes played
    const lineup = matchDetails?.lineup?.real_madrid || matchDetails?.real_madrid_lineup || [];
    lineup.forEach((playerEntry: any) => {
      const playerName = typeof playerEntry === 'string' ? playerEntry : playerEntry.name || playerEntry.player;
      if (playerName) {
        const player = findBestPlayerMatchSync(playerName, players);
        if (player) {
          const stats = statsMap.get(player.id)!;
          stats.minutes_played = 90;
        }
      }
    });

    // Process substitutions
    const substitutions = matchDetails?.substitutions || [];
    substitutions.forEach((sub: any) => {
      if (sub.team === 'real_madrid' || sub.team === 'Real Madrid') {
        // Player coming in
        const playerIn = findBestPlayerMatchSync(sub.in, players);
        if (playerIn) {
          const stats = statsMap.get(playerIn.id)!;
          stats.minutes_played = Math.max(stats.minutes_played, 90 - (sub.minute || 0));
        }

        // Player going out
        const playerOut = findBestPlayerMatchSync(sub.out, players);
        if (playerOut) {
          const stats = statsMap.get(playerOut.id)!;
          stats.minutes_played = sub.minute || 45;
        }
      }
    });

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

      // Fetch all active players
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, name, jersey_number')
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

          const statsMap = extractPlayerStats(matchDetails, players || [], match.id);
          let statsUpdated = 0;

          // Update or insert stats for each player who participated
          for (const [playerId, stats] of statsMap.entries()) {
            // Only update if player has some activity
            if (stats.goals > 0 || stats.assists > 0 || stats.yellow_cards > 0 || 
                stats.red_cards > 0 || stats.minutes_played > 0) {
              
              // Check if stats already exist for this player and match
              const { data: existingStats } = await supabase
                .from('player_stats')
                .select('id, goals, assists, yellow_cards, red_cards, minutes_played')
                .eq('player_id', playerId)
                .eq('match_id', match.id)
                .maybeSingle();

              if (existingStats) {
                // Update only if new data has more info
                const shouldUpdate = 
                  stats.goals > (existingStats.goals || 0) ||
                  stats.assists > (existingStats.assists || 0) ||
                  stats.yellow_cards > (existingStats.yellow_cards || 0) ||
                  stats.red_cards > (existingStats.red_cards || 0) ||
                  stats.minutes_played > (existingStats.minutes_played || 0);

                if (shouldUpdate) {
                  await supabase
                    .from('player_stats')
                    .update({
                      goals: Math.max(stats.goals, existingStats.goals || 0),
                      assists: Math.max(stats.assists, existingStats.assists || 0),
                      yellow_cards: Math.max(stats.yellow_cards, existingStats.yellow_cards || 0),
                      red_cards: Math.max(stats.red_cards, existingStats.red_cards || 0),
                      minutes_played: Math.max(stats.minutes_played, existingStats.minutes_played || 0),
                      updated_at: new Date().toISOString()
                    })
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
                    minutes_played: stats.minutes_played
                  });
                statsUpdated++;
              }
            }
          }

          allResults.push({
            matchId: match.id,
            matchInfo,
            status: 'success',
            message: `${statsUpdated} stats de joueurs mises à jour`,
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
      
      toast.success(`Synchronisation terminée: ${successCount}/${totalMatches} matchs traités, ${totalStats} stats mises à jour`);

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
          Cette fonction analyse tous les matchs avec des données JSON et met à jour automatiquement 
          les statistiques des joueurs (buts, passes décisives, cartons, minutes jouées).
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
