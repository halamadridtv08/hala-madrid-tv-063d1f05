-- Add return_date column for loan transfers
ALTER TABLE public.transfers 
ADD COLUMN return_date DATE NULL;