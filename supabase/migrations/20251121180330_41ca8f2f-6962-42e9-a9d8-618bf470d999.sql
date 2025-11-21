-- Create table for player objectives/goals
CREATE TABLE public.player_objectives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  objective_type TEXT NOT NULL CHECK (objective_type IN ('goals', 'assists', 'clean_sheets', 'minutes_played', 'yellow_cards_max', 'custom')),
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  season TEXT NOT NULL,
  competition TEXT,
  description TEXT,
  deadline DATE,
  is_achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for season statistics summary
CREATE TABLE public.season_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season TEXT NOT NULL,
  competition TEXT,
  total_matches INTEGER DEFAULT 0,
  matches_won INTEGER DEFAULT 0,
  matches_drawn INTEGER DEFAULT 0,
  matches_lost INTEGER DEFAULT 0,
  goals_scored INTEGER DEFAULT 0,
  goals_conceded INTEGER DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  top_scorer_id UUID REFERENCES public.players(id),
  top_assister_id UUID REFERENCES public.players(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(season, competition)
);

-- Enable RLS
ALTER TABLE public.player_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_statistics ENABLE ROW LEVEL SECURITY;

-- RLS policies for player_objectives
CREATE POLICY "Admins can manage player objectives"
ON public.player_objectives
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view player objectives"
ON public.player_objectives
FOR SELECT
USING (true);

-- RLS policies for season_statistics
CREATE POLICY "Admins can manage season statistics"
ON public.season_statistics
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view season statistics"
ON public.season_statistics
FOR SELECT
USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_player_objectives_updated_at
BEFORE UPDATE ON public.player_objectives
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_season_statistics_updated_at
BEFORE UPDATE ON public.season_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update objective progress
CREATE OR REPLACE FUNCTION public.update_player_objectives_progress()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_objective RECORD;
  v_current_value INTEGER;
BEGIN
  FOR v_objective IN 
    SELECT * FROM public.player_objectives WHERE is_achieved = false
  LOOP
    CASE v_objective.objective_type
      WHEN 'goals' THEN
        SELECT COALESCE(SUM(goals), 0) INTO v_current_value
        FROM public.player_stats ps
        JOIN public.matches m ON m.id = ps.match_id
        WHERE ps.player_id = v_objective.player_id
          AND (v_objective.season IS NULL OR EXTRACT(YEAR FROM m.match_date)::TEXT = v_objective.season)
          AND (v_objective.competition IS NULL OR m.competition = v_objective.competition);
          
      WHEN 'assists' THEN
        SELECT COALESCE(SUM(assists), 0) INTO v_current_value
        FROM public.player_stats ps
        JOIN public.matches m ON m.id = ps.match_id
        WHERE ps.player_id = v_objective.player_id
          AND (v_objective.season IS NULL OR EXTRACT(YEAR FROM m.match_date)::TEXT = v_objective.season)
          AND (v_objective.competition IS NULL OR m.competition = v_objective.competition);
          
      WHEN 'clean_sheets' THEN
        SELECT COALESCE(SUM(clean_sheets), 0) INTO v_current_value
        FROM public.player_stats ps
        JOIN public.matches m ON m.id = ps.match_id
        WHERE ps.player_id = v_objective.player_id
          AND (v_objective.season IS NULL OR EXTRACT(YEAR FROM m.match_date)::TEXT = v_objective.season)
          AND (v_objective.competition IS NULL OR m.competition = v_objective.competition);
          
      WHEN 'minutes_played' THEN
        SELECT COALESCE(SUM(minutes_played), 0) INTO v_current_value
        FROM public.player_stats ps
        JOIN public.matches m ON m.id = ps.match_id
        WHERE ps.player_id = v_objective.player_id
          AND (v_objective.season IS NULL OR EXTRACT(YEAR FROM m.match_date)::TEXT = v_objective.season)
          AND (v_objective.competition IS NULL OR m.competition = v_objective.competition);
          
      WHEN 'yellow_cards_max' THEN
        SELECT COALESCE(SUM(yellow_cards), 0) INTO v_current_value
        FROM public.player_stats ps
        JOIN public.matches m ON m.id = ps.match_id
        WHERE ps.player_id = v_objective.player_id
          AND (v_objective.season IS NULL OR EXTRACT(YEAR FROM m.match_date)::TEXT = v_objective.season)
          AND (v_objective.competition IS NULL OR m.competition = v_objective.competition);
          
      ELSE
        v_current_value := v_objective.current_value;
    END CASE;
    
    UPDATE public.player_objectives
    SET current_value = v_current_value,
        is_achieved = (
          CASE 
            WHEN v_objective.objective_type = 'yellow_cards_max' 
              THEN v_current_value <= v_objective.target_value
            ELSE v_current_value >= v_objective.target_value
          END
        ),
        achieved_at = (
          CASE 
            WHEN (
              CASE 
                WHEN v_objective.objective_type = 'yellow_cards_max' 
                  THEN v_current_value <= v_objective.target_value
                ELSE v_current_value >= v_objective.target_value
              END
            ) THEN now()
            ELSE NULL
          END
        )
    WHERE id = v_objective.id;
  END LOOP;
END;
$$;