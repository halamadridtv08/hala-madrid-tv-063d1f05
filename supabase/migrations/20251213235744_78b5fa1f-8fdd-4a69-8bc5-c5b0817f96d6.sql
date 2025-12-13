-- Add visibility entries for the new features
INSERT INTO public.site_visibility (section_key, section_name, parent_key, is_visible, display_order)
VALUES 
  ('newsletter_footer', 'Newsletter (Pied de page)', 'footer', true, 10),
  ('dream_team_nav', 'Dream Team (Navigation)', 'navbar', true, 10),
  ('live_blog_match', 'Live Blog (Détails match)', NULL, true, 20)
ON CONFLICT (section_key) DO NOTHING;