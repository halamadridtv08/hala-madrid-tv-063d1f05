export type FlashNewsCategory = 'transfer' | 'injury' | 'match' | 'general';
export type FlashNewsStatus = 'draft' | 'pending' | 'approved' | 'published';

export interface FlashNews {
  id: string;
  author: string;
  author_handle: string;
  content: string;
  category: FlashNewsCategory;
  verified: boolean;
  is_published: boolean;
  status: FlashNewsStatus;
  scheduled_at?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}
