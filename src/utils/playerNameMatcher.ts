import { supabase } from "@/integrations/supabase/client";

interface PlayerMatch {
  id: string;
  name: string;
  confidence: number;
}

// Normalise un nom pour la comparaison
export const normalizePlayerName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/[áàâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/['-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Calcule un score de similarité entre deux chaînes (exporté)
export const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = normalizePlayerName(str1);
  const s2 = normalizePlayerName(str2);
  
  // Match exact
  if (s1 === s2) return 1;
  
  // Un nom contient l'autre
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  
  // Vérifie si les parties du nom correspondent
  const parts1 = s1.split(' ');
  const parts2 = s2.split(' ');
  
  let matchingParts = 0;
  for (const p1 of parts1) {
    for (const p2 of parts2) {
      if (p1 === p2 || p1.includes(p2) || p2.includes(p1)) {
        matchingParts++;
        break;
      }
    }
  }
  
  const maxParts = Math.max(parts1.length, parts2.length);
  return matchingParts / maxParts * 0.8;
};

// Version synchrone pour trouver le meilleur joueur correspondant à un nom (avec cache de joueurs)
export const findBestPlayerMatchSync = (
  searchName: string,
  players: { id: string; name: string; jersey_number?: number | null }[]
): PlayerMatch | null => {
  if (!searchName || !players.length) return null;
  
  let bestMatch: PlayerMatch | null = null;
  
  for (const player of players) {
    const similarity = calculateSimilarity(searchName, player.name);
    
    if (similarity > 0.5 && (!bestMatch || similarity > bestMatch.confidence)) {
      bestMatch = {
        id: player.id,
        name: player.name,
        confidence: similarity
      };
    }
  }
  
  return bestMatch;
};


// Trouve le meilleur joueur correspondant à un nom
export const findBestPlayerMatch = async (
  searchName: string,
  cachedPlayers?: { id: string; name: string }[]
): Promise<PlayerMatch | null> => {
  const normalizedSearch = normalizePlayerName(searchName);
  
  // Utiliser le cache si disponible, sinon charger depuis Supabase
  let players = cachedPlayers;
  if (!players) {
    const { data } = await supabase
      .from('players')
      .select('id, name')
      .eq('is_active', true);
    players = data || [];
  }
  
  let bestMatch: PlayerMatch | null = null;
  
  for (const player of players) {
    const similarity = calculateSimilarity(searchName, player.name);
    
    if (similarity > 0.5 && (!bestMatch || similarity > bestMatch.confidence)) {
      bestMatch = {
        id: player.id,
        name: player.name,
        confidence: similarity
      };
    }
  }
  
  // Si pas de match avec la similarité, essayer ILIKE en base
  if (!bestMatch) {
    const { data } = await supabase
      .from('players')
      .select('id, name')
      .eq('is_active', true)
      .or(`name.ilike.%${normalizedSearch}%,name.ilike.%${searchName}%`)
      .maybeSingle();
    
    if (data) {
      bestMatch = {
        id: data.id,
        name: data.name,
        confidence: 0.6
      };
    }
  }
  
  return bestMatch;
};

// Trouve tous les joueurs correspondant à une liste de noms
export const matchPlayersFromNames = async (
  playerNames: string[]
): Promise<Map<string, PlayerMatch>> => {
  const results = new Map<string, PlayerMatch>();
  
  // Charger tous les joueurs une seule fois
  const { data: players } = await supabase
    .from('players')
    .select('id, name')
    .eq('is_active', true);
  
  if (!players) return results;
  
  for (const name of playerNames) {
    const match = await findBestPlayerMatch(name, players);
    if (match) {
      results.set(name, match);
    }
  }
  
  return results;
};

// Extrait tous les noms de joueurs d'un JSON de match
export const extractPlayerNamesFromMatchJson = (jsonData: any): string[] => {
  const names = new Set<string>();
  
  // Goals
  if (jsonData.match_details?.goals) {
    for (const goal of jsonData.match_details.goals) {
      if (goal.scorer) names.add(goal.scorer);
      if (goal.player) names.add(goal.player);
      if (goal.assist) names.add(goal.assist);
    }
  }
  
  // Events goals
  if (jsonData.events?.goals) {
    for (const goal of jsonData.events.goals) {
      if (goal.scorer) names.add(goal.scorer);
      if (goal.player) names.add(goal.player);
      if (goal.assist) names.add(goal.assist);
    }
  }
  
  // Goals at root
  if (jsonData.goals && Array.isArray(jsonData.goals)) {
    for (const goal of jsonData.goals) {
      if (goal.scorer) names.add(goal.scorer);
      if (goal.player) names.add(goal.player);
      if (goal.assist) names.add(goal.assist);
    }
  }
  
  // Substitutions
  const substitutions = jsonData.match_details?.substitutions || jsonData.events?.substitutions || jsonData.substitutions || [];
  for (const sub of substitutions) {
    if (sub.in) names.add(sub.in);
    if (sub.out) names.add(sub.out);
    if (sub.player_in) names.add(sub.player_in);
    if (sub.player_out) names.add(sub.player_out);
  }
  
  // Cards
  const cards = jsonData.match_details?.cards || jsonData.events?.cards || jsonData.cards || {};
  const processCards = (cardList: any) => {
    if (Array.isArray(cardList)) {
      for (const card of cardList) {
        if (typeof card === 'string') names.add(card);
        else if (card.player) names.add(card.player);
      }
    } else if (typeof cardList === 'object') {
      for (const [team, teamCards] of Object.entries(cardList)) {
        if (Array.isArray(teamCards)) {
          for (const card of teamCards) {
            if (typeof card === 'string') {
              // Extract name from "Player (minute')" format
              const match = String(card).match(/^([^(]+)/);
              if (match) names.add(match[1].trim());
            } else if ((card as any).player) {
              names.add((card as any).player);
            }
          }
        }
      }
    }
  };
  
  if (cards.yellow) processCards(cards.yellow);
  if (cards.red) processCards(cards.red);
  
  // Yellow cards array
  if (jsonData.events?.yellow_cards) {
    for (const card of jsonData.events.yellow_cards) {
      if (card.player) names.add(card.player);
    }
  }
  
  // Red cards array
  if (jsonData.events?.red_cards) {
    for (const card of jsonData.events.red_cards) {
      if (card.player) names.add(card.player);
    }
  }
  
  // Lineup/Starting players
  const lineup = jsonData.lineup || jsonData.starting_lineup || jsonData.match_details?.lineup || [];
  if (Array.isArray(lineup)) {
    for (const player of lineup) {
      if (typeof player === 'string') names.add(player);
      else if (player.name) names.add(player.name);
      else if (player.player) names.add(player.player);
    }
  }
  
  // Player stats
  const playerStats = jsonData.statistics?.player_stats || jsonData.player_stats || {};
  for (const playerName of Object.keys(playerStats)) {
    names.add(playerName);
  }
  
  return Array.from(names);
};
