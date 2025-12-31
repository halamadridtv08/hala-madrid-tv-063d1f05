-- Table pour le contenu textuel du site
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL UNIQUE,
  content_value TEXT NOT NULL,
  content_type TEXT DEFAULT 'text',
  section TEXT NOT NULL,
  description TEXT,
  language TEXT DEFAULT 'fr',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les paramètres du Welcome Popup
CREATE TABLE public.welcome_popup_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_enabled BOOLEAN DEFAULT true,
  title TEXT DEFAULT '¡Bienvenido Madridista!',
  subtitle TEXT DEFAULT 'Votre nouvelle destination pour suivre le Real Madrid',
  button_text TEXT DEFAULT '¡Hala Madrid!',
  delay_ms INTEGER DEFAULT 500,
  features JSONB DEFAULT '[
    {"icon": "crown", "label": "Actualités exclusives"},
    {"icon": "trophy", "label": "Stats en direct"},
    {"icon": "calendar", "label": "Calendrier complet"}
  ]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour le branding (logo, favicon, couleurs)
CREATE TABLE public.branding_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#8B5CF6',
  secondary_color TEXT DEFAULT '#D946EF',
  accent_color TEXT DEFAULT '#F97316',
  site_name TEXT DEFAULT 'HalaMadrid TV',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les liens de navigation
CREATE TABLE public.navigation_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES public.navigation_links(id) ON DELETE CASCADE,
  location TEXT DEFAULT 'navbar',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les réseaux sociaux
CREATE TABLE public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les cartes Explorer (Quick Links)
CREATE TABLE public.explore_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welcome_popup_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explore_cards ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Allow public read for site_content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Allow public read for welcome_popup_settings" ON public.welcome_popup_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read for branding_settings" ON public.branding_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read for navigation_links" ON public.navigation_links FOR SELECT USING (true);
CREATE POLICY "Allow public read for social_links" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "Allow public read for explore_cards" ON public.explore_cards FOR SELECT USING (true);

-- Authenticated users can modify (admins/moderators check done in app)
CREATE POLICY "Authenticated users can insert site_content" ON public.site_content FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update site_content" ON public.site_content FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete site_content" ON public.site_content FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert welcome_popup_settings" ON public.welcome_popup_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update welcome_popup_settings" ON public.welcome_popup_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete welcome_popup_settings" ON public.welcome_popup_settings FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert branding_settings" ON public.branding_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update branding_settings" ON public.branding_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete branding_settings" ON public.branding_settings FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert navigation_links" ON public.navigation_links FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update navigation_links" ON public.navigation_links FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete navigation_links" ON public.navigation_links FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert social_links" ON public.social_links FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update social_links" ON public.social_links FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete social_links" ON public.social_links FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert explore_cards" ON public.explore_cards FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update explore_cards" ON public.explore_cards FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete explore_cards" ON public.explore_cards FOR DELETE TO authenticated USING (true);

-- Insert default data
INSERT INTO public.welcome_popup_settings (id) VALUES (gen_random_uuid());
INSERT INTO public.branding_settings (id) VALUES (gen_random_uuid());

-- Insert default site content
INSERT INTO public.site_content (content_key, content_value, section, description) VALUES
('hero_title', 'HalaMadrid TV', 'hero', 'Titre principal du hero'),
('hero_subtitle', 'Votre nouvelle destination pour suivre le Real Madrid', 'hero', 'Sous-titre du hero'),
('hero_cta_primary', 'Dernières Actualités', 'hero', 'Bouton principal du hero'),
('hero_cta_secondary', 'Voir les Vidéos', 'hero', 'Bouton secondaire du hero'),
('footer_about_title', 'À propos', 'footer', 'Titre section About'),
('footer_about_text', 'HalaMadrid TV est votre destination ultime pour suivre le Real Madrid. Actualités, statistiques, analyses et bien plus encore.', 'footer', 'Texte About'),
('footer_copyright', '© 2024 HalaMadrid TV. Tous droits réservés.', 'footer', 'Copyright'),
('trophies_title', 'Trophées & Moments Légendaires', 'home', 'Titre section trophées'),
('player_spotlight_title', 'Joueur à la Une', 'home', 'Titre section joueur'),
('current_season', '2024/25', 'global', 'Saison actuelle affichée');

-- Insert default social links
INSERT INTO public.social_links (platform, url, icon, display_order) VALUES
('twitter', 'https://twitter.com/realmadrid', 'Twitter', 1),
('instagram', 'https://instagram.com/realmadrid', 'Instagram', 2),
('youtube', 'https://youtube.com/realmadrid', 'Youtube', 3),
('tiktok', 'https://tiktok.com/@realmadrid', 'Music2', 4);

-- Insert default explore cards
INSERT INTO public.explore_cards (title, description, icon, url, display_order) VALUES
('Entraînements', 'Séances d''entraînement', 'Dumbbell', '/training', 1),
('Conférences', 'Conférences de presse', 'Mic', '/press', 2),
('Maillots', 'Collection officielle', 'Shirt', '/kits', 3),
('Calendrier', 'Tous les matchs', 'CalendarDays', '/calendar', 4);

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_welcome_popup_settings_updated_at BEFORE UPDATE ON public.welcome_popup_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_branding_settings_updated_at BEFORE UPDATE ON public.branding_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_navigation_links_updated_at BEFORE UPDATE ON public.navigation_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_social_links_updated_at BEFORE UPDATE ON public.social_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_explore_cards_updated_at BEFORE UPDATE ON public.explore_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();