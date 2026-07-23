
-- ============================================================
-- Archive tables (extend beyond stats/matches/live_blog/predictions)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.season_transfers_archive (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season TEXT NOT NULL,
  original_id UUID,
  player_id UUID,
  player_name TEXT,
  player_image TEXT,
  from_team TEXT,
  from_team_logo TEXT,
  to_team TEXT,
  to_team_logo TEXT,
  transfer_type TEXT,
  transfer_fee TEXT,
  is_official BOOLEAN,
  description TEXT,
  transfer_date DATE,
  return_date DATE,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.season_transfers_archive TO anon, authenticated;
GRANT ALL ON public.season_transfers_archive TO service_role;
ALTER TABLE public.season_transfers_archive ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read transfers archive" ON public.season_transfers_archive FOR SELECT USING (true);
CREATE POLICY "Admins manage transfers archive" ON public.season_transfers_archive FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.season_kits_archive (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season TEXT NOT NULL,
  original_id UUID,
  title TEXT,
  type TEXT,
  image_url TEXT,
  description TEXT,
  price NUMERIC,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.season_kits_archive TO anon, authenticated;
GRANT ALL ON public.season_kits_archive TO service_role;
ALTER TABLE public.season_kits_archive ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read kits archive" ON public.season_kits_archive FOR SELECT USING (true);
CREATE POLICY "Admins manage kits archive" ON public.season_kits_archive FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.season_training_sessions_archive (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season TEXT NOT NULL,
  original_id UUID,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  duration TEXT,
  training_date TIMESTAMPTZ,
  category TEXT,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.season_training_sessions_archive TO anon, authenticated;
GRANT ALL ON public.season_training_sessions_archive TO service_role;
ALTER TABLE public.season_training_sessions_archive ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read training archive" ON public.season_training_sessions_archive FOR SELECT USING (true);
CREATE POLICY "Admins manage training archive" ON public.season_training_sessions_archive FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.season_press_conferences_archive (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season TEXT NOT NULL,
  original_id UUID,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  duration TEXT,
  conference_date TIMESTAMPTZ,
  category TEXT,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.season_press_conferences_archive TO anon, authenticated;
GRANT ALL ON public.season_press_conferences_archive TO service_role;
ALTER TABLE public.season_press_conferences_archive ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read press archive" ON public.season_press_conferences_archive FOR SELECT USING (true);
CREATE POLICY "Admins manage press archive" ON public.season_press_conferences_archive FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.season_coaches_archive (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season TEXT NOT NULL,
  original_id UUID,
  name TEXT,
  role TEXT,
  age INTEGER,
  nationality TEXT,
  image_url TEXT,
  bio TEXT,
  experience_years INTEGER,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.season_coaches_archive TO anon, authenticated;
GRANT ALL ON public.season_coaches_archive TO service_role;
ALTER TABLE public.season_coaches_archive ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read coaches archive" ON public.season_coaches_archive FOR SELECT USING (true);
CREATE POLICY "Admins manage coaches archive" ON public.season_coaches_archive FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.season_match_absent_players_archive (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season TEXT NOT NULL,
  original_id UUID,
  match_id UUID,
  team_type TEXT,
  player_id UUID,
  player_name TEXT,
  reason TEXT,
  return_date DATE,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.season_match_absent_players_archive TO anon, authenticated;
GRANT ALL ON public.season_match_absent_players_archive TO service_role;
ALTER TABLE public.season_match_absent_players_archive ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read absent archive" ON public.season_match_absent_players_archive FOR SELECT USING (true);
CREATE POLICY "Admins manage absent archive" ON public.season_match_absent_players_archive FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE INDEX IF NOT EXISTS idx_season_transfers_archive_season ON public.season_transfers_archive(season);
CREATE INDEX IF NOT EXISTS idx_season_kits_archive_season ON public.season_kits_archive(season);
CREATE INDEX IF NOT EXISTS idx_season_training_archive_season ON public.season_training_sessions_archive(season);
CREATE INDEX IF NOT EXISTS idx_season_press_archive_season ON public.season_press_conferences_archive(season);
CREATE INDEX IF NOT EXISTS idx_season_coaches_archive_season ON public.season_coaches_archive(season);
CREATE INDEX IF NOT EXISTS idx_season_absent_archive_season ON public.season_match_absent_players_archive(season);
CREATE INDEX IF NOT EXISTS idx_season_pstats_archive_player ON public.season_player_stats_archive(player_id, season);
CREATE INDEX IF NOT EXISTS idx_season_matches_archive_season ON public.season_matches_archive(season);

-- ============================================================
-- Transactional season reset function
-- ============================================================

CREATE OR REPLACE FUNCTION public.archive_and_reset_season(
  p_old_season TEXT,
  p_new_season TEXT,
  p_reset_predictions BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats_count INT := 0;
  v_matches_count INT := 0;
  v_blog_count INT := 0;
  v_predictions_count INT := 0;
  v_transfers_count INT := 0;
  v_kits_count INT := 0;
  v_training_count INT := 0;
  v_press_count INT := 0;
  v_coaches_count INT := 0;
  v_absent_count INT := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  IF p_old_season IS NULL OR p_new_season IS NULL OR p_old_season = p_new_season THEN
    RAISE EXCEPTION 'Invalid season parameters';
  END IF;

  -- Archive player stats
  WITH ins AS (
    INSERT INTO public.season_player_stats_archive
      (season, original_id, player_id, match_id, goals, assists, minutes_played,
       yellow_cards, red_cards, saves, clean_sheets, goals_conceded,
       passes_completed, pass_accuracy, tackles, interceptions)
    SELECT p_old_season, id, player_id, match_id, goals, assists, minutes_played,
           yellow_cards, red_cards, saves, clean_sheets, goals_conceded,
           passes_completed, pass_accuracy, tackles, interceptions
    FROM public.player_stats
    RETURNING 1
  ) SELECT COUNT(*) INTO v_stats_count FROM ins;

  -- Archive matches
  WITH ins AS (
    INSERT INTO public.season_matches_archive
      (season, original_id, home_team, away_team, home_score, away_score,
       match_date, competition, venue, status, home_team_logo, away_team_logo, match_details)
    SELECT p_old_season, id, home_team, away_team, home_score, away_score,
           match_date, competition, venue, status, home_team_logo, away_team_logo, match_details
    FROM public.matches
    RETURNING 1
  ) SELECT COUNT(*) INTO v_matches_count FROM ins;

  -- Archive live blog
  WITH ins AS (
    INSERT INTO public.season_live_blog_archive
      (season, original_id, match_id, entry_type, content, title, minute,
       player_id, team_side, is_important, image_url)
    SELECT p_old_season, id, match_id, entry_type, content, title, minute,
           player_id, team_side, is_important, image_url
    FROM public.live_blog_entries
    RETURNING 1
  ) SELECT COUNT(*) INTO v_blog_count FROM ins;

  -- Archive predictions leaderboard
  WITH ins AS (
    INSERT INTO public.season_predictions_archive
      (season, user_id, total_points, correct_scores, correct_outcomes,
       total_predictions, current_streak, best_streak)
    SELECT p_old_season, user_id, total_points, correct_scores, correct_outcomes,
           total_predictions, current_streak, best_streak
    FROM public.prediction_leaderboard
    RETURNING 1
  ) SELECT COUNT(*) INTO v_predictions_count FROM ins;

  -- Archive transfers
  WITH ins AS (
    INSERT INTO public.season_transfers_archive
      (season, original_id, player_id, player_name, player_image, from_team, from_team_logo,
       to_team, to_team_logo, transfer_type, transfer_fee, is_official, description, transfer_date, return_date)
    SELECT p_old_season, id, player_id, player_name, player_image, from_team, from_team_logo,
           to_team, to_team_logo, transfer_type, transfer_fee, is_official, description, transfer_date, return_date
    FROM public.transfers
    RETURNING 1
  ) SELECT COUNT(*) INTO v_transfers_count FROM ins;

  -- Archive kits
  WITH ins AS (
    INSERT INTO public.season_kits_archive
      (season, original_id, title, type, image_url, description, price)
    SELECT p_old_season, id, title, type, image_url, description, price
    FROM public.kits
    RETURNING 1
  ) SELECT COUNT(*) INTO v_kits_count FROM ins;

  -- Archive training sessions
  WITH ins AS (
    INSERT INTO public.season_training_sessions_archive
      (season, original_id, title, description, thumbnail_url, video_url, duration, training_date, category)
    SELECT p_old_season, id, title, description, thumbnail_url, video_url, duration, training_date, category
    FROM public.training_sessions
    RETURNING 1
  ) SELECT COUNT(*) INTO v_training_count FROM ins;

  -- Archive press conferences
  WITH ins AS (
    INSERT INTO public.season_press_conferences_archive
      (season, original_id, title, description, thumbnail_url, video_url, duration, conference_date, category)
    SELECT p_old_season, id, title, description, thumbnail_url, video_url, duration, conference_date, category
    FROM public.press_conferences
    RETURNING 1
  ) SELECT COUNT(*) INTO v_press_count FROM ins;

  -- Snapshot coaches
  WITH ins AS (
    INSERT INTO public.season_coaches_archive
      (season, original_id, name, role, age, nationality, image_url, bio, experience_years)
    SELECT p_old_season, id, name, role, age, nationality,
           COALESCE(profile_image_url, image_url), COALESCE(biography, bio), experience_years
    FROM public.coaches WHERE is_active = true
    RETURNING 1
  ) SELECT COUNT(*) INTO v_coaches_count FROM ins;

  -- Archive absent players
  WITH ins AS (
    INSERT INTO public.season_match_absent_players_archive
      (season, original_id, match_id, team_type, player_id, player_name, reason, return_date)
    SELECT p_old_season, id, match_id, team_type, player_id, player_name, reason, return_date
    FROM public.match_absent_players
    RETURNING 1
  ) SELECT COUNT(*) INTO v_absent_count FROM ins;

  -- Now delete active data (all within same transaction - rolls back on error)
  DELETE FROM public.player_stats;
  DELETE FROM public.live_blog_entries;
  DELETE FROM public.match_formation_players;
  DELETE FROM public.match_formations;
  DELETE FROM public.match_lineups;
  DELETE FROM public.match_predictions;
  DELETE FROM public.match_probable_lineups;
  DELETE FROM public.match_absent_players;
  DELETE FROM public.match_timer_settings;
  DELETE FROM public.matches;

  IF p_reset_predictions THEN
    UPDATE public.prediction_leaderboard
      SET total_points = 0, correct_scores = 0, correct_outcomes = 0,
          total_predictions = 0, current_streak = 0, updated_at = now();
  END IF;

  -- Update current season
  UPDATE public.site_content
    SET content_value = p_new_season, updated_at = now()
    WHERE content_key = 'current_season';

  -- Audit log
  INSERT INTO public.admin_audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(), 'season_reset', 'season', p_new_season,
    jsonb_build_object(
      'old_season', p_old_season,
      'new_season', p_new_season,
      'archived', jsonb_build_object(
        'player_stats', v_stats_count,
        'matches', v_matches_count,
        'live_blog', v_blog_count,
        'predictions', v_predictions_count,
        'transfers', v_transfers_count,
        'kits', v_kits_count,
        'training', v_training_count,
        'press_conferences', v_press_count,
        'coaches', v_coaches_count,
        'absent_players', v_absent_count
      )
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'old_season', p_old_season,
    'new_season', p_new_season,
    'archived', jsonb_build_object(
      'player_stats', v_stats_count,
      'matches', v_matches_count,
      'live_blog', v_blog_count,
      'predictions', v_predictions_count,
      'transfers', v_transfers_count,
      'kits', v_kits_count,
      'training', v_training_count,
      'press_conferences', v_press_count,
      'coaches', v_coaches_count,
      'absent_players', v_absent_count
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.archive_and_reset_season(TEXT, TEXT, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.archive_and_reset_season(TEXT, TEXT, BOOLEAN) TO authenticated;
