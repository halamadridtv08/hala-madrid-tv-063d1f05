-- Archive table for player stats
CREATE TABLE public.season_player_stats_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season TEXT NOT NULL,
  original_id UUID,
  player_id UUID,
  match_id UUID,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  minutes_played INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  goals_conceded INTEGER DEFAULT 0,
  passes_completed INTEGER DEFAULT 0,
  pass_accuracy NUMERIC,
  tackles INTEGER DEFAULT 0,
  interceptions INTEGER DEFAULT 0,
  rating NUMERIC,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive table for matches
CREATE TABLE public.season_matches_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season TEXT NOT NULL,
  original_id UUID,
  home_team TEXT,
  away_team TEXT,
  home_score INTEGER,
  away_score INTEGER,
  match_date TIMESTAMPTZ,
  competition TEXT,
  venue TEXT,
  status TEXT,
  home_team_logo TEXT,
  away_team_logo TEXT,
  match_details JSONB,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive table for predictions leaderboard
CREATE TABLE public.season_predictions_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season TEXT NOT NULL,
  user_id UUID,
  total_points INTEGER DEFAULT 0,
  correct_scores INTEGER DEFAULT 0,
  correct_outcomes INTEGER DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archive table for live blog entries
CREATE TABLE public.season_live_blog_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season TEXT NOT NULL,
  original_id UUID,
  match_id UUID,
  entry_type TEXT,
  content TEXT,
  title TEXT,
  minute INTEGER,
  player_id UUID,
  team_side TEXT,
  is_important BOOLEAN,
  image_url TEXT,
  archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all archive tables
ALTER TABLE public.season_player_stats_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_matches_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_predictions_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_live_blog_archive ENABLE ROW LEVEL SECURITY;

-- RLS policies for admins only
CREATE POLICY "Admins can manage player stats archive"
ON public.season_player_stats_archive
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage matches archive"
ON public.season_matches_archive
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage predictions archive"
ON public.season_predictions_archive
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage live blog archive"
ON public.season_live_blog_archive
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better query performance
CREATE INDEX idx_player_stats_archive_season ON public.season_player_stats_archive(season);
CREATE INDEX idx_matches_archive_season ON public.season_matches_archive(season);
CREATE INDEX idx_predictions_archive_season ON public.season_predictions_archive(season);
CREATE INDEX idx_live_blog_archive_season ON public.season_live_blog_archive(season);