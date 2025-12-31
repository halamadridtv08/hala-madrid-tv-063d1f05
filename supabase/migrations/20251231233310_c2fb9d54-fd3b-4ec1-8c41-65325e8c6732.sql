-- Update hero_section to be hidden
UPDATE public.site_visibility 
SET is_visible = false, updated_at = now() 
WHERE section_key = 'hero_section';