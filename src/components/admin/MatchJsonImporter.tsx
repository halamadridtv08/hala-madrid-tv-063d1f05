import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileJson, Upload, CheckCircle2, AlertCircle, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Match } from "@/types/Match";
import { MatchImportPreview } from "./MatchImportPreview";
import { MatchImportHistory } from "./MatchImportHistory";
import { PlayerNameValidator } from "./PlayerNameValidator";
import { normalizeCompetitionName } from "@/utils/competitionNormalizer";
import { findBestPlayerMatch, extractPlayerNamesFromMatchJson } from "@/utils/playerNameMatcher";

interface MatchJsonData {
  id?: string;
  home_team: string;
  away_team: string;
  home_team_logo?: string;
  away_team_logo?: string;
  home_score?: number;
  away_score?: number;
  match_date: string;
  venue?: string;
  competition?: string;
  status?: string;
  match_details?: any;
}

interface ImportedMatchJson {
  match: {
    date: string;
    time: string;
    round?: string;
    score: {
      [team: string]: number;
    };
    teams: {
      away: string;
      home: string;
    };
    season?: string;
    status: string;
    possession?: {
      [team: string]: string;
    };
    competition: string;
    venue?: string;
  };
  events?: {
    cards?: {
      red: { [team: string]: number };
      yellow: { [team: string]: number };
    };
    fouls?: Array<{ team: string; minute: number; player: string }>;
    goals?: Array<{ team: string; minute: number; scorer: string }>;
    substitutions?: Array<{ in: string; out: string; team: string; minute: number }>;
  };
  statistics?: {
    fouls?: { [team: string]: number };
    shots?: any;
    passes?: any;
    corners?: { [team: string]: number };
    tackles?: { [team: string]: number };
    offsides?: { [team: string]: number };
    goalkeeper_saves?: { [team: string]: number };
  };
}

