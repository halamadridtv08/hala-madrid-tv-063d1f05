-- Create partners table for sponsor logos
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  tier TEXT NOT NULL DEFAULT 'standard', -- 'main', 'official', 'standard'
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- RLS policies for partners
CREATE POLICY "Anyone can view active partners" ON public.partners FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage partners" ON public.partners FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create footer_links table
CREATE TABLE public.footer_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT,
  link_type TEXT NOT NULL DEFAULT 'internal', -- 'internal', 'external', 'modal'
  section TEXT NOT NULL DEFAULT 'legal', -- 'legal', 'quick_links', 'social'
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  icon TEXT,
  content TEXT, -- For modal content like privacy policy
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for footer_links
CREATE POLICY "Anyone can view visible footer links" ON public.footer_links FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can manage footer links" ON public.footer_links FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create article_ads table
CREATE TABLE public.article_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  aspect_ratio TEXT DEFAULT '16:9', -- '16:9', '4:3', '1:1', '9:16', 'custom'
  custom_width INTEGER,
  custom_height INTEGER,
  position TEXT DEFAULT 'sidebar', -- 'sidebar', 'bottom', 'inline'
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.article_ads ENABLE ROW LEVEL SECURITY;

-- RLS policies for article_ads
CREATE POLICY "Anyone can view active ads" ON public.article_ads FOR SELECT USING (is_active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()));
CREATE POLICY "Admins can manage ads" ON public.article_ads FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Insert visibility settings
INSERT INTO public.site_visibility (section_key, section_name, is_visible, display_order, parent_key) VALUES
  ('partners_section', 'Section Partenaires', true, 100, NULL),
  ('footer_legal', 'Footer - Liens légaux', true, 101, NULL),
  ('footer_cookies', 'Footer - Préférences cookies', true, 102, NULL),
  ('footer_newsletter', 'Footer - Newsletter', true, 103, NULL)
ON CONFLICT (section_key) DO NOTHING;

-- Insert default footer links
INSERT INTO public.footer_links (title, url, link_type, section, display_order, icon) VALUES
  ('Mentions légales', '/mentions-legales', 'modal', 'legal', 1, 'FileText'),
  ('Politique de confidentialité', '/politique-confidentialite', 'modal', 'legal', 2, 'Shield'),
  ('Préférences cookies', '#cookies', 'modal', 'legal', 3, 'Cookie'),
  ('Contact', '/contact', 'modal', 'legal', 4, 'Mail'),
  ('CGU', '/cgu', 'modal', 'legal', 5, 'ScrollText');

-- Create triggers for updated_at
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_footer_links_updated_at BEFORE UPDATE ON public.footer_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_article_ads_updated_at BEFORE UPDATE ON public.article_ads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();