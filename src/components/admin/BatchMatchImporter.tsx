import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { normalizeCompetitionName } from "@/utils/competitionNormalizer";

interface BatchImportResult {
  matchName: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  playersUpdated?: number;
}

export const BatchMatchImporter = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BatchImportResult[]>([]);
  const [progress, setProgress] = useState(0);

  const handleBatchImport = async () => {
    if (!jsonInput.trim()) {
      toast.error("Veuillez coller un JSON");
      return;
    }

    setIsProcessing(true);
    setResults([]);
    setProgress(0);

    try {
      const data = JSON.parse(jsonInput);
      
      // Vérifier si c'est un tableau de matchs
      const matches = Array.isArray(data) ? data : [data];
      
      if (matches.length === 0) {
        toast.error("Aucun match trouvé dans le JSON");
        return;
      }

      // Initialiser les résultats
      const initialResults: BatchImportResult[] = matches.map((match, index) => ({
        matchName: `${match.match?.teams?.home || 'Match'} vs ${match.match?.teams?.away || index + 1}`,
        status: 'pending'
      }));
      setResults(initialResults);

      // Traiter chaque match
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        
        // Mettre à jour le statut
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'processing' } : r
        ));

        try {
          // Transformer le JSON avec normalisation
          const matchData = await transformMatchJson(match);
          
          // Chercher un match existant avec ces équipes et cette date
          const { data: existingMatch, error: findError } = await supabase
            .from('matches')
            .select('id')
            .eq('home_team', matchData.home_team)
            .eq('away_team', matchData.away_team)
            .gte('match_date', new Date(matchData.match_date).toISOString().split('T')[0])
            .lte('match_date', new Date(new Date(matchData.match_date).getTime() + 86400000).toISOString())
            .maybeSingle();

          let matchId: string;

          if (existingMatch) {
            // Mettre à jour le match existant
            const { data: updated, error: updateError } = await supabase
              .from('matches')
              .update(matchData)
              .eq('id', existingMatch.id)
              .select()
              .single();

            if (updateError) throw updateError;
            matchId = existingMatch.id;
          } else {
            // Créer un nouveau match
            const { data: created, error: createError } = await supabase
              .from('matches')
              .insert([matchData])
              .select()
              .single();

            if (createError) throw createError;
            matchId = created.id;
          }

          // Traiter les stats des joueurs
          const playersUpdated = await processPlayerStats(matchId, match);

          // Marquer comme succès
          setResults(prev => prev.map((r, idx) => 
            idx === i ? { ...r, status: 'success', playersUpdated } : r
          ));

        } catch (error: any) {
          console.error(`Erreur pour le match ${i + 1}:`, error);
          setResults(prev => prev.map((r, idx) => 
            idx === i ? { ...r, status: 'error', error: error.message } : r
          ));
        }

        // Mettre à jour la progression
        setProgress(((i + 1) / matches.length) * 100);
      }

      const successCount = results.filter(r => r.status === 'success').length;
      toast.success(`Import terminé: ${successCount}/${matches.length} matchs importés`);

    } catch (error: any) {
      console.error('Erreur lors de l\'import par lots:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const transformMatchJson = async (imported: any) => {
    const homeTeam = imported.match.teams.home;
    const awayTeam = imported.match.teams.away;
    
    // Normalize competition name
    const competitionRaw = imported.match.competition.replace(/_/g, ' ').toUpperCase();
    const normalizedCompetition = await normalizeCompetitionName(competitionRaw);
    
    return {
      home_team: homeTeam === "real_madrid" ? "Real Madrid" : homeTeam.charAt(0).toUpperCase() + homeTeam.slice(1),
      away_team: awayTeam === "real_madrid" ? "Real Madrid" : awayTeam.charAt(0).toUpperCase() + awayTeam.slice(1),
      home_score: imported.match.score[homeTeam] || 0,
      away_score: imported.match.score[awayTeam] || 0,
      match_date: `${imported.match.date}T${imported.match.time}:00Z`,
      venue: imported.match.venue,
      competition: normalizedCompetition,
      status: imported.match.status === "termine" ? "finished" : imported.match.status,
      match_details: {
        possession: imported.match.possession,
        goals: imported.events?.goals,
        cards: imported.events?.cards,
        substitutions: imported.events?.substitutions,
        fouls: imported.events?.fouls,
        statistics: imported.statistics
      }
    };
  };

  const processPlayerStats = async (matchId: string, matchJson: any): Promise<number> => {
    const playerStatsMap = new Map<string, any>();

    // Traiter les buts
    if (matchJson.events?.goals) {
      for (const goal of matchJson.events.goals) {
        const scorerName = goal.scorer || goal.player;
        if (!scorerName) continue;

        const { data: playerData } = await supabase
          .from('players')
          .select('id')
          .ilike('name', `%${scorerName.replace(/_/g, ' ')}%`)
          .maybeSingle();

        if (playerData) {
          if (!playerStatsMap.has(playerData.id)) {
            playerStatsMap.set(playerData.id, {
              player_id: playerData.id,
              match_id: matchId,
              goals: 0,
              assists: 0,
              yellow_cards: 0,
              red_cards: 0,
              minutes_played: 90
            });
          }
          playerStatsMap.get(playerData.id).goals++;
        }
      }
    }

    // Sauvegarder les stats
    for (const [playerId, stats] of playerStatsMap.entries()) {
      await supabase
        .from('player_stats')
        .upsert(stats, { onConflict: 'player_id,match_id' });
    }

    return playerStatsMap.size;
  };

  const exampleBatchJson = [
    {
      match: {
        date: "2025-11-04",
        time: "20:00",
        teams: { home: "liverpool", away: "real_madrid" },
        score: { liverpool: 1, real_madrid: 0 },
        competition: "uefa_champions_league",
        venue: "Anfield",
        status: "termine"
      },
      events: {
        goals: [{ team: "liverpool", minute: 61, scorer: "a_mac_allister" }]
      }
    },
    {
      match: {
        date: "2025-11-10",
        time: "21:00",
        teams: { home: "real_madrid", away: "barcelona" },
        score: { real_madrid: 2, barcelona: 1 },
        competition: "la_liga",
        venue: "Santiago Bernabéu",
        status: "termine"
      },
      events: {
        goals: [
          { team: "real_madrid", minute: 35, scorer: "vinicius_jr" },
          { team: "real_madrid", minute: 78, scorer: "bellingham" }
        ]
      }
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>📦 Import par lots de matchs</CardTitle>
        <CardDescription>
          Importez plusieurs matchs en une seule fois avec un tableau JSON
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Coller un tableau JSON de matchs</label>
          <Textarea
            placeholder="Collez votre tableau JSON ici..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={12}
            className="font-mono text-sm"
            disabled={isProcessing}
          />
        </div>

        <Button 
          onClick={handleBatchImport}
          disabled={!jsonInput.trim() || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Import en cours...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Importer tous les matchs
            </>
          )}
        </Button>

        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              {Math.round(progress)}% complété
            </p>
          </div>
        )}

        {results.length > 0 && (
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    {result.status === 'pending' && (
                      <div className="h-5 w-5 rounded-full bg-gray-200" />
                    )}
                    {result.status === 'processing' && (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    )}
                    {result.status === 'success' && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {result.status === 'error' && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{result.matchName}</p>
                      {result.error && (
                        <p className="text-xs text-red-500">{result.error}</p>
                      )}
                      {result.playersUpdated !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          {result.playersUpdated} joueurs mis à jour
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={
                      result.status === 'success' ? 'default' :
                      result.status === 'error' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
            Voir un exemple de JSON par lots
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
            {JSON.stringify(exampleBatchJson, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};
