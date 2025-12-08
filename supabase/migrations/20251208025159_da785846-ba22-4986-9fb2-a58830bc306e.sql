-- Table pour les prédictions de matchs
CREATE TABLE public.match_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  home_score_prediction integer NOT NULL DEFAULT 0,
  away_score_prediction integer NOT NULL DEFAULT 0,
  points_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, match_id)
);

-- Enable RLS
ALTER TABLE public.match_predictions ENABLE ROW LEVEL SECURITY;

-- Users can view all predictions after match is finished
CREATE POLICY "Users can view their own predictions"
ON public.match_predictions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all predictions for finished matches"
ON public.match_predictions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE id = match_id AND status = 'finished'
  )
);

CREATE POLICY "Users can create their own predictions"
ON public.match_predictions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predictions before match starts"
ON public.match_predictions FOR UPDATE
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE id = match_id AND status = 'upcoming'
  )
);

-- Table pour les abonnements push notifications
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscriptions"
ON public.push_subscriptions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Table pour le classement des prédictions
CREATE TABLE public.prediction_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  user_email text,
  total_points integer DEFAULT 0,
  correct_scores integer DEFAULT 0,
  correct_outcomes integer DEFAULT 0,
  total_predictions integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prediction_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
ON public.prediction_leaderboard FOR SELECT
USING (true);

CREATE POLICY "System can manage leaderboard"
ON public.prediction_leaderboard FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to calculate prediction points
CREATE OR REPLACE FUNCTION public.calculate_prediction_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_prediction RECORD;
  v_points INTEGER;
  v_correct_score BOOLEAN;
  v_correct_outcome BOOLEAN;
BEGIN
  -- Only process when match status changes to 'finished'
  IF NEW.status = 'finished' AND OLD.status != 'finished' THEN
    -- Loop through all predictions for this match
    FOR v_prediction IN 
      SELECT * FROM public.match_predictions WHERE match_id = NEW.id
    LOOP
      v_points := 0;
      v_correct_score := FALSE;
      v_correct_outcome := FALSE;
      
      -- Exact score: 3 points
      IF v_prediction.home_score_prediction = NEW.home_score 
         AND v_prediction.away_score_prediction = NEW.away_score THEN
        v_points := 3;
        v_correct_score := TRUE;
        v_correct_outcome := TRUE;
      -- Correct outcome (win/draw/loss): 1 point
      ELSIF (v_prediction.home_score_prediction > v_prediction.away_score_prediction AND NEW.home_score > NEW.away_score)
         OR (v_prediction.home_score_prediction < v_prediction.away_score_prediction AND NEW.home_score < NEW.away_score)
         OR (v_prediction.home_score_prediction = v_prediction.away_score_prediction AND NEW.home_score = NEW.away_score) THEN
        v_points := 1;
        v_correct_outcome := TRUE;
      END IF;
      
      -- Update prediction with points
      UPDATE public.match_predictions 
      SET points_earned = v_points, updated_at = now()
      WHERE id = v_prediction.id;
      
      -- Update leaderboard
      INSERT INTO public.prediction_leaderboard (user_id, total_points, correct_scores, correct_outcomes, total_predictions)
      VALUES (v_prediction.user_id, v_points, 
              CASE WHEN v_correct_score THEN 1 ELSE 0 END,
              CASE WHEN v_correct_outcome THEN 1 ELSE 0 END,
              1)
      ON CONFLICT (user_id) DO UPDATE SET
        total_points = prediction_leaderboard.total_points + v_points,
        correct_scores = prediction_leaderboard.correct_scores + CASE WHEN v_correct_score THEN 1 ELSE 0 END,
        correct_outcomes = prediction_leaderboard.correct_outcomes + CASE WHEN v_correct_outcome THEN 1 ELSE 0 END,
        total_predictions = prediction_leaderboard.total_predictions + 1,
        updated_at = now();
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for calculating points
CREATE TRIGGER on_match_finished_calculate_points
AFTER UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.calculate_prediction_points();