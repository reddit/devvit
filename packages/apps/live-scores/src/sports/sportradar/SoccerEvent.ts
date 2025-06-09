import type { Devvit } from '@devvit/public-api';

import type { GeneralGameScoreInfo, TeamInfo } from '../GameEvent.js';
import { EventState } from '../GameEvent.js';
import { APIService } from '../Sports.js';
import { APIKey } from './APIKeys.js';

export async function fetchSoccerEvent(
  league: string,
  gameId: string,
  context: Devvit.Context
): Promise<GeneralGameScoreInfo | null> {
  let data;
  const apiKey = await context.settings.get(APIKey.soccer);
  try {
    const request = new Request(
      `https://api.sportradar.us/soccer/production/v4/en/sport_events/${gameId}/timeline.json?api_key=${apiKey}`
    );
    // console.log(request.url);
    const response = await fetch(request);
    data = await response.json();
  } catch (e) {
    console.error(e);
    return null;
  }
  return soccerScoreInfo(league, parseSoccerEvent(data));
}

export function soccerScoreInfo(league: string, soccerEvent: SoccerEvent): SoccerGameScoreInfo {
  const event = soccerEvent.sport_event;
  const status = soccerEvent.sport_event_status;
  const homeTeam = event.competitors[0];
  const awayTeam = event.competitors[1];
  const currentDate = new Date();
  return {
    event: {
      id: event.id,
      name: `${awayTeam.name} at ${homeTeam.name}`,
      date: event.start_time,
      homeTeam: parseTeam(league, homeTeam),
      awayTeam: parseTeam(league, awayTeam),
      state: eventState(status),
      gameType: 'soccer',
      league: league,
      timingInfo: {
        displayClock: clockString(status.clock),
        period: periodForStatus(status),
      },
    },
    homeScore: String(status.home_score ?? 0),
    awayScore: String(status.away_score ?? 0),
    service: APIService.SRSoccer,
    summary: eventsSummary(soccerEvent.timeline),
    homeStats: soccerEvent.statistics?.totals.competitors[0],
    awayStats: soccerEvent.statistics?.totals.competitors[1],
    generatedDate: currentDate.toISOString(),
  };
}

export type SoccerGameScoreInfo = GeneralGameScoreInfo & {
  summary?: GameEventSummary | undefined;
  homeStats?: SportEventStatisticCompetitor | undefined;
  awayStats?: SportEventStatisticCompetitor | undefined;
};

export type GameEventSummary = {
  homeGoals: TimelineEvent[];
  awayGoals: TimelineEvent[];
  homeRedCards: TimelineEvent[];
  awayRedCards: TimelineEvent[];
  latestEvent?: TimelineEvent | undefined;
};

function eventsSummary(timeline?: TimelineEvent[]): GameEventSummary | undefined {
  if (timeline) {
    const goals = timeline.filter((event) => event.type === 'score_change');
    const homeGoals = goals.filter((goal) => goal.competitor === 'home' && goal.players !== null);
    const awayGoals = goals.filter((goal) => goal.competitor === 'away' && goal.players !== null);

    const redCards = timeline.filter(
      (event) => event.type === 'red_card' || event.type === 'yellow_red_card'
    );
    const homeRedCards = redCards.filter(
      (card) => card.competitor === 'home' && card.players !== null
    );
    const awayRedCards = redCards.filter(
      (card) => card.competitor === 'away' && card.players !== null
    );

    return {
      homeGoals: homeGoals,
      awayGoals: awayGoals,
      homeRedCards: homeRedCards,
      awayRedCards: awayRedCards,
      latestEvent: getLastTimelineEventWithCommentary(timeline),
    };
  }
}

function getLastTimelineEventWithCommentary(timeline: TimelineEvent[]): TimelineEvent | undefined {
  if (timeline) {
    for (let i = timeline.length - 1; i >= 0; i--) {
      const event = timeline[i];
      if (event.commentaries && event.commentaries.length > 0) {
        return event;
      }
    }
  }
  return undefined;
}

function clockString(clock: Clock | undefined): string {
  if (clock && clock.stoppage_time_played) {
    const regularTime = clock.played.split(':')[0].replace(/^0/, '');
    const stoppageTime = clock.stoppage_time_played.split(':')[0].replace(/^0/, '');
    return `${regularTime}’+${stoppageTime}’`;
  } else if (clock) {
    const regularTime = clock.played.split(':')[0].replace(/^0/, '');
    return `${regularTime}’`;
  }
  return `0:00`;
}

export function formatAsFirstLastName(nameString: string): string {
  return nameString
    .split(',')
    .reverse()
    .map((s) => s.trim())
    .join(' ');
}

function parseTeam(league: string, team: SportEventCompetitor): TeamInfo {
  return {
    id: team.id,
    name: team.name,
    abbreviation: team.abbreviation,
    fullName: team.name,
    location: team.name,
    logo: league + '-' + team.abbreviation.toLowerCase() + '.png',
  };
}

export function parseSoccerEvent(jsonData: unknown): SoccerEvent {
  return jsonData as SoccerEvent;
}

function eventState(status: SportEventStatus): EventState {
  switch (status.status) {
    case SportEventStatusType.CREATED:
      return EventState.PRE;
    case SportEventStatusType.NOT_STARTED:
      return EventState.PRE;
    case SportEventStatusType.INPROGRESS:
      return EventState.LIVE;
    case SportEventStatusType.LIVE:
      return EventState.LIVE;
    case SportEventStatusType.CLOSED:
      return EventState.FINAL;
    case SportEventStatusType.COMPLETE:
      return EventState.FINAL;
  }
  return EventState.UNKNOWN;
}

