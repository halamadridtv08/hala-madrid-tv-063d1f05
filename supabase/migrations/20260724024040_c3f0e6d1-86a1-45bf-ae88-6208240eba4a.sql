CREATE OR REPLACE FUNCTION public.archive_and_reset_season(
  p_old_season TEXT,
  p_new_season TEXT,
  p_reset_predictions BOOLEAN DEFAULT false
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_stats_count INT; v_matches_count INT; v_blog_count INT;
  v_predictions_count INT; v_transfers_count INT; v_kits_count INT;
  v_training_count INT; v_press_count INT; v_coaches_count INT;
  v_absent_count INT;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Archive player_stats
  WITH ins AS (
    INSERT INTO public.season_player_stats_archive
      (season, original_id, player_id, match_id, minutes_played, goals, assists,
       yellow_cards, red_cards, shots, shots_on_target, passes, pass_accuracy,
       tackles, interceptions, saves, clean_sheet, position_played)
    SELECT p_old_season, id, player_id, match_id, minutes_played, goals, assists,
       yellow_cards, red_cards, shots, shots_on_target, passes, pass_accuracy,
       tackles, interceptions, saves, clean_sheet, position_played
    FROM public.player_stats
    RETURNING 1
  ) SELECT COUNT(*) INTO v_stats_count FROM ins;

  WITH ins AS (
    INSERT INTO public.season_matches_archive
      (season, original_id, home_team, away_team, home_score, away_score,
       match_date, competition, venue, status, matchweek, home_logo, away_logo)
    SELECT p_old_season, id, home_team, away_team, home_score, away_score,
       match_date, competition, venue, status, matchweek, home_logo, away_logo
    FROM public.matches
    RETURNING 1
  ) SELECT COUNT(*) INTO v_matches_count FROM ins;

  WITH ins AS (
    INSERT INTO public.season_live_blog_archive
      (season, original_id, match_id, minute, event_type, title, description,
       player_name, team, importance, image_url, video_url)
    SELECT p_old_season, id, match_id, minute, event_type, title, description,
       player_name, team, importance, image_url, video_url
    FROM public.live_blog_entries
    RETURNING 1
  ) SELECT COUNT(*) INTO v_blog_count FROM ins;

  WITH ins AS (
    INSERT INTO public.season_predictions_archive
      (season, original_id, user_id, match_id, predicted_home_score,
       predicted_away_score, points_earned, is_correct)
    SELECT p_old_season, id, user_id, match_id, predicted_home_score,
       predicted_away_score, points_earned, is_correct
    FROM public.match_predictions
    RETURNING 1
  ) SELECT COUNT(*) INTO v_predictions_count FROM ins;

  WITH ins AS (
    INSERT INTO public.season_transfers_archive
      (season, original_id, player_name, player_image, position, from_club,
       to_club, transfer_type, transfer_fee, transfer_date, contract_until,
       age, nationality, jersey_number, status, rumor_source, reliability)
    SELECT p_old_season, id, player_name, player_image, position, from_club,
       to_club, transfer_type, transfer_fee, transfer_date, contract_until,
       age, nationality, jersey_number, status, rumor_source, reliability
    FROM public.transfers
    RETURNING 1
  ) SELECT COUNT(*) INTO v_transfers_count FROM ins;

  WITH ins AS (
    INSERT INTO public.season_kits_archive
      (season, original_id, name, kit_type, description, image_url, price, is_available)
    SELECT p_old_season, id, name, kit_type, description, image_url, price, is_available
    FROM public.kits
    RETURNING 1
  ) SELECT COUNT(*) INTO v_kits_count FROM ins;

  WITH ins AS (
    INSERT INTO public.season_training_sessions_archive
      (season, original_id, title, description, session_date, session_type,
       location, image_url, video_url, participants)
    SELECT p_old_season, id, title, description, session_date, session_type,
       location, image_url, video_url, participants
    FROM public.training_sessions
    RETURNING 1
  ) SELECT COUNT(*) INTO v_training_count FROM ins;

  WITH ins AS (
    INSERT INTO public.season_press_conferences_archive
      (season, original_id, title, speaker, conference_date, content,
       image_url, video_url, tags, importance)
    SELECT p_old_season, id, title, speaker, conference_date, content,
       image_url, video_url, tags, importance
    FROM public.press_conferences
    RETURNING 1
  ) SELECT COUNT(*) INTO v_press_count FROM ins;

  WITH ins AS (
    INSERT INTO public.season_coaches_archive
      (season, original_id, name, role, image_url, nationality, birth_date,
       contract_until, biography, joined_date)
    SELECT p_old_season, id, name, role, image_url, nationality, birth_date,
       contract_until, biography, joined_date
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

  -- Delete active data (WHERE true satisfies Supabase DELETE-guard)
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

  v_result := jsonb_build_object(
    'success', true,
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

  RETURN v_result;
END;
$$;