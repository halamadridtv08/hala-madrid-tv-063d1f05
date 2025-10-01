
export interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number?: number;
  age?: number;
  nationality?: string;
  height?: string;
  weight?: string;
  image_url?: string;
  bio?: string;
  profile_image_url?: string;
  biography?: string;
  stats?: any;
  is_active: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
  social_media?: any;
}
