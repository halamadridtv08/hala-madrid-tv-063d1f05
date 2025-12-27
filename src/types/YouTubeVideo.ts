export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail_url: string;
  youtube_url: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  is_featured?: boolean;
  category?: string;
}

export const YOUTUBE_VIDEO_CATEGORIES = [
  { value: 'YouTube', label: 'YouTube' },
  { value: 'Entraînement', label: 'Entraînement' },
  { value: 'Conférence de presse', label: 'Conférence de presse' },
  { value: 'Match', label: 'Match' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Behind the scenes', label: 'Coulisses' },
  { value: 'Highlights', label: 'Highlights' },
] as const;
