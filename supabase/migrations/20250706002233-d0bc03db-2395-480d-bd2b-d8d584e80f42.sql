
-- Créer la table pour les conférences de presse
CREATE TABLE public.press_conferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  video_url text,
  duration text,
  conference_date timestamp with time zone NOT NULL,
  is_published boolean DEFAULT false,
  category text DEFAULT 'conference',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Créer la table pour les séances d'entraînement
CREATE TABLE public.training_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  video_url text,
  duration text,
  training_date timestamp with time zone NOT NULL,
  is_published boolean DEFAULT false,
  category text DEFAULT 'training',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Activer RLS pour les conférences de presse
ALTER TABLE public.press_conferences ENABLE ROW LEVEL SECURITY;

-- Activer RLS pour les séances d'entraînement
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les conférences de presse
CREATE POLICY "Anyone can view published press conferences" 
  ON public.press_conferences 
  FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage press conferences" 
  ON public.press_conferences 
  FOR ALL 
  USING (auth.role() = 'authenticated'::text);

-- Politiques RLS pour les séances d'entraînement
CREATE POLICY "Anyone can view published training sessions" 
  ON public.training_sessions 
  FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage training sessions" 
  ON public.training_sessions 
  FOR ALL 
  USING (auth.role() = 'authenticated'::text);
