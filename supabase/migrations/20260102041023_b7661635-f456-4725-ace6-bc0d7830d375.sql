-- Add devtools protection setting to site_visibility
INSERT INTO site_visibility (section_key, section_name, parent_key, is_visible, display_order)
VALUES ('devtools_protection', 'Protection Anti-DevTools', 'security', false, 100)
ON CONFLICT (section_key) DO NOTHING;