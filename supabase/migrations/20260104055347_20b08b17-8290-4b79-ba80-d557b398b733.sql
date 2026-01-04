-- Add author_name column to articles table with default 'HALA MADRID TV'
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'HALA MADRID TV';

-- Update existing articles to have the default value
UPDATE public.articles SET author_name = 'HALA MADRID TV' WHERE author_name IS NULL;