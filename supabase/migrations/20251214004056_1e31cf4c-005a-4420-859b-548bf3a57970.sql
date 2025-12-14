-- Add visibility entry for language selector
INSERT INTO public.site_visibility (section_key, section_name, is_visible, display_order, parent_key)
VALUES ('language_selector', 'Sélecteur de langue', true, 35, 'navbar')
ON CONFLICT (section_key) DO NOTHING;