import { supabase } from "@/integrations/supabase/client";

let cachedAliases: Map<string, string> | null = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const loadCompetitionAliases = async (): Promise<Map<string, string>> => {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedAliases && (now - lastCacheUpdate) < CACHE_DURATION) {
    return cachedAliases;
  }

  const aliasMap = new Map<string, string>();

  try {
    const { data, error } = await supabase
      .from('competition_aliases')
      .select('canonical_name, aliases')
      .eq('is_active', true);

    if (error) throw error;

    data?.forEach(item => {
      // Map canonical name to itself
      aliasMap.set(item.canonical_name.toLowerCase(), item.canonical_name);
      
      // Map each alias to canonical name
      item.aliases.forEach((alias: string) => {
        aliasMap.set(alias.toLowerCase(), item.canonical_name);
      });
    });

    cachedAliases = aliasMap;
    lastCacheUpdate = now;
  } catch (error) {
    console.error('Error loading competition aliases:', error);
  }

  return aliasMap;
};

export const normalizeCompetitionName = async (inputName: string): Promise<string> => {
  if (!inputName) return inputName;

  const trimmed = inputName.trim();
  const aliasMap = await loadCompetitionAliases();
  
  // Try to find canonical name
  const normalized = aliasMap.get(trimmed.toLowerCase());
  
  return normalized || trimmed;
};

export const normalizeCompetitionNames = async (names: string[]): Promise<Map<string, string>> => {
  const aliasMap = await loadCompetitionAliases();
  const result = new Map<string, string>();

  names.forEach(name => {
    if (!name) return;
    const trimmed = name.trim();
    const normalized = aliasMap.get(trimmed.toLowerCase()) || trimmed;
    result.set(name, normalized);
  });

  return result;
};

// Invalidate cache (useful after updating aliases)
export const invalidateCompetitionCache = () => {
  cachedAliases = null;
  lastCacheUpdate = 0;
};
