import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

export function useSocialLinks() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching social links:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();

    const channel = supabase
      .channel('social-links-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'social_links' },
        () => fetchLinks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { links, loading, refetch: fetchLinks };
}
