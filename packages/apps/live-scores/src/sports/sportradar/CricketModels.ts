import type { GeneralGameScoreInfo } from '../GameEvent.js';

export type CricketMatchScoreInfo = GeneralGameScoreInfo & {
  leagueName: string;
  isLive: boolean;
  matchTime: string;
  matchNumber?: string;
  location?: string;
  firstBattingQualifier: CricketQualifierType;
  currentBattingQualifier: CricketQualifierType | undefined;
  winnerQualifier: CricketQualifierType | undefined;
  bottomBarFirstLine: string;
  bottomBarSecondLine?: string;
  homeInfoStats: CricketScoreInfoStats;
  awayInfoStats: CricketScoreInfoStats;
  chatUrl: string | undefined;
  isSuperOver: boolean;
};

export type BasicCricketMatchInfo = {
  timezone?: string;
  matchNumber?: string;
  totalMatches?: string;
  chatUrl?: string;
};

export type CricketScoreInfoStats = {
  displayOvers: number;
  battingStats?: string;
  bowlingStats?: string;
};

export type CricketMatch = {
  sport_event: CricketSportEvent;
  sport_event_status: CricketSportEventStatus;
  statistics: {
    innings?: CricketInning[];
  };
};

// CricketSportEvent
export type CricketSportEvent = {
  id: string;
  scheduled: string;
  start_time_tbd: boolean;
  tournament?: CricketTournament;
  competitors: CricketCompetitor[];
  venue?: CricketVenue;
  matchNumber?: string;
};

export type CricketTournament = {
  id: string;
  name: string;
  type: string;
};

export type CricketCompetitor = {
  id: string;
  name: string;
  country?: string;
  country_code?: string;
  abbreviation: string;
  qualifier: CricketQualifierType;
  gender?: string;
};

export enum CricketQualifierType {
  Away = 'away',
  Home = 'home',
}

export type CricketVenue = {
  id: string;
  name: string;
  city_name?: string;
  country_name: string;
  country_code: string;
};

export type CricketInning = {
  number: number;
  batting_team: string;
  bowling_team: string;
  overs_completed: number;
  teams: CricketTeam[];
};

export type CricketTeam = {
  id: string;
  name: string;
  abbreviation: string;
  statistics: CricketTeamStatistics;
};

export type CricketTeamStatistics = {
  batting?: {
    runs: number;
    balls_remaining: number;
    overs_remaining: number;
    wickets_lost: number;
    players: CricketPlayer[];
    partnerships: CricketPartnership[];
  };
  bowling?: {
    players: CricketPlayer[];
  };
};

export type CricketPartnership = {
  wicket_number: number;
  end: number;
};

export type CricketPlayer = {
  id: string;
  name: string;
  statistics: CricketPlayerStatistic;
};

export type CricketPlayerStatistic = {
  balls_faced?: number;
  runs?: number;
  conceded_runs?: number;
  wickets?: number;
};

export type CricketSportEventStatus = {
  match_status: string;
  status: CricketEventStatusType;
  display_score: string;
  winner_id?: string;
  toss_won_by: string;
  toss_decision: string;
  current_inning: number;
  display_overs: number;
  run_rate: number;
  allotted_overs?: number;
  period_scores?: CricketPeriodScore[];
};

export type CricketPeriodScore = {
  home_score: number;
  away_score: number;
  type: string;
  number: number;
  allotted_overs: number;
  home_wickets?: number;
  away_wickets?: number;
  display_score: string;
};

export enum CricketEventStatusType {
  NOT_STARTED = `not_started`,
  LIVE = `live`,
  POSTPONED = `postponed`,
  SUSPENDED = `suspended`,
  DELAYED = `delayed`,
  CANCELLED = `cancelled`,
  ABANDONED = `abandoned`,
  INTERRUPTED = `interrupted`,
  ENDED = `ended`,
  CLOSED = `closed`,
  CREATED = `created`,
  INPROGRESS = `inprogress`,
  COMPLETE = `complete`,
}

export type BattingResult = {
  battingTeamId: string;
  bowlingTeamId: string;
  inningNumber: number;
  oversRemaning?: number;
  oversCompleted: number;
  ballsRemaning?: number;
  wicketsLost: number;
  runs: number;
  qualifierType: CricketQualifierType;
  displayScore: string;
};
