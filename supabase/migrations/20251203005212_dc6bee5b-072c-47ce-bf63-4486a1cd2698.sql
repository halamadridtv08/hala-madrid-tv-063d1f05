-- Add scheduled_at column to articles for scheduling publication
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create site_visibility table for managing sections visibility
CREATE TABLE IF NOT EXISTS public.site_visibility (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  section_name TEXT NOT NULL,
  parent_key TEXT DEFAULT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_visibility ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage site visibility" ON public.site_visibility
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view site visibility" ON public.site_visibility
FOR SELECT USING (true);

-- Insert default visibility settings
INSERT INTO public.site_visibility (section_key, section_name, parent_key, display_order) VALUES
  ('navbar', 'Barre de navigation', NULL, 1),
  ('navbar_home', 'Accueil', 'navbar', 1),
  ('navbar_news', 'Actualités', 'navbar', 2),
  ('navbar_matches', 'Matchs', 'navbar', 3),
  ('navbar_players', 'Effectif', 'navbar', 4),
  ('navbar_stats', 'Statistiques', 'navbar', 5),
  ('navbar_videos', 'Vidéos', 'navbar', 6),
  ('navbar_calendar', 'Calendrier', 'navbar', 7),
  ('navbar_kits', 'Maillots', 'navbar', 8),
  ('hero_section', 'Section Hero', NULL, 2),
  ('flash_news', 'Flash News', NULL, 3),
  ('upcoming_match', 'Prochain Match', NULL, 4),
  ('latest_news', 'Dernières Actualités', NULL, 5),
  ('player_spotlight', 'Joueur en Vedette', NULL, 6),
  ('youtube_videos', 'Vidéos YouTube', NULL, 7),
  ('featured_kits', 'Maillots en Vedette', NULL, 8),
  ('trophies', 'Trophées', NULL, 9),
  ('footer', 'Pied de page', NULL, 10),
  ('footer_about', 'À propos', 'footer', 1),
  ('footer_links', 'Liens rapides', 'footer', 2),
  ('footer_contact', 'Contact', 'footer', 3),
  ('footer_social', 'Réseaux sociaux', 'footer', 4)
ON CONFLICT (section_key) DO NOTHING;

-- Add thumbnail_url column to articles
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT NULL;

-- Create trigger for updated_at on site_visibility
CREATE TRIGGER update_site_visibility_updated_at
BEFORE UPDATE ON public.site_visibility
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to publish scheduled articles
CREATE OR REPLACE FUNCTION public.publish_scheduled_articles()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.articles
  SET is_published = true
  WHERE scheduled_at IS NOT NULL 
    AND scheduled_at <= now() 
    AND is_published = false;
END;
$$;