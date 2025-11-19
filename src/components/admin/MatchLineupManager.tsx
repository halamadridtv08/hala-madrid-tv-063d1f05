import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, UserX, Users } from "lucide-react";

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
      .order("match_date", { ascending: true });

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
    if (!selectedMatch || !selectedPlayer) {
      toast.error("Veuillez sélectionner un match et un joueur");
      return;
    }

    const playerList = teamType === "real_madrid" ? players : opposingPlayers;
    const player = playerList.find((p) => p.id === selectedPlayer);
    if (!player) return;

    const insertData = {
      match_id: selectedMatch,
      team_type: teamType,
      player_name: player.name,
      position: player.position,
      jersey_number: player.jersey_number,
      is_starter: isStarter,
      ...(teamType === "real_madrid" 
        ? { player_id: player.id, opposing_player_id: null }
        : { opposing_player_id: player.id, player_id: null }
      ),
    };

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
  };

  const addToAbsentPlayers = async (teamType: "real_madrid" | "opposing") => {
    if (!selectedMatch || !selectedPlayer || !absentReason) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    const playerList = teamType === "real_madrid" ? players : opposingPlayers;
    const player = playerList.find((p) => p.id === selectedPlayer);
    if (!player) return;

    const insertData = {
      match_id: selectedMatch,
      team_type: teamType,
      player_name: player.name,
      reason: absentReason,
      return_date: returnDate || null,
      ...(teamType === "real_madrid"
        ? { player_id: player.id, opposing_player_id: null }
        : { opposing_player_id: player.id, player_id: null }
      ),
    };

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
                {/* Same structure for opposing team */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Composition Probable - Équipe Adverse
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
                            {opposingPlayers.map((player) => (
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
                    <Button onClick={() => addToProbableLineup("opposing")}>
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
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Joueur</Label>
                        <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            {opposingPlayers.map((player) => (
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
                    <Button onClick={() => addToAbsentPlayers("opposing")}>
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
