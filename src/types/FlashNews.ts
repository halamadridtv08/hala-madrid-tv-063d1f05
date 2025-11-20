export type FlashNewsCategory = 'transfer' | 'injury' | 'match' | 'general';

export interface FlashNews {
  id: string;
  author: string;
  author_handle: string;
  content: string;
  category: FlashNewsCategory;
  verified: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
