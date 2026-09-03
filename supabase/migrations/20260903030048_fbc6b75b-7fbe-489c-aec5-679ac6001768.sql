CREATE OR REPLACE FUNCTION public.validate_story_item_display_settings()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.media_type = 'image' AND (NEW.duration_seconds < 2 OR NEW.duration_seconds > 180) THEN
    RAISE EXCEPTION 'La durée d’une image doit être comprise entre 2 et 180 secondes';
  END IF;
  IF NEW.media_type = 'video' AND (NEW.duration_seconds < 1 OR NEW.duration_seconds > 21600) THEN
    RAISE EXCEPTION 'La durée d’une vidéo doit être comprise entre 1 seconde et 6 heures';
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