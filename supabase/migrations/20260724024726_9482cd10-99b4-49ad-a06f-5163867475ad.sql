
-- 1. Force points_earned = 0 on user-written predictions (only admin or SECURITY DEFINER can change it)
CREATE OR REPLACE FUNCTION public.enforce_prediction_points_zero()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.points_earned := 0;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Preserve prior value; ignore user-supplied changes
    NEW.points_earned := OLD.points_earned;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_prediction_points_zero_trg ON public.match_predictions;
CREATE TRIGGER enforce_prediction_points_zero_trg
BEFORE INSERT OR UPDATE ON public.match_predictions
FOR EACH ROW
EXECUTE FUNCTION public.enforce_prediction_points_zero();

-- 2. Remove the overly permissive self-manage policy on the leaderboard
DROP POLICY IF EXISTS "System can manage leaderboard" ON public.prediction_leaderboard;

-- Note: the existing "Only admins can manage leaderboard" policy remains.
-- The calculate_prediction_points() trigger is SECURITY DEFINER and bypasses RLS,
-- so automated scoring continues to work.
