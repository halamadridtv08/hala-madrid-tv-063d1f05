import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const REACTION_EMOJIS = ['🔥', '😭', '👑', '✅', '❌', '😐'] as const;

export type ReactionCounts = Record<string, Record<string, number>>; // entryId -> emoji -> count
export type ReactionMine = Record<string, string[]>; // entryId -> emojis

const IDENTIFIER_KEY = 'hmtv_live_blog_visitor_id';

export const getVisitorIdentifier = (): string => {
  if (typeof window === 'undefined') return 'server-side-visitor';
  let id = window.localStorage.getItem(IDENTIFIER_KEY);
  if (!id) {
    id = (window.crypto?.randomUUID?.() ?? `v-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    window.localStorage.setItem(IDENTIFIER_KEY, id);
  }
  return id;
};

/** Reactions (emoji) on live blog entries — visible to everyone, one per emoji per visitor. */
export const useLiveBlogReactions = (matchId: string | undefined) => {
  const [counts, setCounts] = useState<ReactionCounts>({});
  const [mine, setMine] = useState<ReactionMine>({});
  const identifier = useMemo(() => getVisitorIdentifier(), []);

  const fetchReactions = useCallback(async () => {
    if (!matchId) return;
    const { data, error } = await (supabase as any).rpc('get_live_blog_reactions', {
      p_match_id: matchId,
      p_user_identifier: identifier,
    });
    if (error) {
      console.error('Error loading live blog reactions:', error);
      return;
    }
    const nextCounts: ReactionCounts = {};
    const nextMine: ReactionMine = {};
    (data || []).forEach((row: { entry_id: string; emoji: string; total: number; reacted: boolean }) => {
      nextCounts[row.entry_id] = nextCounts[row.entry_id] || {};
      nextCounts[row.entry_id][row.emoji] = Number(row.total);
      if (row.reacted) {
        nextMine[row.entry_id] = [...(nextMine[row.entry_id] || []), row.emoji];
      }
    });
    setCounts(nextCounts);
    setMine(nextMine);
  }, [matchId, identifier]);

  useEffect(() => {
    fetchReactions();
    if (!matchId) return;

    const channel = supabase
      .channel(`live-blog-reactions-${matchId}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_blog_reactions' },
        () => fetchReactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, fetchReactions]);

  const toggleReaction = useCallback(
    async (entryId: string, emoji: string) => {
      const alreadyReacted = (mine[entryId] || []).includes(emoji);

      // Optimistic update
      setCounts((prev) => {
        const entry = { ...(prev[entryId] || {}) };
        const current = entry[emoji] || 0;
        const next = alreadyReacted ? Math.max(0, current - 1) : current + 1;
        if (next === 0) delete entry[emoji];
        else entry[emoji] = next;
        return { ...prev, [entryId]: entry };
      });
      setMine((prev) => {
        const list = prev[entryId] || [];
        return {
          ...prev,
          [entryId]: alreadyReacted ? list.filter((e) => e !== emoji) : [...list, emoji],
        };
      });

      const { error } = await (supabase as any).rpc('toggle_live_blog_reaction', {
        p_entry_id: entryId,
        p_emoji: emoji,
        p_user_identifier: identifier,
      });

      if (error) {
        console.error('Error toggling reaction:', error);
        fetchReactions();
      }
    },
    [mine, identifier, fetchReactions]
  );

  return { counts, mine, toggleReaction, refresh: fetchReactions };
};

export interface LiveBlogComment {
  id: string;
  match_id: string;
  entry_id: string | null;
  user_id: string;
  display_name: string;
  content: string;
  is_hidden: boolean;
  is_pinned: boolean;
  created_at: string;
}

/** Comments posted by signed-in supporters under a match live blog. */
export const useLiveBlogComments = (matchId: string | undefined, includeHidden = false) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<LiveBlogComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!matchId) return;
    let query = (supabase as any)
      .from('live_blog_comments')
      .select('*')
      .eq('match_id', matchId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200);

    if (!includeHidden) query = query.eq('is_hidden', false);

    const { data, error } = await query;
    if (error) {
      console.error('Error loading live blog comments:', error);
    } else {
      setComments((data || []) as LiveBlogComment[]);
    }
    setLoading(false);
  }, [matchId, includeHidden]);

  useEffect(() => {
    setLoading(true);
    fetchComments();
    if (!matchId) return;

    const channel = supabase
      .channel(`live-blog-comments-${matchId}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_blog_comments', filter: `match_id=eq.${matchId}` },
        () => fetchComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, fetchComments]);

  const addComment = useCallback(
    async (content: string, entryId?: string | null) => {
      if (!user || !matchId) throw new Error('not-authenticated');
      const displayName =
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        user.email?.split('@')[0] ||
        'Supporter';

      const { error } = await (supabase as any).from('live_blog_comments').insert({
        match_id: matchId,
        entry_id: entryId ?? null,
        user_id: user.id,
        display_name: displayName.slice(0, 60),
        content: content.trim().slice(0, 1000),
      });
      if (error) throw error;
      await fetchComments();
    },
    [user, matchId, fetchComments]
  );

  const deleteComment = useCallback(
    async (id: string) => {
      const { error } = await (supabase as any).from('live_blog_comments').delete().eq('id', id);
      if (error) throw error;
      await fetchComments();
    },
    [fetchComments]
  );

  const setHidden = useCallback(
    async (id: string, hidden: boolean) => {
      const { error } = await (supabase as any)
        .from('live_blog_comments')
        .update({ is_hidden: hidden })
        .eq('id', id);
      if (error) throw error;
      await fetchComments();
    },
    [fetchComments]
  );

  const setPinned = useCallback(
    async (id: string, pinned: boolean) => {
      const { error } = await (supabase as any)
        .from('live_blog_comments')
        .update({ is_pinned: pinned })
        .eq('id', id);
      if (error) throw error;
      await fetchComments();
    },
    [fetchComments]
  );

  return { comments, loading, addComment, deleteComment, setHidden, setPinned, refresh: fetchComments };
};
