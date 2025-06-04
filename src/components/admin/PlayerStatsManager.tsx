
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface PlayerStat {
  id: string;
  player_id: string;
  match_id: string | null;
  goals: number;
  assists: number;
  minutes_played: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  clean_sheets: number;
  goals_conceded: number;
  passes_completed: number;
  pass_accuracy: number;
  tackles: number;
  interceptions: number;
}

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
}

interface PlayerStatsManagerProps {
  playerId: string;
  playerName: string;
}

export function PlayerStatsManager({ playerId, playerName }: PlayerStatsManagerProps) {
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    match_id: "",
    goals: 0,
    assists: 0,
    minutes_played: 0,
    yellow_cards: 0,
    red_cards: 0,
    saves: 0,
    clean_sheets: 0,
    goals_conceded: 0,
    passes_completed: 0,
    pass_accuracy: 0,
    tackles: 0,
    interceptions: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayerStats();
    fetchMatches();
  }, [playerId]);

  const fetchPlayerStats = async () => {
    try {
      const { data, error } = await supabase
        .from('player_stats')
        .select(`
          *,
          matches (
            id,
            home_team,
            away_team,
            match_date
          )
        `)
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStats(data || []);
    } catch (error) {
      console.error('Error fetching player stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id, home_team, away_team, match_date')
        .order('match_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('player_stats')
        .insert([{
          player_id: playerId,
          ...formData,
          match_id: formData.match_id || null
        }]);

      if (error) throw error;

      toast({
        title: "Statistiques ajoutées",
        description: "Les statistiques du joueur ont été ajoutées avec succès"
      });

      // Reset form
      setFormData({
        match_id: "",
        goals: 0,
        assists: 0,
        minutes_played: 0,
        yellow_cards: 0,
        red_cards: 0,
        saves: 0,
        clean_sheets: 0,
        goals_conceded: 0,
        passes_completed: 0,
        pass_accuracy: 0,
        tackles: 0,
        interceptions: 0
      });

      fetchPlayerStats();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  const deleteStat = async (statId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette statistique ?")) return;

    try {
      const { error } = await supabase
        .from('player_stats')
        .delete()
        .eq('id', statId);

      if (error) throw error;

      toast({
        title: "Statistique supprimée",
        description: "La statistique a été supprimée avec succès"
      });

      fetchPlayerStats();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message
      });
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter des statistiques pour {playerName}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="match">Match (optionnel)</Label>
                <Select value={formData.match_id} onValueChange={(value) => setFormData(prev => ({ ...prev, match_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un match" />
                  </SelectTrigger>
                  <SelectContent>
                    {matches.map((match) => (
                      <SelectItem key={match.id} value={match.id}>
                        {match.home_team} vs {match.away_team} - {new Date(match.match_date).toLocaleDateString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="minutes_played">Minutes jouées</Label>
                <Input
                  id="minutes_played"
                  type="number"
                  min="0"
                  max="120"
                  value={formData.minutes_played}
                  onChange={(e) => setFormData(prev => ({ ...prev, minutes_played: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="goals">Buts</Label>
                <Input
                  id="goals"
                  type="number"
                  min="0"
                  value={formData.goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, goals: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="assists">Passes décisives</Label>
                <Input
                  id="assists"
                  type="number"
                  min="0"
                  value={formData.assists}
                  onChange={(e) => setFormData(prev => ({ ...prev, assists: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="yellow_cards">Cartons jaunes</Label>
                <Input
                  id="yellow_cards"
                  type="number"
                  min="0"
                  value={formData.yellow_cards}
                  onChange={(e) => setFormData(prev => ({ ...prev, yellow_cards: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="red_cards">Cartons rouges</Label>
                <Input
                  id="red_cards"
                  type="number"
                  min="0"
                  value={formData.red_cards}
                  onChange={(e) => setFormData(prev => ({ ...prev, red_cards: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="passes_completed">Passes réussies</Label>
                <Input
                  id="passes_completed"
                  type="number"
                  min="0"
                  value={formData.passes_completed}
                  onChange={(e) => setFormData(prev => ({ ...prev, passes_completed: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="pass_accuracy">Précision des passes (%)</Label>
                <Input
                  id="pass_accuracy"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.pass_accuracy}
                  onChange={(e) => setFormData(prev => ({ ...prev, pass_accuracy: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="tackles">Tacles</Label>
                <Input
                  id="tackles"
                  type="number"
                  min="0"
                  value={formData.tackles}
                  onChange={(e) => setFormData(prev => ({ ...prev, tackles: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="interceptions">Interceptions</Label>
                <Input
                  id="interceptions"
                  type="number"
                  min="0"
                  value={formData.interceptions}
                  onChange={(e) => setFormData(prev => ({ ...prev, interceptions: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="saves">Arrêts (gardiens)</Label>
                <Input
                  id="saves"
                  type="number"
                  min="0"
                  value={formData.saves}
                  onChange={(e) => setFormData(prev => ({ ...prev, saves: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="clean_sheets">Clean sheets</Label>
                <Input
                  id="clean_sheets"
                  type="number"
                  min="0"
                  value={formData.clean_sheets}
                  onChange={(e) => setFormData(prev => ({ ...prev, clean_sheets: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter les statistiques
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques existantes</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune statistique enregistrée</p>
          ) : (
            <div className="space-y-4">
              {stats.map((stat) => (
                <div key={stat.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        {stat.match_id ? 
                          `Match du ${new Date((stat as any).matches?.match_date).toLocaleDateString()}` :
                          "Statistiques générales"
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        {stat.minutes_played} min jouées
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteStat(stat.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>Buts: {stat.goals}</div>
                    <div>Passes D.: {stat.assists}</div>
                    <div>Cartons J.: {stat.yellow_cards}</div>
                    <div>Cartons R.: {stat.red_cards}</div>
                    <div>Passes: {stat.passes_completed}</div>
                    <div>Précision: {stat.pass_accuracy}%</div>
                    <div>Tacles: {stat.tackles}</div>
                    <div>Interceptions: {stat.interceptions}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
