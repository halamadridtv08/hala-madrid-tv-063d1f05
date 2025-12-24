import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AnnouncementBar {
  id: string;
  message: string;
  emoji: string | null;
  cta_text: string | null;
  cta_link: string | null;
  is_active: boolean;
  background_color: string | null;
  text_color: string | null;
}

export function useAnnouncementBar() {
  const [announcement, setAnnouncement] = useState<AnnouncementBar | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncement = async () => {
    try {
      const { data, error } = await supabase
        .from('announcement_bar')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setAnnouncement(data);
    } catch (error) {
      console.error('Error fetching announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncement();

    const channel = supabase
      .channel('announcement-bar-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcement_bar'
        },
        () => {
          fetchAnnouncement();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { announcement, loading, refetch: fetchAnnouncement };
}

export function useAnnouncementBarAdmin() {
  const [announcement, setAnnouncement] = useState<AnnouncementBar | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncement = async () => {
    try {
      const { data, error } = await supabase
        .from('announcement_bar')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setAnnouncement(data);
    } catch (error) {
      console.error('Error fetching announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAnnouncement = async (updates: Partial<AnnouncementBar>) => {
    if (!announcement) return;
    
    try {
      const { error } = await supabase
        .from('announcement_bar')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', announcement.id);

      if (error) throw error;
      await fetchAnnouncement();
      return true;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  return { announcement, loading, updateAnnouncement, refetch: fetchAnnouncement };
}
