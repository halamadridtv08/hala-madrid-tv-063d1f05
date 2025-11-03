-- Ajouter le champ is_featured à la table youtube_videos
ALTER TABLE public.youtube_videos 
ADD COLUMN is_featured boolean DEFAULT false;

-- S'assurer qu'une seule vidéo peut être featured à la fois
-- avec un trigger qui désactive les autres quand une nouvelle est featured
CREATE OR REPLACE FUNCTION public.ensure_single_featured_youtube_video()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_featured = true THEN
    UPDATE public.youtube_videos
    SET is_featured = false
    WHERE id != NEW.id AND is_featured = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER youtube_videos_featured_trigger
BEFORE INSERT OR UPDATE ON public.youtube_videos
FOR EACH ROW
WHEN (NEW.is_featured = true)
EXECUTE FUNCTION public.ensure_single_featured_youtube_video();