function periodForStatus(status: SportEventStatus): number {
  switch (status.match_status) {
    case `1st_half`:
      return 1;
    case `2nd_half`:
      return 2;
    case `halftime`:
      return 0.5;
  }
  return 0;
}

export type SoccerEvent = {
  sport_event: SportEvent;
  sport_event_status: SportEventStatus;
  statistics?: SportEventStatistics;
  timeline?: TimelineEvent[];
};

type SportEvent = {
  id: string;
  start_time: string;
  sport_event_context: SportEventContext;
  coverage: SRCoverage;
  competitors: SportEventCompetitor[];
  venue: Venue;
  replaced_by?: string;
};

type SportEventCompetitor = {
  id: string;
  name: string;
  country?: string;
  country_code?: string;
  abbreviation: string;
  qualifier: HomeAwayTeam;
  gender?: string;
};

enum HomeAwayTeam {
  Away = 'away',
  Home = 'home',
}

type SRCoverage = {
  type: string;
  sport_event_properties: SRCoverageProperties;
};

type SRCoverageProperties = {
  lineups: boolean;
  venue: boolean;
  extended_player_stats: boolean;
  extended_team_stats: boolean;
  lineups_availability: string;
  ballspotting: boolean;
  commentary: boolean;
  fun_facts: boolean;
  goal_scorers: boolean;
  scores: string;
  game_clock: boolean;
  deeper_play_by_play: boolean;
  deeper_player_stats: boolean;
  deeper_team_stats: boolean;
  basic_play_by_play: boolean;
  basic_player_stats: boolean;
  basic_team_stats: boolean;
};

type SportEventContext = {
  sport: BasicValue;
  category: BasicValue;
  competition: BasicValue;
  season: Season;
  stage?: Stage;
  round?: Round;
};

type Stage = {
  order: number;
  type: string;
  phase: string;
  start_date: string;
  end_date: string;
  year: string;
};

type Round = {
  number: number;
};

type BasicValue = {
  id: string;
  name: string;
};

type Season = BasicValue & {
  start_date: string;
  end_date: string;
  year: string;
  competition_id: string;
};

type Venue = {
  id: string;
  name: string;
  capacity: number;
  city_name: string;
  country_name: string;
  map_coordinates: string;
  country_code: string;
  timezone: string;
};

type SportEventStatus = {
  status: SportEventStatusType;
  match_status: string;
  home_score?: number;
  away_score?: number;
  home_normaltime_score?: number;
  away_normaltime_score?: number;
  home_overtime_score?: number;
  away_overtime_score?: number;
  winner_id?: string;
  period_scores?: PeriodScore[];
  clock?: Clock;
};

type Clock = {
  played: string;
  stoppage_time_played?: string;
  stoppage_time_announced?: string;
};

enum SportEventStatusType {
  CREATED = `created`,
  LIVE = `live`,
  NOT_STARTED = `not_started`,
  INPROGRESS = `inprogress`,
  CLOSED = `closed`,
  COMPLETE = `complete`,
  POSTPONED = `postponed`,
}

type PeriodScore = {
  home_score: number;
  away_score: number;
  type: PeriodType;
  number: number;
};

enum PeriodType {
  AwaitingExtra = 'awaiting_extra',
  AwaitingPenalties = 'awaiting_penalties',
  ExtraTimeHalftime = 'extra_time_halftime',
  Overtime = 'overtime',
  Pause = 'pause',
  Penalties = 'penalties',
  RegularPeriod = 'regular_period',
}

type SportEventStatistics = {
  totals: SportEventStatisticsTotals;
};

type SportEventStatisticsTotals = {
  competitors: SportEventStatisticCompetitor[];
};

export type SportEventStatisticCompetitor = SportEventCompetitor & {
  statistics: SoccerTeamStatistics;
  players?: SoccerPlayer[];
};

export type SoccerPlayer = {
  statistics?: SoccerPlayerStatistics;
  id: string;
  name: string;
  starter: boolean;
  type?: string;
};

type SoccerBaseStatistics = {
  corner_kicks: number;
  offsides: number;
  red_cards: number;
  shots_blocked: number;
  shots_off_target: number;
  shots_on_target: number;
  yellow_cards: number;
  yellow_red_cards: number;
};

export type SoccerTeamStatistics = SoccerBaseStatistics & {
  ball_possession: number;
  cards_given: number;
  fouls: number;
  free_kicks: number;
  goal_kicks: number;
  injuries: number;
  shots_saved: number;
  shots_total: number;
  substitutions: number;
  throw_ins: number;
};

export type SoccerPlayerStatistics = SoccerBaseStatistics & {
  assists: number;
  goals_scored: number;
  own_goals: number;
  substituted_in: number;
  substituted_out: number;
};

export type TimelineEvent = {
  id: number;
  type: string;
  time: string;
  period?: number;
  period_type?: string;
  match_time?: number;
  match_clock?: string;
  competitor?: HomeAwayTeam;
  x?: number;
  y?: number;
  outcome?: string;
  players?: SoccerPlayer[];
  home_score?: number;
  away_score?: number;
  method?: string;
  stoppage_time?: number;
  stoppage_time_clock?: string;
  break_name?: string;
  commentaries?: Commentary[];
};

type Commentary = {
  text: string;
};
