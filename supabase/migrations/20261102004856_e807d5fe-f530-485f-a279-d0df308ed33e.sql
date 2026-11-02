-- lovable-cron-fallback-reviewed: existing user-approved 30-min auto-articles job; only adding an auth token header, cadence unchanged
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name='auto_articles_cron_token') THEN
    PERFORM vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'), 'auto_articles_cron_token');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.verify_auto_articles_cron_token(p_token text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, vault AS $$
  SELECT p_token IS NOT NULL AND EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name='auto_articles_cron_token' AND decrypted_secret = p_token)
$$;
REVOKE ALL ON FUNCTION public.verify_auto_articles_cron_token(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_auto_articles_cron_token(text) TO service_role;

SELECT cron.unschedule('auto-articles-every-30-min');
SELECT cron.schedule('auto-articles-every-30-min', '*/30 * * * *', $cmd$
  select net.http_post(
    url:='https://qjnppcfbywfazwolfppo.supabase.co/functions/v1/auto-articles',
    headers:=jsonb_build_object('Content-Type','application/json','apikey','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbnBwY2ZieXdmYXp3b2xmcHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNDA0MzksImV4cCI6MjA2MTcxNjQzOX0.1dPuqM42ASnYsfdBs4d2bLRgHxJQzmCSEW2dIUbcJOI',
      'x-cron-token',(select decrypted_secret from vault.decrypted_secrets where name='auto_articles_cron_token')),
    body:='{"action":"cron"}'::jsonb)
$cmd$);

CREATE OR REPLACE FUNCTION public.sanitize_moderator_action_title()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.entity_title IS NOT NULL THEN
    NEW.entity_title := left(regexp_replace(NEW.entity_title, '[<>]', '', 'g'), 300);
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS sanitize_moderator_action_title ON public.moderator_actions;
CREATE TRIGGER sanitize_moderator_action_title BEFORE INSERT OR UPDATE ON public.moderator_actions
FOR EACH ROW EXECUTE FUNCTION public.sanitize_moderator_action_title();