import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StoryItem {
  id: string;
  ring_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string | null;
  link_url?: string | null;
  link_label?: string | null;
  duration_seconds: number;
  display_order: number;
  expires_at?: string | null;
  created_at: string;
}

export interface StoryRing {
  id: string;
  title: string;
  cover_url?: string | null;
  is_highlight: boolean;
  is_published: boolean;
  display_order: number;
  expires_at?: string | null;
  created_at: string;
  items: StoryItem[];
}

const db = supabase as any;

export async function fetchStoryRings(includeUnpublished = false): Promise<StoryRing[]> {
  let query = db
    .from('story_rings')
    .select('*')
    .order('is_highlight', { ascending: true })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (!includeUnpublished) query = query.eq('is_published', true);

  const { data: rings, error } = await query;
  if (error) throw error;

  const ringList = (rings ?? []) as StoryRing[];
  if (ringList.length === 0) return [];

  const { data: items, error: itemsError } = await db
    .from('story_items')
    .select('*')
    .in('ring_id', ringList.map((r) => r.id))
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (itemsError) throw itemsError;

  const now = Date.now();
  const byRing = new Map<string, StoryItem[]>();
  ((items ?? []) as StoryItem[]).forEach((item) => {
    const list = byRing.get(item.ring_id) ?? [];
    list.push(item);
    byRing.set(item.ring_id, list);
  });

  return ringList.map((ring) => ({ ...ring, items: byRing.get(ring.id) ?? [] })).filter((ring) => {
    if (includeUnpublished) return true;
    const expired = !ring.is_highlight && ring.expires_at && new Date(ring.expires_at).getTime() <= now;
    return !expired && ring.items.length > 0;
  });
}

export function useStories() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['story-rings'],
    queryFn: () => fetchStoryRings(false),
    staleTime: 2 * 60 * 1000,
  });

  return { rings: data ?? [], isLoading, error, refetch };
}
