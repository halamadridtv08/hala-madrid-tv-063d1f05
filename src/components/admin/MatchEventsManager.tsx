import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Goal, Flag, ArrowRightLeft, Plus, Trash2, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Player {
  id: string;
  name: string;
}

interface MatchEventsManagerProps {
  matchId: string;
  matchDetails: any;
  onUpdate: () => void;
}

export const MatchEventsManager = ({ matchId, matchDetails, onUpdate }: MatchEventsManagerProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [goals, setGoals] = useState<any[]>(matchDetails?.goals || []);
  const [cards, setCards] = useState<any[]>([]);
  const [substitutions, setSubstitutions] = useState<any[]>(matchDetails?.substitutions || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventType, setEventType] = useState<'goal' | 'card' | 'substitution'>('goal');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form states
  const [formData, setFormData] = useState<any>({
    scorer: '',
    assist: '',
    minute: '',
    type: 'normal',
    team: 'real_madrid',
    score: '',
    player: '',
    cardType: 'yellow',
    in: '',
    out: ''
  });

  useEffect(() => {
    fetchPlayers();
    parseCardsFromFouls();
  }, [matchDetails]);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setPlayers(data);
    }
  };

  const parseCardsFromFouls = () => {
    const fouls = matchDetails?.fouls || [];
    const cardEvents = fouls.map((foul: any) => ({
      player: foul.player,
      minute: foul.minute,
      type: 'yellow',
      team: foul.team
    }));
    setCards(cardEvents);
  };

  const resetForm = () => {
    setFormData({
      scorer: '',
      assist: '',
      minute: '',
      type: 'normal',
      team: 'real_madrid',
      score: '',
      player: '',
      cardType: 'yellow',
      in: '',
      out: ''
    });
    setEditingIndex(null);
  };

  const openDialog = (type: 'goal' | 'card' | 'substitution', index?: number) => {
    setEventType(type);
    if (index !== undefined) {
      setEditingIndex(index);
      if (type === 'goal') {
        const goal = goals[index];
        setFormData({
          ...formData,
          scorer: goal.scorer,
          assist: goal.assist || '',
          minute: goal.minute,
          type: goal.type || 'normal',
          team: goal.team,
          score: goal.score || ''
        });
      } else if (type === 'card') {
        const card = cards[index];
        setFormData({
          ...formData,
          player: card.player,
          minute: card.minute,
          cardType: card.type,
          team: card.team
        });
      } else if (type === 'substitution') {
        const sub = substitutions[index];
        setFormData({
          ...formData,
          in: sub.in,
          out: sub.out,
          minute: sub.minute,
          team: sub.team
        });
      }
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    let updatedMatchDetails = { ...matchDetails };

    if (eventType === 'goal') {
      const goalData = {
        scorer: formData.scorer,
        assist: formData.assist || null,
        minute: parseInt(formData.minute),
        type: formData.type,
        team: formData.team,
        score: formData.score
      };

      const updatedGoals = editingIndex !== null 
        ? goals.map((g, i) => i === editingIndex ? goalData : g)
        : [...goals, goalData];

      updatedMatchDetails.goals = updatedGoals;
      setGoals(updatedGoals);
    } else if (eventType === 'card') {
      const cardData = {
        player: formData.player,
        minute: parseInt(formData.minute),
        type: formData.cardType,
        team: formData.team
      };

      const updatedCards = editingIndex !== null
        ? cards.map((c, i) => i === editingIndex ? cardData : c)
        : [...cards, cardData];

      // Mettre à jour les fouls pour les cartons jaunes
      const fouls = updatedCards.filter(c => c.type === 'yellow');
      updatedMatchDetails.fouls = fouls;
      setCards(updatedCards);
    } else if (eventType === 'substitution') {
      const subData = {
        in: formData.in,
        out: formData.out,
        minute: parseInt(formData.minute),
        team: formData.team
      };

      const updatedSubs = editingIndex !== null
        ? substitutions.map((s, i) => i === editingIndex ? subData : s)
        : [...substitutions, subData];

      updatedMatchDetails.substitutions = updatedSubs;
      setSubstitutions(updatedSubs);
    }

    // Sauvegarder dans la base de données
    const { error } = await supabase
      .from('matches')
      .update({ match_details: updatedMatchDetails })
      .eq('id', matchId);

    if (error) {
      toast.error("Erreur lors de la sauvegarde");
      console.error(error);
    } else {
      toast.success("Événement sauvegardé");
      setIsDialogOpen(false);
      resetForm();
      onUpdate();
    }
  };

  const handleDeleteEvent = async (type: 'goal' | 'card' | 'substitution', index: number) => {
    let updatedMatchDetails = { ...matchDetails };

    if (type === 'goal') {
      const updatedGoals = goals.filter((_, i) => i !== index);
      updatedMatchDetails.goals = updatedGoals;
      setGoals(updatedGoals);
    } else if (type === 'card') {
      const updatedCards = cards.filter((_, i) => i !== index);
      const fouls = updatedCards.filter(c => c.type === 'yellow');
      updatedMatchDetails.fouls = fouls;
      setCards(updatedCards);
    } else if (type === 'substitution') {
      const updatedSubs = substitutions.filter((_, i) => i !== index);
      updatedMatchDetails.substitutions = updatedSubs;
      setSubstitutions(updatedSubs);
    }

    const { error } = await supabase
      .from('matches')
      .update({ match_details: updatedMatchDetails })
      .eq('id', matchId);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Événement supprimé");
      onUpdate();
    }
  };

  const formatPlayerName = (name: string) => {
    if (!name) return '';
    return name.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Section Buts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <Goal className="h-5 w-5 text-green-600" />
            Buts ({goals.length})
          </CardTitle>
          <Button size="sm" onClick={() => openDialog('goal')}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun but enregistré</p>
          ) : (
            <div className="space-y-2">
              {goals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-600">{goal.minute}'</Badge>
                    <div>
                      <div className="font-medium">{formatPlayerName(goal.scorer)}</div>
                      {goal.assist && (
                        <div className="text-sm text-muted-foreground">
                          Passe: {formatPlayerName(goal.assist)}
                        </div>
                      )}
                      {goal.type !== 'normal' && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {goal.type === 'penalty' ? 'Pénalty' : 'CSC'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openDialog('goal', index)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteEvent('goal', index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Cartons */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-yellow-500" />
            Cartons ({cards.length})
          </CardTitle>
          <Button size="sm" onClick={() => openDialog('card')}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          {cards.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun carton enregistré</p>
          ) : (
            <div className="space-y-2">
              {cards.map((card, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-600">{card.minute}'</Badge>
                    <div className={`w-6 h-8 rounded-sm ${card.type === 'red' ? 'bg-red-600' : 'bg-yellow-400'}`} />
                    <div className="font-medium">{formatPlayerName(card.player)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openDialog('card', index)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteEvent('card', index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Substitutions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-blue-600" />
            Substitutions ({substitutions.length})
          </CardTitle>
          <Button size="sm" onClick={() => openDialog('substitution')}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          {substitutions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune substitution enregistrée</p>
          ) : (
            <div className="space-y-2">
              {substitutions.map((sub, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-600">{sub.minute}'</Badge>
                    <div>
                      <div className="font-medium text-green-600">
                        ↑ {formatPlayerName(sub.in)}
                      </div>
                      <div className="text-sm text-red-500">
                        ↓ {formatPlayerName(sub.out)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openDialog('substitution', index)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteEvent('substitution', index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour ajouter/modifier un événement */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Modifier' : 'Ajouter'}{' '}
              {eventType === 'goal' ? 'un but' : eventType === 'card' ? 'un carton' : 'une substitution'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Formulaire pour But */}
            {eventType === 'goal' && (
              <>
                <div>
                  <Label>Buteur</Label>
                  <Input
                    placeholder="Nom du joueur (ex: vinicius_junior)"
                    value={formData.scorer}
                    onChange={(e) => setFormData({ ...formData, scorer: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Passeur (optionnel)</Label>
                  <Input
                    placeholder="Nom du passeur"
                    value={formData.assist}
                    onChange={(e) => setFormData({ ...formData, assist: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Minute</Label>
                  <Input
                    type="number"
                    placeholder="Minute du but"
                    value={formData.minute}
                    onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="penalty">Pénalty</SelectItem>
                      <SelectItem value="own_goal">Contre son camp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Équipe</Label>
                  <Select value={formData.team} onValueChange={(value) => setFormData({ ...formData, team: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real_madrid">Real Madrid</SelectItem>
                      <SelectItem value="opponent">Adversaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Score après le but (optionnel)</Label>
                  <Input
                    placeholder="Ex: 1-0"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Formulaire pour Carton */}
            {eventType === 'card' && (
              <>
                <div>
                  <Label>Joueur</Label>
                  <Input
                    placeholder="Nom du joueur"
                    value={formData.player}
                    onChange={(e) => setFormData({ ...formData, player: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Minute</Label>
                  <Input
                    type="number"
                    placeholder="Minute du carton"
                    value={formData.minute}
                    onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Type de carton</Label>
                  <Select value={formData.cardType} onValueChange={(value) => setFormData({ ...formData, cardType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yellow">Carton jaune</SelectItem>
                      <SelectItem value="red">Carton rouge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Équipe</Label>
                  <Select value={formData.team} onValueChange={(value) => setFormData({ ...formData, team: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real_madrid">Real Madrid</SelectItem>
                      <SelectItem value="opponent">Adversaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Formulaire pour Substitution */}
            {eventType === 'substitution' && (
              <>
                <div>
                  <Label>Joueur entrant</Label>
                  <Input
                    placeholder="Nom du joueur qui entre"
                    value={formData.in}
                    onChange={(e) => setFormData({ ...formData, in: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Joueur sortant</Label>
                  <Input
                    placeholder="Nom du joueur qui sort"
                    value={formData.out}
                    onChange={(e) => setFormData({ ...formData, out: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Minute</Label>
                  <Input
                    type="number"
                    placeholder="Minute de la substitution"
                    value={formData.minute}
                    onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Équipe</Label>
                  <Select value={formData.team} onValueChange={(value) => setFormData({ ...formData, team: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real_madrid">Real Madrid</SelectItem>
                      <SelectItem value="opponent">Adversaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveEvent}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
