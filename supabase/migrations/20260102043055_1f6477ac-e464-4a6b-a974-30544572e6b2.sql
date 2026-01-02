-- Add granular protection options
INSERT INTO site_visibility (section_key, section_name, parent_key, is_visible, display_order)
VALUES 
  ('protection_right_click', 'Blocage clic droit', 'devtools_protection', false, 101),
  ('protection_copy', 'Blocage copie', 'devtools_protection', false, 102),
  ('protection_keyboard', 'Blocage raccourcis clavier', 'devtools_protection', false, 103)
ON CONFLICT (section_key) DO NOTHING;