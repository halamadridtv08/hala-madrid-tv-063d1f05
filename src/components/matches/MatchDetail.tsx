import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, AlertCircle, Radio, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TacticalFormation } from "./TacticalFormation";
import { MatchEvents } from "./MatchEvents";
import { MatchStatistics } from "./MatchStatistics";
import { ProbableLineupFormation } from "./ProbableLineupFormation";
import { LiveBlog } from "./LiveBlog";
import { useSiteVisibility } from "@/hooks/useSiteVisibility";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileTabSelector } from "./MobileTabSelector";
interface PlayerType {
  id?: string;
  name: string;
  position: string;
  number: number;
  imageUrl?: string;
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
  photo_url: string | null;
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
  const { isVisible } = useSiteVisibility();
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
      } = await supabase
        .from('players')
        .select('id, name, position, jersey_number, image_url, profile_image_url')
        .eq('is_active', true)
        .order('jersey_number', {
          ascending: true
        });
      if (realMadridError) {
        console.error("Erreur lors du chargement des joueurs Real Madrid:", realMadridError);
        toast.error("Erreur lors du chargement des joueurs Real Madrid");
      } else {
        const formattedPlayers: PlayerType[] = realMadridData.map(player => ({
          id: player.id,
          name: player.name,
          position: player.position,
          number: player.jersey_number || 0,
          imageUrl: player.profile_image_url || player.image_url || undefined
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

  const realMadridPhotoById = Object.fromEntries(
    realMadridPlayers
      .filter(p => p.id && p.imageUrl)
      .map(p => [p.id as string, p.imageUrl as string])
  ) as Record<string, string>;

  const opposingPhotoById = Object.fromEntries(
    opposingPlayers
      .filter(p => p.id && p.photo_url)
      .map(p => [p.id, p.photo_url as string])
  ) as Record<string, string>;

  // Utiliser les compositions probables de la base de données
  const realMadridLineup: PlayerType[] = probableLineups
    .filter(l => l.team_type === 'real_madrid' && l.is_starter)
    .map(l => ({
      id: l.player_id || undefined,
      name: l.player_name,
      position: l.position,
      number: l.jersey_number || 0,
      imageUrl: l.player_id ? realMadridPhotoById[l.player_id] : undefined
    }));

  const realMadridSubs: PlayerType[] = probableLineups
    .filter(l => l.team_type === 'real_madrid' && !l.is_starter)
    .map(l => ({
      id: l.player_id || undefined,
      name: l.player_name,
      position: l.position,
      number: l.jersey_number || 0,
      imageUrl: l.player_id ? realMadridPhotoById[l.player_id] : undefined
    }));

  // Utiliser les compositions probables de la base de données pour l'équipe adverse
  const opposingLineup: PlayerType[] = probableLineups
    .filter(l => l.team_type === 'opposing' && l.is_starter)
    .map(l => ({
      id: l.opposing_player_id || undefined,
      name: l.player_name,
      position: l.position,
      number: l.jersey_number || 0,
      imageUrl: l.opposing_player_id ? opposingPhotoById[l.opposing_player_id] : undefined
    }));

  const opposingSubs: PlayerType[] = probableLineups
    .filter(l => l.team_type === 'opposing' && !l.is_starter)
    .map(l => ({
      id: l.opposing_player_id || undefined,
      name: l.player_name,
      position: l.position,
      number: l.jersey_number || 0,
      imageUrl: l.opposing_player_id ? opposingPhotoById[l.opposing_player_id] : undefined
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

  // Utiliser les vraies compos uniquement - afficher message "aucune composition" sinon
  const finalOpposingLineup = opposingLineup;
  const finalOpposingSubs = opposingSubs;

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-3 sm:p-6">
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

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 my-4">
          <div className="flex flex-col items-center">
            <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-14 h-14 sm:w-20 sm:h-20 object-contain" />
            <h3 className="text-base sm:text-xl font-bold mt-2 text-center">{match.homeTeam.name}</h3>
          </div>
          
          <div className="text-center">
            <div className="text-3xl sm:text-5xl font-bold text-madrid-gold">VS</div>
          </div>
          
          <div className="flex flex-col items-center">
            <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-14 h-14 sm:w-20 sm:h-20 object-contain" />
            <h3 className="text-base sm:text-xl font-bold mt-2 text-center">{match.awayTeam.name}</h3>
          </div>
        </div>

        <MobileTabSelector 
          match={match} 
          isVisible={isVisible} 
          loading={loading}
          realMadridLineup={realMadridLineup}
          realMadridSubs={realMadridSubs}
          finalOpposingLineup={finalOpposingLineup}
          finalOpposingSubs={finalOpposingSubs}
          absentPlayers={absentPlayers}
        />
      </DialogContent>
    </Dialog>;
};