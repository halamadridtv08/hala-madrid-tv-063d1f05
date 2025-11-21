import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Target, Plus, Trash2, CheckCircle2, TrendingUp, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface PlayerObjective {
  id: string;
  player_id: string;
  objective_type: string;
  target_value: number;
  current_value: number;
  season: string;
  competition: string | null;
  description: string | null;
  deadline: string | null;
  is_achieved: boolean;
  achieved_at: string | null;
  players: {
    name: string;
    image_url: string;
  };
}

export const PlayerObjectivesManager = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<PlayerObjective[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [objectiveType, setObjectiveType] = useState<string>("goals");
  const [targetValue, setTargetValue] = useState<string>("10");
  const [season, setSeason] = useState<string>("2024");
  const [competition, setCompetition] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");

  useEffect(() => {
    loadPlayers();
    loadObjectives();

    // Real-time updates
    const channel = supabase
      .channel('player_objectives_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'player_objectives' },
        () => loadObjectives()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, position, image_url')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des joueurs:', error);
    }
  };

  const loadObjectives = async () => {
    try {
      const { data, error } = await supabase
        .from('player_objectives')
        .select(`
          *,
          players (
            name,
            image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setObjectives(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des objectifs:', error);
    }
  };

  const handleUpdateProgress = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('update_player_objectives_progress');
      if (error) throw error;
      
      toast.success("Progression mise à jour avec succès");
      loadObjectives();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error("Erreur lors de la mise à jour de la progression");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddObjective = async () => {
    if (!selectedPlayerId) {
      toast.error("Veuillez sélectionner un joueur");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('player_objectives')
        .insert({
          player_id: selectedPlayerId,
          objective_type: objectiveType,
          target_value: parseInt(targetValue),
          season,
          competition: competition || null,
          description: description || null,
          deadline: deadline || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast.success("Objectif ajouté avec succès");
      setShowForm(false);
      resetForm();
      loadObjectives();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast.error("Erreur lors de l'ajout de l'objectif");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteObjective = async (id: string) => {
    try {
      const { error } = await supabase
        .from('player_objectives')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Objectif supprimé");
      loadObjectives();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setSelectedPlayerId("");
    setObjectiveType("goals");
    setTargetValue("10");
    setSeason("2024");
    setCompetition("");
    setDescription("");
    setDeadline("");
  };

  const objectiveTypeLabels: Record<string, string> = {
    goals: "Buts",
    assists: "Passes Décisives",
    clean_sheets: "Clean Sheets",
    minutes_played: "Minutes Jouées",
    yellow_cards_max: "Cartons Jaunes Max",
    custom: "Personnalisé"
  };

  const calculateProgress = (current: number, target: number, type: string) => {
    if (type === 'yellow_cards_max') {
      return Math.max(0, 100 - (current / target) * 100);
    }
    return Math.min(100, (current / target) * 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objectifs des Joueurs
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleUpdateProgress} disabled={isLoading} variant="outline" size="sm">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                Actualiser Progression
              </Button>
              <Button onClick={() => setShowForm(!showForm)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Objectif
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Form */}
          {showForm && (
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-medium">Créer un nouvel objectif</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Joueur</label>
                  <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map(player => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type d'objectif</label>
                  <Select value={objectiveType} onValueChange={setObjectiveType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(objectiveTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Valeur cible</label>
                  <Input 
                    type="number" 
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Saison</label>
                  <Input 
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    placeholder="2024"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Compétition (optionnel)</label>
                  <Input 
                    value={competition}
                    onChange={(e) => setCompetition(e.target.value)}
                    placeholder="Liga, Champions League..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date limite (optionnel)</label>
                  <Input 
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Détails de l'objectif..."
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddObjective} disabled={isLoading}>
                  Créer l'objectif
                </Button>
                <Button onClick={() => { setShowForm(false); resetForm(); }} variant="outline">
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {/* Objectives List */}
          <div className="space-y-4">
            {objectives.map(objective => {
              const progress = calculateProgress(objective.current_value, objective.target_value, objective.objective_type);
              
              return (
                <div key={objective.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {objective.players?.image_url && (
                        <img 
                          src={objective.players.image_url}
                          alt={objective.players.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{objective.players?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {objectiveTypeLabels[objective.objective_type]} - Saison {objective.season}
                          {objective.competition && ` - ${objective.competition}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {objective.is_achieved && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Atteint
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteObjective(objective.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {objective.description && (
                    <p className="text-sm">{objective.description}</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progression</span>
                      <span className="font-medium">
                        {objective.current_value} / {objective.target_value}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                      {progress.toFixed(0)}%
                    </p>
                  </div>

                  {objective.deadline && (
                    <p className="text-xs text-muted-foreground">
                      Date limite: {new Date(objective.deadline).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              );
            })}

            {objectives.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Aucun objectif défini. Créez-en un pour suivre la progression des joueurs.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
