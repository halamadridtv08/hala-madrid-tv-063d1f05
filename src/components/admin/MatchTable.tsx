
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/Match";
import { MatchForm } from "./MatchForm";
import { MatchJsonImporter } from "./MatchJsonImporter";
import { Plus, Edit, Trash2, Calendar, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMatchApiData } from "@/hooks/useMatchApiData";

interface MatchTableProps {
  matches: Match[];
  setMatches: (matches: Match[]) => void;
}

const MatchTable = ({ matches, setMatches }: MatchTableProps) => {
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | undefined>(undefined);
  const [syncingMatchId, setSyncingMatchId] = useState<string | null>(null);
  const { findApiFixtureForMatch, syncMatchFromApi, syncing } = useMatchApiData();
  // Trier les matchs par date (plus récent en premier)
  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      const dateA = new Date(a.match_date).getTime();
      const dateB = new Date(b.match_date).getTime();
      return dateB - dateA;
    });
  }, [matches]);

  const refreshMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Erreur lors du rechargement des matchs:', error);
      toast.error("Erreur lors du rechargement des matchs");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce match ?")) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMatches(matches.filter(match => match.id !== id));
      toast.success("Match supprimé avec succès");
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error("Erreur lors de la suppression du match");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="secondary">À venir</Badge>;
      case 'live':
        return <Badge variant="destructive">En cours</Badge>;
      case 'finished':
        return <Badge variant="default">Terminé</Badge>;
      case 'postponed':
        return <Badge variant="outline">Reporté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddMatch = () => {
    setEditingMatch(undefined);
    setIsFormOpen(true);
  };

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingMatch(undefined);
    refreshMatches();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingMatch(undefined);
  };

  const handleViewDetails = (match: Match) => {
    toast.info(`Détails du match ${match.home_team} vs ${match.away_team}`);
    console.log("Affichage des détails du match:", match);
  };

  const handleSyncMatch = async (match: Match) => {
    setSyncingMatchId(match.id);
    try {
      // First try to find the API fixture ID
      const fixtureId = await findApiFixtureForMatch(
        match.home_team,
        match.away_team,
        match.match_date
      );

      if (!fixtureId) {
        toast.error("Impossible de trouver ce match dans l'API Football");
        return;
      }

      const success = await syncMatchFromApi(match.id, fixtureId);
      if (success) {
        refreshMatches();
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error("Erreur lors de la synchronisation");
    } finally {
      setSyncingMatchId(null);
    }
  };

  const handleSyncAllRecent = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://qjnppcfbywfazwolfppo.supabase.co/functions/v1/sync-match-details'
      );
      const result = await response.json();
      
      if (result.success) {
        if (result.synced > 0) {
          toast.success(`${result.synced} match(s) synchronisé(s) sur ${result.checked} vérifiés`);
        } else if (result.needsSync === 0) {
          const msg = result.skippedFuture > 0
            ? `Tous les matchs passés sont synchronisés ! (${result.skippedFuture} matchs futurs ignorés)`
            : "Tous les matchs sont déjà synchronisés !";
          toast.info(msg);
        } else {
          toast.warning(
            `Aucune correspondance API trouvée pour les ${result.needsSync} matchs à synchroniser.`
          );
        }
        if (result.errors && result.errors.length > 0) {
          console.log('Sync errors:', result.errors);
        }
        refreshMatches();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Sync all error:', error);
      toast.error("Erreur lors de la synchronisation automatique");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="space-y-6">
        <MatchJsonImporter />
        
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <CardTitle>Matchs ({matches.length})</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSyncAllRecent} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Sync API
                </Button>
                <Button onClick={handleAddMatch}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau match
                </Button>
              </div>
            </div>
          </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedMatches.map((match) => (
              <div key={match.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm sm:text-base">
                    {match.home_team} vs {match.away_team}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {new Date(match.match_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                    {getStatusBadge(match.status)}
                    {match.competition && <Badge variant="outline" className="text-xs">{match.competition}</Badge>}
                    {match.venue && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">{match.venue}</span>
                    )}
                    {match.status === 'finished' && (
                      <span className="text-xs sm:text-sm font-medium">
                        {match.home_score} - {match.away_score}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 justify-end sm:justify-start">
                  {match.status === 'finished' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSyncMatch(match)}
                      disabled={syncingMatchId === match.id || syncing}
                      title="Synchroniser depuis l'API"
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                    >
                      {syncingMatchId === match.id ? (
                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(match)}
                    title="Voir les détails"
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                  >
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditMatch(match)}
                    title="Modifier le match"
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                  >
                    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(match.id)}
                    disabled={loading}
                    title="Supprimer le match"
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {sortedMatches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun match trouvé
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMatch ? "Modifier le match" : "Nouveau match"}
            </DialogTitle>
          </DialogHeader>
          <MatchForm
            match={editingMatch}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MatchTable;
