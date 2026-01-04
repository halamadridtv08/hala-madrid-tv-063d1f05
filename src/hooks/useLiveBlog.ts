import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LiveBlogEntry {
  id: string;
  match_id: string;
  minute: number | null;
  entry_type: string;
  title: string | null;
  content: string;
  is_important: boolean;
  created_at: string;
  author_id: string | null;
  image_url: string | null;
  player_id: string | null;
  assist_player_id: string | null;
  card_type: 'yellow' | 'red' | 'second_yellow' | null;
  card_reason: string | null;
  team_side: 'home' | 'away' | null;
  substituted_player_id: string | null;
}

export interface NewLiveBlogEntry {
  match_id: string;
  minute?: number | null;
  entry_type: string;
  title?: string | null;
  content: string;
  is_important?: boolean;
  author_id?: string | null;
  image_url?: string | null;
  player_id?: string | null;
  assist_player_id?: string | null;
  card_type?: 'yellow' | 'red' | 'second_yellow' | null;
  card_reason?: string | null;
  team_side?: 'home' | 'away' | null;
  substituted_player_id?: string | null;
}

export const useLiveBlog = (matchId: string | undefined) => {
  const [entries, setEntries] = useState<LiveBlogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!matchId) return;

    const fetchEntries = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('live_blog_entries')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching live blog entries:', error);
      } else {
        setEntries((data || []) as LiveBlogEntry[]);
      }
      setLoading(false);
    };

    fetchEntries();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`live-blog-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_blog_entries',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          console.log('Live blog update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newEntry = payload.new as LiveBlogEntry;
            setEntries((prev) => (prev.some((e) => e.id === newEntry.id) ? prev : [newEntry, ...prev]));
            if (newEntry.is_important) {
              toast({
                title: `${newEntry.minute ? `${newEntry.minute}'` : ''} ${newEntry.title || 'Mise à jour'}`,
                description: newEntry.content.substring(0, 100),
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            setEntries((prev) =>
              prev.map((entry) =>
                entry.id === payload.new.id ? (payload.new as LiveBlogEntry) : entry
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setEntries((prev) =>
              prev.filter((entry) => entry.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, toast]);

  const addEntry = async (entry: NewLiveBlogEntry) => {
    const { data, error } = await supabase
      .from('live_blog_entries')
      .insert(entry)
      .select()
      .single();

    if (error) {
      console.error('Error adding live blog entry:', error);
      throw error;
    }

    const created = data as LiveBlogEntry;

    // Optimistic/local sync (realtime can be delayed)
    setEntries((prev) => (prev.some((e) => e.id === created.id) ? prev : [created, ...prev]));

    return created;
  };

  const updateEntry = async (id: string, updates: Partial<LiveBlogEntry>) => {
    const { error } = await supabase
      .from('live_blog_entries')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating live blog entry:', error);
      throw error;
    }

    // Optimistic/local sync (merge fields)
    setEntries((prev) => prev.map((e) => (e.id === id ? ({ ...e, ...updates } as LiveBlogEntry) : e)));
  };

  const deleteEntry = async (id: string) => {
    const previous = entries;
    setEntries((prev) => prev.filter((e) => e.id !== id));

    const { error } = await supabase
      .from('live_blog_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting live blog entry:', error);
      // rollback
      setEntries(previous);
      throw error;
    }
  };

  const deleteAllEntries = async () => {
    if (!matchId) return;

    const previous = entries;
    setEntries([]);

    const { error } = await supabase
      .from('live_blog_entries')
      .delete()
      .eq('match_id', matchId);

    if (error) {
      console.error('Error deleting all live blog entries:', error);
      // rollback
      setEntries(previous);
      throw error;
    }
  };

  return {
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    deleteAllEntries,
  };
};
