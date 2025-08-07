-- Créer la table pour les compositions de match
CREATE TABLE public.match_formations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL,
  team_type TEXT NOT NULL CHECK (team_type IN ('real_madrid', 'opposing')),
  formation TEXT NOT NULL DEFAULT '4-3-3',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les positions des joueurs dans les compositions
CREATE TABLE public.match_formation_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  formation_id UUID NOT NULL REFERENCES public.match_formations(id) ON DELETE CASCADE,
  player_id UUID,
  opposing_player_id UUID,
  position_x NUMERIC NOT NULL DEFAULT 0,
  position_y NUMERIC NOT NULL DEFAULT 0,
  is_starter BOOLEAN NOT NULL DEFAULT true,
  jersey_number INTEGER,
  player_name TEXT NOT NULL,
  player_position TEXT NOT NULL,
  player_image_url TEXT,
  player_rating NUMERIC DEFAULT 0,
  substitution_minute INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_player_reference CHECK (
    (player_id IS NOT NULL AND opposing_player_id IS NULL) OR 
    (player_id IS NULL AND opposing_player_id IS NOT NULL)
  )
);

-- Activer RLS
ALTER TABLE public.match_formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_formation_players ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour match_formations
CREATE POLICY "Anyone can view match formations" 
ON public.match_formations 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage match formations" 
ON public.match_formations 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

-- Politiques RLS pour match_formation_players
CREATE POLICY "Anyone can view match formation players" 
ON public.match_formation_players 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage match formation players" 
ON public.match_formation_players 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

-- Créer les triggers pour updated_at
CREATE TRIGGER update_match_formations_updated_at
BEFORE UPDATE ON public.match_formations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_match_formation_players_updated_at
BEFORE UPDATE ON public.match_formation_players
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Créer des index pour les performances
CREATE INDEX idx_match_formations_match_id ON public.match_formations(match_id);
CREATE INDEX idx_match_formations_team_type ON public.match_formations(team_type);
CREATE INDEX idx_match_formation_players_formation_id ON public.match_formation_players(formation_id);
CREATE INDEX idx_match_formation_players_player_id ON public.match_formation_players(player_id);
CREATE INDEX idx_match_formation_players_opposing_player_id ON public.match_formation_players(opposing_player_id);