import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileJson, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MatchJsonData {
  id?: string;
  home_team: string;
  away_team: string;
  home_team_logo?: string;
  away_team_logo?: string;
  home_score?: number;
  away_score?: number;
  match_date: string;
  venue?: string;
  competition?: string;
  status?: string;
  match_details?: any;
}

interface ImportedMatchJson {
  match: {
    date: string;
    time: string;
    round?: string;
    score: {
      [team: string]: number;
    };
    teams: {
      away: string;
      home: string;
    };
    season?: string;
    status: string;
    possession?: {
      [team: string]: string;
    };
    competition: string;
    venue?: string;
  };
  events?: {
    cards?: {
      red: { [team: string]: number };
      yellow: { [team: string]: number };
    };
    fouls?: Array<{ team: string; minute: number; player: string }>;
    goals?: Array<{ team: string; minute: number; scorer: string }>;
    substitutions?: Array<{ in: string; out: string; team: string; minute: number }>;
  };
  statistics?: {
    fouls?: { [team: string]: number };
    shots?: any;
    passes?: any;
    corners?: { [team: string]: number };
    tackles?: { [team: string]: number };
    offsides?: { [team: string]: number };
    goalkeeper_saves?: { [team: string]: number };
  };
}

export const MatchJsonImporter = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [parsedData, setParsedData] = useState<MatchJsonData | null>(null);

  const transformImportedJson = (imported: ImportedMatchJson): MatchJsonData => {
    const homeTeam = imported.match.teams.home;
    const awayTeam = imported.match.teams.away;
    
    return {
      home_team: homeTeam === "real_madrid" ? "Real Madrid" : homeTeam.charAt(0).toUpperCase() + homeTeam.slice(1),
      away_team: awayTeam === "real_madrid" ? "Real Madrid" : awayTeam.charAt(0).toUpperCase() + awayTeam.slice(1),
      home_score: imported.match.score[homeTeam] || 0,
      away_score: imported.match.score[awayTeam] || 0,
      match_date: `${imported.match.date}T${imported.match.time}:00Z`,
      venue: imported.match.venue,
      competition: imported.match.competition.replace(/_/g, ' ').toUpperCase(),
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

  const validateJson = (input: string): boolean => {
    try {
      const data = JSON.parse(input);
      
      // Check if it's the new format
      if (data.match && data.match.teams) {
        const transformed = transformImportedJson(data as ImportedMatchJson);
        setParsedData(transformed);
        setValidationStatus("valid");
        return true;
      }
      
      // Check if it's the old format
      if (!data.home_team || !data.away_team || !data.match_date) {
        toast.error("Format JSON invalide. Vérifiez la structure.");
        return false;
      }

      setParsedData(data);
      setValidationStatus("valid");
      return true;
    } catch (error) {
      setValidationStatus("invalid");
      toast.error("JSON invalide");
      return false;
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    setValidationStatus("idle");
    setParsedData(null);
  };

  const handleValidate = () => {
    if (!jsonInput.trim()) {
      toast.error("Veuillez coller un JSON");
      return;
    }
    validateJson(jsonInput);
  };

  const handleImport = async () => {
    if (!parsedData) {
      toast.error("Veuillez d'abord valider le JSON");
      return;
    }

    setIsProcessing(true);

    try {
      const matchData = {
        home_team: parsedData.home_team,
        away_team: parsedData.away_team,
        home_team_logo: parsedData.home_team_logo,
        away_team_logo: parsedData.away_team_logo,
        home_score: parsedData.home_score || 0,
        away_score: parsedData.away_score || 0,
        match_date: parsedData.match_date,
        venue: parsedData.venue,
        competition: parsedData.competition,
        status: parsedData.status || 'finished',
        match_details: parsedData.match_details || {}
      };

      let result;
      
      if (parsedData.id) {
        // Mise à jour d'un match existant
        result = await supabase
          .from('matches')
          .update(matchData)
          .eq('id', parsedData.id)
          .select();
      } else {
        // Création d'un nouveau match
        result = await supabase
          .from('matches')
          .insert([matchData])
          .select();
      }

      if (result.error) {
        throw result.error;
      }

      const matchId = result.data[0].id;

      // Mise à jour des statistiques des joueurs si fournies
      if (parsedData.match_details?.goals) {
        for (const goal of parsedData.match_details.goals) {
          const playerName = goal.scorer || goal.player;
          if (!playerName) continue;

          // Trouver le joueur par nom
          const { data: playerData } = await supabase
            .from('players')
            .select('id')
            .ilike('name', `%${playerName.replace(/_/g, ' ')}%`)
            .maybeSingle();

          if (playerData) {
            // Récupérer les stats existantes
            const { data: existingStats } = await supabase
              .from('player_stats')
              .select('*')
              .eq('player_id', playerData.id)
              .eq('match_id', matchId)
              .maybeSingle();

            if (existingStats) {
              // Incrémenter les buts
              await supabase
                .from('player_stats')
                .update({ goals: (existingStats.goals || 0) + 1 })
                .eq('id', existingStats.id);
            } else {
              // Créer une nouvelle entrée de stats
              await supabase
                .from('player_stats')
                .insert([{
                  player_id: playerData.id,
                  match_id: matchId,
                  goals: 1
                }]);
            }
          }
        }
      }

      toast.success(
        parsedData.id 
          ? "Match mis à jour avec succès!" 
          : "Match créé avec succès!"
      );
      
      setJsonInput("");
      setParsedData(null);
      setValidationStatus("idle");
      
    } catch (error: any) {
      console.error('Erreur import:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const exampleJson = {
    match: {
      date: "2025-11-04",
      time: "20:00",
      round: "ronde_4",
      score: {
        liverpool: 1,
        real_madrid: 0
      },
      teams: {
        away: "real_madrid",
        home: "liverpool"
      },
      season: "2025-2026",
      status: "termine",
      possession: {
        liverpool: "38%",
        real_madrid: "62%"
      },
      competition: "uefa_champions_league",
      venue: "Anfield"
    },
    events: {
      cards: {
        red: { liverpool: 0, real_madrid: 0 },
        yellow: { liverpool: 1, real_madrid: 4 }
      },
      goals: [
        { team: "liverpool", minute: 61, scorer: "a_mac_allister" }
      ],
      substitutions: [
        { in: "e_camavinga", out: "rodrygo", team: "real_madrid", minute: 69 }
      ]
    },
    statistics: {
      shots: {
        total: { liverpool: 17, real_madrid: 8 },
        on_target: { liverpool: 2, real_madrid: 5 }
      },
      passes: {
        liverpool: { total: 332, accuracy: "77%", completed: 257 },
        real_madrid: { total: 531, accuracy: "86%", completed: 460 }
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileJson className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Importateur JSON de Match</CardTitle>
            <CardDescription>
              Collez un fichier JSON pour créer ou mettre à jour un match
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {validationStatus === "valid" && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              JSON valide! Prêt à importer.
            </AlertDescription>
          </Alert>
        )}

        {validationStatus === "invalid" && (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              JSON invalide. Vérifiez le format.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Données JSON du match</label>
          <Textarea
            placeholder="Collez votre JSON ici..."
            value={jsonInput}
            onChange={(e) => handleJsonChange(e.target.value)}
            rows={15}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleValidate}
            variant="outline"
            disabled={!jsonInput.trim()}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Valider JSON
          </Button>
          
          <Button 
            onClick={handleImport}
            disabled={validationStatus !== "valid" || isProcessing}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isProcessing ? "Import en cours..." : "Importer"}
          </Button>
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
            Voir un exemple de JSON
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
            {JSON.stringify(exampleJson, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};
