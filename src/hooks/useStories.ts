import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
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
  scheduled_at?: string | null;
  expires_at?: string | null;
  backdrop_blur: number;
  backdrop_opacity: number;
  media_zoom: number;
  media_position_x: number;
  media_position_y: number;
  created_at: string;
}

export interface StoryRing {
  id: string;
  title: string;
  cover_url?: string | null;
  is_highlight: boolean;
  is_published: boolean;
  display_order: number;
  scheduled_at?: string | null;
  archived_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  items: StoryItem[];
}

export interface StoryDisplaySettings {
  id: string;
  bar_background: 'card' | 'transparent' | 'muted' | 'gradient';
  ring_style: 'gradient' | 'solid' | 'minimal';
  ring_size: number;
  show_titles: boolean;
  viewer_backdrop: 'blur' | 'dark' | 'gradient';
  viewer_fit: 'contain' | 'cover';
}

export const DEFAULT_STORY_SETTINGS: StoryDisplaySettings = {
  id: '',
  bar_background: 'card',
  ring_style: 'gradient',
  ring_size: 64,
  show_titles: true,
  viewer_backdrop: 'blur',
  viewer_fit: 'contain',
};

const db = supabase as any;

export function isRingArchived(ring: StoryRing, now = Date.now()): boolean {
  if (ring.archived_at) return true;
  return !ring.is_highlight && !!ring.expires_at && new Date(ring.expires_at).getTime() <= now;
}

export function isRingScheduled(ring: StoryRing, now = Date.now()): boolean {
  return !!ring.scheduled_at && new Date(ring.scheduled_at).getTime() > now;
}

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

  return ringList
    .map((ring) => {
      const all = byRing.get(ring.id) ?? [];
      const visible = includeUnpublished
        ? all
        : all.filter((it) => !it.scheduled_at || new Date(it.scheduled_at).getTime() <= now);
      return { ...ring, items: visible };
    })
    .filter((ring) => {
      if (includeUnpublished) return true;
      if (isRingArchived(ring, now)) return false;
      if (isRingScheduled(ring, now)) return false;
      return ring.items.length > 0;
    });
}

export function useStories() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['story-rings'],
    queryFn: () => fetchStoryRings(false),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { rings: data ?? [], isLoading, error, refetch };
}

const PROGRESS_KEY = 'hmtv-story-progress';

export interface StoryProgress {
  ringId: string;
  itemId: string;
  positionSeconds: number;
  updatedAt: string;
  isCompleted?: boolean;
}

export type StoryPlaybackEventType =
  | 'media_error'
  | 'retry'
  | 'autoplay_blocked'
  | 'fullscreen_denied'
  | 'stalled'
  | 'progress_sync_failed'
  | 'poster_error';

function readLocalProgress(ringId: string): StoryProgress | null {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') as Record<string, StoryProgress>;
    return all[ringId] ?? null;
  } catch {
    return null;
  }
}

function writeLocalProgress(progress: StoryProgress) {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') as Record<string, StoryProgress>;
    all[progress.ringId] = progress;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {
    /* local persistence is best effort */
  }
}

export async function getStoryProgress(ringId: string): Promise<StoryProgress | null> {
  const local = readLocalProgress(ringId);
  const { data: authData } = await supabase.auth.getSession();
  const userId = authData.session?.user.id;
  if (!userId) return local;

  const { data } = await db
    .from('story_progress')
    .select('ring_id,item_id,position_seconds,client_updated_at,is_completed')
    .eq('user_id', userId)
    .eq('ring_id', ringId)
    .maybeSingle();

  const remote = data
    ? {
        ringId: data.ring_id,
        itemId: data.item_id,
        positionSeconds: Number(data.position_seconds) || 0,
        updatedAt: data.client_updated_at,
        isCompleted: Boolean(data.is_completed),
      }
    : null;
  if (!remote) return local;
  if (!local) return remote;
  const remoteTime = new Date(remote.updatedAt).getTime() || 0;
  const localTime = new Date(local.updatedAt).getTime() || 0;
  return remoteTime >= localTime ? remote : local;
}

