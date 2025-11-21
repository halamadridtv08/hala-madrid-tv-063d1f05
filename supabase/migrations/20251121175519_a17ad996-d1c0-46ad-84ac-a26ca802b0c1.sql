-- Create table for player performance alerts configuration
CREATE TABLE public.player_alert_thresholds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_type TEXT NOT NULL CHECK (stat_type IN ('goals', 'assists', 'yellow_cards', 'red_cards')),
  threshold_value INTEGER NOT NULL,
  alert_message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for triggered alerts
CREATE TABLE public.player_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  stat_type TEXT NOT NULL,
  current_value INTEGER NOT NULL,
  threshold_value INTEGER NOT NULL,
  alert_message TEXT NOT NULL,
  is_acknowledged BOOLEAN DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID
);

-- Enable RLS
ALTER TABLE public.player_alert_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for player_alert_thresholds
CREATE POLICY "Admins can manage alert thresholds"
ON public.player_alert_thresholds
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active thresholds"
ON public.player_alert_thresholds
FOR SELECT
USING (is_active = true);

-- RLS policies for player_alerts
CREATE POLICY "Admins can manage alerts"
ON public.player_alerts
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view alerts"
ON public.player_alerts
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_player_alert_thresholds_updated_at
BEFORE UPDATE ON public.player_alert_thresholds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check and trigger alerts
CREATE OR REPLACE FUNCTION public.check_player_stats_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_threshold RECORD;
  v_player RECORD;
  v_stat_value INTEGER;
BEGIN
  -- Loop through all active thresholds
  FOR v_threshold IN 
    SELECT * FROM public.player_alert_thresholds WHERE is_active = true
  LOOP
    -- For each active player, check if they've reached the threshold
    FOR v_player IN 
      SELECT id, name FROM public.players WHERE is_active = true
    LOOP
      -- Calculate the stat value based on stat_type
      CASE v_threshold.stat_type
        WHEN 'goals' THEN
          SELECT COALESCE(SUM(goals), 0) INTO v_stat_value
          FROM public.player_stats
          WHERE player_id = v_player.id;
        WHEN 'assists' THEN
          SELECT COALESCE(SUM(assists), 0) INTO v_stat_value
          FROM public.player_stats
          WHERE player_id = v_player.id;
        WHEN 'yellow_cards' THEN
          SELECT COALESCE(SUM(yellow_cards), 0) INTO v_stat_value
          FROM public.player_stats
          WHERE player_id = v_player.id;
        WHEN 'red_cards' THEN
          SELECT COALESCE(SUM(red_cards), 0) INTO v_stat_value
          FROM public.player_stats
          WHERE player_id = v_player.id;
      END CASE;
      
      -- If threshold is reached and no unacknowledged alert exists, create one
      IF v_stat_value >= v_threshold.threshold_value THEN
        IF NOT EXISTS (
          SELECT 1 FROM public.player_alerts
          WHERE player_id = v_player.id
            AND stat_type = v_threshold.stat_type
            AND threshold_value = v_threshold.threshold_value
            AND is_acknowledged = false
        ) THEN
          INSERT INTO public.player_alerts (
            player_id,
            stat_type,
            current_value,
            threshold_value,
            alert_message
          ) VALUES (
            v_player.id,
            v_threshold.stat_type,
            v_stat_value,
            v_threshold.threshold_value,
            REPLACE(v_threshold.alert_message, '{player}', v_player.name)
          );
        END IF;
      END IF;
    END LOOP;
  END LOOP;
END;
$$;