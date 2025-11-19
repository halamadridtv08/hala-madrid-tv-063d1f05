-- Créer la table pour les compositions probables
CREATE TABLE IF NOT EXISTS public.match_probable_lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team_type TEXT NOT NULL CHECK (team_type IN ('real_madrid', 'opposing')),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  opposing_player_id UUID REFERENCES public.opposing_players(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  position TEXT NOT NULL,
  jersey_number INTEGER,
  is_starter BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT check_player_reference CHECK (
    (team_type = 'real_madrid' AND player_id IS NOT NULL AND opposing_player_id IS NULL) OR
    (team_type = 'opposing' AND opposing_player_id IS NOT NULL AND player_id IS NULL)
  )
);

-- Créer la table pour les joueurs absents
CREATE TABLE IF NOT EXISTS public.match_absent_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team_type TEXT NOT NULL CHECK (team_type IN ('real_madrid', 'opposing')),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  opposing_player_id UUID REFERENCES public.opposing_players(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  return_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT check_absent_player_reference CHECK (
    (team_type = 'real_madrid' AND player_id IS NOT NULL AND opposing_player_id IS NULL) OR
    (team_type = 'opposing' AND opposing_player_id IS NOT NULL AND player_id IS NULL)
  )
);

-- Activer RLS
ALTER TABLE public.match_probable_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_absent_players ENABLE ROW LEVEL SECURITY;

-- Policies pour match_probable_lineups
CREATE POLICY "Anyone can view match probable lineups"
  ON public.match_probable_lineups
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage match probable lineups"
  ON public.match_probable_lineups
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies pour match_absent_players
CREATE POLICY "Anyone can view match absent players"
  ON public.match_absent_players
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage match absent players"
  ON public.match_absent_players
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers pour updated_at
CREATE TRIGGER update_match_probable_lineups_updated_at
  BEFORE UPDATE ON public.match_probable_lineups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_match_absent_players_updated_at
  BEFORE UPDATE ON public.match_absent_players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();