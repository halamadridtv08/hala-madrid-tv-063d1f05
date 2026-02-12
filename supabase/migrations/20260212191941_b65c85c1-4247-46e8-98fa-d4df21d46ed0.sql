
-- =====================================================
-- SECURITY HARDENING: Fix permissive RLS policies
-- Replace WITH CHECK (true) / USING (true) on admin tables
-- with proper role-based access checks
-- =====================================================

-- ===== branding_settings =====
DROP POLICY IF EXISTS "Authenticated users can insert branding_settings" ON public.branding_settings;
DROP POLICY IF EXISTS "Authenticated users can update branding_settings" ON public.branding_settings;
DROP POLICY IF EXISTS "Authenticated users can delete branding_settings" ON public.branding_settings;

CREATE POLICY "Admins can manage branding_settings"
  ON public.branding_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- ===== explore_cards =====
DROP POLICY IF EXISTS "Authenticated users can insert explore_cards" ON public.explore_cards;
DROP POLICY IF EXISTS "Authenticated users can update explore_cards" ON public.explore_cards;
DROP POLICY IF EXISTS "Authenticated users can delete explore_cards" ON public.explore_cards;

CREATE POLICY "Admins can manage explore_cards"
  ON public.explore_cards FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- ===== navigation_links =====
DROP POLICY IF EXISTS "Authenticated users can insert navigation_links" ON public.navigation_links;
DROP POLICY IF EXISTS "Authenticated users can update navigation_links" ON public.navigation_links;
DROP POLICY IF EXISTS "Authenticated users can delete navigation_links" ON public.navigation_links;

CREATE POLICY "Admins can manage navigation_links"
  ON public.navigation_links FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- ===== site_content =====
DROP POLICY IF EXISTS "Authenticated users can insert site_content" ON public.site_content;
DROP POLICY IF EXISTS "Authenticated users can update site_content" ON public.site_content;
DROP POLICY IF EXISTS "Authenticated users can delete site_content" ON public.site_content;

CREATE POLICY "Admins can manage site_content"
  ON public.site_content FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- ===== social_links =====
DROP POLICY IF EXISTS "Authenticated users can insert social_links" ON public.social_links;
DROP POLICY IF EXISTS "Authenticated users can update social_links" ON public.social_links;
DROP POLICY IF EXISTS "Authenticated users can delete social_links" ON public.social_links;

CREATE POLICY "Admins can manage social_links"
  ON public.social_links FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- ===== welcome_popup_settings =====
DROP POLICY IF EXISTS "Authenticated users can insert welcome_popup_settings" ON public.welcome_popup_settings;
DROP POLICY IF EXISTS "Authenticated users can update welcome_popup_settings" ON public.welcome_popup_settings;
DROP POLICY IF EXISTS "Authenticated users can delete welcome_popup_settings" ON public.welcome_popup_settings;

CREATE POLICY "Admins can manage welcome_popup_settings"
  ON public.welcome_popup_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- ===== kits (insert was public!) =====
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.kits;

CREATE POLICY "Admins can manage kits"
  ON public.kits FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- ===== player_stats =====
DROP POLICY IF EXISTS "Autoriser seulement l'utilisateur connecté" ON public.player_stats;

CREATE POLICY "Admins can manage player_stats"
  ON public.player_stats FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- ===== rate_limits - fix public role to service_role only =====
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;
-- Keep service_role policy, just remove the public one
