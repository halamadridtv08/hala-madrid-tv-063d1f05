
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, AlertCircle } from "lucide-react";

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

export const MatchDetail = ({ match, isOpen, onClose }: MatchDetailProps) => {
  if (!match) return null;

  // Données simulées pour les compositions probables
  const homeLineup = [
    { name: "Courtois", position: "GK", number: 1 },
    { name: "Carvajal", position: "RB", number: 2 },
    { name: "Militão", position: "CB", number: 3 },
    { name: "Rüdiger", position: "CB", number: 22 },
    { name: "Mendy", position: "LB", number: 23 },
    { name: "Valverde", position: "CM", number: 8 },
    { name: "Tchouameni", position: "CDM", number: 14 },
    { name: "Camavinga", position: "CM", number: 6 },
    { name: "Bellingham", position: "CAM", number: 5 },
    { name: "Vini Jr.", position: "LW", number: 7 },
    { name: "Mbappé", position: "ST", number: 9 }
  ];

  const awayLineup = match.awayTeam ? [
    { name: "Ederson", position: "GK", number: 31 },
    { name: "Walker", position: "RB", number: 2 },
    { name: "Dias", position: "CB", number: 3 },
    { name: "Stones", position: "CB", number: 5 },
    { name: "Gvardiol", position: "LB", number: 24 },
    { name: "Rodri", position: "CDM", number: 16 },
    { name: "De Bruyne", position: "CM", number: 17 },
    { name: "Silva", position: "CM", number: 20 },
    { name: "Foden", position: "LW", number: 47 },
    { name: "Grealish", position: "RW", number: 10 },
    { name: "Haaland", position: "ST", number: 9 }
  ] : [];

  // Données simulées pour les joueurs absents
  const absentPlayers = [
    { name: "Alaba", reason: "Blessure (Ligament croisé)", team: "Real Madrid", return: "Septembre 2025" },
    { name: "Ceballos", reason: "Blessure (Cheville)", team: "Real Madrid", return: "1 semaine" },
    { name: "Rodrygo", reason: "Incertain (Fatigue musculaire)", team: "Real Madrid", return: "Test avant-match" },
    { name: "Doku", reason: "Blessure (Ischio-jambiers)", team: "Manchester City", return: "2 semaines" }
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
      case "Ligue des Champions": return "bg-blue-600";
      case "Copa del Rey": return "bg-purple-600";
      default: return "bg-gray-600";
    }
  };

  const renderLineup = (lineup: PlayerType[], teamName: string) => {
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
            <p className="text-sm text-gray-500">Liste des remplaçants à confirmer</p>
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
                {renderLineup(homeLineup, match.homeTeam.name)}
                <hr className="my-4" />
                {renderLineup(awayLineup, match.awayTeam.name)}
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
