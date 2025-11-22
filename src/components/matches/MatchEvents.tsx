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

  // Table de correction des noms courants (mapping manuel)
  const nameCorrections: { [key: string]: string } = {
    // Variations courantes
    'vinicius': 'vinicius_junior',
    'vini': 'vinicius_junior',
    'rodrygo': 'rodrygo',
    'mbappe': 'kylian_mbappe',
    'kylian': 'kylian_mbappe',
    'bellingham': 'jude_bellingham',
    'jude': 'jude_bellingham',
    'valverde': 'federico_valverde',
    'fede': 'federico_valverde',
    'modric': 'luka_modric',
    'kroos': 'toni_kroos',
    'courtois': 'thibaut_courtois',
    'militao': 'eder_militao',
    'rudiger': 'antonio_rudiger',
    'carvajal': 'dani_carvajal',
    'camavinga': 'eduardo_camavinga',
    'tchouameni': 'aurelien_tchouameni',
    'guler': 'arda_guler',
    'arda': 'arda_guler',
    'brahim': 'brahim_diaz',
    'endrick': 'endrick',
    'ancelotti': 'carlo_ancelotti'
  };

  // Fonction pour normaliser les noms (supprimer accents, espaces, etc.)
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9]/g, '_') // Remplacer caractères spéciaux par underscore
      .replace(/_+/g, '_') // Fusionner underscores multiples
      .replace(/^_|_$/g, '') // Supprimer underscores début/fin
      .trim();
  };

  // Fonction pour extraire le nom de famille (dernier mot)
  const getLastName = (name: string): string => {
    const parts = name.split(/[\s_]+/).filter(p => p.length > 0);
    return parts[parts.length - 1] || '';
  };

  // Fonction pour suggérer une correction de nom
  const suggestNameCorrection = (playerName: string): string => {
    const normalized = normalizeString(playerName);
    
    // Vérifier d'abord dans la table de corrections
    if (nameCorrections[normalized]) {
      return nameCorrections[normalized];
    }
    
    // Vérifier le nom de famille dans la table
    const lastName = normalizeString(getLastName(playerName));
    if (nameCorrections[lastName]) {
      return nameCorrections[lastName];
    }
    
    return playerName;
  };

  // Fonction pour trouver l'image du joueur avec correspondance améliorée
  const getPlayerImage = (playerName: string, team: string): string | null => {
    if (team !== 'real_madrid') return null;
    if (!playerName) return null;

    // Appliquer la correction de nom
    const correctedName = suggestNameCorrection(playerName);
    const normalizedEventName = normalizeString(correctedName);
    const eventLastName = normalizeString(getLastName(correctedName));
    
    // Chercher le joueur par correspondance de nom
    const player = realMadridPlayers.find(p => {
      const normalizedDbName = normalizeString(p.name);
      const dbLastName = normalizeString(getLastName(p.name));
      
      // 1. Correspondance exacte du nom complet
      if (normalizedDbName === normalizedEventName) {
        return true;
      }
      
      // 2. Correspondance exacte du nom de famille
      if (eventLastName && dbLastName && eventLastName === dbLastName) {
        return true;
      }
      
      // 3. Le nom de l'événement contient le nom de famille de la DB
      if (dbLastName && normalizedEventName.includes(dbLastName)) {
        return true;
      }
      
      // 4. Le nom de la DB contient le nom de famille de l'événement
      if (eventLastName && normalizedDbName.includes(eventLastName)) {
        return true;
      }
      
      // 5. Correspondance partielle des mots (au moins 50% de correspondance)
      const eventParts = normalizedEventName.split('_').filter(p => p.length > 2);
      const dbParts = normalizedDbName.split('_').filter(p => p.length > 2);
      
      if (eventParts.length === 0 || dbParts.length === 0) return false;
      
      let matchCount = 0;
      for (const eventPart of eventParts) {
        for (const dbPart of dbParts) {
          if (eventPart === dbPart || eventPart.includes(dbPart) || dbPart.includes(eventPart)) {
            matchCount++;
            break;
          }
        }
      }
      
      const matchRatio = matchCount / Math.max(eventParts.length, dbParts.length);
      return matchRatio >= 0.5;
    });

    return player?.profile_image_url || player?.image_url || null;
  };

  // Extraire les événements
  const goals = matchDetails.goals || [];
  const substitutions = matchDetails.substitutions || [];
  const cards = matchDetails.cards || { yellow: {}, red: {} };
  const fouls = matchDetails.fouls || [];

  // Créer les événements de cartons à partir des fautes (cartons jaunes)
  const yellowCardEvents = fouls.map((foul: any) => ({
    ...foul,
    type: 'yellow'
  }));

  // Créer les événements de cartons rouges (si disponibles dans les données)
  const redCardEvents: any[] = [];
  
  // Vérifier si on a des données de cartons rouges dans les événements
  if (matchDetails.cards && matchDetails.cards.red_card_events) {
    redCardEvents.push(...matchDetails.cards.red_card_events.map((card: any) => ({
      ...card,
      type: 'red'
    })));
  }

  // Combiner tous les événements de cartons
  const allCardEvents = [...yellowCardEvents, ...redCardEvents];

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
    const isRed = card.type === 'red';
    
    return (
      <div key={index} className={`flex items-center gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors ${isRightSide ? 'flex-row-reverse' : ''}`}>
        <Avatar className="h-10 w-10 border-2 border-border">
          {getPlayerImage(card.player, card.team) && (
            <AvatarImage src={getPlayerImage(card.player, card.team)!} alt={formatPlayerName(card.player)} />
          )}
          <AvatarFallback className="bg-madrid-blue text-white text-xs">
            {getPlayerInitials(card.player)}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex-1 ${isRightSide ? 'text-right' : ''}`}>
          <div className="font-semibold text-foreground">
            {formatPlayerName(card.player)}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Flag className="h-3 w-3" />
            Faute
          </div>
        </div>

        {/* Carton visuel */}
        <div className={`w-6 h-8 rounded-sm shadow-md ${isRed ? 'bg-red-600' : 'bg-yellow-400'}`}>
        </div>

        <Badge className="bg-green-600 hover:bg-green-700 text-white min-w-[45px] justify-center font-bold">
          {card.minute}'
        </Badge>
      </div>
    );
  };

  const sortedGoals = sortEvents(goals);
  const sortedSubstitutions = sortEvents(substitutions);
  const sortedCards = sortEvents(allCardEvents);

  // Créer une timeline combinée quand le tri par minute est activé
  const combinedTimeline = sortByMinute ? [
    ...goals.map(g => ({ ...g, eventType: 'goal' })),
    ...substitutions.map(s => ({ ...s, eventType: 'substitution' })),
    ...allCardEvents.map(c => ({ ...c, eventType: 'card' })),
    ...(matchDetails.var || []).map((v: any) => ({ ...v, eventType: 'var' })),
    ...(matchDetails.chances || []).map((ch: any) => ({ ...ch, eventType: 'chance' }))
  ].sort((a, b) => a.minute - b.minute) : [];

  // Fonction pour rendre un événement en fonction de son type
  const renderEvent = (event: any, index: number) => {
    switch (event.eventType) {
      case 'goal':
        return <GoalEvent key={`goal-${index}`} goal={event} index={index} />;
      case 'substitution':
        return <SubstitutionEvent key={`sub-${index}`} sub={event} index={index} />;
      case 'card':
        return <CardEvent key={`card-${index}`} card={event} index={index} />;
      case 'var':
        return (
          <EventRow
            key={`var-${index}`}
            player={event.player}
            detail={event.decision}
            minute={event.minute}
            icon={FileWarning}
            iconColor="text-purple-600"
            team={event.team}
          />
        );
      case 'chance':
        return (
          <EventRow
            key={`chance-${index}`}
            player={event.player}
            detail={event.type}
            minute={event.minute}
            icon={Megaphone}
            iconColor="text-blue-600"
            team={event.team}
          />
        );
      default:
        return null;
    }
  };

  // Si pas de données de match
  if (!matchDetails) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <FileWarning className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Aucune donnée disponible</p>
            <p className="text-sm mt-2">Les événements du match seront disponibles après le début du match.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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

        {/* Affichage par minute (timeline combinée) */}
        {sortByMinute ? (
          <div className="space-y-2">
            {combinedTimeline.length > 0 ? (
              combinedTimeline.map((event, index) => renderEvent(event, index))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Aucun événement disponible pour ce match
              </div>
            )}
          </div>
        ) : (
          /* Affichage par catégorie */
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};
