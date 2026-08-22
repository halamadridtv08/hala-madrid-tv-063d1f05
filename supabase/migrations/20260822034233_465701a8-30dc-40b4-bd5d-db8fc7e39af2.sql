CREATE TABLE public.story_rings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  cover_url text,
  is_highlight boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.story_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ring_id uuid NOT NULL REFERENCES public.story_rings(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  caption text,
  link_url text,
  link_label text,
  duration_seconds integer NOT NULL DEFAULT 6,
  display_order integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_story_items_ring ON public.story_items(ring_id);
CREATE INDEX idx_story_rings_expires ON public.story_rings(expires_at);

GRANT SELECT ON public.story_rings TO anon;
GRANT SELECT ON public.story_items TO anon;
GRANT SELECT ON public.story_rings TO authenticated;
GRANT SELECT ON public.story_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.story_rings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.story_items TO authenticated;
GRANT ALL ON public.story_rings TO service_role;
GRANT ALL ON public.story_items TO service_role;

ALTER TABLE public.story_rings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active story rings"
  ON public.story_rings FOR SELECT
  USING (is_published = true AND (is_highlight = true OR expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins and moderators manage story rings"
  ON public.story_rings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Public can view active story items"
  ON public.story_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.story_rings r
    WHERE r.id = story_items.ring_id
      AND r.is_published = true
      AND (r.is_highlight = true OR r.expires_at IS NULL OR r.expires_at > now())
  ) AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins and moderators manage story items"
  ON public.story_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE TRIGGER update_story_rings_updated_at
  BEFORE UPDATE ON public.story_rings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
