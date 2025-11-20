-- Insert example flash news source with fabri avatar
INSERT INTO public.flash_news_sources (name, handle, avatar_url, is_active)
VALUES 
  ('Fabri', '@fabri', '/avatars/fabri-avatar.png', true)
ON CONFLICT (handle) DO UPDATE 
SET 
  name = EXCLUDED.name,
  avatar_url = EXCLUDED.avatar_url,
  is_active = EXCLUDED.is_active,
  updated_at = now();