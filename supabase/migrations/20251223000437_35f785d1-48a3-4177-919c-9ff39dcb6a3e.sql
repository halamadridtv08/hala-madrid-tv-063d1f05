-- Add hero background video settings to site_settings
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES 
  ('hero_background_video_enabled', 'false'),
  ('hero_background_video_url', '')
ON CONFLICT (setting_key) DO NOTHING;