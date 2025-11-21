import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RefreshCw, Check } from "lucide-react";

export const CompetitionNormalizer = () => {
  const [isNormalizing, setIsNormalizing] = useState(false);

  const normalizeCompetitions = async () => {
    setIsNormalizing(true);
    try {
      // Normaliser UEFA Champions League
      const { error: championsError } = await supabase
        .from('matches')
        .update({ competition: 'UEFA Champions League' })
        .in('competition', ['Champions League', 'UEFA CHAMPIONS LEAGUE']);

      if (championsError) throw championsError;

      // Normaliser La Liga
      const { error: ligaError } = await supabase
        .from('matches')
        .update({ competition: 'La Liga' })
        .eq('competition', 'LALIGA');

      if (ligaError) throw ligaError;

      toast.success("Noms de compétitions normalisés avec succès !");
    } catch (error) {
      console.error('Erreur lors de la normalisation:', error);
      toast.error("Erreur lors de la normalisation des compétitions");
    } finally {
      setIsNormalizing(false);
    }
  };

  return (
    <Card className="border-yellow-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <RefreshCw className="h-4 w-4" />
          Normalisation des Compétitions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Standardise les noms de compétitions dans la base de données :
          </p>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• "Champions League" / "UEFA CHAMPIONS LEAGUE" → "UEFA Champions League"</li>
            <li>• "LALIGA" → "La Liga"</li>
          </ul>
          <Button 
            onClick={normalizeCompetitions} 
            disabled={isNormalizing}
            size="sm"
            className="w-full"
          >
            {isNormalizing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Normalisation en cours...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Normaliser les compétitions
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
