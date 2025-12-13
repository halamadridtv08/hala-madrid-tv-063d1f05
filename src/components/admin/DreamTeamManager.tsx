import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Trash2, Eye, Users, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DreamTeam {
  id: string;
  team_name: string;
  formation: string;
  players: any[];
  total_budget_used: number;
  likes_count: number;
  user_id: string | null;
  share_token: string | null;
  created_at: string;
}

export function DreamTeamManager() {
  const [dreamTeams, setDreamTeams] = useState<DreamTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeams: 0,
    avgBudget: 0,
    mostPopularFormation: ""
  });

  const fetchDreamTeams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dream_teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des Dream Teams");
      console.error(error);
    } else {
      const teams = (data || []) as DreamTeam[];
      setDreamTeams(teams);
      
      // Calculate stats
      if (teams.length > 0) {
        const avgBudget = teams.reduce((acc, t) => acc + (t.total_budget_used || 0), 0) / teams.length;
        const formationCounts: Record<string, number> = {};
        teams.forEach(t => {
          formationCounts[t.formation] = (formationCounts[t.formation] || 0) + 1;
        });
        const mostPopular = Object.entries(formationCounts).sort((a, b) => b[1] - a[1])[0];
        
        setStats({
          totalTeams: teams.length,
          avgBudget: Math.round(avgBudget),
          mostPopularFormation: mostPopular ? mostPopular[0] : "N/A"
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDreamTeams();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette Dream Team ?")) return;

    const { error } = await supabase.from("dream_teams").delete().eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Dream Team supprimée");
      fetchDreamTeams();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Dream Teams</p>
              <p className="text-2xl font-bold">{stats.totalTeams}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget moyen utilisé</p>
              <p className="text-2xl font-bold">{stats.avgBudget}M€</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <Eye className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Formation populaire</p>
              <p className="text-2xl font-bold">{stats.mostPopularFormation}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dream Teams Table */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les Dream Teams ({dreamTeams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {dreamTeams.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune Dream Team créée pour le moment
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Formation</TableHead>
                  <TableHead>Joueurs</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dreamTeams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.team_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{team.formation}</Badge>
                    </TableCell>
                    <TableCell>{team.players?.length || 0} joueurs</TableCell>
                    <TableCell>{team.total_budget_used || 0}M€</TableCell>
                    <TableCell>{team.likes_count || 0}</TableCell>
                    <TableCell>
                      {format(new Date(team.created_at), "dd MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {team.share_token && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/dream-team/${team.share_token}`
                              );
                              toast.success("Lien copié !");
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(team.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
