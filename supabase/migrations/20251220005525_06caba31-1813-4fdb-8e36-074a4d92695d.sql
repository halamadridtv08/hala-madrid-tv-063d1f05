-- Ajouter le paramètre pour l'URL Spline dans site_settings
INSERT INTO site_settings (setting_key, setting_value, description)
VALUES ('footer_spline_url', 'https://prod.spline.design/UprPcn5OQK3GJAai/scene.splinecode', 'URL de l''animation Spline du footer')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- Ajouter l'entrée de visibilité dans site_visibility
INSERT INTO site_visibility (section_key, section_name, parent_key, is_visible, display_order)
VALUES ('footer_spline', 'Animation 3D Spline', 'footer', true, 5)
ON CONFLICT (section_key) DO UPDATE SET section_name = EXCLUDED.section_name;