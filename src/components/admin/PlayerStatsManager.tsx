
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Pencil, Save, X } from "lucide-react";

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
  const [editingStat, setEditingStat] = useState<PlayerStat | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
  const [editFormData, setEditFormData] = useState({
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
        .select('id, home_team, away_team, match_date, match_details')
        .order('match_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  // Auto-remplir les stats depuis les données du match sélectionné
  const handleMatchSelect = async (matchId: string) => {
    setFormData(prev => ({ ...prev, match_id: matchId }));
    
    if (!matchId) return;
    
    const selectedMatch = matches.find(m => m.id === matchId) as any;
    if (!selectedMatch?.match_details) return;
    
    const details = selectedMatch.match_details;
    let goals = 0;
    let assists = 0;
    let yellowCards = 0;
    let redCards = 0;
    let minutesPlayed = 90;
    
    // Chercher dans les buts
    const matchGoals = details.goals || details.raw?.events?.goals || [];
    for (const goal of matchGoals) {
      const scorerName = (goal.scorer || goal.player || '').toLowerCase();
      if (playerName.toLowerCase().includes(scorerName) || scorerName.includes(playerName.toLowerCase().split(' ')[0])) {
        goals++;
      }
      const assistName = (goal.assist || '').toLowerCase();
      if (playerName.toLowerCase().includes(assistName) || assistName.includes(playerName.toLowerCase().split(' ')[0])) {
        assists++;
      }
    }
    
    // Chercher dans les cartons
    const cards = details.cards || {};
    const checkCards = (cardList: any, type: 'yellow' | 'red') => {
      if (!cardList) return 0;
      let count = 0;
      for (const [team, teamCards] of Object.entries(cardList)) {
        if (Array.isArray(teamCards)) {
          for (const card of teamCards) {
            const cardPlayerName = typeof card === 'string' ? card : (card as any).player || '';
            const cleanName = String(cardPlayerName).replace(/\s*\([^)]*\)/g, '').toLowerCase();
            if (playerName.toLowerCase().includes(cleanName) || cleanName.includes(playerName.toLowerCase().split(' ')[0])) {
              count++;
            }
          }
        }
      }
      return count;
    };
    
    yellowCards = checkCards(cards.yellow, 'yellow');
    redCards = checkCards(cards.red, 'red');
    
    // Chercher dans les substitutions
    const subs = details.substitutions || details.raw?.events?.substitutions || [];
    for (const sub of subs) {
      const outName = (sub.out || sub.player_out || '').toLowerCase();
      const inName = (sub.in || sub.player_in || '').toLowerCase();
      const pName = playerName.toLowerCase();
      const firstName = pName.split(' ')[0];
      
      if (pName.includes(outName) || outName.includes(firstName)) {
        minutesPlayed = sub.minute || 90;
      }
      if (pName.includes(inName) || inName.includes(firstName)) {
        minutesPlayed = 90 - (sub.minute || 0);
      }
    }
    
    // Mettre à jour le formulaire avec les données trouvées
    setFormData(prev => ({
      ...prev,
      match_id: matchId,
      goals,
      assists,
      yellow_cards: yellowCards,
      red_cards: redCards,
      minutes_played: minutesPlayed
    }));
    
    if (goals > 0 || assists > 0 || yellowCards > 0) {
      toast({
        title: "Données pré-remplies",
        description: `${goals} but(s), ${assists} passe(s) décisive(s) trouvés pour ${playerName}`
      });
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

  const openEditDialog = (stat: PlayerStat) => {
    setEditingStat(stat);
    setEditFormData({
      goals: stat.goals || 0,
      assists: stat.assists || 0,
      minutes_played: stat.minutes_played || 0,
      yellow_cards: stat.yellow_cards || 0,
      red_cards: stat.red_cards || 0,
      saves: stat.saves || 0,
      clean_sheets: stat.clean_sheets || 0,
      goals_conceded: stat.goals_conceded || 0,
      passes_completed: stat.passes_completed || 0,
      pass_accuracy: stat.pass_accuracy || 0,
      tackles: stat.tackles || 0,
      interceptions: stat.interceptions || 0
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStat = async () => {
    if (!editingStat) return;

    try {
      const { error } = await supabase
        .from('player_stats')
        .update(editFormData)
        .eq('id', editingStat.id);

      if (error) throw error;

      toast({
        title: "Statistiques mises à jour",
        description: "Les modifications ont été enregistrées avec succès"
      });

      setIsEditDialogOpen(false);
      setEditingStat(null);
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
                <Select value={formData.match_id} onValueChange={handleMatchSelect}>
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
            <p className="text-muted-foreground text-center py-4">Aucune statistique enregistrée</p>
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
                      <p className="text-sm text-muted-foreground">
                        {stat.minutes_played} min jouées
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEditDialog(stat)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-500/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteStat(stat.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier les statistiques</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
            <div>
              <Label htmlFor="edit_minutes_played">Minutes jouées</Label>
              <Input
                id="edit_minutes_played"
                type="number"
                min="0"
                max="120"
                value={editFormData.minutes_played}
                onChange={(e) => setEditFormData(prev => ({ ...prev, minutes_played: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="edit_goals">Buts</Label>
              <Input
                id="edit_goals"
                type="number"
                min="0"
                value={editFormData.goals}
                onChange={(e) => setEditFormData(prev => ({ ...prev, goals: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="edit_assists">Passes décisives</Label>
              <Input
                id="edit_assists"
                type="number"
                min="0"
                value={editFormData.assists}
                onChange={(e) => setEditFormData(prev => ({ ...prev, assists: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="edit_yellow_cards">Cartons jaunes</Label>
              <Input
                id="edit_yellow_cards"
                type="number"
                min="0"
                value={editFormData.yellow_cards}
                onChange={(e) => setEditFormData(prev => ({ ...prev, yellow_cards: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="edit_red_cards">Cartons rouges</Label>
              <Input
                id="edit_red_cards"
                type="number"
                min="0"
                value={editFormData.red_cards}
                onChange={(e) => setEditFormData(prev => ({ ...prev, red_cards: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="edit_passes_completed">Passes réussies</Label>
              <Input
                id="edit_passes_completed"
                type="number"
                min="0"
                value={editFormData.passes_completed}
                onChange={(e) => setEditFormData(prev => ({ ...prev, passes_completed: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="edit_pass_accuracy">Précision (%)</Label>
              <Input
                id="edit_pass_accuracy"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={editFormData.pass_accuracy}
                onChange={(e) => setEditFormData(prev => ({ ...prev, pass_accuracy: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="edit_tackles">Tacles</Label>
              <Input
                id="edit_tackles"
                type="number"
                min="0"
                value={editFormData.tackles}
                onChange={(e) => setEditFormData(prev => ({ ...prev, tackles: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="edit_interceptions">Interceptions</Label>
              <Input
                id="edit_interceptions"
                type="number"
                min="0"
                value={editFormData.interceptions}
                onChange={(e) => setEditFormData(prev => ({ ...prev, interceptions: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="edit_saves">Arrêts</Label>
              <Input
                id="edit_saves"
                type="number"
                min="0"
                value={editFormData.saves}
                onChange={(e) => setEditFormData(prev => ({ ...prev, saves: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="edit_clean_sheets">Clean sheets</Label>
              <Input
                id="edit_clean_sheets"
                type="number"
                min="0"
                value={editFormData.clean_sheets}
                onChange={(e) => setEditFormData(prev => ({ ...prev, clean_sheets: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="edit_goals_conceded">Buts encaissés</Label>
              <Input
                id="edit_goals_conceded"
                type="number"
                min="0"
                value={editFormData.goals_conceded}
                onChange={(e) => setEditFormData(prev => ({ ...prev, goals_conceded: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button onClick={handleUpdateStat}>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
