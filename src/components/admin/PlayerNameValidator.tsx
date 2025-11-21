import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PlayerNameMatch {
  originalName: string;
  suggestions: Array<{
    id: string;
    name: string;
    position: string;
    similarity: number;
  }>;
  selectedId?: string;
  isConfirmed: boolean;
}

interface PlayerNameValidatorProps {
  playerNames: string[];
  onValidationComplete: (mapping: Record<string, string>) => void;
}

export const PlayerNameValidator = ({ playerNames, onValidationComplete }: PlayerNameValidatorProps) => {
  const [matches, setMatches] = useState<PlayerNameMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);

  useEffect(() => {
    loadPlayersAndValidate();
  }, [playerNames]);

  const loadPlayersAndValidate = async () => {
    try {
      setIsLoading(true);
      
      // Charger tous les joueurs
      const { data: players, error } = await supabase
        .from('players')
        .select('id, name, position')
        .eq('is_active', true);

      if (error) throw error;
      setAllPlayers(players || []);

      // Analyser chaque nom
      const nameMatches: PlayerNameMatch[] = [];
      
      for (const originalName of playerNames) {
        const cleanName = originalName.replace(/_/g, ' ').toLowerCase();
        
        // Chercher des correspondances
        const suggestions = (players || [])
          .map(player => ({
            ...player,
            similarity: calculateSimilarity(cleanName, player.name.toLowerCase())
          }))
          .filter(p => p.similarity > 0.4) // Seuil de similarité
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 5);

        // Auto-confirmer si une correspondance exacte ou très proche existe
        const bestMatch = suggestions[0];
        const isAutoConfirmed = bestMatch && bestMatch.similarity > 0.85;

        nameMatches.push({
          originalName,
          suggestions,
          selectedId: isAutoConfirmed ? bestMatch.id : undefined,
          isConfirmed: isAutoConfirmed
        });
      }

      setMatches(nameMatches);
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    // Levenshtein distance simplifiée + bonus pour mots communs
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    
    let commonWords = 0;
    for (const word1 of words1) {
      if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
        commonWords++;
      }
    }

    const wordScore = commonWords / Math.max(words1.length, words2.length);
    
    // Score basé sur la distance de Levenshtein
    const distance = levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    const distanceScore = 1 - (distance / maxLength);
    
    // Combinaison des scores
    return (wordScore * 0.6) + (distanceScore * 0.4);
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  const handleSelectPlayer = (originalName: string, playerId: string) => {
    setMatches(prev => prev.map(m => 
      m.originalName === originalName 
        ? { ...m, selectedId: playerId, isConfirmed: true }
        : m
    ));
  };

  const handleManualSearch = (originalName: string, searchTerm: string) => {
    const cleanSearch = searchTerm.toLowerCase();
    const filtered = allPlayers
      .filter(p => p.name.toLowerCase().includes(cleanSearch))
      .map(p => ({ ...p, similarity: 1 }))
      .slice(0, 5);

    setMatches(prev => prev.map(m => 
      m.originalName === originalName 
        ? { ...m, suggestions: filtered }
        : m
    ));
  };

  const handleConfirmAll = () => {
    const mapping: Record<string, string> = {};
    
    for (const match of matches) {
      if (match.selectedId) {
        mapping[match.originalName] = match.selectedId;
      }
    }

    onValidationComplete(mapping);
  };

  const unconfirmedCount = matches.filter(m => !m.isConfirmed).length;
  const allConfirmed = matches.length > 0 && unconfirmedCount === 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Validation des noms en cours...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🔍 Validation des joueurs</span>
          <Badge variant={allConfirmed ? "default" : "secondary"}>
            {matches.length - unconfirmedCount}/{matches.length} confirmés
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {unconfirmedCount > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {unconfirmedCount} joueur(s) nécessite(nt) une validation manuelle
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {matches.map((match, index) => (
              <Card key={index} className={match.isConfirmed ? "border-green-500" : "border-orange-500"}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{match.originalName}</p>
                      <p className="text-sm text-muted-foreground">Nom du JSON</p>
                    </div>
                    {match.isConfirmed && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Confirmé
                      </Badge>
                    )}
                  </div>

                  {!match.isConfirmed && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Rechercher un joueur..."
                        onChange={(e) => handleManualSearch(match.originalName, e.target.value)}
                      />
                      <Button variant="outline" size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {match.suggestions.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Suggestions:</p>
                      {match.suggestions.map(suggestion => (
                        <div
                          key={suggestion.id}
                          className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer hover:bg-accent ${
                            match.selectedId === suggestion.id ? 'bg-primary/10 border-primary' : ''
                          }`}
                          onClick={() => handleSelectPlayer(match.originalName, suggestion.id)}
                        >
                          <div>
                            <p className="font-medium text-sm">{suggestion.name}</p>
                            <p className="text-xs text-muted-foreground">{suggestion.position}</p>
                          </div>
                          <Badge variant="outline">
                            {Math.round(suggestion.similarity * 100)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Aucun joueur trouvé. Vérifiez l'orthographe ou ajoutez ce joueur à la base.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <Button 
          onClick={handleConfirmAll}
          disabled={!allConfirmed}
          className="w-full"
        >
          Confirmer et continuer ({matches.length - unconfirmedCount}/{matches.length})
        </Button>
      </CardContent>
    </Card>
  );
};
