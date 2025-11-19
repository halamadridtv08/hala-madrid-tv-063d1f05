import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Goal, 
  Shield, 
  Flag, 
  ArrowRightLeft, 
  FileWarning,
  Megaphone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MatchEventsProps {
  matchDetails: any;
}

interface Player {
  id: string;
  name: string;
  image_url: string | null;
  profile_image_url: string | null;
}

export const MatchEvents = ({ matchDetails }: MatchEventsProps) => {
  const [sortByMinute, setSortByMinute] = useState(false);
  const [realMadridPlayers, setRealMadridPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetchRealMadridPlayers();
  }, []);

  const fetchRealMadridPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('id, name, image_url, profile_image_url')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching players:', error);
      return;
    }

    setRealMadridPlayers(data || []);
  };

  if (!matchDetails) return null;

  const formatPlayerName = (name: string) => {
    if (!name) return '';
    return name.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getPlayerInitials = (name: string) => {
    const formatted = formatPlayerName(name);
    const parts = formatted.split(' ');
    return parts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
  };

  // Fonction pour trouver l'image du joueur
  const getPlayerImage = (playerName: string, team: string): string | null => {
    if (team !== 'real_madrid') return null;

    // Normaliser le nom du joueur pour la correspondance
    const normalizedEventName = playerName.toLowerCase().replace(/\s+/g, '_');
    
    // Chercher le joueur par correspondance de nom
    const player = realMadridPlayers.find(p => {
      const normalizedDbName = p.name.toLowerCase().replace(/\s+/g, '_');
      
      // Correspondance exacte
      if (normalizedDbName === normalizedEventName) return true;
      
      // Correspondance partielle (nom de famille)
      const eventParts = normalizedEventName.split('_');
      const dbParts = normalizedDbName.split('_');
      
      // Vérifier si le nom de famille correspond
      return eventParts.some(part => 
        dbParts.some(dbPart => dbPart.includes(part) || part.includes(dbPart))
      );
    });

    return player?.profile_image_url || player?.image_url || null;
  };

  // Extraire les événements
  const goals = matchDetails.goals || [];
  const substitutions = matchDetails.substitutions || [];
  const cards = matchDetails.cards || { yellow: {}, red: {} };
  const fouls = matchDetails.fouls || [];

  // Créer les événements de cartons à partir des fautes
  const yellowCardEvents = fouls.map((foul: any) => ({
    ...foul,
    type: 'yellow'
  }));

  // Fonction de tri
  const sortEvents = (events: any[]) => {
    if (!sortByMinute) return events;
    return [...events].sort((a, b) => a.minute - b.minute);
  };

  const EventSection = ({ title, icon: Icon, children }: any) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4 p-2 bg-muted/30 rounded-t-lg border-b-2 border-border">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );

  const EventRow = ({ 
    player, 
    detail, 
    minute, 
    icon: Icon, 
    iconColor,
    isRightSide = false,
    team,
    score,
    additionalInfo
  }: any) => {
    const playerImage = getPlayerImage(player, team);
    
    return (
      <div className={`flex items-center gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors ${isRightSide ? 'flex-row-reverse' : ''}`}>
        <Avatar className="h-10 w-10 border-2 border-border">
          {playerImage && <AvatarImage src={playerImage} alt={formatPlayerName(player)} />}
          <AvatarFallback className="bg-madrid-blue text-white text-xs">
            {getPlayerInitials(player)}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex-1 ${isRightSide ? 'text-right' : ''}`}>
          <div className="font-semibold text-foreground">
            {formatPlayerName(player)}
          </div>
          {detail && (
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              {Icon && <Icon className="h-3 w-3" />}
              {detail}
            </div>
          )}
          {score && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {score}
            </div>
          )}
        </div>

        {Icon && iconColor && (
          <Icon className={`h-5 w-5 ${iconColor}`} />
        )}

        <Badge className="bg-green-600 hover:bg-green-700 text-white min-w-[45px] justify-center font-bold">
          {minute}'
        </Badge>

        {additionalInfo && (
          <div className="text-xs text-muted-foreground">
            {additionalInfo}
          </div>
        )}
      </div>
    );
  };

  const GoalEvent = ({ goal, index }: any) => {
    // Déterminer le type de but et l'icône
    const isPenalty = goal.type === 'penalty';
    const isOwnGoal = goal.type === 'own_goal';
    
    return (
      <EventRow
        key={index}
        player={goal.scorer}
        detail={goal.assist ? formatPlayerName(goal.assist) : null}
        minute={goal.minute}
        icon={isPenalty ? Shield : Goal}
        iconColor="text-green-600"
        team={goal.team}
        score={goal.score}
        additionalInfo={isPenalty ? 'PEN' : null}
      />
    );
  };

  const SubstitutionEvent = ({ sub, index }: any) => {
    const isRightSide = sub.team !== 'real_madrid';
    
    return (
      <div key={index}>
        <EventRow
          player={sub.in}
          detail={formatPlayerName(sub.out)}
          minute={sub.minute}
          icon={ArrowRightLeft}
          iconColor="text-red-500"
          isRightSide={isRightSide}
          team={sub.team}
        />
      </div>
    );
  };

  const CardEvent = ({ card, index }: any) => {
    const isRightSide = card.team !== 'real_madrid';
    
    return (
      <EventRow
        key={index}
        player={card.player}
        detail="Faute"
        minute={card.minute}
        icon={Flag}
        iconColor={card.type === 'red' ? 'text-red-600' : 'text-yellow-500'}
        isRightSide={isRightSide}
        team={card.team}
      />
    );
  };

  const sortedGoals = sortEvents(goals);
  const sortedSubstitutions = sortEvents(substitutions);
  const sortedCards = sortEvents(yellowCardEvents);

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Toggle pour trier par minute */}
        <div className="flex items-center justify-between mb-6 p-3 bg-muted/50 rounded-lg">
          <Label htmlFor="sort-mode" className="text-sm font-medium cursor-pointer">
            Classez les événements par minute
          </Label>
          <Switch
            id="sort-mode"
            checked={sortByMinute}
            onCheckedChange={setSortByMinute}
          />
        </div>

        {/* Section Buts */}
        {sortedGoals.length > 0 && (
          <EventSection title="BUTS" icon={Goal}>
            {sortedGoals.map((goal: any, index: number) => (
              <GoalEvent key={index} goal={goal} index={index} />
            ))}
          </EventSection>
        )}

        {/* Section VAR - si disponible */}
        {matchDetails.var && matchDetails.var.length > 0 && (
          <EventSection title="VAR" icon={FileWarning}>
            {matchDetails.var.map((var_event: any, index: number) => (
              <EventRow
                key={index}
                player={var_event.player}
                detail={var_event.decision}
                minute={var_event.minute}
                icon={FileWarning}
                iconColor="text-purple-600"
                team={var_event.team}
              />
            ))}
          </EventSection>
        )}

        {/* Section Occasions - si disponible */}
        {matchDetails.chances && matchDetails.chances.length > 0 && (
          <EventSection title="OCCASIONS" icon={Megaphone}>
            {matchDetails.chances.map((chance: any, index: number) => (
              <EventRow
                key={index}
                player={chance.player}
                detail={chance.type}
                minute={chance.minute}
                icon={Megaphone}
                iconColor="text-blue-600"
                team={chance.team}
              />
            ))}
          </EventSection>
        )}

        {/* Section Cartes */}
        {sortedCards.length > 0 && (
          <EventSection title="CARTES" icon={Flag}>
            {sortedCards.map((card: any, index: number) => (
              <CardEvent key={index} card={card} index={index} />
            ))}
          </EventSection>
        )}

        {/* Section Substitutions */}
        {sortedSubstitutions.length > 0 && (
          <EventSection title="SUBSTITUTIONS" icon={ArrowRightLeft}>
            {sortedSubstitutions.map((sub: any, index: number) => (
              <SubstitutionEvent key={index} sub={sub} index={index} />
            ))}
          </EventSection>
        )}

        {sortedGoals.length === 0 && sortedSubstitutions.length === 0 && sortedCards.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucun événement disponible pour ce match
          </div>
        )}
      </CardContent>
    </Card>
  );
};
