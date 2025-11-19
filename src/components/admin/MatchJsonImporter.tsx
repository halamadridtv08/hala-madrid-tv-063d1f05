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
  match_details?: {
    stadium?: string;
    attendance?: number;
    referee?: string;
    weather?: string;
    goals?: Array<{
      player: string;
      minute: number;
      team: string;
      type?: string;
    }>;
    cards?: Array<{
      player: string;
      minute: number;
      team: string;
      type: "yellow" | "red";
    }>;
    substitutions?: Array<{
      player_in: string;
      player_out: string;
      minute: number;
      team: string;
    }>;
    possession?: {
      home: number;
      away: number;
    };
    shots?: {
      home: { total: number; on_target: number };
      away: { total: number; on_target: number };
    };
    passes?: {
      home: { total: number; accuracy: number };
      away: { total: number; accuracy: number };
    };
  };
}

export const MatchJsonImporter = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [parsedData, setParsedData] = useState<MatchJsonData | null>(null);

  const validateJson = (input: string): boolean => {
    try {
      const data = JSON.parse(input);
      
      // Vérification des champs requis
      if (!data.home_team || !data.away_team || !data.match_date) {
        toast.error("Champs requis manquants: home_team, away_team, match_date");
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
          // Trouver le joueur par nom
          const { data: playerData } = await supabase
            .from('players')
            .select('id')
            .ilike('name', `%${goal.player}%`)
            .single();

          if (playerData) {
            // Récupérer les stats existantes
            const { data: existingStats } = await supabase
              .from('player_stats')
              .select('*')
              .eq('player_id', playerData.id)
              .eq('match_id', matchId)
              .single();

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
    id: "uuid-du-match-si-mise-a-jour",
    home_team: "Real Madrid",
    away_team: "FC Barcelona",
    home_team_logo: "https://example.com/real-madrid-logo.png",
    away_team_logo: "https://example.com/barcelona-logo.png",
    home_score: 3,
    away_score: 2,
    match_date: "2024-03-15T20:00:00Z",
    venue: "Santiago Bernabéu",
    competition: "La Liga",
    status: "finished",
    match_details: {
      stadium: "Santiago Bernabéu",
      attendance: 78000,
      referee: "Antonio Mateu Lahoz",
      goals: [
        { player: "Vinicius Jr", minute: 12, team: "Real Madrid", type: "open_play" },
        { player: "Jude Bellingham", minute: 35, team: "Real Madrid" },
        { player: "Robert Lewandowski", minute: 48, team: "Barcelona" }
      ],
      cards: [
        { player: "Gavi", minute: 65, team: "Barcelona", type: "yellow" }
      ],
      possession: { home: 58, away: 42 },
      shots: {
        home: { total: 15, on_target: 8 },
        away: { total: 12, on_target: 5 }
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
