CREATE OR REPLACE FUNCTION public.archive_expired_stories()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_daily int := 0;
  v_high int := 0;
  v_titles text := '';
BEGIN
  WITH d AS (
    UPDATE public.story_rings
       SET archived_at = now(), is_published = false
     WHERE archived_at IS NULL
       AND is_highlight = false
       AND expires_at IS NOT NULL
       AND expires_at <= now()
    RETURNING title
  )
  SELECT count(*), coalesce(string_agg(title, ', '), '') INTO v_daily, v_titles FROM d;

  WITH h AS (
    UPDATE public.story_rings
       SET archived_at = now(), is_published = false
     WHERE archived_at IS NULL
       AND is_highlight = true
       AND expires_at IS NOT NULL
       AND expires_at <= now()
    RETURNING title
  )
  SELECT count(*) INTO v_high FROM h;

  IF (v_daily + v_high) > 0 THEN
    INSERT INTO public.admin_notifications (type, title, message, entity_type)
    VALUES (
      'story_expiry',
      'Stories archivées automatiquement',
      format('%s story(s) 24 h et %s story(s) à la une ont expiré et ont été archivées. %s', v_daily, v_high, v_titles),
      'story_rings'
    );
  END IF;

  RETURN jsonb_build_object('daily', v_daily, 'highlights', v_high, 'titles', v_titles);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.archive_expired_stories() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.archive_expired_stories() TO authenticated, service_role;

SELECT cron.schedule(
  'archive-expired-stories',
  '0 * * * *',
  $$ SELECT public.archive_expired_stories(); $$
);