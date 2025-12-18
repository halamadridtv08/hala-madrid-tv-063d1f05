import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StandingTeam {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  form: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

export interface LiveMatch {
  fixture: {
    id: number;
    status: {
      short: string;
      elapsed: number | null;
    };
    date: string;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  events?: Array<{
    time: { elapsed: number };
    type: string;
    player: { name: string };
  }>;
}

export interface TeamStats {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  form: string;
  fixtures: {
    played: { home: number; away: number; total: number };
    wins: { home: number; away: number; total: number };
    draws: { home: number; away: number; total: number };
    loses: { home: number; away: number; total: number };
  };
  goals: {
    for: {
      total: { home: number; away: number; total: number };
      average: { home: string; away: string; total: string };
    };
    against: {
      total: { home: number; away: number; total: number };
      average: { home: string; away: string; total: string };
    };
  };
  clean_sheet: { home: number; away: number; total: number };
  failed_to_score: { home: number; away: number; total: number };
}

const REAL_MADRID_ID = 541;

async function callFootballApi<T>(action: string, params?: Record<string, string>): Promise<T | null> {
  try {
    const queryParams = new URLSearchParams({ action, ...params });
    const { data, error } = await supabase.functions.invoke('football-api', {
      body: null,
      headers: {},
    });

    // Use fetch directly since we need query params
    const response = await fetch(
      `https://qjnppcfbywfazwolfppo.supabase.co/functions/v1/football-api?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const result = await response.json();
    return result.data as T;
  } catch (error) {
    console.error(`Football API error (${action}):`, error);
    return null;
  }
}

export function useLaLigaStandings() {
  const [standings, setStandings] = useState<StandingTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callFootballApi<StandingTeam[]>('standings');
      if (data) {
        setStandings(data);
      } else {
        setError('Impossible de charger le classement');
      }
    } catch (err) {
      setError('Erreur lors du chargement du classement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  return { standings, loading, error, refetch: fetchStandings, realMadridId: REAL_MADRID_ID };
}

export function useLiveScores(refreshInterval = 30000) {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveMatches = useCallback(async () => {
    try {
      const data = await callFootballApi<LiveMatch[]>('live');
      if (data) {
        setMatches(data);
        setError(null);
      }
    } catch (err) {
      setError('Erreur lors du chargement des matchs en direct');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchLiveMatches, refreshInterval]);

  return { matches, loading, error, refetch: fetchLiveMatches, realMadridId: REAL_MADRID_ID };
}

export function useTeamStats() {
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callFootballApi<TeamStats>('team-stats');
      if (data) {
        setStats(data);
      } else {
        setError('Impossible de charger les statistiques');
      }
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useUpcomingFixtures(count = 5) {
  const [fixtures, setFixtures] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFixtures = useCallback(async () => {
    setLoading(true);
    try {
      const data = await callFootballApi<LiveMatch[]>('fixtures', { next: count.toString() });
      if (data) {
        setFixtures(data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des prochains matchs');
    } finally {
      setLoading(false);
    }
  }, [count]);

  useEffect(() => {
    fetchFixtures();
  }, [fetchFixtures]);

  return { fixtures, loading, error, refetch: fetchFixtures };
}
