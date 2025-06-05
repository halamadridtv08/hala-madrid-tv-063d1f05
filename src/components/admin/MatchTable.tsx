
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/Match";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface MatchTableProps {
  matches: Match[];
  setMatches: (matches: Match[]) => void;
}

const MatchTable = ({ matches, setMatches }: MatchTableProps) => {
  const [loading, setLoading] = useState(false);

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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddMatch = () => {
    toast.info("Formulaire d'ajout de match - À implémenter");
    console.log("Redirection vers le formulaire d'ajout de match");
  };

  const handleEditMatch = (match: Match) => {
    toast.info(`Modification du match ${match.home_team} vs ${match.away_team} - À implémenter`);
    console.log("Redirection vers le formulaire de modification:", match);
  };

  const handleViewDetails = (match: Match) => {
    toast.info(`Détails du match ${match.home_team} vs ${match.away_team}`);
    console.log("Affichage des détails du match:", match);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Matchs ({matches.length})</CardTitle>
          <Button onClick={handleAddMatch}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau match
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="flex items-center justify-between p-4 border rounded">
              <div className="flex-1">
                <h3 className="font-semibold">
                  {match.home_team} vs {match.away_team}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(match.match_date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(match.status)}
                  {match.competition && <Badge variant="outline">{match.competition}</Badge>}
                  {match.venue && (
                    <span className="text-xs text-gray-500">{match.venue}</span>
                  )}
                  {match.status === 'finished' && (
                    <span className="text-sm font-medium">
                      {match.home_score} - {match.away_score}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetails(match)}
                  title="Voir les détails"
                >
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditMatch(match)}
                  title="Modifier le match"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(match.id)}
                  disabled={loading}
                  title="Supprimer le match"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {matches.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun match trouvé
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchTable;
