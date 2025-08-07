import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlayerType {
  name: string;
  position: string;
  number: number;
}

interface MatchDetailProps {
  match: any;
  isOpen: boolean;
  onClose: () => void;
}

interface OpposingPlayer {
  id: string;
  name: string;
  position: string;
  jersey_number: number | null;
  is_starter: boolean;
}

export const MatchDetail = ({ match, isOpen, onClose }: MatchDetailProps) => {
  const [opposingPlayers, setOpposingPlayers] = useState<OpposingPlayer[]>([]);
  const [realMadridPlayers, setRealMadridPlayers] = useState<PlayerType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && match) {
      fetchMatchData();
    }
  }, [isOpen, match]);

  const fetchMatchData = async () => {
    if (!match) return;
    
    setLoading(true);
    try {
      // Récupérer les joueurs Real Madrid depuis la base de données
      const { data: realMadridData, error: realMadridError } = await supabase
        .from('players')
        .select('name, position, jersey_number')
        .eq('is_active', true)
        .order('jersey_number', { ascending: true });

      if (realMadridError) {
        console.error("Erreur lors du chargement des joueurs Real Madrid:", realMadridError);
        toast.error("Erreur lors du chargement des joueurs Real Madrid");
      } else {
        const formattedPlayers = realMadridData.map(player => ({
          name: player.name,
          position: player.position,
          number: player.jersey_number || 0
        }));
        setRealMadridPlayers(formattedPlayers);
      }

      // Récupérer les joueurs de l'équipe adverse
      const opposingTeamName = match.homeTeam.name === 'Real Madrid' ? match.awayTeam.name : match.homeTeam.name;
      
      const { data: teamData, error: teamError } = await supabase
        .from('opposing_teams')
        .select('id')
        .eq('name', opposingTeamName)
        .maybeSingle();

      if (teamError) {
        console.error("Erreur lors de la recherche de l'équipe adverse:", teamError);
      } else if (teamData) {
        const { data: playersData, error: playersError } = await supabase
          .from('opposing_players')
          .select('*')
          .eq('team_id', teamData.id)
          .order('is_starter', { ascending: false })
          .order('jersey_number', { ascending: true });

        if (playersError) {
          console.error("Erreur lors du chargement des joueurs adverses:", playersError);
          toast.error("Erreur lors du chargement des joueurs");
        } else {
          setOpposingPlayers(playersData || []);
        }
      } else {
        console.log("Équipe adverse non trouvée dans la base de données:", opposingTeamName);
        setOpposingPlayers([]);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!match) return null;

  // Séparer les joueurs Real Madrid en titulaires et remplaçants
  // Pour l'instant, on prend les 11 premiers comme titulaires et le reste comme remplaçants
  const realMadridLineup = realMadridPlayers.slice(0, 11);
  const realMadridSubs = realMadridPlayers.slice(11);

  // Convertir les joueurs adverses en format PlayerType
  const opposingTeamStarters = opposingPlayers
    .filter(player => player.is_starter)
    .map(player => ({
      name: player.name,
      position: player.position,
      number: player.jersey_number || 0
    }));

  const opposingTeamSubs = opposingPlayers
    .filter(player => !player.is_starter)
    .map(player => ({
      name: player.name,
      position: player.position,
      number: player.jersey_number || 0
    }));

  // Données par défaut si aucun joueur n'est trouvé
  const defaultOpposingLineup = [
    { name: "Gardien", position: "GK", number: 1 },
    { name: "Défenseur 1", position: "CB", number: 2 },
    { name: "Défenseur 2", position: "CB", number: 3 },
    { name: "Défenseur 3", position: "LB", number: 4 },
    { name: "Défenseur 4", position: "RB", number: 5 },
    { name: "Milieu 1", position: "CM", number: 6 },
    { name: "Milieu 2", position: "CM", number: 7 },
    { name: "Milieu 3", position: "CM", number: 8 },
    { name: "Attaquant 1", position: "LW", number: 9 },
    { name: "Attaquant 2", position: "ST", number: 10 },
    { name: "Attaquant 3", position: "RW", number: 11 }
  ];

  const defaultOpposingSubs = [
    { name: "Remplaçant 1", position: "GK", number: 12 },
    { name: "Remplaçant 2", position: "CB", number: 13 },
    { name: "Remplaçant 3", position: "CM", number: 14 },
    { name: "Remplaçant 4", position: "ST", number: 15 }
  ];

  // Utiliser les vrais joueurs ou les données par défaut
  const finalOpposingLineup = opposingTeamStarters.length > 0 ? opposingTeamStarters : defaultOpposingLineup;
  const finalOpposingSubs = opposingTeamSubs.length > 0 ? opposingTeamSubs : defaultOpposingSubs;

  // Données simulées pour les joueurs absents
  const absentPlayers = [
    { name: "Alaba", reason: "Blessure (Ligament croisé)", team: "Real Madrid", return: "Septembre 2025" },
    { name: "Ceballos", reason: "Suspension (Cumulation de cartons jaunes)", team: "Real Madrid", return: "Prochain match" },
    { name: "Rodrygo", reason: "Incertain (Fatigue musculaire)", team: "Real Madrid", return: "Test avant-match" }
  ];

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case "La Liga": return "bg-green-600";
      case "LALIGA": return "bg-green-600";
      case "Ligue des Champions": return "bg-blue-600";
      case "Copa del Rey": return "bg-purple-600";
      default: return "bg-gray-600";
    }
  };

  const renderLineup = (lineup: PlayerType[], subs: PlayerType[], teamName: string) => {
    return (
      <div className="py-4">
        <h4 className="font-bold text-center mb-4">{teamName}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-semibold mb-2">Titulaires</h5>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Joueur</TableHead>
                  <TableHead>Pos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineup.map((player) => (
                  <TableRow key={player.name}>
                    <TableCell>{player.number}</TableCell>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.position}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Remplaçants</h5>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Joueur</TableHead>
                  <TableHead>Pos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.map((player) => (
                  <TableRow key={player.name}>
                    <TableCell>{player.number}</TableCell>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.position}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            <div className="flex items-center gap-2">
              <Badge className={`${getCompetitionColor(match.competition)}`}>
                {match.competition}
              </Badge>
              <span>{match.round}</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center justify-center mt-2 space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span>{formatMatchDate(match.date)}</span>
              <Clock className="h-5 w-5 text-gray-500 ml-4" />
              <span>{formatMatchTime(match.date)}</span>
            </div>
            <div className="flex items-center justify-center mt-2 space-x-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-300">{match.venue}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 my-4">
          <div className="flex flex-col items-center">
            <img 
              src={match.homeTeam.logo} 
              alt={match.homeTeam.name}
              className="w-20 h-20 object-contain"
            />
            <h3 className="text-xl font-bold mt-2">{match.homeTeam.name}</h3>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold text-madrid-gold">VS</div>
          </div>
          
          <div className="flex flex-col items-center">
            <img 
              src={match.awayTeam.logo} 
              alt={match.awayTeam.name}
              className="w-20 h-20 object-contain"
            />
            <h3 className="text-xl font-bold mt-2">{match.awayTeam.name}</h3>
          </div>
        </div>

        <Tabs defaultValue="lineups" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lineups">Compositions probables</TabsTrigger>
            <TabsTrigger value="absents">Joueurs absents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lineups">
            <Card>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="text-center py-8">
                    Chargement des compositions...
                  </div>
                ) : (
                  <>
                    {match.homeTeam.name === 'Real Madrid' ? (
                      <>
                        {renderLineup(realMadridLineup, realMadridSubs, "Real Madrid")}
                        <hr className="my-4" />
                        {renderLineup(finalOpposingLineup, finalOpposingSubs, match.awayTeam.name)}
                      </>
                    ) : (
                      <>
                        {renderLineup(finalOpposingLineup, finalOpposingSubs, match.homeTeam.name)}
                        <hr className="my-4" />
                        {renderLineup(realMadridLineup, realMadridSubs, "Real Madrid")}
                      </>
                    )}
                    {opposingPlayers.length === 0 && (
                      <div className="text-center text-gray-500 mt-4">
                        <p>Composition de l'équipe adverse non disponible.</p>
                        <p className="text-sm">Les joueurs peuvent être ajoutés depuis l'interface d'administration.</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="absents">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  <h3 className="font-bold">Joueurs absents ou incertains</h3>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Joueur</TableHead>
                      <TableHead>Équipe</TableHead>
                      <TableHead>Raison</TableHead>
                      <TableHead>Retour prévu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {absentPlayers.map((player) => (
                      <TableRow key={player.name}>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>{player.team}</TableCell>
                        <TableCell>{player.reason}</TableCell>
                        <TableCell>{player.return}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};