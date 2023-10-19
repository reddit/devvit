export interface Period {
  period_type: string;
  id: string;
  number: number;
  sequence: number;
  home_points: number;
  away_points: number;
}

export interface Team {
  id: string;
  name: string;
  alias: string;
  sr_id: string;
}

export interface TeamRecord {
  wins: number;
  losses: number;
  ties: number;
}
