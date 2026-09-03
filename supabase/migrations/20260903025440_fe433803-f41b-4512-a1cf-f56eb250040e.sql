CREATE TABLE public.story_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ring_id uuid NOT NULL REFERENCES public.story_rings(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.story_items(id) ON DELETE CASCADE,
  position_seconds numeric(10,3) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, ring_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_progress TO authenticated;
GRANT ALL ON public.story_progress TO service_role;

ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own story progress"
ON public.story_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_story_progress_updated_at
BEFORE UPDATE ON public.story_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX story_progress_user_updated_idx
ON public.story_progress (user_id, updated_at DESC);