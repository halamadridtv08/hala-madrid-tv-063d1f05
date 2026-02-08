import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AutomationSettings {
  id: string;
  match_id: string;
  automation_enabled: boolean;
  api_fixture_id: number | null;
  scraper_url: string | null;
  last_api_sync: string | null;
  last_scraper_sync: string | null;
  auto_timer: boolean;
  auto_live_blog: boolean;
  auto_score: boolean;
  events_synced: any[];
  last_known_status: string | null;
  last_known_period: string | null;
  sync_errors: any[];
}

export function useMatchAutomation(matchId: string) {
  const [settings, setSettings] = useState<AutomationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('match_automation_settings')
      .select('*')
      .eq('match_id', matchId)
      .single();

    if (data && !error) {
      setSettings(data as AutomationSettings);
    }
    setLoading(false);
  }, [matchId]);

  useEffect(() => {
    fetchSettings();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`automation-${matchId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'match_automation_settings',
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        if (payload.new) {
          setSettings(payload.new as AutomationSettings);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, fetchSettings]);

  // Create or update settings
  const updateSettings = async (updates: Partial<AutomationSettings>) => {
    if (settings?.id) {
      const { error } = await supabase
        .from('match_automation_settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('match_automation_settings')
        .insert({ match_id: matchId, ...updates });

      if (error) throw error;
    }

    await fetchSettings();
  };

  // Enable automation
  const enableAutomation = async (fixtureId?: number, scraperUrl?: string) => {
    await updateSettings({
      automation_enabled: true,
      api_fixture_id: fixtureId || null,
      scraper_url: scraperUrl || null,
    });
  };

  // Disable automation
  const disableAutomation = async () => {
    await updateSettings({ automation_enabled: false });
  };

  // Trigger manual sync
  const triggerSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-live-match', {
        body: { match_id: matchId },
      });

      if (error) throw error;
      await fetchSettings();
      return data;
    } finally {
      setSyncing(false);
    }
  };

  return {
    settings,
    loading,
    syncing,
    isAutomationEnabled: settings?.automation_enabled || false,
    updateSettings,
    enableAutomation,
    disableAutomation,
    triggerSync,
    refetch: fetchSettings,
  };
}
