-- Scheduling + archiving for stories
ALTER TABLE public.story_rings
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

ALTER TABLE public.story_items
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

-- Analytics
CREATE TABLE IF NOT EXISTS public.story_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ring_id uuid NOT NULL REFERENCES public.story_rings(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.story_items(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  duration_ms integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.story_views TO anon;
GRANT SELECT, INSERT ON public.story_views TO authenticated;
GRANT ALL ON public.story_views TO service_role;

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can record story views" ON public.story_views;
CREATE POLICY "Anyone can record story views"
  ON public.story_views FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins and moderators can read story views" ON public.story_views;
CREATE POLICY "Admins and moderators can read story views"
  ON public.story_views FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE INDEX IF NOT EXISTS idx_story_views_ring ON public.story_views(ring_id);
CREATE INDEX IF NOT EXISTS idx_story_views_created ON public.story_views(created_at DESC);

-- Display settings for the public stories bar / viewer
CREATE TABLE IF NOT EXISTS public.story_display_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bar_background text NOT NULL DEFAULT 'card',
  ring_style text NOT NULL DEFAULT 'gradient',
  ring_size integer NOT NULL DEFAULT 64,
  show_titles boolean NOT NULL DEFAULT true,
  viewer_backdrop text NOT NULL DEFAULT 'blur',
  viewer_fit text NOT NULL DEFAULT 'contain',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.story_display_settings TO anon;
GRANT SELECT ON public.story_display_settings TO authenticated;
GRANT ALL ON public.story_display_settings TO service_role;

ALTER TABLE public.story_display_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Story display settings are public" ON public.story_display_settings;
CREATE POLICY "Story display settings are public"
  ON public.story_display_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage story display settings" ON public.story_display_settings;
CREATE POLICY "Admins manage story display settings"
  ON public.story_display_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.story_display_settings (bar_background)
SELECT 'card' WHERE NOT EXISTS (SELECT 1 FROM public.story_display_settings);

-- Aggregated stats for admins
CREATE OR REPLACE FUNCTION public.get_story_stats(p_days integer DEFAULT 30)
RETURNS TABLE(
  ring_id uuid,
  title text,
  is_highlight boolean,
  views bigint,
  unique_viewers bigint,
  completions bigint,
  avg_duration_ms numeric,
  total_duration_ms bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id,
         r.title,
         r.is_highlight,
         count(v.id) AS views,
         count(DISTINCT v.session_id) AS unique_viewers,
         count(v.id) FILTER (WHERE v.completed) AS completions,
         COALESCE(avg(v.duration_ms), 0) AS avg_duration_ms,
         COALESCE(sum(v.duration_ms), 0)::bigint AS total_duration_ms
  FROM public.story_rings r
  LEFT JOIN public.story_views v
    ON v.ring_id = r.id
   AND v.created_at > now() - make_interval(days => GREATEST(p_days, 1))
  WHERE public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator')
  GROUP BY r.id, r.title, r.is_highlight
  ORDER BY views DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_story_stats(integer) TO authenticated;