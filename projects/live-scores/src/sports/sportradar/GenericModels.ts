export type Period = {
  period_type: string;
  id: string;
  number: number;
  sequence: number;
  home_points: number;
  away_points: number;
};

export type Team = {
  id: string;
  name: string;
  alias: string;
  sr_id: string;
};

export type TeamRecord = {
  wins: number;
  losses: number;
  ties: number;
};
