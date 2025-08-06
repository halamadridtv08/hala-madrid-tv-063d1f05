
export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_team_logo?: string;
  away_team_logo?: string;
  venue?: string;
  competition?: string;
  status: string;
  match_date: string;
  home_score?: number;
  away_score?: number;
  match_details?: any;
  opposing_team_id?: string;
  created_at: string;
  updated_at: string;
}
