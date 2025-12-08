import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface Integration {
  id: string;
  integration_key: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  is_enabled: boolean;
  config: Json;
  documentation_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useIntegrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les intégrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (id: string, isEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .update({ is_enabled: isEnabled })
        .eq('id', id);

      if (error) throw error;

      setIntegrations(prev =>
        prev.map(i => i.id === id ? { ...i, is_enabled: isEnabled } : i)
      );

      toast({
        title: isEnabled ? "Intégration activée" : "Intégration désactivée",
        description: `L'intégration a été ${isEnabled ? 'activée' : 'désactivée'} avec succès`
      });

      return true;
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'intégration",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateConfig = async (id: string, config: Json) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .update({ config })
        .eq('id', id);

      if (error) throw error;

      setIntegrations(prev =>
        prev.map(i => i.id === id ? { ...i, config } : i)
      );

      toast({
        title: "Configuration sauvegardée",
        description: "La configuration a été mise à jour avec succès"
      });

      return true;
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
      return false;
    }
  };

  const isIntegrationEnabled = (key: string): boolean => {
    const integration = integrations.find(i => i.integration_key === key);
    return integration?.is_enabled || false;
  };

  const getIntegration = (key: string): Integration | undefined => {
    return integrations.find(i => i.integration_key === key);
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return {
    integrations,
    loading,
    toggleIntegration,
    updateConfig,
    isIntegrationEnabled,
    getIntegration,
    refetch: fetchIntegrations
  };
};
