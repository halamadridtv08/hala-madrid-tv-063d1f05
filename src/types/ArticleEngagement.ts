export interface ArticleComment {
  id: string;
  article_id: string;
  user_name: string;
  user_email?: string;
  content: string;
  is_approved: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArticlePoll {
  id: string;
  article_id: string;
  question: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  vote_count: number;
  created_at: string;
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_identifier: string;
  created_at: string;
}

export interface ArticleQuiz {
  id: string;
  article_id: string;
  title: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
  display_order: number;
  created_at: string;
}

export interface ArticleTweet {
  id: string;
  article_id: string;
  tweet_url: string;
  tweet_html?: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
