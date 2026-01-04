-- Add footer background settings to site_settings
INSERT INTO site_settings (setting_key, setting_value, description)
VALUES 
  ('footer_background_enabled', 'false', 'Activer le fond personnalisé du footer'),
  ('footer_background_type', 'none', 'Type de fond: image, video ou none'),
  ('footer_background_url', '', 'URL du média de fond du footer')
ON CONFLICT (setting_key) DO NOTHING;