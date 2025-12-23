-- Add player_id column to link transfers with players
ALTER TABLE public.transfers 
ADD COLUMN player_id UUID REFERENCES public.players(id) NULL;

-- Create function to deactivate player when transfer is published
CREATE OR REPLACE FUNCTION public.sync_player_status_on_transfer()
RETURNS TRIGGER AS $$
BEGIN
  -- When a transfer is published and is outgoing (loan or permanent sale)
  IF NEW.is_published = true AND NEW.player_id IS NOT NULL THEN
    -- Deactivate the player if it's a loan or permanent transfer (outgoing)
    IF NEW.transfer_type IN ('loan', 'permanent', 'free') THEN
      UPDATE public.players
      SET is_active = false, updated_at = now()
      WHERE id = NEW.player_id;
    END IF;
    
    -- Reactivate the player if it's a return from loan
    IF NEW.transfer_type = 'return' THEN
      UPDATE public.players
      SET is_active = true, updated_at = now()
      WHERE id = NEW.player_id;
    END IF;
  END IF;
  
  -- If transfer is unpublished, reactivate the player
  IF NEW.is_published = false AND OLD.is_published = true AND NEW.player_id IS NOT NULL THEN
    IF OLD.transfer_type IN ('loan', 'permanent', 'free') THEN
      UPDATE public.players
      SET is_active = true, updated_at = now()
      WHERE id = NEW.player_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS sync_player_on_transfer ON public.transfers;
CREATE TRIGGER sync_player_on_transfer
  AFTER INSERT OR UPDATE ON public.transfers
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_player_status_on_transfer();