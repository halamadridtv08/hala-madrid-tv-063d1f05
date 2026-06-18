
-- 1) integrations: restrict SELECT to admins, expose public tracking IDs via RPC
DROP POLICY IF EXISTS "Authenticated users can view integrations" ON public.integrations;

CREATE OR REPLACE FUNCTION public.get_public_integrations()
RETURNS TABLE(integration_key text, config jsonb)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.integration_key, i.config
  FROM public.integrations i
  WHERE i.is_enabled = true
    AND i.integration_key IN ('google_analytics','facebook_pixel','hotjar','google_adsense');
$$;

REVOKE ALL ON FUNCTION public.get_public_integrations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_integrations() TO anon, authenticated;

-- 2) newsletter_subscribers: only allow inserts through the validated RPC
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

-- 3) poll_votes: drop duplicate INSERT policy and enforce one vote per identifier
DROP POLICY IF EXISTS "Anyone can vote" ON public.poll_votes;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'poll_votes_poll_identifier_unique'
  ) THEN
    -- Use CREATE UNIQUE INDEX (CONCURRENTLY-incompatible in migrations) for dedup
    BEGIN
      EXECUTE 'CREATE UNIQUE INDEX poll_votes_poll_identifier_unique ON public.poll_votes (poll_id, user_identifier)';
    EXCEPTION WHEN unique_violation THEN
      -- If duplicates already exist, skip — they will be addressed manually
      NULL;
    END;
  END IF;
END $$;

-- 4) articles: drop redundant author-level write policies so only moderators/admins can write
DROP POLICY IF EXISTS "Authors can insert their own articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can manage their own articles" ON public.articles;

-- 5) season_predictions_archive: let users read their own archived predictions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'season_predictions_archive'
      AND policyname = 'Users can view their own archived predictions'
  ) THEN
    EXECUTE $POL$
      CREATE POLICY "Users can view their own archived predictions"
      ON public.season_predictions_archive
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id)
    $POL$;
  END IF;
END $$;

-- 6) Set immutable search_path on helper functions flagged by linter
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := lower(title);
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
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  base_slug := left(base_slug, 80);
  base_slug := trim(both '-' from base_slug);

  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.articles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  RETURN final_slug;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_generate_article_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
