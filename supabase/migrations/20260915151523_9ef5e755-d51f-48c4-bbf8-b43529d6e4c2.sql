CREATE OR REPLACE FUNCTION public.enforce_story_expiration()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_start timestamptz;
BEGIN
  IF NEW.is_highlight THEN
    RETURN NEW;
  END IF;

  IF NEW.expires_at IS NULL THEN
    IF TG_OP = 'UPDATE' AND OLD.is_highlight THEN
      v_start := COALESCE(NEW.scheduled_at, now());
    ELSE
      v_start := COALESCE(NEW.scheduled_at, NEW.created_at, now());
    END IF;
    NEW.expires_at := v_start + interval '24 hours';
  END IF;

  RETURN NEW;
END;
$$;