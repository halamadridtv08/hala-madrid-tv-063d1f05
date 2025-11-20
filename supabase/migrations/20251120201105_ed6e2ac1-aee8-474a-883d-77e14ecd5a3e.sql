-- Add moderation and scheduling columns to flash_news
ALTER TABLE public.flash_news
ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'published'));

-- Update existing records to have 'published' status if they are already published
UPDATE public.flash_news
SET status = 'published'
WHERE is_published = true;

-- Create index for scheduled publishing
CREATE INDEX IF NOT EXISTS idx_flash_news_scheduled ON public.flash_news(scheduled_at) WHERE scheduled_at IS NOT NULL AND status = 'approved';

-- Create function to auto-publish scheduled flash news
CREATE OR REPLACE FUNCTION public.publish_scheduled_flash_news()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.flash_news
  SET is_published = true,
      status = 'published',
      updated_at = now()
  WHERE scheduled_at IS NOT NULL
    AND scheduled_at <= now()
    AND status = 'approved'
    AND is_published = false;
END;
$$;

-- Enable realtime for flash_news table
ALTER TABLE public.flash_news REPLICA IDENTITY FULL;

-- Create a view for public flash news to use in realtime
CREATE OR REPLACE VIEW public.published_flash_news AS
SELECT *
FROM public.flash_news
WHERE is_published = true
ORDER BY created_at DESC;