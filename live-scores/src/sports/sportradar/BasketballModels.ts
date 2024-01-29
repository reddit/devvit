import { Team } from './GenericModels.js';

export type BasketballGame = {
  id: string;
  status: string;
  scheduled: string;
  sr_id: string;
  home: BasketballTeam;
  away: BasketballTeam;
  home_points?: number;
  away_points?: number;
  clock?: string;
  quarter?: number;
  clock_decimal?: string;
  periods?: BasketballPeriod[];
  deleted_events?: BasketballDeletedEvent[];
};

export type BasketballTeam = Team & {
  market?: string;
  points?: number;
  remaining_timeouts?: number;
  record?: BasketballTeamRecord;
  reference: string;
};

export type BasketballTeamRecord = {
  wins: number;
  losses: number;
};

export type BasketballSeason = {
  league: BasketballLeague;
  season: BasketballSeasonInfo;
  games: BasketballGame[];
};

export type BasketballLeague = {
  id: string;
  name: string;
  alias: string;
};

export type BasketballSeasonInfo = {
  id: string;
  year: number;
  type: string;
};

export type BasketballPeriod = {
  type: string;
  id: string;
  number: number;
  sequence: number;
  scoring: BasketballScoring;
  events: BasketballPlayByPlayEvent[];
};

export type BasketballScoring = {
  times_tied: number;
  lead_changes: number;
  home: BasketballScoringTeam;
  away: BasketballScoringTeam;
};

export type BasketballScoringTeam = {
  name: string;
  market: string;
  id: string;
  points: number;
  reference: string;
};

export type BasketballPlayByPlayEvent = {
  id: string;
  clock: string;
  updated: string;
  description: string;
  wall_clock: string;
  sequence: number;
  home_points: number;
  away_points: number;
  clock_decimal: string;
  number: number;
  event_type: string;
  attribution?: BasketballPlayByPlayAttribution;
  location?: BasketballPlayByPlayLocation;
};

export type BasketballPlayByPlayAttribution = {
  name: string;
  market: string;
  id: string;
  team_basket?: string;
  sr_id: string;
  reference: string;
};

export type BasketballPlayByPlayLocation = {
  coord_x: number;
  coord_y: number;
  action_area: string;
};

export type BasketballDeletedEvent = {
  id: string;
};
