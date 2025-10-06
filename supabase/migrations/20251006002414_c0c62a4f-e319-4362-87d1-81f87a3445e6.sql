-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Migrate existing admins to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.admins
ON CONFLICT (user_id, role) DO NOTHING;

-- Add all authenticated users as 'user' role by default
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role
FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on articles
DROP POLICY IF EXISTS "Admins can manage all articles" ON public.articles;
CREATE POLICY "Admins can manage all articles"
ON public.articles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on achievements
DROP POLICY IF EXISTS "Authenticated users can manage achievements" ON public.achievements;
CREATE POLICY "Admins can manage achievements"
ON public.achievements
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on coaches
DROP POLICY IF EXISTS "Authenticated users can manage coaches" ON public.coaches;
CREATE POLICY "Admins can manage coaches"
ON public.coaches
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on kits
DROP POLICY IF EXISTS "Authenticated users can manage kits" ON public.kits;
CREATE POLICY "Admins can manage kits"
ON public.kits
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on kit_images
DROP POLICY IF EXISTS "Authenticated users can manage kit images" ON public.kit_images;
CREATE POLICY "Admins can manage kit images"
ON public.kit_images
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on article_images
DROP POLICY IF EXISTS "Authenticated users can manage article images" ON public.article_images;
CREATE POLICY "Admins can manage article images"
ON public.article_images
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on matches
DROP POLICY IF EXISTS "Authenticated users can delete matches" ON public.matches;
DROP POLICY IF EXISTS "Authenticated users can insert matches" ON public.matches;
DROP POLICY IF EXISTS "Authenticated users can update matches" ON public.matches;

CREATE POLICY "Admins can manage matches"
ON public.matches
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on opposing_teams
DROP POLICY IF EXISTS "Authenticated users can delete opposing teams" ON public.opposing_teams;
DROP POLICY IF EXISTS "Authenticated users can insert opposing teams" ON public.opposing_teams;
DROP POLICY IF EXISTS "Authenticated users can update opposing teams" ON public.opposing_teams;

CREATE POLICY "Admins can manage opposing teams"
ON public.opposing_teams
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on opposing_players
DROP POLICY IF EXISTS "Authenticated users can manage opposing players" ON public.opposing_players;
CREATE POLICY "Admins can manage opposing players"
ON public.opposing_players
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on match_formations
DROP POLICY IF EXISTS "Authenticated users can manage match formations" ON public.match_formations;
CREATE POLICY "Admins can manage match formations"
ON public.match_formations
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on match_formation_players
DROP POLICY IF EXISTS "Authenticated users can manage match formation players" ON public.match_formation_players;
CREATE POLICY "Admins can manage match formation players"
ON public.match_formation_players
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on match_lineups
DROP POLICY IF EXISTS "Authenticated users can manage match lineups" ON public.match_lineups;
CREATE POLICY "Admins can manage match lineups"
ON public.match_lineups
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on players
DROP POLICY IF EXISTS "Authenticated users can manage players" ON public.players;
CREATE POLICY "Admins can manage players"
ON public.players
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on photos
DROP POLICY IF EXISTS "Authenticated users can manage photos" ON public.photos;
CREATE POLICY "Admins can manage photos"
ON public.photos
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on press_conferences
DROP POLICY IF EXISTS "Authenticated users can manage press conferences" ON public.press_conferences;
CREATE POLICY "Admins can manage press conferences"
ON public.press_conferences
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on training_sessions
DROP POLICY IF EXISTS "Authenticated users can manage training sessions" ON public.training_sessions;
CREATE POLICY "Admins can manage training sessions"
ON public.training_sessions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on videos
DROP POLICY IF EXISTS "Allow authenticated users to create videos" ON public.videos;
DROP POLICY IF EXISTS "Allow authenticated users to delete videos" ON public.videos;
DROP POLICY IF EXISTS "Allow authenticated users to update videos" ON public.videos;

CREATE POLICY "Admins can manage videos"
ON public.videos
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on youtube_videos
DROP POLICY IF EXISTS "Authenticated users can manage YouTube videos" ON public.youtube_videos;
CREATE POLICY "Admins can manage YouTube videos"
ON public.youtube_videos
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on player_stats
DROP POLICY IF EXISTS "Autoriser seulement l'utilisateur connecté" ON public.player_stats;
CREATE POLICY "Admins can manage player stats"
ON public.player_stats
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies on login_attempts
DROP POLICY IF EXISTS "Only admins can view login attempts" ON public.login_attempts;
CREATE POLICY "Only admins can view login attempts"
ON public.login_attempts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to auto-assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();