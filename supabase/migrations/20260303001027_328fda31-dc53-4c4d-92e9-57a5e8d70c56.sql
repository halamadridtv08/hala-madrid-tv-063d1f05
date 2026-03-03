
-- Add slug column to articles
ALTER TABLE public.articles ADD COLUMN slug text;

-- Create a function to generate slugs from titles
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Transliterate accented characters and normalize
  base_slug := lower(title);
  -- Replace French accented characters
  base_slug := replace(base_slug, 'à', 'a');
  base_slug := replace(base_slug, 'â', 'a');
  base_slug := replace(base_slug, 'ä', 'a');
  base_slug := replace(base_slug, 'é', 'e');
  base_slug := replace(base_slug, 'è', 'e');
  base_slug := replace(base_slug, 'ê', 'e');
  base_slug := replace(base_slug, 'ë', 'e');
  base_slug := replace(base_slug, 'î', 'i');
  base_slug := replace(base_slug, 'ï', 'i');
  base_slug := replace(base_slug, 'ô', 'o');
  base_slug := replace(base_slug, 'ö', 'o');
  base_slug := replace(base_slug, 'ù', 'u');
  base_slug := replace(base_slug, 'û', 'u');
  base_slug := replace(base_slug, 'ü', 'u');
  base_slug := replace(base_slug, 'ç', 'c');
  base_slug := replace(base_slug, 'ñ', 'n');
  -- Replace non-alphanumeric chars with hyphens
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  -- Trim leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  -- Truncate to max 80 chars
  base_slug := left(base_slug, 80);
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.articles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Generate slugs for all existing articles
UPDATE public.articles 
SET slug = public.generate_slug(title)
WHERE slug IS NULL;

-- Now make the column NOT NULL and add unique index
ALTER TABLE public.articles ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX idx_articles_slug ON public.articles(slug);

-- Create trigger to auto-generate slug on insert if not provided
CREATE OR REPLACE FUNCTION public.auto_generate_article_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_slug_articles
BEFORE INSERT ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_article_slug();
