import { APIService } from './Sports.js';

export type GeneralGameScoreInfo = {
  event: GameEvent;
  homeScore: number;
  awayScore: number;
  extraContent?: string;
  service: APIService;
};

export type GameEvent = {
  id: string;
  name: string;
  date: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  state: EventState;
  gameType: string;
  // the league (i.e. `mlb` or `nfl`)
  league: string;
  // Timing info (i.e. clock & period/quarter/half)
  timingInfo: GameEventTimingInfo;
};

export type GameEventTimingInfo = {
  clock?: number;
  displayClock: string;
  period: number;
};

export type TeamInfo = {
  id: string;
  // "Rangers", "Packers", "Blue Jays"
  name: string;
  // "NYR", "GB", "TOR"
  abbreviation: string;
  // "New York Rangers", "Green Bay Packers", "Toronto Blue Jays"
  fullName: string;
  // "New York", "Green Bay", "Toronto"
  location: string;
  // Generated asset name from abbreviation + png file extension
  logo: string;
  // team color provided or mapped in constants.ts
  color: string;
};

export enum EventState {
  UNKNOWN = '',
  PRE = 'pre',
  LIVE = 'live',
  FINAL = 'final',
  DELAYED = 'delayed',
}
