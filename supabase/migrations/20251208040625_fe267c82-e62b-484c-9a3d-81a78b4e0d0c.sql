-- Ajouter les nouvelles sections de visibilité pour Prédictions et Tendances
INSERT INTO public.site_visibility (section_key, section_name, parent_key, is_visible, display_order)
VALUES 
  ('predictions_section', 'Prédictions', NULL, true, 11),
  ('trending_section', 'Tendances', NULL, true, 12)
ON CONFLICT (section_key) DO NOTHING;