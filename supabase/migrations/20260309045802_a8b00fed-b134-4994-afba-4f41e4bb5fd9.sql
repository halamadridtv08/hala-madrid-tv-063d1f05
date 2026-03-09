
-- Make shop_nav a child of shop section so they're grouped together in admin
UPDATE public.site_visibility 
SET parent_key = 'shop', display_order = 1
WHERE section_key = 'shop_nav';
