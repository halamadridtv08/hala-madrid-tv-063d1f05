ALTER TABLE public.story_progress
  ADD COLUMN IF NOT EXISTS client_updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS is_completed boolean NOT NULL DEFAULT false;

CREATE TABLE public.story_playback_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ring_id uuid REFERENCES public.story_rings(id) ON DELETE SET NULL,
  item_id uuid REFERENCES public.story_items(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  event_type text NOT NULL,
  detail text,
  origin text,
  page_url text,
  media_url text,
  attempt integer NOT NULL DEFAULT 0,
  asset_version text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.story_playback_events TO anon, authenticated;
GRANT SELECT, DELETE ON public.story_playback_events TO authenticated;
GRANT ALL ON public.story_playback_events TO service_role;

ALTER TABLE public.story_playback_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record story playback diagnostics"
ON public.story_playback_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(session_id) BETWEEN 1 AND 128
  AND event_type IN ('media_error', 'retry', 'autoplay_blocked', 'fullscreen_denied', 'stalled', 'progress_sync_failed', 'poster_error')
  AND char_length(COALESCE(detail, '')) <= 1000
  AND char_length(COALESCE(origin, '')) <= 255
  AND char_length(COALESCE(page_url, '')) <= 1000
  AND char_length(COALESCE(media_url, '')) <= 2000
  AND attempt BETWEEN 0 AND 10
  AND char_length(COALESCE(asset_version, '')) <= 255
);

CREATE POLICY "Admins and moderators can read story playback diagnostics"
ON public.story_playback_events
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'moderator'::public.app_role)
);

CREATE POLICY "Admins can delete story playback diagnostics"
ON public.story_playback_events
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX story_playback_events_created_at_idx
ON public.story_playback_events (created_at DESC);

CREATE INDEX story_playback_events_ring_id_idx
ON public.story_playback_events (ring_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.save_story_progress(
  p_ring_id uuid,
  p_item_id uuid,
  p_position_seconds numeric,
  p_client_updated_at timestamptz,
  p_is_completed boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_changed boolean := false;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_position_seconds < 0 OR p_position_seconds > 21600 THEN
    RAISE EXCEPTION 'Invalid story position';
  END IF;

  INSERT INTO public.story_progress (
    user_id, ring_id, item_id, position_seconds, is_completed, client_updated_at, updated_at
  ) VALUES (
    v_user_id, p_ring_id, p_item_id, p_position_seconds, p_is_completed, p_client_updated_at, now()
  )
  ON CONFLICT (user_id, ring_id) DO UPDATE SET
    item_id = EXCLUDED.item_id,
    position_seconds = EXCLUDED.position_seconds,
    is_completed = EXCLUDED.is_completed,
    client_updated_at = EXCLUDED.client_updated_at,
    updated_at = now()
  WHERE public.story_progress.client_updated_at <= EXCLUDED.client_updated_at;

  GET DIAGNOSTICS v_changed = ROW_COUNT;
  RETURN v_changed;
END;
$$;

REVOKE ALL ON FUNCTION public.save_story_progress(uuid, uuid, numeric, timestamptz, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_story_progress(uuid, uuid, numeric, timestamptz, boolean) TO authenticated, service_role;