
-- 1) Fix archive_and_reset_season with real column names
CREATE OR REPLACE FUNCTION public.archive_and_reset_season(p_old_season text, p_new_season text, p_reset_predictions boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_result JSONB;
  v_stats_count INT := 0; v_matches_count INT := 0; v_blog_count INT := 0;
  v_predictions_count INT := 0; v_transfers_count INT := 0; v_kits_count INT := 0;
  v_training_count INT := 0; v_press_count INT := 0; v_coaches_count INT := 0;
  v_absent_count INT := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

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

  WITH ins AS (
    INSERT INTO public.season_matches_archive
      (season, original_id, home_team, away_team, home_score, away_score,
       match_date, competition, venue, status, home_team_logo, away_team_logo, match_details)
    SELECT p_old_season, id, home_team, away_team, home_score, away_score,
       match_date, competition, venue, status, home_team_logo, away_team_logo, match_details
    FROM public.matches
    RETURNING 1
  ) SELECT COUNT(*) INTO v_matches_count FROM ins;

  WITH ins AS (
    INSERT INTO public.season_live_blog_archive
      (season, original_id, match_id, entry_type, content, title, minute,
       player_id, team_side, is_important, image_url)
    SELECT p_old_season, id, match_id, entry_type, content, title, minute,
       player_id, team_side, is_important, image_url
    FROM public.live_blog_entries
    RETURNING 1
  ) SELECT COUNT(*) INTO v_blog_count FROM ins;

  -- predictions archive stores aggregated leaderboard per user
  WITH ins AS (
    INSERT INTO public.season_predictions_archive
      (season, user_id, total_points, correct_scores, correct_outcomes,
       total_predictions, current_streak, best_streak)
    SELECT p_old_season, user_id, total_points, correct_scores, correct_outcomes,
       total_predictions, current_streak, best_streak
    FROM public.prediction_leaderboard
    RETURNING 1
  ) SELECT COUNT(*) INTO v_predictions_count FROM ins;

  WITH ins AS (
    INSERT INTO public.season_transfers_archive
      (season, original_id, player_id, player_name, player_image,
       from_team, from_team_logo, to_team, to_team_logo,
       transfer_type, transfer_fee, is_official, description, transfer_date, return_date)
    SELECT p_old_season, id, player_id, player_name, player_image,
       from_team, from_team_logo, to_team, to_team_logo,
       transfer_type, transfer_fee, is_official, description, transfer_date, return_date
    FROM public.transfers
    RETURNING 1
  ) SELECT COUNT(*) INTO v_transfers_count FROM ins;

  WITH ins AS (
    INSERT INTO public.season_kits_archive
      (season, original_id, title, type, image_url, description, price)
    SELECT p_old_season, id, title, type, image_url, description, price
    FROM public.kits
    RETURNING 1
  ) SELECT COUNT(*) INTO v_kits_count FROM ins;

  WITH ins AS (
    INSERT INTO public.season_training_sessions_archive
      (season, original_id, title, description, thumbnail_url, video_url,
       duration, training_date, category)
    SELECT p_old_season, id, title, description, thumbnail_url, video_url,
       duration, training_date, category
    FROM public.training_sessions
    RETURNING 1
  ) SELECT COUNT(*) INTO v_training_count FROM ins;

  WITH ins AS (
    INSERT INTO public.season_press_conferences_archive
      (season, original_id, title, description, thumbnail_url, video_url,
       duration, conference_date, category)
    SELECT p_old_season, id, title, description, thumbnail_url, video_url,
       duration, conference_date, category
    FROM public.press_conferences
    RETURNING 1
  ) SELECT COUNT(*) INTO v_press_count FROM ins;

  WITH ins AS (
    INSERT INTO public.season_coaches_archive
      (season, original_id, name, role, age, nationality, image_url, bio, experience_years)
    SELECT p_old_season, id, name, role, age, nationality, image_url, bio, experience_years
    FROM public.coaches
    RETURNING 1
  ) SELECT COUNT(*) INTO v_coaches_count FROM ins;

  WITH ins AS (
    INSERT INTO public.season_match_absent_players_archive
      (season, original_id, match_id, team_type, player_id, player_name, reason, return_date)
    SELECT p_old_season, id, match_id, team_type, player_id, player_name, reason, return_date
    FROM public.match_absent_players
    RETURNING 1
  ) SELECT COUNT(*) INTO v_absent_count FROM ins;

  DELETE FROM public.player_stats WHERE true;
  DELETE FROM public.live_blog_entries WHERE true;
  DELETE FROM public.match_formation_players WHERE true;
  DELETE FROM public.match_formations WHERE true;
  DELETE FROM public.match_lineups WHERE true;
  DELETE FROM public.match_predictions WHERE true;
  DELETE FROM public.match_probable_lineups WHERE true;
  DELETE FROM public.match_absent_players WHERE true;
  DELETE FROM public.match_timer_settings WHERE true;
  DELETE FROM public.matches WHERE true;

  IF p_reset_predictions THEN
    UPDATE public.prediction_leaderboard
      SET total_points = 0, correct_scores = 0, correct_outcomes = 0,
          total_predictions = 0, current_streak = 0, updated_at = now()
      WHERE true;
  END IF;

  UPDATE public.site_content
    SET content_value = p_new_season, updated_at = now()
    WHERE content_key = 'current_season';

  INSERT INTO public.admin_audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(), 'season_reset', 'season', p_new_season,
    jsonb_build_object(
      'old_season', p_old_season, 'new_season', p_new_season,
      'archived', jsonb_build_object(
        'player_stats', v_stats_count, 'matches', v_matches_count,
        'live_blog', v_blog_count, 'predictions', v_predictions_count,
        'transfers', v_transfers_count, 'kits', v_kits_count,
        'training', v_training_count, 'press_conferences', v_press_count,
        'coaches', v_coaches_count, 'absent_players', v_absent_count
      )
    )
  );

  v_result := jsonb_build_object(
    'success', true,
    'archived', jsonb_build_object(
      'player_stats', v_stats_count, 'matches', v_matches_count,
      'live_blog', v_blog_count, 'predictions', v_predictions_count,
      'transfers', v_transfers_count, 'kits', v_kits_count,
      'training', v_training_count, 'press_conferences', v_press_count,
      'coaches', v_coaches_count, 'absent_players', v_absent_count
    )
  );
  RETURN v_result;
END;
$function$;

-- 2) Live chat messages
CREATE TABLE IF NOT EXISTS public.live_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id UUID,
  room_key TEXT NOT NULL DEFAULT 'global',
  display_name TEXT,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 500),
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS live_chat_messages_room_created_idx
  ON public.live_chat_messages (room_key, created_at DESC);

GRANT SELECT ON public.live_chat_messages TO anon, authenticated;
GRANT INSERT ON public.live_chat_messages TO authenticated;
GRANT ALL ON public.live_chat_messages TO service_role;

ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visible chat messages"
  ON public.live_chat_messages FOR SELECT
  USING (is_hidden = false OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Authenticated users can post chat messages"
  ON public.live_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and moderators can moderate chat"
  ON public.live_chat_messages FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete chat messages"
  ON public.live_chat_messages FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;

-- 3) YouTube videos: mark as live stream + optional raw stream URL
ALTER TABLE public.youtube_videos
  ADD COLUMN IF NOT EXISTS is_live_stream BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stream_url TEXT;
