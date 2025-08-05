-- Create a table for opposing teams
CREATE TABLE public.opposing_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for opposing team players
CREATE TABLE public.opposing_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.opposing_teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  jersey_number INTEGER,
  is_starter BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table to link matches with opposing team lineups
CREATE TABLE public.match_lineups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  opposing_team_id UUID NOT NULL REFERENCES public.opposing_teams(id) ON DELETE CASCADE,
  real_madrid_formation TEXT DEFAULT '4-3-3',
  opposing_team_formation TEXT DEFAULT '4-4-2',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.opposing_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opposing_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_lineups ENABLE ROW LEVEL SECURITY;

-- Create policies for opposing_teams
CREATE POLICY "Anyone can view opposing teams" 
ON public.opposing_teams 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage opposing teams" 
ON public.opposing_teams 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

-- Create policies for opposing_players
CREATE POLICY "Anyone can view opposing players" 
ON public.opposing_players 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage opposing players" 
ON public.opposing_players 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

-- Create policies for match_lineups
CREATE POLICY "Anyone can view match lineups" 
ON public.match_lineups 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage match lineups" 
ON public.match_lineups 
FOR ALL 
USING (auth.role() = 'authenticated'::text);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_opposing_teams_updated_at
BEFORE UPDATE ON public.opposing_teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opposing_players_updated_at
BEFORE UPDATE ON public.opposing_players
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_match_lineups_updated_at
BEFORE UPDATE ON public.match_lineups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some example opposing teams
INSERT INTO public.opposing_teams (name, logo_url) VALUES 
('Osasuna', 'https://upload.wikimedia.org/wikipedia/fr/thumb/2/25/Logo_CA_Osasuna_2024.svg/1200px-Logo_CA_Osasuna_2024.svg.png'),
('Atlético Madrid', 'https://upload.wikimedia.org/wikipedia/fr/thumb/f/f4/Atletico_Madrid_2017_logo.svg/1200px-Atletico_Madrid_2017_logo.svg.png'),
('FC Barcelone', 'https://upload.wikimedia.org/wikipedia/fr/thumb/a/a1/Logo_FC_Barcelona.svg/1200px-Logo_FC_Barcelona.svg.png');