let progressWriteQueue = Promise.resolve();

export async function saveStoryProgress(progress: Omit<StoryProgress, 'updatedAt'> & { updatedAt?: string }) {
  const normalized: StoryProgress = { ...progress, updatedAt: progress.updatedAt ?? new Date().toISOString() };
  writeLocalProgress(normalized);
  const { data: authData } = await supabase.auth.getSession();
  const userId = authData.session?.user.id;
  if (!userId) return;

  progressWriteQueue = progressWriteQueue.then(async () => {
    const { error } = await db.rpc('save_story_progress', {
      p_ring_id: normalized.ringId,
      p_item_id: normalized.itemId,
      p_position_seconds: Math.max(0, normalized.positionSeconds),
      p_client_updated_at: normalized.updatedAt,
      p_is_completed: normalized.isCompleted ?? false,
    });
    if (error) {
      await logStoryEvent({
        ringId: normalized.ringId,
        itemId: normalized.itemId,
        eventType: 'progress_sync_failed',
        detail: error.message,
      });
    }
  }).catch(() => undefined);
  return progressWriteQueue;
}

export function useStoryDisplaySettings() {
  const { data, isLoading } = useQuery({
    queryKey: ['story-display-settings'],
    queryFn: async (): Promise<StoryDisplaySettings> => {
      const { data, error } = await db.from('story_display_settings').select('*').limit(1).maybeSingle();
      if (error) throw error;
      return { ...DEFAULT_STORY_SETTINGS, ...(data ?? {}) } as StoryDisplaySettings;
    },
    staleTime: 5 * 60 * 1000,
  });

  return { settings: data ?? DEFAULT_STORY_SETTINGS, isLoading };
}

export function useUpdateStoryDisplaySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<StoryDisplaySettings>) => {
      const { data: existing } = await db.from('story_display_settings').select('id').limit(1).maybeSingle();
      if (existing?.id) {
        const { error } = await db
          .from('story_display_settings')
          .update({ ...patch, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await db.from('story_display_settings').insert(patch);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['story-display-settings'] }),
  });
}

const SESSION_KEY = 'hmtv-story-session';

export function getStorySessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
}

function currentAssetVersion(): string {
  const script = Array.from(document.scripts).find((node) => node.src.includes('/assets/index-'));
  return script?.src.split('/').pop() ?? 'development';
}

export async function logStoryEvent(params: {
  ringId?: string;
  itemId?: string;
  eventType: StoryPlaybackEventType;
  detail?: string;
  mediaUrl?: string;
  attempt?: number;
}) {
  try {
    await db.from('story_playback_events').insert({
      ring_id: params.ringId ?? null,
      item_id: params.itemId ?? null,
      session_id: getStorySessionId(),
      event_type: params.eventType,
      detail: params.detail?.slice(0, 1000) ?? null,
      origin: window.location.origin.slice(0, 255),
      page_url: window.location.href.slice(0, 1000),
      media_url: params.mediaUrl?.slice(0, 2000) ?? null,
      attempt: Math.max(0, Math.min(10, params.attempt ?? 0)),
      asset_version: currentAssetVersion().slice(0, 255),
    });
  } catch {
    /* diagnostics must never interrupt playback */
  }
}

export async function trackStoryView(params: {
  ringId: string;
  itemId: string;
  durationMs: number;
  completed: boolean;
}) {
  try {
    await db.from('story_views').insert({
      ring_id: params.ringId,
      item_id: params.itemId,
      session_id: getStorySessionId(),
      duration_ms: Math.max(0, Math.round(params.durationMs)),
      completed: params.completed,
    });
  } catch {
    /* analytics failures must never break playback */
  }
}
