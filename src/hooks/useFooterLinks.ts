import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FooterLink {
  id: string;
  title: string;
  url: string | null;
  link_type: string;
  section: string;
  display_order: number;
  is_visible: boolean;
  icon: string | null;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export function useFooterLinks() {
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_links')
        .select('*')
        .eq('is_visible', true)
        .order('section', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLinks((data || []) as FooterLink[]);
    } catch (error) {
      console.error('Error fetching footer links:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return { links, loading, refetch: fetchLinks };
}

export function useFooterLinksAdmin() {
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_links')
        .select('*')
        .order('section', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLinks((data || []) as FooterLink[]);
    } catch (error) {
      console.error('Error fetching footer links:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLink = async (link: Omit<FooterLink, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('footer_links')
      .insert(link)
      .select()
      .single();

    if (error) throw error;
    await fetchLinks();
    return data;
  };

  const updateLink = async (id: string, link: Partial<FooterLink>) => {
    const { error } = await supabase
      .from('footer_links')
      .update(link)
      .eq('id', id);

    if (error) throw error;
    await fetchLinks();
  };

  const deleteLink = async (id: string) => {
    const { error } = await supabase
      .from('footer_links')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchLinks();
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return { links, loading, createLink, updateLink, deleteLink, refetch: fetchLinks };
}
