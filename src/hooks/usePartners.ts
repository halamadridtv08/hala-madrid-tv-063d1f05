import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  tier: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_active', true)
        .order('tier', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPartners((data || []) as Partner[]);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  return { partners, loading, refetch: fetchPartners };
}

export function usePartnersAdmin() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('tier', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPartners((data || []) as Partner[]);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPartner = async (partner: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('partners')
      .insert(partner)
      .select()
      .single();

    if (error) throw error;
    await fetchPartners();
    return data;
  };

  const updatePartner = async (id: string, partner: Partial<Partner>) => {
    const { error } = await supabase
      .from('partners')
      .update(partner)
      .eq('id', id);

    if (error) throw error;
    await fetchPartners();
  };

  const deletePartner = async (id: string) => {
    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchPartners();
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  return { partners, loading, createPartner, updatePartner, deletePartner, refetch: fetchPartners };
}
