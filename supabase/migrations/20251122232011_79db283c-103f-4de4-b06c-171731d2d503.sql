-- Create comments table
CREATE TABLE IF NOT EXISTS public.article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create polls table
CREATE TABLE IF NOT EXISTS public.article_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create poll options table
CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.article_polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create poll votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.article_polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(poll_id, user_identifier)
);

-- Create quiz table
CREATE TABLE IF NOT EXISTS public.article_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.article_quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create embedded tweets table
CREATE TABLE IF NOT EXISTS public.article_tweets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tweet_url TEXT NOT NULL,
  tweet_html TEXT,
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tweets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Anyone can view approved comments" ON public.article_comments
  FOR SELECT USING (is_approved = true AND is_published = true);

CREATE POLICY "Admins can manage comments" ON public.article_comments
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can create comments" ON public.article_comments
  FOR INSERT WITH CHECK (true);

-- RLS Policies for polls
CREATE POLICY "Anyone can view active polls" ON public.article_polls
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage polls" ON public.article_polls
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for poll options
CREATE POLICY "Anyone can view poll options" ON public.poll_options
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage poll options" ON public.poll_options
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for poll votes
CREATE POLICY "Anyone can view poll votes" ON public.poll_votes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can vote" ON public.poll_votes
  FOR INSERT WITH CHECK (true);

-- RLS Policies for quizzes
CREATE POLICY "Anyone can view active quizzes" ON public.article_quizzes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage quizzes" ON public.article_quizzes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for quiz questions
CREATE POLICY "Anyone can view quiz questions" ON public.quiz_questions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage quiz questions" ON public.quiz_questions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for tweets
CREATE POLICY "Anyone can view published tweets" ON public.article_tweets
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage tweets" ON public.article_tweets
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_article_comments_article_id ON public.article_comments(article_id);
CREATE INDEX idx_article_polls_article_id ON public.article_polls(article_id);
CREATE INDEX idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX idx_article_quizzes_article_id ON public.article_quizzes(article_id);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX idx_article_tweets_article_id ON public.article_tweets(article_id);

-- Trigger for updating updated_at
CREATE TRIGGER update_article_comments_updated_at
  BEFORE UPDATE ON public.article_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_article_polls_updated_at
  BEFORE UPDATE ON public.article_polls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_article_quizzes_updated_at
  BEFORE UPDATE ON public.article_quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_article_tweets_updated_at
  BEFORE UPDATE ON public.article_tweets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();