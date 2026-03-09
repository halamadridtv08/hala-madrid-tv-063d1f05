
INSERT INTO public.site_visibility (section_key, section_name, parent_key, is_visible, display_order)
VALUES
  ('shop', 'Boutique (Shop)', NULL, false, 50),
  ('shop_nav', 'Lien Shop (Navigation)', 'navbar', false, 15)
ON CONFLICT (section_key) DO UPDATE SET is_visible = false;
