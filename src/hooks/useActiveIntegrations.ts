import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface IntegrationConfig {
  [key: string]: string | undefined;
}

export interface ActiveIntegration {
  integration_key: string;
  config: IntegrationConfig;
}

export const useActiveIntegrations = () => {
  const [integrations, setIntegrations] = useState<ActiveIntegration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveIntegrations = async () => {
      try {
        const { data, error } = await supabase
          .from('integrations')
          .select('integration_key, config')
          .eq('is_enabled', true);

        if (error) throw error;

        const parsed = (data || []).map(item => ({
          integration_key: item.integration_key,
          config: (item.config as IntegrationConfig) || {}
        }));

        setIntegrations(parsed);
      } catch (error) {
        console.error('Error fetching active integrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveIntegrations();

    // Subscribe to changes
    const channel = supabase
      .channel('integrations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'integrations' }, () => {
        fetchActiveIntegrations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getConfig = (key: string): IntegrationConfig | null => {
    const integration = integrations.find(i => i.integration_key === key);
    return integration?.config || null;
  };

  const isEnabled = (key: string): boolean => {
    return integrations.some(i => i.integration_key === key);
  };

  return { integrations, loading, getConfig, isEnabled };
};
