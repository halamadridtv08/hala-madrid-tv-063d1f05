
export interface TrainingSession {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  duration?: string;
  training_date: string;
  is_published?: boolean;
  category?: string;
  created_at: string;
  updated_at: string;
}
