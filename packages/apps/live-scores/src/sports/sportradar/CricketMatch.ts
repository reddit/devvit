import type { Devvit } from '@devvit/public-api';
import type { GeneralGameScoreInfo, TeamInfo } from '../GameEvent.js';
import { EventState } from '../GameEvent.js';
import { APIService } from '../Sports.js';
import { APIKey } from './APIKeys.js';

export async function fetchCricketMatch(
  league: string,
  matchId: string,
  context: Devvit.Context
): Promise<CricketMatchScoreInfo | null> {
  let data;
  const apiKey = await context.settings.get(APIKey.cricket);
  try {
    const request = new Request(
      `https://api.sportradar.com/cricket-t2/en/matches/${matchId}/timeline.json?api_key=${apiKey}`
    );
    // console.log(request.url);
    const response = await fetch(request);
    data = await response.json();
  } catch (e) {
    console.error(e);
    return null;
  }
  return cricketMatchInfo(league, parseCricketMatch(data));
}

export type CricketSportEvent = {
  id: string;
  scheduled: string;
  start_time_tbd: boolean;
  competitors: SportEventCompetitor[];
  status: SportEventStatusType;
};

export type CricketMatch = {
  sport_event: CricketSportEvent;
  sport_event_status: SportEventStatus;
};

export function parseCricketMatch(jsonData: unknown): CricketMatch {
  return jsonData as CricketMatch;
}

export function cricketMatchInfo(
  league: string,
  cricketMatch: CricketMatch
): CricketMatchScoreInfo {
  const event = cricketMatch.sport_event;
  const status = cricketMatch.sport_event_status;
  const homeTeam = event.competitors[0];
  const awayTeam = event.competitors[1];
  const currentDate = new Date();
  return {
    event: {
      id: event.id,
      name: `${awayTeam.name} at ${homeTeam.name}`,
      date: event.scheduled,
      homeTeam: parseTeam(league, homeTeam),
      awayTeam: parseTeam(league, awayTeam),
      state: eventState(status.status),
      gameType: 'cricket',
      league: league,
      timingInfo: {
        displayClock: clockString(status.clock),
        period: periodForStatus(status),
      },
    },
    homeScore: status.home_score ?? 0,
    awayScore: status.away_score ?? 0,
    service: APIService.SRCricket,
    generatedDate: currentDate.toISOString(),
  };
}

function periodForStatus(status: SportEventStatus): number {
  /// TODO IGN-3692 add logic for cricket period
  return 0;
}

function clockString(clock: Clock | undefined): string {
  /// TODO IGN-3692 add logic for cricket clock
  return '';
}

type Clock = {
  played: string;
  stoppage_time_played?: string;
  stoppage_time_announced?: string;
};

/// TODO IGN-3692 fix logic for type to adjust to cricket
enum SportEventStatusType {
  CREATED = `created`,
  LIVE = `live`,
  NOT_STARTED = `not_started`,
  INPROGRESS = `inprogress`,
  CLOSED = `closed`,
  COMPLETE = `complete`,
  POSTPONED = `postponed`,
}

function eventState(status: SportEventStatusType): EventState {
  switch (status) {
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

type PeriodScore = {
  home_score: number;
  away_score: number;
  type: PeriodType;
  number: number;
};

/// TODO IGN-3692 fix logic for period to adjust to cricket
enum PeriodType {
  AwaitingExtra = 'awaiting_extra',
  AwaitingPenalties = 'awaiting_penalties',
  ExtraTimeHalftime = 'extra_time_halftime',
  Overtime = 'overtime',
  Pause = 'pause',
  Penalties = 'penalties',
  RegularPeriod = 'regular_period',
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

export type CricketMatchScoreInfo = GeneralGameScoreInfo & {};
