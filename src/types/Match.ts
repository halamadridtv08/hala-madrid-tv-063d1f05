
export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  venue?: string;
  competition?: string;
  status: string;
  match_date: string;
  home_score?: number;
  away_score?: number;
  match_details?: any;
  created_at: string;
  updated_at: string;
}
