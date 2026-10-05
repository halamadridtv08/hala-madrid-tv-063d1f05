ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS auto_generated boolean NOT NULL DEFAULT false;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS tags text[];

CREATE TABLE public.auto_article_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  scraping_enabled boolean NOT NULL DEFAULT false,
  publish_mode text NOT NULL DEFAULT 'draft' CHECK (publish_mode IN ('draft','interval','fixed_times')),
  interval_minutes int NOT NULL DEFAULT 120 CHECK (interval_minutes BETWEEN 15 AND 1440),
  fixed_times text[] NOT NULL DEFAULT ARRAY['10:00','14:00','18:00','21:00'],
  timezone text NOT NULL DEFAULT 'Africa/Dakar',
  source_urls text[] NOT NULL DEFAULT ARRAY['https://www.livefoot.fr/espagne/liga/real-madrid.php'],
  max_articles_per_run int NOT NULL DEFAULT 3 CHECK (max_articles_per_run BETWEEN 1 AND 10),
  default_category text NOT NULL DEFAULT 'Actualités',
  last_scrape_at timestamptz,
  last_publish_at timestamptz,
  paused_reason text,
  lock_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.auto_article_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
GRANT SELECT, UPDATE ON public.auto_article_settings TO authenticated;
GRANT ALL ON public.auto_article_settings TO service_role;
ALTER TABLE public.auto_article_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read auto settings" ON public.auto_article_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update auto settings" ON public.auto_article_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.auto_article_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url text NOT NULL UNIQUE,
  source_title text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done','failed','skipped')),
  article_id uuid REFERENCES public.articles(id) ON DELETE SET NULL,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
GRANT SELECT, DELETE ON public.auto_article_items TO authenticated;
GRANT ALL ON public.auto_article_items TO service_role;
ALTER TABLE public.auto_article_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read auto items" ON public.auto_article_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete auto items" ON public.auto_article_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));