INSERT INTO public.site_content (content_key, content_value, content_type, section, description)
VALUES ('flashscore_live_enabled', 'true', 'setting', 'sync', 'Active ou coupe la synchronisation automatique Flashscore des matchs en direct (toutes les 2 minutes)')
ON CONFLICT (content_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.laliga_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_api_id INTEGER NOT NULL,
  team_name TEXT NOT NULL,
  team_logo TEXT,
  rank INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  played INTEGER NOT NULL DEFAULT 0,
  won INTEGER NOT NULL DEFAULT 0,
  drawn INTEGER NOT NULL DEFAULT 0,
  lost INTEGER NOT NULL DEFAULT 0,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  goal_difference INTEGER NOT NULL DEFAULT 0,
  season INTEGER NOT NULL,
  league_id INTEGER NOT NULL DEFAULT 87,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (team_api_id, season)
);
GRANT SELECT ON public.laliga_standings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.laliga_standings TO authenticated;
GRANT ALL ON public.laliga_standings TO service_role;
ALTER TABLE public.laliga_standings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view standings" ON public.laliga_standings FOR SELECT USING (true);
CREATE POLICY "Admins can manage standings" ON public.laliga_standings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));