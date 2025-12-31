-- Migration: Add moderator access to content tables
-- This allows users with 'moderator' role to manage content alongside admins
-- Security-sensitive tables remain admin-only

-- ============================================
-- ARTICLES & RELATED
-- ============================================

-- articles: Allow moderators to manage articles
CREATE POLICY "Moderators can manage articles" 
ON public.articles 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- article_images: Allow moderators to manage
DROP POLICY IF EXISTS "Admins can manage article images" ON public.article_images;
CREATE POLICY "Admins and moderators can manage article images" 
ON public.article_images 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- article_polls: Allow moderators to manage
DROP POLICY IF EXISTS "Admins can manage polls" ON public.article_polls;
CREATE POLICY "Admins and moderators can manage polls" 
ON public.article_polls 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- article_quizzes: Allow moderators to manage
DROP POLICY IF EXISTS "Admins can manage quizzes" ON public.article_quizzes;
CREATE POLICY "Admins and moderators can manage quizzes" 
ON public.article_quizzes 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- article_tweets: Allow moderators to manage
DROP POLICY IF EXISTS "Admins can manage tweets" ON public.article_tweets;
CREATE POLICY "Admins and moderators can manage tweets" 
ON public.article_tweets 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- article_comments: Allow moderators to manage
CREATE POLICY "Moderators can manage comments" 
ON public.article_comments 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- PLAYERS & COACHES
-- ============================================

-- players table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'players') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage players" ON public.players';
    EXECUTE 'CREATE POLICY "Admins and moderators can manage players" ON public.players FOR ALL TO authenticated USING (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

-- coaches: Allow moderators to manage
DROP POLICY IF EXISTS "Admins can manage coaches" ON public.coaches;
CREATE POLICY "Admins and moderators can manage coaches" 
ON public.coaches 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- MATCHES & RELATED
-- ============================================

-- matches table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'matches') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage matches" ON public.matches';
    EXECUTE 'CREATE POLICY "Admins and moderators can manage matches" ON public.matches FOR ALL TO authenticated USING (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

-- match_formations
DROP POLICY IF EXISTS "Admins can manage match formations" ON public.match_formations;
CREATE POLICY "Admins and moderators can manage match formations" 
ON public.match_formations 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- match_formation_players
DROP POLICY IF EXISTS "Admins can manage match formation players" ON public.match_formation_players;
CREATE POLICY "Admins and moderators can manage match formation players" 
ON public.match_formation_players 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- match_lineups
DROP POLICY IF EXISTS "Admins can manage match lineups" ON public.match_lineups;
CREATE POLICY "Admins and moderators can manage match lineups" 
ON public.match_lineups 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- match_probable_lineups
DROP POLICY IF EXISTS "Admins can manage match probable lineups" ON public.match_probable_lineups;
CREATE POLICY "Admins and moderators can manage match probable lineups" 
ON public.match_probable_lineups 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- match_absent_players
DROP POLICY IF EXISTS "Admins can manage match absent players" ON public.match_absent_players;
CREATE POLICY "Admins and moderators can manage match absent players" 
ON public.match_absent_players 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- live_blog_entries
DROP POLICY IF EXISTS "Admins can manage live blog entries" ON public.live_blog_entries;
CREATE POLICY "Admins and moderators can manage live blog entries" 
ON public.live_blog_entries 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- live_match_bar_settings
DROP POLICY IF EXISTS "Admins can manage live match bar settings" ON public.live_match_bar_settings;
CREATE POLICY "Admins and moderators can manage live match bar settings" 
ON public.live_match_bar_settings 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- MEDIA: VIDEOS, PHOTOS, KITS
-- ============================================

-- videos table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'videos') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage videos" ON public.videos';
    EXECUTE 'CREATE POLICY "Admins and moderators can manage videos" ON public.videos FOR ALL TO authenticated USING (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

-- photos table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'photos') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage photos" ON public.photos';
    EXECUTE 'CREATE POLICY "Admins and moderators can manage photos" ON public.photos FOR ALL TO authenticated USING (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

-- kits
DROP POLICY IF EXISTS "Admins can manage kits" ON public.kits;
CREATE POLICY "Admins and moderators can manage kits" 
ON public.kits 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- kit_images
DROP POLICY IF EXISTS "Admins can manage kit images" ON public.kit_images;
CREATE POLICY "Admins and moderators can manage kit images" 
ON public.kit_images 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- youtube_videos table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'youtube_videos') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage youtube videos" ON public.youtube_videos';
    EXECUTE 'CREATE POLICY "Admins and moderators can manage youtube videos" ON public.youtube_videos FOR ALL TO authenticated USING (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

-- ============================================
-- OTHER CONTENT
-- ============================================

-- press_conferences table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'press_conferences') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage press conferences" ON public.press_conferences';
    EXECUTE 'CREATE POLICY "Admins and moderators can manage press conferences" ON public.press_conferences FOR ALL TO authenticated USING (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

-- training_sessions table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'training_sessions') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage training sessions" ON public.training_sessions';
    EXECUTE 'CREATE POLICY "Admins and moderators can manage training sessions" ON public.training_sessions FOR ALL TO authenticated USING (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

-- transfers table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transfers') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage transfers" ON public.transfers';
    EXECUTE 'CREATE POLICY "Admins and moderators can manage transfers" ON public.transfers FOR ALL TO authenticated USING (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''moderator''::app_role) OR has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

-- achievements
DROP POLICY IF EXISTS "Admins can manage achievements" ON public.achievements;
CREATE POLICY "Admins and moderators can manage achievements" 
ON public.achievements 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- announcement_bar
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcement_bar;
CREATE POLICY "Admins and moderators can manage announcements" 
ON public.announcement_bar 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- footer_links
DROP POLICY IF EXISTS "Admins can manage footer links" ON public.footer_links;
CREATE POLICY "Admins and moderators can manage footer links" 
ON public.footer_links 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- article_ads
DROP POLICY IF EXISTS "Admins can manage ads" ON public.article_ads;
CREATE POLICY "Admins and moderators can manage ads" 
ON public.article_ads 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- formation_templates
DROP POLICY IF EXISTS "Admins can manage formation templates" ON public.formation_templates;
CREATE POLICY "Admins and moderators can manage formation templates" 
ON public.formation_templates 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- flash_news_categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.flash_news_categories;
CREATE POLICY "Admins and moderators can manage categories" 
ON public.flash_news_categories 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- competition_aliases
DROP POLICY IF EXISTS "Admins can manage competition aliases" ON public.competition_aliases;
CREATE POLICY "Admins and moderators can manage competition aliases" 
ON public.competition_aliases 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- admin_notifications: Allow moderators to view and manage
DROP POLICY IF EXISTS "Admins can view notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.admin_notifications;

CREATE POLICY "Admins and moderators can view notifications" 
ON public.admin_notifications 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins and moderators can update notifications" 
ON public.admin_notifications 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins and moderators can delete notifications" 
ON public.admin_notifications 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- SECURITY TABLES REMAIN ADMIN-ONLY
-- (user_roles, admin_audit_logs, login_attempts, 
--  blocked_email_domains, integrations, admins)
-- No changes needed - they already restrict to admin only
-- ============================================