import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Upload, FileJson, Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadFile } from "@/utils/fileUpload";

interface OpposingTeam {
  id: string;
  name: string;
  logo_url?: string;
  short_name?: string | null;
  stadium?: string | null;
  created_at: string;
  updated_at: string;
}

interface OpposingPlayer {
  id: string;
  team_id: string;
  name: string;
  position: string;
  jersey_number?: number;
  photo_url?: string;
  is_starter: boolean;
  created_at: string;
  updated_at: string;
}

export const OpposingTeamManager = () => {
  const [teams, setTeams] = useState<OpposingTeam[]>([]);
  const [players, setPlayers] = useState<OpposingPlayer[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Array<any>>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [isJsonImportDialogOpen, setIsJsonImportDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<OpposingTeam | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<OpposingPlayer | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const playersCardRef = useRef<HTMLDivElement>(null);

  const [teamForm, setTeamForm] = useState({
    name: "",
    logo_url: "",
    short_name: "",
    stadium: ""
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const result = await uploadFile(file, 'media', 'team-logos');
      if (result.error || !result.url) {
        toast.error(result.error || "Erreur lors de l'upload du logo");
        return;
      }
      setTeamForm(prev => ({ ...prev, logo_url: result.url as string }));
      toast.success("Logo uploadé");
    } finally {
      setUploadingLogo(false);
    }
  };

  const [playerForm, setPlayerForm] = useState({
    name: "",
    position: "",
    jersey_number: "",
    photo_url: "",
    is_starter: true
  });

  useEffect(() => {
    fetchTeams();
    fetchUpcomingMatches();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchPlayers(selectedTeam);
      // Scroll vers la section des joueurs après un court délai
      setTimeout(() => {
        playersCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedTeam]);

  const fetchUpcomingMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        opposing_team:opposing_teams(id, name, logo_url)
      `)
      .gte('match_date', new Date().toISOString())
      .order('match_date', { ascending: true })
      .limit(10);

    if (error) {
      toast.error("Erreur lors du chargement des matchs");
      return;
    }

    setUpcomingMatches(data || []);
  };

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('opposing_teams')
      .select(`
        *,
        matches:matches!opposing_team_id(id, home_team, away_team, match_date, competition, status)
      `)
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
      fetchUpcomingMatches(); // Rafraîchir aussi les matchs
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleSavePlayer = async () => {
    if (!playerForm.name.trim() || !playerForm.position.trim()) {
      toast.error("Le nom et la position sont requis");
      return;
    }

    const playerData = {
      ...playerForm,
      team_id: selectedTeam,
      jersey_number: playerForm.jersey_number ? parseInt(playerForm.jersey_number) : null,
      photo_url: playerForm.photo_url || null
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
      setPlayerForm({ name: "", position: "", jersey_number: "", photo_url: "", is_starter: true });
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

  // JSON Import functionality
  const handleJsonImport = async () => {
    if (!selectedTeam || !jsonInput.trim()) {
      toast.error("Sélectionnez une équipe et entrez du JSON");
      return;
    }

    setJsonError(null);
    setIsImporting(true);

    try {
      // Parse JSON - support both array and object with players array
      let playersData: any[];
      const parsed = JSON.parse(jsonInput);
      
      if (Array.isArray(parsed)) {
        playersData = parsed;
      } else if (parsed.players && Array.isArray(parsed.players)) {
        playersData = parsed.players;
      } else if (parsed.squad && Array.isArray(parsed.squad)) {
        playersData = parsed.squad;
      } else {
        throw new Error("Format JSON invalide. Attendu: un tableau de joueurs ou un objet avec 'players' ou 'squad'");
      }

      // Validate and transform players
      const validPlayers = playersData.map((p: any, index: number) => {
        if (!p.name && !p.nom) {
          throw new Error(`Joueur ${index + 1}: nom manquant`);
        }
        
        return {
          team_id: selectedTeam,
          name: p.name || p.nom || `Joueur ${index + 1}`,
          position: normalizePosition(p.position || p.poste || "CM"),
          jersey_number: p.jersey_number || p.number || p.numero || p.numéro || null,
          is_starter: p.is_starter ?? p.titulaire ?? p.starter ?? true
        };
      });

      // Option: clear existing players before import
      const shouldReplace = confirm(`Importer ${validPlayers.length} joueurs. Voulez-vous remplacer les joueurs existants ? (OK = Remplacer, Annuler = Ajouter)`);
      
      if (shouldReplace) {
        // Delete existing players
        const { error: deleteError } = await supabase
          .from('opposing_players')
          .delete()
          .eq('team_id', selectedTeam);
        
        if (deleteError) throw deleteError;
      }

      // Insert new players
      const { error: insertError } = await supabase
        .from('opposing_players')
        .insert(validPlayers);

      if (insertError) throw insertError;

      toast.success(`${validPlayers.length} joueurs importés avec succès`);
      setIsJsonImportDialogOpen(false);
      setJsonInput("");
      fetchPlayers(selectedTeam);
    } catch (error: any) {
      const message = error.message || "Erreur lors de l'import";
      setJsonError(message);
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  };

  // Normalize position names
  const normalizePosition = (pos: string): string => {
    const positionMap: Record<string, string> = {
      'gardien': 'GK', 'goalkeeper': 'GK', 'portero': 'GK', 'gk': 'GK',
      'défenseur central': 'CB', 'central defender': 'CB', 'defensa central': 'CB', 'cb': 'CB', 'dc': 'CB',
      'arrière droit': 'RB', 'right back': 'RB', 'lateral derecho': 'RB', 'rb': 'RB', 'ad': 'RB',
      'arrière gauche': 'LB', 'left back': 'LB', 'lateral izquierdo': 'LB', 'lb': 'LB',
      'milieu défensif': 'CDM', 'defensive midfielder': 'CDM', 'mediocentro defensivo': 'CDM', 'cdm': 'CDM', 'mdf': 'CDM', 'md': 'CDM',
      'milieu': 'CM', 'midfielder': 'CM', 'centrocampista': 'CM', 'cm': 'CM', 'mc': 'CM',
      'milieu offensif': 'AM', 'attacking midfielder': 'AM', 'mediapunta': 'AM', 'am': 'AM', 'cam': 'AM', 'mo': 'AM',
      'ailier droit': 'RW', 'right winger': 'RW', 'extremo derecho': 'RW', 'rw': 'RW',
      'ailier gauche': 'LW', 'left winger': 'LW', 'extremo izquierdo': 'LW', 'lw': 'LW', 'ag': 'LW',
      'attaquant': 'ST', 'striker': 'ST', 'delantero': 'ST', 'st': 'ST', 'cf': 'ST', 'fw': 'ST', 'att': 'ST'
    };
    
    const normalized = pos.toLowerCase().trim();
    return positionMap[normalized] || pos.toUpperCase().slice(0, 3);
  };

  // Generate example JSON
  const getExampleJson = () => {
    return JSON.stringify({
      players: [
        { name: "Nom du joueur", position: "GK", jersey_number: 1, is_starter: true },
        { name: "Défenseur 1", position: "CB", jersey_number: 4, is_starter: true },
        { name: "Défenseur 2", position: "CB", jersey_number: 5, is_starter: true },
        { name: "Arrière droit", position: "RB", jersey_number: 2, is_starter: true },
        { name: "Arrière gauche", position: "LB", jersey_number: 3, is_starter: true },
        { name: "Milieu 1", position: "CM", jersey_number: 6, is_starter: true },
        { name: "Milieu 2", position: "CM", jersey_number: 8, is_starter: true },
        { name: "Ailier droit", position: "RW", jersey_number: 7, is_starter: true },
        { name: "Ailier gauche", position: "LW", jersey_number: 11, is_starter: true },
        { name: "Attaquant", position: "ST", jersey_number: 9, is_starter: true },
        { name: "Milieu offensif", position: "AM", jersey_number: 10, is_starter: true },
        { name: "Remplaçant 1", position: "GK", jersey_number: 13, is_starter: false },
        { name: "Remplaçant 2", position: "CB", jersey_number: 15, is_starter: false }
      ]
    }, null, 2);
  };

  // Export current players as JSON
  const exportPlayersJson = () => {
    const exportData = {
      team: teams.find(t => t.id === selectedTeam)?.name,
      players: players.map(p => ({
        name: p.name,
        position: p.position,
        jersey_number: p.jersey_number,
        is_starter: p.is_starter
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${teams.find(t => t.id === selectedTeam)?.name || 'equipe'}_joueurs.json`;
    a.click();
    URL.revokeObjectURL(url);
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
        photo_url: player.photo_url || "",
        is_starter: player.is_starter
      });
    } else {
      setEditingPlayer(null);
      setPlayerForm({ name: "", position: "", jersey_number: "", photo_url: "", is_starter: true });
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
      case "CAM": return "bg-green-500";
      case "RW":
      case "LW":
      case "ST": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const renderPlayerCard = (player: OpposingPlayer) => (
    <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3 min-w-0">
        {player.photo_url ? (
          <img src={player.photo_url} alt={player.name} className="w-8 h-8 object-cover rounded-full border shrink-0" />
        ) : (
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center shrink-0">
            <span className="text-xs text-muted-foreground">{player.name.charAt(0)}</span>
          </div>
        )}
        {player.jersey_number != null && (
          <span className="text-xs font-mono text-muted-foreground shrink-0">#{player.jersey_number}</span>
        )}
        <span className="font-medium text-sm truncate">{player.name}</span>
        <Badge className={`${getPositionColor(player.position)} text-[10px] shrink-0`}>{player.position}</Badge>
      </div>
      <div className="flex gap-1 shrink-0 ml-2">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openPlayerDialog(player)}>
          <Edit className="w-3 h-3" />
        </Button>
        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeletePlayer(player.id)}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Section des prochains matchs */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-2xl">Prochains Matchs à Venir</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {upcomingMatches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {upcomingMatches.slice(0, 6).map((match) => {
                const isRealMadridHome = match.home_team === "Real Madrid";
                const opponentName = isRealMadridHome ? match.away_team : match.home_team;
                const opponentLogo = isRealMadridHome ? match.away_team_logo : match.home_team_logo;

                return (
                  <div key={match.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {(isRealMadridHome ? match.home_team_logo : match.away_team_logo) && (
                          <img src={isRealMadridHome ? match.home_team_logo : match.away_team_logo} alt="Real Madrid" className="w-5 h-5 object-contain shrink-0" />
                        )}
                        <span className="font-semibold text-xs sm:text-sm truncate">Real Madrid</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">vs</span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-xs sm:text-sm truncate">{opponentName}</span>
                        {opponentLogo && (
                          <img src={opponentLogo} alt={opponentName} className="w-5 h-5 object-contain shrink-0" />
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground text-center truncate">
                      {new Date(match.match_date).toLocaleDateString('fr-FR', {
                        weekday: 'short', day: 'numeric', month: 'short',
                        hour: '2-digit', minute: '2-digit'
                      })} - {match.competition}
                    </div>
                    {match.venue && (
                      <div className="text-[10px] text-muted-foreground text-center truncate">{match.venue}</div>
                    )}
                    {match.opposing_team_id ? (
                      <Badge variant="outline" className="text-green-600 w-full justify-center text-[10px] sm:text-xs">
                        Équipe adverse liée
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-8"
                        onClick={async () => {
                          try {
                            const { data: newTeam, error } = await supabase
                              .from('opposing_teams')
                              .insert([{ name: opponentName, logo_url: opponentLogo || "" }])
                              .select()
                              .single();
                            if (error) throw error;
                            await supabase
                              .from('matches')
                              .update({ opposing_team_id: newTeam.id })
                              .eq('id', match.id);
                            toast.success(`Équipe ${opponentName} créée et liée au match`);
                            fetchTeams();
                            fetchUpcomingMatches();
                          } catch (error) {
                            toast.error("Erreur lors de la création de l'équipe");
                          }
                        }}
                      >
                        Créer & lier équipe
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Aucun match à venir programmé</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-base sm:text-2xl">
            <span>Gestion des Équipes Adverses</span>
            <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => openTeamDialog()} className="text-xs h-8">
                  <Plus className="w-3 h-3 mr-1" />
                  Nouvelle Équipe
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-lg p-4 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="text-base sm:text-lg">
                    {editingTeam ? "Modifier l'équipe" : "Nouvelle équipe"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nom de l'équipe</label>
                    <Input value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} placeholder="Nom de l'équipe" className="h-9 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL du logo</label>
                    <Input value={teamForm.logo_url} onChange={(e) => setTeamForm({ ...teamForm, logo_url: e.target.value })} placeholder="URL du logo" className="h-9 text-sm" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleSaveTeam} className="h-9 text-sm">Enregistrer</Button>
                    <Button variant="outline" onClick={() => setIsTeamDialogOpen(false)} className="h-9 text-sm">Annuler</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {/* Mobile: card layout */}
          <div className="block sm:hidden space-y-3">
            {teams.map((team) => (
              <div key={team.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-3">
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="w-8 h-8 object-contain rounded shrink-0" />
                  ) : (
                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-muted-foreground">Logo</span>
                    </div>
                  )}
                  <span className="font-medium text-sm truncate">{team.name}</span>
                </div>
                {(team as any).matches?.length > 0 && (
                  <div className="space-y-1">
                    {(team as any).matches.slice(0, 2).map((match: any) => (
                      <div key={match.id} className="text-[11px] text-muted-foreground truncate">
                        {match.competition} - {new Date(match.match_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="h-7 text-[11px] flex-1" onClick={() => setSelectedTeam(team.id)}>
                    Joueurs
                  </Button>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openTeamDialog(team)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDeleteTeam(team.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: table layout */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Matchs</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      {team.logo_url ? (
                        <img src={team.logo_url} alt={team.name} className="w-10 h-10 object-contain rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Logo</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {(team as any).matches?.length > 0 ? (
                          (team as any).matches.slice(0, 2).map((match: any) => (
                            <div key={match.id} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="font-medium">{match.competition}</span>
                              <span>-</span>
                              <span>{new Date(match.match_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                              <Badge variant={match.status === 'upcoming' ? 'default' : 'secondary'} className="text-xs">
                                {match.status === 'upcoming' ? 'À venir' : match.status === 'live' ? 'En cours' : 'Terminé'}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Aucun match programmé</span>
                        )}
                        {(team as any).matches?.length > 2 && (
                          <div className="text-sm text-muted-foreground">+{(team as any).matches.length - 2} autres matchs...</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedTeam(team.id)}>Gérer joueurs</Button>
                        <Button variant="outline" size="sm" onClick={() => openTeamDialog(team)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteTeam(team.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedTeam && (
        <Card ref={playersCardRef}>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex flex-col gap-3 text-base sm:text-2xl">
              <span className="truncate">Joueurs de {teams.find(t => t.id === selectedTeam)?.name}</span>
              <div className="flex flex-wrap gap-2">
                <Dialog open={isJsonImportDialogOpen} onOpenChange={setIsJsonImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => { setJsonInput(""); setJsonError(null); }}>
                      <FileJson className="w-3 h-3 mr-1" />
                      Import JSON
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                      <DialogTitle className="text-base sm:text-lg">Importer des joueurs depuis JSON</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs sm:text-sm">
                          Formats acceptés: tableau de joueurs ou objet avec clé "players" ou "squad".
                          Champs: name/nom, position/poste, jersey_number/numero, is_starter/titulaire
                        </AlertDescription>
                      </Alert>
                      <div>
                        <label className="text-sm font-medium">JSON des joueurs</label>
                        <Textarea
                          value={jsonInput}
                          onChange={(e) => { setJsonInput(e.target.value); setJsonError(null); }}
                          placeholder="Collez votre JSON ici..."
                          className="font-mono text-xs min-h-[150px] sm:min-h-[200px]"
                        />
                      </div>
                      {jsonError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">{jsonError}</AlertDescription>
                        </Alert>
                      )}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handleJsonImport} disabled={isImporting || !jsonInput.trim()} className="h-9 text-sm">
                          <Upload className="w-3 h-3 mr-1" />
                          {isImporting ? "Import en cours..." : "Importer"}
                        </Button>
                        <Button variant="outline" onClick={() => setJsonInput(getExampleJson())} className="h-9 text-sm">Voir exemple</Button>
                        <Button variant="ghost" onClick={() => setIsJsonImportDialogOpen(false)} className="h-9 text-sm">Annuler</Button>
                      </div>
                      <div className="border-t pt-4">
                        <p className="text-xs text-muted-foreground mb-2">Exemple de format JSON:</p>
                        <pre className="text-[10px] sm:text-xs bg-muted p-2 sm:p-3 rounded-md overflow-x-auto max-w-full">
{`{
  "players": [
    { "name": "Unai Simón", "position": "GK", "jersey_number": 1 },
    { "name": "Dani Vivian", "position": "CB", "jersey_number": 4 }
  ]
}`}
                        </pre>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {players.length > 0 && (
                  <Button variant="outline" size="sm" className="text-xs h-8" onClick={exportPlayersJson}>
                    <Download className="w-3 h-3 mr-1" />
                    Exporter
                  </Button>
                )}

                <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="text-xs h-8" onClick={() => openPlayerDialog()}>
                      <Plus className="w-3 h-3 mr-1" />
                      Nouveau Joueur
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                      <DialogTitle className="text-base sm:text-lg">
                        {editingPlayer ? "Modifier le joueur" : "Nouveau joueur"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Nom du joueur</label>
                        <Input value={playerForm.name} onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })} placeholder="Nom du joueur" className="h-9 text-sm" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Position</label>
                        <Select value={playerForm.position} onValueChange={(value) => setPlayerForm({ ...playerForm, position: value })}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Sélectionner une position" /></SelectTrigger>
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
                        <Input type="number" value={playerForm.jersey_number} onChange={(e) => setPlayerForm({ ...playerForm, jersey_number: e.target.value })} placeholder="Numéro" className="h-9 text-sm" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Photo du joueur (URL)</label>
                        <Input value={playerForm.photo_url} onChange={(e) => setPlayerForm({ ...playerForm, photo_url: e.target.value })} placeholder="https://example.com/photo.jpg" className="h-9 text-sm" />
                        {playerForm.photo_url && (
                          <div className="mt-2">
                            <img src={playerForm.photo_url} alt="Preview" className="w-12 h-12 object-cover rounded-full border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Select value={playerForm.is_starter ? "starter" : "substitute"} onValueChange={(value) => setPlayerForm({ ...playerForm, is_starter: value === "starter" })}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="starter">Titulaire</SelectItem>
                            <SelectItem value="substitute">Remplaçant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={handleSavePlayer} className="h-9 text-sm">Enregistrer</Button>
                        <Button variant="outline" onClick={() => setIsPlayerDialogOpen(false)} className="h-9 text-sm">Annuler</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Tabs defaultValue="starters">
              <TabsList>
                <TabsTrigger value="starters" className="text-xs sm:text-sm">Titulaires</TabsTrigger>
                <TabsTrigger value="substitutes" className="text-xs sm:text-sm">Remplaçants</TabsTrigger>
              </TabsList>

              <TabsContent value="starters">
                {/* Mobile: card layout */}
                <div className="block sm:hidden space-y-2">
                  {players.filter(p => p.is_starter).map(renderPlayerCard)}
                </div>
                {/* Desktop: table */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Photo</TableHead>
                        <TableHead>N°</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {players.filter(p => p.is_starter).map((player) => (
                        <TableRow key={player.id}>
                          <TableCell>
                            {player.photo_url ? (
                              <img src={player.photo_url} alt={player.name} className="w-10 h-10 object-cover rounded-full border" />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">{player.name.charAt(0)}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{player.jersey_number}</TableCell>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell><Badge className={getPositionColor(player.position)}>{player.position}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => openPlayerDialog(player)}><Edit className="w-4 h-4" /></Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeletePlayer(player.id)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="substitutes">
                {/* Mobile: card layout */}
                <div className="block sm:hidden space-y-2">
                  {players.filter(p => !p.is_starter).map(renderPlayerCard)}
                </div>
                {/* Desktop: table */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Photo</TableHead>
                        <TableHead>N°</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {players.filter(p => !p.is_starter).map((player) => (
                        <TableRow key={player.id}>
                          <TableCell>
                            {player.photo_url ? (
                              <img src={player.photo_url} alt={player.name} className="w-10 h-10 object-cover rounded-full border" />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">{player.name.charAt(0)}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{player.jersey_number}</TableCell>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell><Badge className={getPositionColor(player.position)}>{player.position}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => openPlayerDialog(player)}><Edit className="w-4 h-4" /></Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeletePlayer(player.id)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};