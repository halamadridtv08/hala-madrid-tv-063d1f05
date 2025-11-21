import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, RefreshCw, Wand2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Inconsistency {
  type: 'competition' | 'team' | 'player';
  originalValue: string;
  suggestedValue: string;
  count: number;
  affectedIds: string[];
}

export const DataInconsistencyDetector = () => {
  const [inconsistencies, setInconsistencies] = useState<Inconsistency[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const scanForInconsistencies = async () => {
    setIsScanning(true);
    const foundIssues: Inconsistency[] = [];

    try {
      // Check competitions
      const { data: matches } = await supabase
        .from('matches')
        .select('id, competition');

      if (matches) {
        const competitionGroups = new Map<string, { ids: string[], original: string }>();
        
        for (const match of matches) {
          if (!match.competition) continue;
          
          const normalized = match.competition.toLowerCase().trim();
          if (!competitionGroups.has(normalized)) {
            competitionGroups.set(normalized, { ids: [], original: match.competition });
          }
          competitionGroups.get(normalized)!.ids.push(match.id);
        }

        // Get canonical names
        const { data: aliases } = await supabase
          .from('competition_aliases')
          .select('canonical_name, aliases')
          .eq('is_active', true);

        for (const [normalized, group] of competitionGroups.entries()) {
          const alias = aliases?.find(a => 
            a.canonical_name.toLowerCase() === normalized ||
            a.aliases.some((al: string) => al.toLowerCase() === normalized)
          );

          if (alias && alias.canonical_name !== group.original) {
            foundIssues.push({
              type: 'competition',
              originalValue: group.original,
              suggestedValue: alias.canonical_name,
              count: group.ids.length,
              affectedIds: group.ids
            });
          }
        }
      }

      // Check team names (home/away teams)
      const { data: allMatches } = await supabase
        .from('matches')
        .select('id, home_team, away_team');

      if (allMatches) {
        const teamVariants = new Map<string, Set<string>>();
        
        for (const match of allMatches) {
          [match.home_team, match.away_team].forEach(team => {
            if (!team) return;
            const normalized = team.toLowerCase().trim();
            if (!teamVariants.has(normalized)) {
              teamVariants.set(normalized, new Set());
            }
            teamVariants.get(normalized)!.add(team);
          });
        }

        // Find teams with multiple variants
        for (const [normalized, variants] of teamVariants.entries()) {
          if (variants.size > 1) {
            const mostCommon = Array.from(variants).sort((a, b) => {
              const countA = allMatches.filter(m => 
                m.home_team === a || m.away_team === a
              ).length;
              const countB = allMatches.filter(m => 
                m.home_team === b || m.away_team === b
              ).length;
              return countB - countA;
            })[0];

            for (const variant of variants) {
              if (variant !== mostCommon) {
                const affected = allMatches
                  .filter(m => m.home_team === variant || m.away_team === variant)
                  .map(m => m.id);

                if (affected.length > 0) {
                  foundIssues.push({
                    type: 'team',
                    originalValue: variant,
                    suggestedValue: mostCommon,
                    count: affected.length,
                    affectedIds: affected
                  });
                }
              }
            }
          }
        }
      }

      setInconsistencies(foundIssues);
      
      if (foundIssues.length === 0) {
        toast.success("Aucune incohérence détectée !");
      } else {
        toast.info(`${foundIssues.length} incohérence(s) détectée(s)`);
      }
    } catch (error) {
      console.error('Error scanning:', error);
      toast.error("Erreur lors de l'analyse");
    } finally {
      setIsScanning(false);
    }
  };

  const fixInconsistency = async (issue: Inconsistency) => {
    setIsFixing(true);
    try {
      if (issue.type === 'competition') {
        const { error } = await supabase
          .from('matches')
          .update({ competition: issue.suggestedValue })
          .in('id', issue.affectedIds);

        if (error) throw error;
      } else if (issue.type === 'team') {
        for (const id of issue.affectedIds) {
          const { data: match } = await supabase
            .from('matches')
            .select('home_team, away_team')
            .eq('id', id)
            .single();

          if (!match) continue;

          const updates: any = {};
          if (match.home_team === issue.originalValue) {
            updates.home_team = issue.suggestedValue;
          }
          if (match.away_team === issue.originalValue) {
            updates.away_team = issue.suggestedValue;
          }

          if (Object.keys(updates).length > 0) {
            await supabase
              .from('matches')
              .update(updates)
              .eq('id', id);
          }
        }
      }

      toast.success("Incohérence corrigée avec succès");
      setInconsistencies(prev => prev.filter(i => i !== issue));
    } catch (error) {
      console.error('Error fixing inconsistency:', error);
      toast.error("Erreur lors de la correction");
    } finally {
      setIsFixing(false);
    }
  };

  const fixAllInconsistencies = async () => {
    if (!confirm(`Voulez-vous corriger toutes les ${inconsistencies.length} incohérences détectées ?`)) {
      return;
    }

    setIsFixing(true);
    let fixed = 0;
    let errors = 0;

    for (const issue of inconsistencies) {
      try {
        await fixInconsistency(issue);
        fixed++;
      } catch (error) {
        errors++;
      }
    }

    if (errors === 0) {
      toast.success(`Toutes les incohérences ont été corrigées (${fixed})`);
    } else {
      toast.warning(`${fixed} corrigées, ${errors} erreurs`);
    }
    
    setIsFixing(false);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'competition': return 'Compétition';
      case 'team': return 'Équipe';
      case 'player': return 'Joueur';
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'competition': return 'default';
      case 'team': return 'secondary';
      case 'player': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Détecteur d'Incohérences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              Cet outil analyse les données pour détecter les incohérences dans les noms de compétitions,
              équipes et joueurs. Il suggère des corrections basées sur les alias configurés et les variantes
              les plus courantes.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              onClick={scanForInconsistencies}
              disabled={isScanning}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Analyse en cours...' : 'Analyser les données'}
            </Button>

            {inconsistencies.length > 0 && (
              <Button
                onClick={fixAllInconsistencies}
                disabled={isFixing}
                variant="default"
                className="flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Tout corriger ({inconsistencies.length})
              </Button>
            )}
          </div>

          {inconsistencies.length === 0 && !isScanning && (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>Aucune incohérence détectée</p>
              <p className="text-sm">Cliquez sur "Analyser" pour vérifier les données</p>
            </div>
          )}

          {inconsistencies.length > 0 && (
            <div className="space-y-3">
              {inconsistencies.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-4 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getTypeBadgeColor(issue.type)}>
                          {getTypeLabel(issue.type)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {issue.count} occurrence(s)
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-destructive line-through">
                            {issue.originalValue}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-sm font-medium text-green-600">
                            {issue.suggestedValue}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => fixInconsistency(issue)}
                      disabled={isFixing}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Wand2 className="h-4 w-4" />
                      Corriger
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
