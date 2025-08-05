import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface OpposingTeam {
  id: string;
  name: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

interface OpposingPlayer {
  id: string;
  team_id: string;
  name: string;
  position: string;
  jersey_number?: number;
  is_starter: boolean;
  created_at: string;
  updated_at: string;
}

export const OpposingTeamManager = () => {
  const [teams, setTeams] = useState<OpposingTeam[]>([]);
  const [players, setPlayers] = useState<OpposingPlayer[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<OpposingTeam | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<OpposingPlayer | null>(null);

  const [teamForm, setTeamForm] = useState({
    name: "",
    logo_url: ""
  });

  const [playerForm, setPlayerForm] = useState({
    name: "",
    position: "",
    jersey_number: "",
    is_starter: true
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchPlayers(selectedTeam);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('opposing_teams')
      .select('*')
      .order('name');

    if (error) {
      toast.error("Erreur lors du chargement des équipes");
      return;
    }

    setTeams(data || []);
  };

  const fetchPlayers = async (teamId: string) => {
    const { data, error } = await supabase
      .from('opposing_players')
      .select('*')
      .eq('team_id', teamId)
      .order('jersey_number');

    if (error) {
      toast.error("Erreur lors du chargement des joueurs");
      return;
    }

    setPlayers(data || []);
  };

  const handleSaveTeam = async () => {
    if (!teamForm.name.trim()) {
      toast.error("Le nom de l'équipe est requis");
      return;
    }

    try {
      if (editingTeam) {
        const { error } = await supabase
          .from('opposing_teams')
          .update(teamForm)
          .eq('id', editingTeam.id);

        if (error) throw error;
        toast.success("Équipe modifiée avec succès");
      } else {
        const { error } = await supabase
          .from('opposing_teams')
          .insert([teamForm]);

        if (error) throw error;
        toast.success("Équipe créée avec succès");
      }

      setIsTeamDialogOpen(false);
      setEditingTeam(null);
      setTeamForm({ name: "", logo_url: "" });
      fetchTeams();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleSavePlayer = async () => {
    if (!teamForm.name.trim() || !playerForm.position.trim()) {
      toast.error("Le nom et la position sont requis");
      return;
    }

    const playerData = {
      ...playerForm,
      team_id: selectedTeam,
      jersey_number: playerForm.jersey_number ? parseInt(playerForm.jersey_number) : null
    };

    try {
      if (editingPlayer) {
        const { error } = await supabase
          .from('opposing_players')
          .update(playerData)
          .eq('id', editingPlayer.id);

        if (error) throw error;
        toast.success("Joueur modifié avec succès");
      } else {
        const { error } = await supabase
          .from('opposing_players')
          .insert([playerData]);

        if (error) throw error;
        toast.success("Joueur créé avec succès");
      }

      setIsPlayerDialogOpen(false);
      setEditingPlayer(null);
      setPlayerForm({ name: "", position: "", jersey_number: "", is_starter: true });
      fetchPlayers(selectedTeam);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette équipe ?")) return;

    try {
      const { error } = await supabase
        .from('opposing_teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      toast.success("Équipe supprimée avec succès");
      fetchTeams();
      if (selectedTeam === teamId) {
        setSelectedTeam("");
        setPlayers([]);
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce joueur ?")) return;

    try {
      const { error } = await supabase
        .from('opposing_players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;
      toast.success("Joueur supprimé avec succès");
      fetchPlayers(selectedTeam);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const openTeamDialog = (team?: OpposingTeam) => {
    if (team) {
      setEditingTeam(team);
      setTeamForm({ name: team.name, logo_url: team.logo_url || "" });
    } else {
      setEditingTeam(null);
      setTeamForm({ name: "", logo_url: "" });
    }
    setIsTeamDialogOpen(true);
  };

  const openPlayerDialog = (player?: OpposingPlayer) => {
    if (player) {
      setEditingPlayer(player);
      setPlayerForm({
        name: player.name,
        position: player.position,
        jersey_number: player.jersey_number?.toString() || "",
        is_starter: player.is_starter
      });
    } else {
      setEditingPlayer(null);
      setPlayerForm({ name: "", position: "", jersey_number: "", is_starter: true });
    }
    setIsPlayerDialogOpen(true);
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case "GK": return "bg-yellow-500";
      case "RB":
      case "LB":
      case "CB": return "bg-blue-500";
      case "CM":
      case "CDM":
      case "LB": return "bg-green-500";
      case "RW":
      case "LW":
      case "ST": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Gestion des Équipes Adverses
            <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openTeamDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Équipe
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTeam ? "Modifier l'équipe" : "Nouvelle équipe"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nom de l'équipe</label>
                    <Input
                      value={teamForm.name}
                      onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                      placeholder="Nom de l'équipe"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL du logo</label>
                    <Input
                      value={teamForm.logo_url}
                      onChange={(e) => setTeamForm({ ...teamForm, logo_url: e.target.value })}
                      placeholder="URL du logo"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveTeam}>Enregistrer</Button>
                    <Button variant="outline" onClick={() => setIsTeamDialogOpen(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>
                    {team.logo_url && (
                      <img src={team.logo_url} alt={team.name} className="w-8 h-8 object-contain" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTeam(team.id)}
                      >
                        Gérer joueurs
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTeamDialog(team)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedTeam && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Joueurs de {teams.find(t => t.id === selectedTeam)?.name}
              <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openPlayerDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Joueur
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingPlayer ? "Modifier le joueur" : "Nouveau joueur"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nom du joueur</label>
                      <Input
                        value={playerForm.name}
                        onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                        placeholder="Nom du joueur"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Position</label>
                      <Select
                        value={playerForm.position}
                        onValueChange={(value) => setPlayerForm({ ...playerForm, position: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GK">Gardien (GK)</SelectItem>
                          <SelectItem value="RB">Arrière droit (RB)</SelectItem>
                          <SelectItem value="CB">Défenseur central (CB)</SelectItem>
                          <SelectItem value="LB">Arrière gauche (LB)</SelectItem>
                          <SelectItem value="CDM">Milieu défensif (CDM)</SelectItem>
                          <SelectItem value="CM">Milieu de terrain (CM)</SelectItem>
                          <SelectItem value="RW">Ailier droit (RW)</SelectItem>
                          <SelectItem value="LW">Ailier gauche (LW)</SelectItem>
                          <SelectItem value="ST">Attaquant (ST)</SelectItem>
                          <SelectItem value="AM">Milieu offensif (AM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Numéro de maillot</label>
                      <Input
                        type="number"
                        value={playerForm.jersey_number}
                        onChange={(e) => setPlayerForm({ ...playerForm, jersey_number: e.target.value })}
                        placeholder="Numéro"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <Select
                        value={playerForm.is_starter ? "starter" : "substitute"}
                        onValueChange={(value) => setPlayerForm({ ...playerForm, is_starter: value === "starter" })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">Titulaire</SelectItem>
                          <SelectItem value="substitute">Remplaçant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSavePlayer}>Enregistrer</Button>
                      <Button variant="outline" onClick={() => setIsPlayerDialogOpen(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="starters">
              <TabsList>
                <TabsTrigger value="starters">Titulaires</TabsTrigger>
                <TabsTrigger value="substitutes">Remplaçants</TabsTrigger>
              </TabsList>
              
              <TabsContent value="starters">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N°</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.filter(p => p.is_starter).map((player) => (
                      <TableRow key={player.id}>
                        <TableCell>{player.jersey_number}</TableCell>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>
                          <Badge className={getPositionColor(player.position)}>
                            {player.position}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPlayerDialog(player)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePlayer(player.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="substitutes">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N°</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.filter(p => !p.is_starter).map((player) => (
                      <TableRow key={player.id}>
                        <TableCell>{player.jersey_number}</TableCell>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>
                          <Badge className={getPositionColor(player.position)}>
                            {player.position}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPlayerDialog(player)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePlayer(player.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};