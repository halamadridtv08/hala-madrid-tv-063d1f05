-- Ajouter la section barre de match en direct à la visibilité du site
INSERT INTO public.site_visibility (section_key, section_name, parent_key, is_visible, display_order)
VALUES ('live_match_bar', 'Barre de match en direct', 'home', true, 0)
ON CONFLICT (section_key) DO NOTHING;