export const MatchJsonImporter = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [parsedData, setParsedData] = useState<MatchJsonData | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [playerNamesToValidate, setPlayerNamesToValidate] = useState<string[]>([]);
  const [showPlayerValidation, setShowPlayerValidation] = useState(false);
  const [playerNameMapping, setPlayerNameMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des matchs:', error);
      toast.error("Erreur lors du chargement des matchs");
    } finally {
      setIsLoadingMatches(false);
    }
  };

  // Fonction pour formater les cartons dans le format attendu par MatchEvents
  const formatCardsForDisplay = (events: ImportedMatchJson['events']): { yellow: Record<string, string[]>; red: Record<string, string[]> } => {
    const cards = { yellow: {} as Record<string, string[]>, red: {} as Record<string, string[]> };
    
    // Traiter les cartons depuis les fautes si disponibles
    if (events?.fouls) {
      for (const foul of events.fouls) {
        if (!cards.yellow[foul.team]) {
          cards.yellow[foul.team] = [];
        }
        cards.yellow[foul.team].push(`${foul.player} (${foul.minute}')`);
      }
    }
    
    // Si les cartons sont déjà définis, les formater correctement
    if (events?.cards) {
      if (events.cards.yellow) {
        for (const [team, count] of Object.entries(events.cards.yellow)) {
          // Si c'est un nombre, on ne peut pas créer les entrées sans noms de joueurs
          // Les données seront récupérées depuis fouls
        }
      }
      if (events.cards.red) {
        for (const [team, count] of Object.entries(events.cards.red)) {
          // Idem
        }
      }
    }
    
    return cards;
  };

  const transformImportedJson = async (imported: ImportedMatchJson): Promise<MatchJsonData> => {
    const homeTeam = imported.match.teams.home;
    const awayTeam = imported.match.teams.away;
    
    // Normalize competition name
    const competitionRaw = imported.match.competition.replace(/_/g, ' ').toUpperCase();
    const normalizedCompetition = await normalizeCompetitionName(competitionRaw);
    
    // Formater les cartons pour l'affichage
    const formattedCards = formatCardsForDisplay(imported.events);
    
    return {
      home_team: homeTeam === "real_madrid" ? "Real Madrid" : homeTeam.charAt(0).toUpperCase() + homeTeam.slice(1),
      away_team: awayTeam === "real_madrid" ? "Real Madrid" : awayTeam.charAt(0).toUpperCase() + awayTeam.slice(1),
      home_score: imported.match.score[homeTeam] || 0,
      away_score: imported.match.score[awayTeam] || 0,
      match_date: `${imported.match.date}T${imported.match.time}:00Z`,
      venue: imported.match.venue,
      competition: normalizedCompetition,
      status: imported.match.status === "termine" ? "finished" : imported.match.status,
      match_details: {
        // Événements à la racine pour MatchEvents
        goals: imported.events?.goals || [],
        substitutions: imported.events?.substitutions || [],
        cards: formattedCards,
        fouls: imported.events?.fouls || [],
        possession: imported.match.possession || {},
        
        // Statistiques sous statistics pour MatchStatistics
        statistics: {
          shots: imported.statistics?.shots,
          passes: imported.statistics?.passes,
          fouls: imported.statistics?.fouls,
          corners: imported.statistics?.corners,
          tackles: imported.statistics?.tackles,
          offsides: imported.statistics?.offsides,
          goalkeeper_saves: imported.statistics?.goalkeeper_saves
        },
        
        // Conserver les données brutes pour référence
        raw: {
          match: imported.match,
          events: imported.events,
          statistics: imported.statistics
        }
      }
    };
  };

  const normalizeJsonKeys = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => normalizeJsonKeys(item));
    
    const normalized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Normaliser la clé en minuscules et sans espaces
      const normalizedKey = key.toLowerCase().trim();
      normalized[normalizedKey] = normalizeJsonKeys(value);
    }
    return normalized;
  };

  const transformSimpleFormat = async (data: any): Promise<MatchJsonData> => {
    // Déterminer les équipes à partir de score ou possession
    const teams = Object.keys(data.score || data.possession || {});
    const realMadridKey = teams.find(t => t.includes('real_madrid') || t.includes('realmadrid'));
    const opponentKey = teams.find(t => t !== realMadridKey);
    
    const isHome = realMadridKey === teams[0];
    
    // Formater les cartons - supporter plusieurs formats
    const formattedCards: { yellow: Record<string, string[]>; red: Record<string, string[]> } = { 
      yellow: {}, 
      red: {} 
    };
    
    // Format 1: events.yellow_cards / events.red_cards (array d'objets)
    if (data.events?.yellow_cards && Array.isArray(data.events.yellow_cards)) {
      for (const card of data.events.yellow_cards) {
        const team = card.team;
        if (!formattedCards.yellow[team]) {
          formattedCards.yellow[team] = [];
        }
        formattedCards.yellow[team].push(`${card.player} (${card.minute}')`);
      }
    }
    if (data.events?.red_cards && Array.isArray(data.events.red_cards)) {
      for (const card of data.events.red_cards) {
        const team = card.team;
        if (!formattedCards.red[team]) {
          formattedCards.red[team] = [];
        }
        formattedCards.red[team].push(`${card.player} (${card.minute}')`);
      }
    }
    
    // Format 2: cards.yellow / cards.red avec nombres (compter seulement)
    // On garde les données existantes des events si disponibles
    
    return {
      home_team: isHome ? "Real Madrid" : opponentKey?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Équipe adverse",
      away_team: isHome ? opponentKey?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Équipe adverse" : "Real Madrid",
      home_score: isHome ? (data.score?.[realMadridKey] || 0) : (data.score?.[opponentKey] || 0),
      away_score: isHome ? (data.score?.[opponentKey] || 0) : (data.score?.[realMadridKey] || 0),
      match_date: data.date || new Date().toISOString(),
      venue: data.venue || "Santiago Bernabéu",
      competition: data.competition ? await normalizeCompetitionName(data.competition) : "La Liga",
      status: data.status || "finished",
      match_details: {
        // Événements à la racine pour MatchEvents
        goals: data.goals || [],
        substitutions: data.substitutions || [],
        cards: formattedCards,
        possession: data.possession || {},
        
        // Statistiques sous statistics pour MatchStatistics
        statistics: data.statistics || {
          shots: data.shots,
          passes: data.passes,
          fouls: data.statistics?.fouls,
          corners: data.statistics?.corners,
          tackles: data.statistics?.tackles,
          offsides: data.statistics?.offsides,
          goalkeeper_saves: data.statistics?.goalkeeper_saves
        },
        
        // Données brutes pour référence
        raw: data
      }
    };
  };

  const validateJson = async (input: string): Promise<MatchJsonData | null> => {
    try {
      let data = JSON.parse(input);
      
      // Normaliser toutes les clés en minuscules
      data = normalizeJsonKeys(data);
      
      // Check if it's the new format (with match.teams)
      if (data.match && data.match.teams) {
        const transformed = await transformImportedJson(data as ImportedMatchJson);
        setParsedData(transformed);
        setValidationStatus("valid");
        return transformed;
      }
      
      // Check if it's the simple format (with score/possession/goals at root)
      if (data.score || (data.possession && data.goals)) {
        const transformed = await transformSimpleFormat(data);
        setParsedData(transformed);
        setValidationStatus("valid");
        return transformed;
      }
      
      // Check if it's the old format (direct match data)
      if (!data.home_team || !data.away_team || !data.match_date) {
        toast.error("Format JSON invalide. Vérifiez la structure.");
        return null;
      }

      // Normalize competition name for old format too
      if (data.competition) {
        data.competition = await normalizeCompetitionName(data.competition);
      }

      // S'assurer que match_details est présent
      if (!data.match_details) {
        data.match_details = {};
      }

      setParsedData(data);
      setValidationStatus("valid");
      return data;
    } catch (error) {
      setValidationStatus("invalid");
      toast.error("JSON invalide");
      return null;
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    setValidationStatus("idle");
    setParsedData(null);
  };

  const handleValidate = async () => {
    if (!jsonInput.trim()) {
      toast.error("Veuillez coller un JSON");
      return;
    }
    
    if (!selectedMatchId) {
      toast.error("Veuillez d'abord sélectionner un match");
      return;
    }
    
    const parsedResult = await validateJson(jsonInput);
    
    if (parsedResult) {
      // Extraire les noms de joueurs du Real Madrid uniquement
      const jsonData = JSON.parse(jsonInput);
      const playerNames = new Set<string>();
      
      // Déterminer la clé Real Madrid
      const teams = Object.keys(jsonData.score || jsonData.possession || {});
      const realMadridKey = teams.find(t => t.includes('real_madrid') || t.includes('realmadrid')) || 'real_madrid';
      
      // Collecter les noms depuis les buts - SEULEMENT Real Madrid
      const goals = jsonData.goals || jsonData.events?.goals || [];
      goals.forEach((goal: any) => {
        if (goal.team === realMadridKey) {
          if (goal.scorer) playerNames.add(goal.scorer);
          if (goal.assist) playerNames.add(goal.assist);
        }
      });
      
      // Collecter depuis les cartons - format events.yellow_cards - SEULEMENT Real Madrid
      if (jsonData.events?.yellow_cards && Array.isArray(jsonData.events.yellow_cards)) {
        jsonData.events.yellow_cards.forEach((card: any) => {
          if (card.team === realMadridKey && card.player) playerNames.add(card.player);
        });
      }
      if (jsonData.events?.red_cards && Array.isArray(jsonData.events.red_cards)) {
        jsonData.events.red_cards.forEach((card: any) => {
          if (card.team === realMadridKey && card.player) playerNames.add(card.player);
        });
      }
      
      // Collecter depuis les cartons - ancien format events.cards - SEULEMENT Real Madrid
      if (jsonData.events?.cards) {
        ['yellow', 'red'].forEach(cardType => {
          const teamCards = jsonData.events.cards[cardType]?.[realMadridKey];
          if (Array.isArray(teamCards)) {
            teamCards.forEach((card: any) => {
              const playerName = typeof card === 'string' ? card : card.player;
              if (playerName) playerNames.add(playerName);
            });
          }
        });
      }
      
      // Collecter depuis les substitutions - SEULEMENT Real Madrid
      const substitutions = jsonData.substitutions || jsonData.events?.substitutions || [];
      substitutions.forEach((sub: any) => {
        if (sub.team === realMadridKey) {
          if (sub.in) playerNames.add(sub.in);
          if (sub.out) playerNames.add(sub.out);
        }
      });
      
      const uniqueNames = Array.from(playerNames);
      
      if (uniqueNames.length > 0) {
        setPlayerNamesToValidate(uniqueNames);
        setShowPlayerValidation(true);
      } else {
        // Pas de joueurs Real Madrid à valider, passer directement à la prévisualisation
        generatePreview(jsonData, parsedResult);
      }
    }
  };

  const handlePlayerValidationComplete = (mapping: Record<string, string>) => {
    setPlayerNameMapping(mapping);
    setShowPlayerValidation(false);
    
    // Générer la prévisualisation avec les noms validés
    const jsonData = JSON.parse(jsonInput);
    if (parsedData) {
      generatePreview(jsonData, parsedData);
    }
  };

  const generatePreview = (jsonData: any, matchData: MatchJsonData) => {
    // Récupérer la date du match sélectionné depuis la base de données
    const selectedMatch = matches.find(m => m.id === selectedMatchId);
    if (selectedMatch) {
      matchData.match_date = selectedMatch.match_date;
      matchData.competition = selectedMatch.competition || matchData.competition;
    }
    
    // Générer l'aperçu des stats
    const playerStatsMap = new Map<string, any>();

    // 1. Buts et passes (supporter goals à la racine ou dans events)
    const goals = jsonData.goals || jsonData.events?.goals || [];
    for (const goal of goals) {
      const scorerName = goal.scorer || goal.player;
      if (scorerName) {
        const key = scorerName;
        if (!playerStatsMap.has(key)) {
          playerStatsMap.set(key, { playerName: scorerName.replace(/_/g, ' '), goals: 0, assists: 0, minutesPlayed: 90 });
        }
        playerStatsMap.get(key).goals++;

        if (goal.assist) {
          const assistKey = goal.assist;
          if (!playerStatsMap.has(assistKey)) {
            playerStatsMap.set(assistKey, { playerName: goal.assist.replace(/_/g, ' '), goals: 0, assists: 0, minutesPlayed: 90 });
          }
          playerStatsMap.get(assistKey).assists++;
        }
      }
    }

    // 2. Cartons - format events.yellow_cards (array d'objets)
    if (jsonData.events?.yellow_cards && Array.isArray(jsonData.events.yellow_cards)) {
      for (const card of jsonData.events.yellow_cards) {
        const playerName = card.player;
        if (playerName) {
          const key = playerName;
          if (!playerStatsMap.has(key)) {
            playerStatsMap.set(key, { playerName: playerName.replace(/_/g, ' '), goals: 0, assists: 0, minutesPlayed: 90 });
          }
          playerStatsMap.get(key).yellowCards = (playerStatsMap.get(key).yellowCards || 0) + 1;
        }
      }
    }
    if (jsonData.events?.red_cards && Array.isArray(jsonData.events.red_cards)) {
      for (const card of jsonData.events.red_cards) {
        const playerName = card.player;
        if (playerName) {
          const key = playerName;
          if (!playerStatsMap.has(key)) {
            playerStatsMap.set(key, { playerName: playerName.replace(/_/g, ' '), goals: 0, assists: 0, minutesPlayed: 90 });
          }
          playerStatsMap.get(key).redCards = (playerStatsMap.get(key).redCards || 0) + 1;
        }
      }
    }

    // 2b. Cartons - ancien format events.cards
    if (jsonData.events?.cards) {
      if (jsonData.events.cards.yellow) {
        for (const [team, cards] of Object.entries(jsonData.events.cards.yellow)) {
          if (Array.isArray(cards)) {
            for (const card of cards) {
              const playerName = typeof card === 'string' ? card : card.player;
              if (playerName) {
                const key = playerName;
                if (!playerStatsMap.has(key)) {
                  playerStatsMap.set(key, { playerName: playerName.replace(/_/g, ' '), goals: 0, assists: 0, minutesPlayed: 90 });
                }
                playerStatsMap.get(key).yellowCards = (playerStatsMap.get(key).yellowCards || 0) + 1;
              }
            }
          }
        }
      }
      
      if (jsonData.events.cards.red) {
        for (const [team, cards] of Object.entries(jsonData.events.cards.red)) {
          if (Array.isArray(cards)) {
            for (const card of cards) {
              const playerName = typeof card === 'string' ? card : card.player;
              if (playerName) {
                const key = playerName;
                if (!playerStatsMap.has(key)) {
                  playerStatsMap.set(key, { playerName: playerName.replace(/_/g, ' '), goals: 0, assists: 0, minutesPlayed: 90 });
                }
                playerStatsMap.get(key).redCards = (playerStatsMap.get(key).redCards || 0) + 1;
              }
            }
          }
        }
      }
    }

    // 3. Substitutions (supporter à la racine ou dans events)
    const substitutions = jsonData.substitutions || jsonData.events?.substitutions || [];
    for (const sub of substitutions) {
      if (sub.out) {
        const key = sub.out;
        if (!playerStatsMap.has(key)) {
          playerStatsMap.set(key, { playerName: sub.out.replace(/_/g, ' '), goals: 0, assists: 0, minutesPlayed: 90 });
        }
        playerStatsMap.get(key).minutesPlayed = sub.minute || 90;
      }
      if (sub.in) {
        const key = sub.in;
        if (!playerStatsMap.has(key)) {
          playerStatsMap.set(key, { playerName: sub.in.replace(/_/g, ' '), goals: 0, assists: 0, minutesPlayed: 90 });
        }
        playerStatsMap.get(key).minutesPlayed = 90 - (sub.minute || 0);
      }
    }

    // 4. Stats avancées
    if (jsonData.statistics?.player_stats) {
      for (const [playerKey, stats] of Object.entries(jsonData.statistics.player_stats)) {
        const key = playerKey;
        if (!playerStatsMap.has(key)) {
          playerStatsMap.set(key, { playerName: playerKey.replace(/_/g, ' '), goals: 0, assists: 0, minutesPlayed: 90 });
        }
        const playerStat = playerStatsMap.get(key);
        const statObj = stats as any;
        
        if (statObj.shots !== undefined) playerStat.shots = statObj.shots;
        if (statObj.shots_on_target !== undefined) playerStat.shotsOnTarget = statObj.shots_on_target;
        if (statObj.passes_completed !== undefined) playerStat.passesCompleted = statObj.passes_completed;
        if (statObj.pass_accuracy !== undefined) playerStat.passAccuracy = statObj.pass_accuracy;
        if (statObj.tackles !== undefined) playerStat.tackles = statObj.tackles;
      }
    }

    setPreviewData({
      matchData: matchData,
      playerStats: Array.from(playerStatsMap.values())
    });
    setShowPreview(true);
  };

  const handleImport = async () => {
    if (!selectedMatchId) {
      toast.error("Veuillez sélectionner un match à mettre à jour");
      return;
    }

    if (!parsedData) {
      toast.error("Veuillez d'abord valider le JSON");
      return;
    }

    setIsProcessing(true);

    try {
      // Sauvegarder l'état actuel avant modification
      const { data: currentMatch, error: fetchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', selectedMatchId)
        .single();

      if (fetchError) throw fetchError;

      const { data: currentStats, error: statsError } = await supabase
        .from('player_stats')
        .select('*')
        .eq('match_id', selectedMatchId);

      if (statsError) throw statsError;

      const matchData = {
        home_team: parsedData.home_team,
        away_team: parsedData.away_team,
        home_team_logo: parsedData.home_team_logo,
        away_team_logo: parsedData.away_team_logo,
        home_score: parsedData.home_score || 0,
        away_score: parsedData.away_score || 0,
        match_date: parsedData.match_date,
        venue: parsedData.venue,
        competition: parsedData.competition,
        status: parsedData.status || 'finished',
        match_details: parsedData.match_details || {}
      };

      // Mise à jour du match
      const result = await supabase
        .from('matches')
        .update(matchData)
        .eq('id', selectedMatchId)
        .select();

      if (result.error) throw result.error;

      const matchId = selectedMatchId;
      const { data: { user } } = await supabase.auth.getUser();

      // Charger tous les joueurs actifs une seule fois pour optimiser
      const { data: allPlayers } = await supabase
        .from('players')
        .select('id, name')
        .eq('is_active', true);
      
      const playersCache = allPlayers || [];

      // Fonction helper pour trouver un joueur avec le nouveau matcher
      const findPlayer = async (name: string): Promise<string | null> => {
        // D'abord vérifier le mapping validé manuellement
        if (playerNameMapping[name]) {
          return playerNameMapping[name];
        }
        
        // Utiliser le nouveau matcher amélioré
        const match = await findBestPlayerMatch(name, playersCache);
        return match?.id || null;
      };

      // Mise à jour des statistiques des joueurs
      const playerStatsMap = new Map<string, any>();
      const jsonData = JSON.parse(jsonInput);

      // Helper pour initialiser les stats d'un joueur
      const initPlayerStats = (playerId: string) => {
        if (!playerStatsMap.has(playerId)) {
          playerStatsMap.set(playerId, {
            player_id: playerId,
            match_id: matchId,
            goals: 0,
            assists: 0,
            yellow_cards: 0,
            red_cards: 0,
            minutes_played: 90,
            shots: 0,
            passes_completed: 0,
            tackles: 0,
            interceptions: 0,
            saves: 0,
            clean_sheets: 0
          });
        }
        return playerStatsMap.get(playerId);
      };

      // 1. Traiter les buts et passes
      const goals = parsedData.match_details?.goals || jsonData.goals || jsonData.events?.goals || [];
      for (const goal of goals) {
        const scorerName = goal.scorer || goal.player;
        if (!scorerName) continue;

        const playerId = await findPlayer(scorerName);
        if (playerId) {
          const stats = initPlayerStats(playerId);
          stats.goals++;

          // Passes décisives
          if (goal.assist) {
            const assistId = await findPlayer(goal.assist);
            if (assistId) {
              const assistStats = initPlayerStats(assistId);
              assistStats.assists++;
            }
          }
        }
      }

      // 2. Traiter les cartons jaunes
      const yellowCards = jsonData.events?.yellow_cards || [];
      for (const card of yellowCards) {
        const playerName = card.player;
        if (!playerName) continue;
        
        const playerId = await findPlayer(playerName);
        if (playerId) {
          const stats = initPlayerStats(playerId);
          stats.yellow_cards++;
        }
      }

      // Cartons depuis cards object
      const cards = parsedData.match_details?.cards || jsonData.cards || {};
      if (cards.yellow) {
        for (const [team, teamCards] of Object.entries(cards.yellow)) {
          if (Array.isArray(teamCards)) {
            for (const card of teamCards) {
              let playerName = typeof card === 'string' ? card : (card as any).player;
              if (!playerName) continue;
              
              // Extraire le nom du format "Player (minute')"
              const nameMatch = String(playerName).match(/^([^(]+)/);
              if (nameMatch) playerName = nameMatch[1].trim();
              
              const playerId = await findPlayer(playerName);
              if (playerId) {
                const stats = initPlayerStats(playerId);
                stats.yellow_cards++;
              }
            }
          }
        }
      }

      // 3. Traiter les cartons rouges
      const redCards = jsonData.events?.red_cards || [];
      for (const card of redCards) {
        const playerName = card.player;
        if (!playerName) continue;
        
        const playerId = await findPlayer(playerName);
        if (playerId) {
          const stats = initPlayerStats(playerId);
          stats.red_cards++;
        }
      }

      if (cards.red) {
        for (const [team, teamCards] of Object.entries(cards.red)) {
          if (Array.isArray(teamCards)) {
            for (const card of teamCards) {
              let playerName = typeof card === 'string' ? card : (card as any).player;
              if (!playerName) continue;
              
              const nameMatch = String(playerName).match(/^([^(]+)/);
              if (nameMatch) playerName = nameMatch[1].trim();
              
              const playerId = await findPlayer(playerName);
              if (playerId) {
                const stats = initPlayerStats(playerId);
                stats.red_cards++;
              }
            }
          }
        }
      }

      // 4. Traiter les substitutions
      const substitutions = parsedData.match_details?.substitutions || jsonData.substitutions || jsonData.events?.substitutions || [];
      for (const sub of substitutions) {
        const outName = sub.out || sub.player_out;
        const inName = sub.in || sub.player_in;
        
        if (outName) {
          const playerId = await findPlayer(outName);
          if (playerId) {
            const stats = initPlayerStats(playerId);
            stats.minutes_played = sub.minute || 90;
          }
        }

        if (inName) {
          const playerId = await findPlayer(inName);
          if (playerId) {
            const stats = initPlayerStats(playerId);
            stats.minutes_played = 90 - (sub.minute || 0);
          }
        }
      }

      // 5. Traiter les stats avancées si disponibles
      const playerStats = jsonData.statistics?.player_stats || jsonData.player_stats || {};
      for (const [playerKey, stats] of Object.entries(playerStats)) {
        const playerId = await findPlayer(playerKey);
        if (playerId) {
          const playerStat = initPlayerStats(playerId);
          const statObj = stats as any;

          if (statObj.shots !== undefined) playerStat.shots = statObj.shots;
          if (statObj.passes_completed !== undefined) playerStat.passes_completed = statObj.passes_completed;
          if (statObj.tackles !== undefined) playerStat.tackles = statObj.tackles;
          if (statObj.interceptions !== undefined) playerStat.interceptions = statObj.interceptions;
          if (statObj.saves !== undefined) playerStat.saves = statObj.saves;
          if (statObj.minutes_played !== undefined) playerStat.minutes_played = statObj.minutes_played;
        }
      }

      // 6. Traiter les titulaires/lineup si disponibles
      const lineup = jsonData.lineup || jsonData.starting_lineup || parsedData.match_details?.lineup || [];
      for (const player of lineup) {
        const playerName = typeof player === 'string' ? player : (player.name || player.player);
        if (!playerName) continue;
        
        const playerId = await findPlayer(playerName);
        if (playerId) {
          initPlayerStats(playerId); // Assure que le joueur est dans les stats
        }
      }

      // 7. Sauvegarder les stats dans la base
      let savedCount = 0;
      for (const [playerId, stats] of playerStatsMap.entries()) {
        try {
          const { data: existingStats } = await supabase
            .from('player_stats')
            .select('*')
            .eq('player_id', playerId)
            .eq('match_id', matchId)
            .maybeSingle();

          if (existingStats) {
            // Fusionner les stats existantes avec les nouvelles
            const mergedStats = {
              ...stats,
              goals: stats.goals + (existingStats.goals || 0),
              assists: stats.assists + (existingStats.assists || 0),
              yellow_cards: Math.max(stats.yellow_cards, existingStats.yellow_cards || 0),
              red_cards: Math.max(stats.red_cards, existingStats.red_cards || 0),
            };
            
            await supabase
              .from('player_stats')
              .update(stats)
              .eq('id', existingStats.id);
          } else {
            await supabase
              .from('player_stats')
              .insert([stats]);
          }
          savedCount++;
        } catch (err) {
          console.error(`Erreur sauvegarde stats joueur ${playerId}:`, err);
        }
      }

      // 8. Sauvegarder dans l'historique
      const statsSummary = {
        goals: Array.from(playerStatsMap.values()).reduce((sum, s) => sum + s.goals, 0),
        assists: Array.from(playerStatsMap.values()).reduce((sum, s) => sum + s.assists, 0),
        yellow_cards: Array.from(playerStatsMap.values()).reduce((sum, s) => sum + s.yellow_cards, 0),
        red_cards: Array.from(playerStatsMap.values()).reduce((sum, s) => sum + s.red_cards, 0),
        players_processed: playerStatsMap.size
      };

      await supabase
        .from('match_import_history')
        .insert({
          match_id: matchId,
          imported_by: user?.id,
          json_data: jsonData,
          previous_match_data: currentMatch,
          previous_stats_data: currentStats,
          players_updated: savedCount,
          stats_summary: statsSummary
        });

      toast.success(`Match mis à jour! Stats de ${savedCount} joueur(s) enregistrées.`);
      
      setJsonInput("");
      setParsedData(null);
      setValidationStatus("idle");
      setSelectedMatchId("");
      setShowPreview(false);
      setPreviewData(null);
      loadMatches();
      
    } catch (error: any) {
      console.error('Erreur import:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const exampleJson = {
    match: {
      date: "2025-11-04",
      time: "20:00",
      round: "ronde_4",
      score: {
        liverpool: 1,
        real_madrid: 0
      },
      teams: {
        away: "real_madrid",
        home: "liverpool"
      },
      season: "2025-2026",
      status: "termine",
      possession: {
        liverpool: "38%",
        real_madrid: "62%"
      },
      competition: "uefa_champions_league",
      venue: "Anfield"
    },
    events: {
      cards: {
        red: { liverpool: 0, real_madrid: 0 },
        yellow: { liverpool: 1, real_madrid: 4 }
      },
      goals: [
        { team: "liverpool", minute: 61, scorer: "a_mac_allister" }
      ],
      substitutions: [
        { in: "e_camavinga", out: "rodrygo", team: "real_madrid", minute: 69 }
      ]
    },
    statistics: {
      shots: {
        total: { liverpool: 17, real_madrid: 8 },
        on_target: { liverpool: 2, real_madrid: 5 }
      },
      passes: {
        liverpool: { total: 332, accuracy: "77%", completed: 257 },
        real_madrid: { total: 531, accuracy: "86%", completed: 460 }
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileJson className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Importateur JSON de Match</CardTitle>
            <CardDescription>
              Collez un fichier JSON pour créer ou mettre à jour un match
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">1. Sélectionner le match à mettre à jour</label>
          <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un match..." />
            </SelectTrigger>
            <SelectContent>
              {isLoadingMatches ? (
                <SelectItem value="loading" disabled>Chargement...</SelectItem>
              ) : matches.length === 0 ? (
                <SelectItem value="empty" disabled>Aucun match disponible</SelectItem>
              ) : (
                matches.map((match) => (
                  <SelectItem key={match.id} value={match.id}>
                    {match.home_team} vs {match.away_team} - {new Date(match.match_date).toLocaleDateString('fr-FR')}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {validationStatus === "valid" && !showPreview && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              JSON valide! Prêt à importer.
            </AlertDescription>
          </Alert>
        )}

        {validationStatus === "invalid" && (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              JSON invalide. Vérifiez le format.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">2. Coller les données JSON du match</label>
          <Textarea
            placeholder="Collez votre JSON ici..."
            value={jsonInput}
            onChange={(e) => handleJsonChange(e.target.value)}
            rows={15}
            className="font-mono text-sm"
            disabled={showPlayerValidation || showPreview}
          />
        </div>

        {showPlayerValidation && (
          <PlayerNameValidator
            playerNames={playerNamesToValidate}
            onValidationComplete={handlePlayerValidationComplete}
          />
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleValidate}
            variant="outline"
            disabled={!jsonInput.trim() || !selectedMatchId || showPreview || showPlayerValidation}
          >
            <Eye className="h-4 w-4 mr-2" />
            Valider et Prévisualiser
          </Button>
          
          <Button 
            onClick={handleImport}
            disabled={!selectedMatchId || !showPreview || isProcessing}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isProcessing ? "Mise à jour en cours..." : "Confirmer l'import"}
          </Button>

          {(showPreview || showPlayerValidation) && (
            <Button 
              onClick={() => {
                setShowPreview(false);
                setPreviewData(null);
                setShowPlayerValidation(false);
                setPlayerNamesToValidate([]);
                setPlayerNameMapping({});
              }}
              variant="ghost"
            >
              Annuler
            </Button>
          )}
        </div>

        {showPreview && previewData && (
          <MatchImportPreview
            matchData={previewData.matchData}
            playerStats={previewData.playerStats}
          />
        )}

        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
            Voir un exemple de JSON
          </summary>
          <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
            {JSON.stringify(exampleJson, null, 2)}
          </pre>
        </details>

        <div className="mt-6">
          <MatchImportHistory />
        </div>
      </CardContent>
    </Card>
  );
};
