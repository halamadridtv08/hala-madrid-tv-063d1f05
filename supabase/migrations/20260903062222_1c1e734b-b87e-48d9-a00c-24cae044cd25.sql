ALTER TABLE public.players ADD COLUMN IF NOT EXISTS formation_image_url TEXT;
ALTER TABLE public.opposing_players ADD COLUMN IF NOT EXISTS formation_image_url TEXT;