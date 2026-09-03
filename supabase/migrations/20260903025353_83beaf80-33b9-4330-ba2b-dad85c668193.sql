ALTER TABLE public.story_items
  ADD COLUMN IF NOT EXISTS backdrop_blur integer NOT NULL DEFAULT 32,
  ADD COLUMN IF NOT EXISTS backdrop_opacity integer NOT NULL DEFAULT 55,
  ADD COLUMN IF NOT EXISTS media_zoom numeric(4,2) NOT NULL DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS media_position_x integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS media_position_y integer NOT NULL DEFAULT 50;

CREATE OR REPLACE FUNCTION public.validate_story_item_display_settings()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.duration_seconds < 2 OR NEW.duration_seconds > 180 THEN
    RAISE EXCEPTION 'La durée doit être comprise entre 2 et 180 secondes';
  END IF;
  IF NEW.backdrop_blur < 0 OR NEW.backdrop_blur > 64 THEN
    RAISE EXCEPTION 'Le flou doit être compris entre 0 et 64';
  END IF;
  IF NEW.backdrop_opacity < 0 OR NEW.backdrop_opacity > 100 THEN
    RAISE EXCEPTION 'L’opacité doit être comprise entre 0 et 100';
  END IF;
  IF NEW.media_zoom < 1 OR NEW.media_zoom > 2 THEN
    RAISE EXCEPTION 'Le zoom doit être compris entre 1 et 2';
  END IF;
  IF NEW.media_position_x < 0 OR NEW.media_position_x > 100 OR NEW.media_position_y < 0 OR NEW.media_position_y > 100 THEN
    RAISE EXCEPTION 'La position doit être comprise entre 0 et 100';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_story_item_display_settings_trigger ON public.story_items;
CREATE TRIGGER validate_story_item_display_settings_trigger
BEFORE INSERT OR UPDATE ON public.story_items
FOR EACH ROW EXECUTE FUNCTION public.validate_story_item_display_settings();