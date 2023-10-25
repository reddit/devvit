import { Devvit } from '@devvit/public-api';
import { EventState, GeneralGameScoreInfo, TeamInfo } from '../GameEvent.js';
import { APIService } from '../Sports.js';
import { getAPIKey } from './APIKeys.js';

export async function fetchSoccerEvent(
  league: string,
  gameId: string,
  context: Devvit.Context
): Promise<GeneralGameScoreInfo | null> {
  let data;
  const apiKey = await getAPIKey('soccer-api-key', context);
  try {
    const request = new Request(
      `https://api.sportradar.us/soccer/trial/v4/en/sport_events/${gameId}/timeline.json?api_key=${apiKey}`
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
    homeScore: status.home_score ?? 0,
    awayScore: status.away_score ?? 0,
    service: APIService.SRSoccer,
    summary: eventsSummary(soccerEvent.timeline),
  };
}

export interface SoccerGameScoreInfo extends GeneralGameScoreInfo {
  homeGoals?: string | undefined;
  awayGoals?: string | undefined;
  homeRedCards?: string | undefined;
  awayRedCards?: string | undefined;
  summary?: GameEventSummary | undefined;
}

interface GameEventSummary {
  homeGoals: TimelineEvent[];
  awayGoals: TimelineEvent[];
  homeRedCards: TimelineEvent[];
  awayRedCards: TimelineEvent[];
}

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
    };
  }
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

export function parseSoccerEvent(jsonData: any): SoccerEvent {
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

export interface SoccerEvent {
  sport_event: SportEvent;
  sport_event_status: SportEventStatus;
  statistics?: SportEventStatistics;
  timeline?: TimelineEvent[];
}

interface SportEvent {
  id: string;
  start_time: string;
  sport_event_context: SportEventContext;
  coverage: SRCoverage;
  competitors: SportEventCompetitor[];
  venue: Venue;
  replaced_by?: string;
}

interface SportEventCompetitor {
  id: string;
  name: string;
  country?: string;
  country_code?: string;
  abbreviation: string;
  qualifier: HomeAwayTeam;
  gender?: string;
}

enum HomeAwayTeam {
  Away = 'away',
  Home = 'home',
}

interface SRCoverage {
  type: string;
  sport_event_properties: SRCoverageProperties;
}

interface SRCoverageProperties {
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
}

interface SportEventContext {
  sport: BasicValue;
  category: BasicValue;
  competition: BasicValue;
  season: Season;
  stage?: Stage;
  round?: Round;
}

interface Stage {
  order: number;
  type: string;
  phase: string;
  start_date: string;
  end_date: string;
  year: string;
}

interface Round {
  number: number;
}

interface BasicValue {
  id: string;
  name: string;
}

interface Season extends BasicValue {
  start_date: string;
  end_date: string;
  year: string;
  competition_id: string;
}

interface Venue {
  id: string;
  name: string;
  capacity: number;
  city_name: string;
  country_name: string;
  map_coordinates: string;
  country_code: string;
  timezone: string;
}

interface SportEventStatus {
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
}

interface Clock {
  played: string;
  stoppage_time_played?: string;
  stoppage_time_announced?: string;
}

enum SportEventStatusType {
  CREATED = `created`,
  NOT_STARTED = `not_started`,
  INPROGRESS = `inprogress`,
  CLOSED = `closed`,
  COMPLETE = `complete`,
  POSTPONED = `postponed`,
}

interface PeriodScore {
  home_score: number;
  away_score: number;
  type: PeriodType;
  number: number;
}

enum PeriodType {
  AwaitingExtra = 'awaiting_extra',
  AwaitingPenalties = 'awaiting_penalties',
  ExtraTimeHalftime = 'extra_time_halftime',
  Overtime = 'overtime',
  Pause = 'pause',
  Penalties = 'penalties',
  RegularPeriod = 'regular_period',
}

interface SportEventStatistics {
  totals: SportEventStatisticsTotals;
}

interface SportEventStatisticsTotals {
  competitors: SportEventStatisticCompetitor[];
}

interface SportEventStatisticCompetitor extends SportEventCompetitor {
  statistics: SoccerTeamStatistics;
  players?: SoccerPlayer[];
}

export interface SoccerPlayer {
  statistics?: SoccerPlayerStatistics;
  id: string;
  name: string;
  starter: boolean;
  type?: string;
}

interface SoccerTeamStatistics {
  corner_kicks: number;
  fouls: number;
  free_kicks: number;
  offsides: number;
  red_cards: number;
  shots_blocked: number;
  shots_off_target: number;
  shots_total: number;
  throw_ins: number;
  yellow_cards: number;
  yellow_red_cards: number;
}

interface SoccerPlayerStatistics {
  assists: number;
  goals_scored: number;
  own_goals: number;
  red_cards: number;
  shots_blocked: number;
  substituted_in: number;
  substituted_out: number;
  yellow_cards: number;
  yellow_red_cards: number;
}

export interface TimelineEvent {
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
}
