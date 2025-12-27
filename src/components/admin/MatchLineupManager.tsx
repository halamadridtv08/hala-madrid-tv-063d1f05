import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, UserX, Users, Download, Upload } from "lucide-react";
import Papa from "papaparse";

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
}

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number;
}

interface OpposingPlayer {
  id: string;
  name: string;
  position: string;
  jersey_number: number;
}

export function MatchLineupManager() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [opposingPlayers, setOpposingPlayers] = useState<OpposingPlayer[]>([]);
  const [probableLineups, setProbableLineups] = useState<any[]>([]);
  const [absentPlayers, setAbsentPlayers] = useState<any[]>([]);
  
  // Form states
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [isStarter, setIsStarter] = useState<boolean>(true);
  const [absentReason, setAbsentReason] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  
  // Form states for opposing team (simple text inputs)
  const [opposingPlayerName, setOpposingPlayerName] = useState<string>("");
  const [opposingPlayerNumber, setOpposingPlayerNumber] = useState<string>("");
  const [opposingPlayerPosition, setOpposingPlayerPosition] = useState<string>("");

  // Refs for file inputs
  const lineupsFileInputRef = useRef<HTMLInputElement>(null);
  const absentsFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      fetchMatchLineups();
      fetchAbsentPlayers();
      fetchOpposingPlayersForMatch();
    }
  }, [selectedMatch]);

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select("id, home_team, away_team, match_date")
      .order("match_date", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des matchs");
      return;
    }
    setMatches(data || []);
  };

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("id, name, position, jersey_number")
      .eq("is_active", true)
      .order("jersey_number");

    if (error) {
      toast.error("Erreur lors du chargement des joueurs");
      return;
    }
    setPlayers(data || []);
  };

  const fetchOpposingPlayersForMatch = async () => {
    const match = matches.find((m) => m.id === selectedMatch);
    if (!match) return;

    const opposingTeamName = match.home_team === "Real Madrid" ? match.away_team : match.home_team;

    const { data: teamData } = await supabase
      .from("opposing_teams")
      .select("id")
      .eq("name", opposingTeamName)
      .maybeSingle();

    if (teamData) {
      const { data: playersData } = await supabase
        .from("opposing_players")
        .select("*")
        .eq("team_id", teamData.id)
        .order("jersey_number");

      setOpposingPlayers(playersData || []);
    }
  };

  const fetchMatchLineups = async () => {
    const { data, error } = await supabase
      .from("match_probable_lineups")
      .select("*")
      .eq("match_id", selectedMatch)
      .order("is_starter", { ascending: false });

    if (!error) {
      setProbableLineups(data || []);
    }
  };

  const fetchAbsentPlayers = async () => {
    const { data, error } = await supabase
      .from("match_absent_players")
      .select("*")
      .eq("match_id", selectedMatch);

    if (!error) {
      setAbsentPlayers(data || []);
    }
  };

  const addToProbableLineup = async (teamType: "real_madrid" | "opposing") => {
    if (!selectedMatch) {
      toast.error("Veuillez sélectionner un match");
      return;
    }

    let insertData;
    
    if (teamType === "real_madrid") {
      if (!selectedPlayer) {
        toast.error("Veuillez sélectionner un joueur");
        return;
      }
      
      const player = players.find((p) => p.id === selectedPlayer);
      if (!player) return;
      
      insertData = {
        match_id: selectedMatch,
        team_type: teamType,
        player_id: player.id,
        player_name: player.name,
        position: player.position,
        jersey_number: player.jersey_number,
        is_starter: isStarter,
      };
    } else {
      // For opposing team, use simple text inputs
      if (!opposingPlayerName || !opposingPlayerPosition) {
        toast.error("Veuillez renseigner le nom et la position");
        return;
      }
      
      insertData = {
        match_id: selectedMatch,
        team_type: teamType,
        player_name: opposingPlayerName,
        position: opposingPlayerPosition,
        jersey_number: opposingPlayerNumber ? parseInt(opposingPlayerNumber) : null,
        is_starter: isStarter,
      };
    }

    const { error } = await supabase
      .from("match_probable_lineups")
      .insert(insertData);

    if (error) {
      toast.error("Erreur lors de l'ajout du joueur");
      return;
    }

    toast.success("Joueur ajouté à la composition probable");
    fetchMatchLineups();
    setSelectedPlayer("");
    setOpposingPlayerName("");
    setOpposingPlayerNumber("");
    setOpposingPlayerPosition("");
  };

  const addToAbsentPlayers = async (teamType: "real_madrid" | "opposing") => {
    if (!selectedMatch || !absentReason) {
      toast.error("Veuillez remplir la raison de l'absence");
      return;
    }

    let insertData;
    
    if (teamType === "real_madrid") {
      if (!selectedPlayer) {
        toast.error("Veuillez sélectionner un joueur");
        return;
      }
      
      const player = players.find((p) => p.id === selectedPlayer);
      if (!player) return;
      
      insertData = {
        match_id: selectedMatch,
        team_type: teamType,
        player_id: player.id,
        player_name: player.name,
        reason: absentReason,
        return_date: returnDate || null,
      };
    } else {
      // For opposing team, use simple text input
      if (!opposingPlayerName) {
        toast.error("Veuillez renseigner le nom du joueur");
        return;
      }
      
      insertData = {
        match_id: selectedMatch,
        team_type: teamType,
        player_name: opposingPlayerName,
        reason: absentReason,
        return_date: returnDate || null,
      };
    }

    const { error } = await supabase
      .from("match_absent_players")
      .insert(insertData);

    if (error) {
      toast.error("Erreur lors de l'ajout du joueur absent");
      return;
    }

    toast.success("Joueur ajouté aux absents");
    fetchAbsentPlayers();
    setSelectedPlayer("");
    setOpposingPlayerName("");
    setAbsentReason("");
    setReturnDate("");
  };

  const deleteFromLineup = async (id: string) => {
    const { error } = await supabase
      .from("match_probable_lineups")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
      return;
    }

    toast.success("Joueur retiré de la composition");
    fetchMatchLineups();
  };

  const deleteFromAbsent = async (id: string) => {
    const { error } = await supabase
      .from("match_absent_players")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erreur lors de la suppression");
      return;
    }

    toast.success("Joueur retiré des absents");
    fetchAbsentPlayers();
  };

  // Export functions
  const exportLineupsToCSV = () => {
    if (!selectedMatch) {
      toast.error("Veuillez sélectionner un match");
      return;
    }

    const csvData = probableLineups.map((lineup) => ({
      team_type: lineup.team_type,
      player_name: lineup.player_name,
      position: lineup.position,
      jersey_number: lineup.jersey_number || "",
      is_starter: lineup.is_starter ? "Oui" : "Non",
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `compositions_probables_${selectedMatch}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Export CSV réussi");
  };

  const exportAbsentsToCSV = () => {
    if (!selectedMatch) {
      toast.error("Veuillez sélectionner un match");
      return;
    }

    const csvData = absentPlayers.map((player) => ({
      team_type: player.team_type,
      player_name: player.player_name,
      reason: player.reason,
      return_date: player.return_date || "",
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `joueurs_absents_${selectedMatch}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Export CSV réussi");
  };

  // Import functions
  const importLineupsFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedMatch) {
      toast.error("Veuillez sélectionner un match");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const validRows = results.data.filter((row: any) => 
          row.team_type && row.player_name && row.position
        );

        if (validRows.length === 0) {
          toast.error("Aucune donnée valide trouvée dans le fichier");
          return;
        }

        const insertData = validRows.map((row: any) => ({
          match_id: selectedMatch,
          team_type: row.team_type,
          player_name: row.player_name,
          position: row.position,
          jersey_number: row.jersey_number ? parseInt(row.jersey_number) : null,
          is_starter: row.is_starter === "Oui" || row.is_starter === "true",
          player_id: null,
          opposing_player_id: null,
        }));

        const { error } = await supabase
          .from("match_probable_lineups")
          .insert(insertData);

        if (error) {
          toast.error("Erreur lors de l'import: " + error.message);
          return;
        }

        toast.success(`${validRows.length} joueurs importés avec succès`);
        fetchMatchLineups();
        
        if (lineupsFileInputRef.current) {
          lineupsFileInputRef.current.value = "";
        }
      },
      error: (error) => {
        toast.error("Erreur lors de la lecture du fichier: " + error.message);
      },
    });
  };

  const importAbsentsFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedMatch) {
      toast.error("Veuillez sélectionner un match");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const validRows = results.data.filter((row: any) => 
          row.team_type && row.player_name && row.reason
        );

        if (validRows.length === 0) {
          toast.error("Aucune donnée valide trouvée dans le fichier");
          return;
        }

        const insertData = validRows.map((row: any) => ({
          match_id: selectedMatch,
          team_type: row.team_type,
          player_name: row.player_name,
          reason: row.reason,
          return_date: row.return_date || null,
          player_id: null,
          opposing_player_id: null,
        }));

        const { error } = await supabase
          .from("match_absent_players")
          .insert(insertData);

        if (error) {
          toast.error("Erreur lors de l'import: " + error.message);
          return;
        }

        toast.success(`${validRows.length} joueurs absents importés avec succès`);
        fetchAbsentPlayers();
        
        if (absentsFileInputRef.current) {
          absentsFileInputRef.current.value = "";
        }
      },
      error: (error) => {
        toast.error("Erreur lors de la lecture du fichier: " + error.message);
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Compositions et Joueurs Absents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Sélectionner un match</Label>
            <Select value={selectedMatch} onValueChange={setSelectedMatch}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un match" />
              </SelectTrigger>
              <SelectContent>
                {matches.map((match) => (
                  <SelectItem key={match.id} value={match.id}>
                    {match.home_team} vs {match.away_team} -{" "}
                    {new Date(match.match_date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMatch && (
            <div className="flex flex-wrap gap-4 pt-4 border-t">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Compositions Probables</h3>
                <div className="flex gap-2">
                  <Button onClick={exportLineupsToCSV} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter CSV
                  </Button>
                  <Button onClick={() => lineupsFileInputRef.current?.click()} variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Importer CSV
                  </Button>
                  <input
                    ref={lineupsFileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={importLineupsFromCSV}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Joueurs Absents</h3>
                <div className="flex gap-2">
                  <Button onClick={exportAbsentsToCSV} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter CSV
                  </Button>
                  <Button onClick={() => absentsFileInputRef.current?.click()} variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Importer CSV
                  </Button>
                  <input
                    ref={absentsFileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={importAbsentsFromCSV}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedMatch && (
            <Tabs defaultValue="real_madrid" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="real_madrid">Real Madrid</TabsTrigger>
                <TabsTrigger value="opposing">Équipe Adverse</TabsTrigger>
              </TabsList>

              <TabsContent value="real_madrid" className="space-y-6">
                {/* Composition Probable */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Composition Probable - Real Madrid
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label>Joueur</Label>
                        <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un joueur" />
                          </SelectTrigger>
                          <SelectContent>
                            {players.map((player) => (
                              <SelectItem key={player.id} value={player.id}>
                                {player.jersey_number} - {player.name} ({player.position})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select value={isStarter.toString()} onValueChange={(v) => setIsStarter(v === "true")}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Titulaire</SelectItem>
                            <SelectItem value="false">Remplaçant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={() => addToProbableLineup("real_madrid")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>N°</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {probableLineups
                          .filter((l) => l.team_type === "real_madrid")
                          .map((lineup) => (
                            <TableRow key={lineup.id}>
                              <TableCell>{lineup.jersey_number}</TableCell>
                              <TableCell>{lineup.player_name}</TableCell>
                              <TableCell>{lineup.position}</TableCell>
                              <TableCell>
                                {lineup.is_starter ? "Titulaire" : "Remplaçant"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteFromLineup(lineup.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Joueurs Absents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserX className="h-5 w-5" />
                      Joueurs Absents - Real Madrid
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Joueur</Label>
                        <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            {players.map((player) => (
                              <SelectItem key={player.id} value={player.id}>
                                {player.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Raison</Label>
                        <Input
                          value={absentReason}
                          onChange={(e) => setAbsentReason(e.target.value)}
                          placeholder="Blessure, suspension..."
                        />
                      </div>
                      <div>
                        <Label>Date de retour (optionnel)</Label>
                        <Input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button onClick={() => addToAbsentPlayers("real_madrid")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Raison</TableHead>
                          <TableHead>Retour prévu</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {absentPlayers
                          .filter((a) => a.team_type === "real_madrid")
                          .map((absent) => (
                            <TableRow key={absent.id}>
                              <TableCell>{absent.player_name}</TableCell>
                              <TableCell>{absent.reason}</TableCell>
                              <TableCell>
                                {absent.return_date
                                  ? new Date(absent.return_date).toLocaleDateString()
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteFromAbsent(absent.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="opposing" className="space-y-6">
                {/* Simplified form for opposing team */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Composition Probable - Équipe Adverse
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label>N° Maillot</Label>
                        <Input
                          type="number"
                          placeholder="Ex: 10"
                          value={opposingPlayerNumber}
                          onChange={(e) => setOpposingPlayerNumber(e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Nom du joueur</Label>
                        <Input
                          placeholder="Ex: Mbappé"
                          value={opposingPlayerName}
                          onChange={(e) => setOpposingPlayerName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Position</Label>
                        <Input
                          placeholder="Ex: ST"
                          value={opposingPlayerPosition}
                          onChange={(e) => setOpposingPlayerPosition(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <Label>Type</Label>
                        <Select value={isStarter.toString()} onValueChange={(v) => setIsStarter(v === "true")}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Titulaire</SelectItem>
                            <SelectItem value="false">Remplaçant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={() => addToProbableLineup("opposing")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>N°</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {probableLineups
                          .filter((l) => l.team_type === "opposing")
                          .map((lineup) => (
                            <TableRow key={lineup.id}>
                              <TableCell>{lineup.jersey_number}</TableCell>
                              <TableCell>{lineup.player_name}</TableCell>
                              <TableCell>{lineup.position}</TableCell>
                              <TableCell>
                                {lineup.is_starter ? "Titulaire" : "Remplaçant"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteFromLineup(lineup.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserX className="h-5 w-5" />
                      Joueurs Absents - Équipe Adverse
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nom du joueur</Label>
                        <Input
                          placeholder="Ex: Benzema"
                          value={opposingPlayerName}
                          onChange={(e) => setOpposingPlayerName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Raison</Label>
                        <Input
                          placeholder="Ex: Blessé"
                          value={absentReason}
                          onChange={(e) => setAbsentReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date de retour prévue</Label>
                        <Input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={() => addToAbsentPlayers("opposing")}>
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter
                        </Button>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Raison</TableHead>
                          <TableHead>Retour prévu</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {absentPlayers
                          .filter((a) => a.team_type === "opposing")
                          .map((absent) => (
                            <TableRow key={absent.id}>
                              <TableCell>{absent.player_name}</TableCell>
                              <TableCell>{absent.reason}</TableCell>
                              <TableCell>
                                {absent.return_date
                                  ? new Date(absent.return_date).toLocaleDateString()
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteFromAbsent(absent.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
