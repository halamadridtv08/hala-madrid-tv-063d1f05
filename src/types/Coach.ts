
export interface Coach {
  id: string;
  name: string;
  role: string;
  age?: number;
  nationality?: string;
  image_url?: string;
  bio?: string;
  profile_image_url?: string;
  biography?: string;
  experience_years?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  social_media?: any;
}
