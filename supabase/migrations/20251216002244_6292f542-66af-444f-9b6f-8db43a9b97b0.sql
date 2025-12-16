-- Add visibility setting for fancy social links
INSERT INTO site_visibility (section_key, section_name, is_visible, display_order, parent_key)
VALUES ('fancy_social_links', 'Liens sociaux fancy (Footer)', false, 25, 'footer')
ON CONFLICT (section_key) DO NOTHING;