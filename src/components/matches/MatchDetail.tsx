import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TacticalFormation } from "./TacticalFormation";
import { MatchEvents } from "./MatchEvents";
import { MatchStatistics } from "./MatchStatistics";
import { ProbableLineupFormation } from "./ProbableLineupFormation";
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
export const MatchDetail = ({
  match,
  isOpen,
  onClose
}: MatchDetailProps) => {
  const [opposingPlayers, setOpposingPlayers] = useState<OpposingPlayer[]>([]);
  const [realMadridPlayers, setRealMadridPlayers] = useState<PlayerType[]>([]);
  const [probableLineups, setProbableLineups] = useState<any[]>([]);
  const [absentPlayers, setAbsentPlayers] = useState<any[]>([]);
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
      // Récupérer les compositions probables
      const {
        data: lineupsData
      } = await supabase.from('match_probable_lineups').select('*').eq('match_id', match.id).order('is_starter', {
        ascending: false
      });
      if (lineupsData) {
        setProbableLineups(lineupsData);
      }

      // Récupérer les joueurs absents
      const {
        data: absentData
      } = await supabase.from('match_absent_players').select('*').eq('match_id', match.id);
      if (absentData) {
        setAbsentPlayers(absentData);
      }

      // Récupérer les joueurs Real Madrid depuis la base de données
      const {
        data: realMadridData,
        error: realMadridError
      } = await supabase.from('players').select('name, position, jersey_number').eq('is_active', true).order('jersey_number', {
        ascending: true
      });
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
      const {
        data: teamData,
        error: teamError
      } = await supabase.from('opposing_teams').select('id').eq('name', opposingTeamName).maybeSingle();
      if (teamError) {
        console.error("Erreur lors de la recherche de l'équipe adverse:", teamError);
      } else if (teamData) {
        const {
          data: playersData,
          error: playersError
        } = await supabase.from('opposing_players').select('*').eq('team_id', teamData.id).order('is_starter', {
          ascending: false
        }).order('jersey_number', {
          ascending: true
        });
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

  // Utiliser les compositions probables de la base de données
  const realMadridLineup = probableLineups.filter(l => l.team_type === 'real_madrid' && l.is_starter).map(l => ({
    name: l.player_name,
    position: l.position,
    number: l.jersey_number || 0
  }));
  const realMadridSubs = probableLineups.filter(l => l.team_type === 'real_madrid' && !l.is_starter).map(l => ({
    name: l.player_name,
    position: l.position,
    number: l.jersey_number || 0
  }));

  // Utiliser les compositions probables de la base de données pour l'équipe adverse
  const opposingLineup = probableLineups.filter(l => l.team_type === 'opposing' && l.is_starter).map(l => ({
    name: l.player_name,
    position: l.position,
    number: l.jersey_number || 0
  }));
  const opposingSubs = probableLineups.filter(l => l.team_type === 'opposing' && !l.is_starter).map(l => ({
    name: l.player_name,
    position: l.position,
    number: l.jersey_number || 0
  }));

  // Données par défaut si aucune composition n'est trouvée
  const defaultOpposingLineup = [{
    name: "Gardien",
    position: "GK",
    number: 1
  }, {
    name: "Défenseur 1",
    position: "CB",
    number: 2
  }, {
    name: "Défenseur 2",
    position: "CB",
    number: 3
  }, {
    name: "Défenseur 3",
    position: "LB",
    number: 4
  }, {
    name: "Défenseur 4",
    position: "RB",
    number: 5
  }, {
    name: "Milieu 1",
    position: "CM",
    number: 6
  }, {
    name: "Milieu 2",
    position: "CM",
    number: 7
  }, {
    name: "Milieu 3",
    position: "CM",
    number: 8
  }, {
    name: "Attaquant 1",
    position: "LW",
    number: 9
  }, {
    name: "Attaquant 2",
    position: "ST",
    number: 10
  }, {
    name: "Attaquant 3",
    position: "RW",
    number: 11
  }];
  const defaultOpposingSubs = [{
    name: "Remplaçant 1",
    position: "GK",
    number: 12
  }, {
    name: "Remplaçant 2",
    position: "CB",
    number: 13
  }, {
    name: "Remplaçant 3",
    position: "CM",
    number: 14
  }, {
    name: "Remplaçant 4",
    position: "ST",
    number: 15
  }];

  // Utiliser les vraies compos ou les données par défaut
  const finalOpposingLineup = opposingLineup.length > 0 ? opposingLineup : defaultOpposingLineup;
  const finalOpposingSubs = opposingSubs.length > 0 ? opposingSubs : defaultOpposingSubs;

  // Les joueurs absents viennent maintenant de la base de données via le state

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
      case "La Liga":
        return "bg-green-600";
      case "LALIGA":
        return "bg-green-600";
      case "Ligue des Champions":
        return "bg-blue-600";
      case "Copa del Rey":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };
  
  return <Dialog open={isOpen} onOpenChange={() => onClose()}>
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
            <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-20 h-20 object-contain" />
            <h3 className="text-xl font-bold mt-2">{match.homeTeam.name}</h3>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold text-madrid-gold">VS</div>
          </div>
          
          <div className="flex flex-col items-center">
            <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-20 h-20 object-contain" />
            <h3 className="text-xl font-bold mt-2">{match.awayTeam.name}</h3>
          </div>
        </div>

        <Tabs defaultValue="tactical" className="mt-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="tactical">Compositions officielles</TabsTrigger>
            <TabsTrigger value="events">Événements</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="lineups">Compositions probables</TabsTrigger>
            <TabsTrigger value="absents">Joueurs absents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tactical">
            <TacticalFormation matchId={match.id} matchData={match} />
          </TabsContent>

          <TabsContent value="events">
            <MatchEvents matchDetails={match.match_details} />
          </TabsContent>

          <TabsContent value="stats">
            <MatchStatistics matchDetails={match.match_details} homeTeam={match.homeTeam.name} awayTeam={match.awayTeam.name} />
          </TabsContent>

          <TabsContent value="lineups">
            <Card>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="text-center py-8">
                    Chargement des compositions...
                  </div>
                ) : (
                  <ProbableLineupFormation
                    realMadridLineup={realMadridLineup}
                    realMadridSubs={realMadridSubs}
                    opposingLineup={finalOpposingLineup}
                    opposingSubs={finalOpposingSubs}
                    opposingTeamName={match.homeTeam.name === 'Real Madrid' ? match.awayTeam.name : match.homeTeam.name}
                    homeTeamName={match.homeTeam.name}
                  />
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
                
                {absentPlayers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Aucun joueur absent pour ce match</p>
                ) : (
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
                      {absentPlayers.map(player => (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">{player.player_name}</TableCell>
                          <TableCell>{player.team_type === 'real_madrid' ? 'Real Madrid' : 'Équipe adverse'}</TableCell>
                          <TableCell>{player.reason}</TableCell>
                          <TableCell>{player.return_date ? new Date(player.return_date).toLocaleDateString('fr-FR') : 'Non défini'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>;
};