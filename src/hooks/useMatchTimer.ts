import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MatchTimerSettings {
  id: string;
  match_id: string;
  timer_started_at: string | null;
  is_timer_running: boolean;
  current_half: number;
  half_started_at: string | null;
  first_half_extra_time: number;
  second_half_extra_time: number;
  is_extra_time: boolean;
  is_paused: boolean;
  paused_at_minute: number;
  created_at: string;
  updated_at: string;
}

export function useMatchTimer(matchId: string) {
  const [timerSettings, setTimerSettings] = useState<MatchTimerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMinute, setCurrentMinute] = useState<string>('0');

  // Fetch timer settings
  const fetchTimerSettings = useCallback(async () => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('match_timer_settings')
      .select('*')
      .eq('match_id', matchId)
      .maybeSingle();

    if (!error && data) {
      setTimerSettings(data as MatchTimerSettings);
    }
    setLoading(false);
  }, [matchId]);

  // Create or update timer settings
  const upsertTimerSettings = async (updates: Partial<MatchTimerSettings>) => {
    if (!matchId) return { success: false, error: 'No match ID' };

    const { data, error } = await supabase
      .from('match_timer_settings')
      .upsert({
        match_id: matchId,
        ...updates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'match_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating timer settings:', error);
      return { success: false, error: error.message };
    }

    setTimerSettings(data as MatchTimerSettings);
    return { success: true };
  };

  // Start first half (Coup d'envoi)
  const startFirstHalf = () => {
    return upsertTimerSettings({
      timer_started_at: new Date().toISOString(),
      half_started_at: new Date().toISOString(),
      is_timer_running: true,
      current_half: 1,
      is_extra_time: false,
      is_paused: false,
      paused_at_minute: 0
    });
  };

  // End first half (Mi-temps)
  const endFirstHalf = (extraTime: number = 0) => {
    return upsertTimerSettings({
      is_timer_running: false,
      first_half_extra_time: extraTime,
      is_paused: true,
      paused_at_minute: 45 + extraTime
    });
  };

  // Start second half (Reprise)
  const startSecondHalf = () => {
    return upsertTimerSettings({
      half_started_at: new Date().toISOString(),
      is_timer_running: true,
      current_half: 2,
      is_extra_time: false,
      is_paused: false
    });
  };

  // End match (Fin du match)
  const endMatch = (secondHalfExtraTime: number = 0) => {
    return upsertTimerSettings({
      is_timer_running: false,
      second_half_extra_time: secondHalfExtraTime,
      is_paused: true
    });
  };

  // Set extra time for current half
  const setExtraTime = (minutes: number) => {
    if (!timerSettings) return;
    
    if (timerSettings.current_half === 1) {
      return upsertTimerSettings({
        first_half_extra_time: minutes,
        is_extra_time: true
      });
    } else {
      return upsertTimerSettings({
        second_half_extra_time: minutes,
        is_extra_time: true
      });
    }
  };

  // Calculate display minute with extra time format (45'+3)
  const calculateDisplayMinute = useCallback((): string => {
    if (!timerSettings) return '0';
    
    if (!timerSettings.is_timer_running && timerSettings.is_paused) {
      // Timer is paused, show last known minute
      if (timerSettings.current_half === 1) {
        const extraTime = timerSettings.first_half_extra_time;
        if (extraTime > 0) {
          return `45'+${extraTime}`;
        }
        return '45';
      } else {
        const extraTime = timerSettings.second_half_extra_time;
        if (extraTime > 0) {
          return `90'+${extraTime}`;
        }
        return '90';
      }
    }

    if (!timerSettings.is_timer_running || !timerSettings.half_started_at) {
      return timerSettings.paused_at_minute?.toString() || '0';
    }

    const now = new Date();
    const halfStart = new Date(timerSettings.half_started_at);
    const elapsedMinutes = Math.floor((now.getTime() - halfStart.getTime()) / 60000);

    if (timerSettings.current_half === 1) {
      // First half: 0-45, then extra time as 45'+X
      const baseMinute = Math.min(elapsedMinutes, 45);
      const extraMinute = Math.max(0, elapsedMinutes - 45);
      
      if (extraMinute > 0) {
        const maxExtraTime = timerSettings.first_half_extra_time || 10;
        const displayExtra = Math.min(extraMinute, maxExtraTime);
        return `45'+${displayExtra}`;
      }
      return baseMinute.toString();
    } else {
      // Second half: 45-90, then extra time as 90'+X
      const baseMinute = Math.min(45 + elapsedMinutes, 90);
      const extraMinute = Math.max(0, elapsedMinutes - 45);
      
      if (extraMinute > 0) {
        const maxExtraTime = timerSettings.second_half_extra_time || 10;
        const displayExtra = Math.min(extraMinute, maxExtraTime);
        return `90'+${displayExtra}`;
      }
      return baseMinute.toString();
    }
  }, [timerSettings]);

  // Get numeric minute for live blog entries
  const getNumericMinute = useCallback((): number => {
    if (!timerSettings) return 0;
    
    if (!timerSettings.is_timer_running || !timerSettings.half_started_at) {
      return timerSettings.paused_at_minute || 0;
    }

    const now = new Date();
    const halfStart = new Date(timerSettings.half_started_at);
    const elapsedMinutes = Math.floor((now.getTime() - halfStart.getTime()) / 60000);

    if (timerSettings.current_half === 1) {
      return Math.min(elapsedMinutes, 45 + (timerSettings.first_half_extra_time || 0));
    } else {
      return Math.min(45 + elapsedMinutes, 90 + (timerSettings.second_half_extra_time || 0));
    }
  }, [timerSettings]);

  // Update minute display every second when timer is running
  useEffect(() => {
    if (!timerSettings?.is_timer_running) {
      setCurrentMinute(calculateDisplayMinute());
      return;
    }

    const updateMinute = () => {
      setCurrentMinute(calculateDisplayMinute());
    };

    updateMinute();
    const interval = setInterval(updateMinute, 1000);

    return () => clearInterval(interval);
  }, [timerSettings, calculateDisplayMinute]);

  // Initial fetch and real-time subscription
  useEffect(() => {
    fetchTimerSettings();

    if (!matchId) return;

    const channel = supabase
      .channel(`match_timer_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_timer_settings',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          if (payload.new) {
            setTimerSettings(payload.new as MatchTimerSettings);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, fetchTimerSettings]);

  return {
    timerSettings,
    loading,
    currentMinute,
    getNumericMinute,
    startFirstHalf,
    endFirstHalf,
    startSecondHalf,
    endMatch,
    setExtraTime,
    refetch: fetchTimerSettings
  };
}
