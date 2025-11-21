import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { History, Undo2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ImportHistoryEntry {
  id: string;
  match_id: string;
  imported_at: string;
  json_data: any;
  previous_match_data: any;
  previous_stats_data: any;
  players_updated: number;
  stats_summary: any;
  matches?: {
    home_team: string;
    away_team: string;
    match_date: string;
  };
}

export const MatchImportHistory = () => {
  const [history, setHistory] = useState<ImportHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rollbackId, setRollbackId] = useState<string | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('match_import_history')
        .select(`
          *,
          matches (
            home_team,
            away_team,
            match_date
          )
        `)
        .order('imported_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      toast.error("Erreur lors du chargement de l'historique");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollback = async (entry: ImportHistoryEntry) => {
    setIsRollingBack(true);
    try {
      // 1. Restaurer les données du match
      const { error: matchError } = await supabase
        .from('matches')
        .update(entry.previous_match_data)
        .eq('id', entry.match_id);

      if (matchError) throw matchError;

      // 2. Supprimer les stats ajoutées lors de cet import
      if (entry.previous_stats_data) {
        // Supprimer toutes les stats de ce match
        const { error: deleteError } = await supabase
          .from('player_stats')
          .delete()
          .eq('match_id', entry.match_id);

        if (deleteError) throw deleteError;

        // Restaurer les anciennes stats si elles existaient
        if (entry.previous_stats_data.length > 0) {
          const { error: insertError } = await supabase
            .from('player_stats')
            .insert(entry.previous_stats_data);

          if (insertError) throw insertError;
        }
      }

      // 3. Supprimer cette entrée d'historique
      const { error: historyError } = await supabase
        .from('match_import_history')
        .delete()
        .eq('id', entry.id);

      if (historyError) throw historyError;

      toast.success("Import annulé avec succès!");
      loadHistory();
    } catch (error: any) {
      console.error('Erreur lors du rollback:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsRollingBack(false);
      setRollbackId(null);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('match_import_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Entrée d'historique supprimée");
      loadHistory();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Chargement de l'historique...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>Historique des imports</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <Alert>
              <AlertDescription>
                Aucun import n'a encore été effectué.
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">
                          {entry.matches?.home_team} vs {entry.matches?.away_team}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.imported_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRollbackId(entry.id)}
                          disabled={isRollingBack}
                        >
                          <Undo2 className="h-4 w-4 mr-1" />
                          Annuler
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteHistory(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        {entry.players_updated} joueur{entry.players_updated > 1 ? 's' : ''} mis à jour
                      </Badge>
                      {entry.stats_summary?.goals > 0 && (
                        <Badge variant="outline">
                          ⚽ {entry.stats_summary.goals}
                        </Badge>
                      )}
                      {entry.stats_summary?.assists > 0 && (
                        <Badge variant="outline">
                          🎯 {entry.stats_summary.assists}
                        </Badge>
                      )}
                      {entry.stats_summary?.yellow_cards > 0 && (
                        <Badge variant="outline">
                          🟨 {entry.stats_summary.yellow_cards}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!rollbackId} onOpenChange={() => setRollbackId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action va restaurer le match et les statistiques des joueurs à leur état avant cet import.
              Cette opération ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const entry = history.find((h) => h.id === rollbackId);
                if (entry) handleRollback(entry);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
