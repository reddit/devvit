import type {
  GameEvent,
  GameEventTimingInfo,
  GeneralGameScoreInfo,
  TeamInfo,
} from '../GameEvent.js';
import { EventState } from '../GameEvent.js';
import {
  APIService,
  League,
  getLeagueFromString,
  getSportFromLeague,
  getSportFromLeagueString,
} from '../Sports.js';

export type BaseballGameScoreInfo = GeneralGameScoreInfo & {
  // events[].competitions[].situation.onFirst
  isRunnerOnFirst: boolean;
  // events[].competitions[].situation.onSecond
  isRunnerOnSecond: boolean;
  // events[].competitions[].situation.onThird
  isRunnerOnThird: boolean;
  // events[].competitions[].situation.balls
  balls: number;
  // events[].competitions[].situation.strikes
  strikes: number;
  // events[].competitions[].situation.outs
  outs: number;
  // events[].competitions[].situation.pitcher.athlete.displayName
  pitcher: string;
  // events[].competitions[].situation.batter.athlete.displayName
  batter: string;
  // events[].competitions[].situation.inning.number (TODO: parse real field)
  inning: number;
  // events[].competitions[].situation.inning.state (TODO: parse real field)
  inningState: InningState;
  // events[].competitions[].situation.dueUp[].athlete.displayName
  dueUp: string;
  // events[].competitions[].situation.pitcher.athlete.summary
  pitcherSummery: string;
  // events[].competitions[].situation.batter.athlete.summary
  batterSummary: string;
};

export enum InningState {
  UNKNOWN = '',
  TOP = 'top',
  BOTTOM = 'bottom',
  MID = 'mid',
  END = 'end',
}

export async function fetchActiveGames<T extends GeneralGameScoreInfo>(
  league: string
): Promise<T[]> {
  const sport = getSportFromLeagueString(league);
  const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`;
  let data;
  try {
    const request = new Request(apiUrl, {
      headers: { Accept: 'application/json' },
    });
    const res = await fetch(request);
    data = await res.json();
  } catch (e) {
    console.error(e);
    return [];
  }

  const gameInfos: T[] = [];
  data['events'].forEach((event: unknown) => {
    gameInfos.push(parseGeneralGameScoreInfo(event, league, sport) as T);
  });
  return gameInfos;
}

export async function fetchNextEventForTeam(teamId: string, league: string): Promise<GameEvent> {
  let data;
  const sport = getSportFromLeague(getLeagueFromString(league));
  try {
    const request = new Request(
      `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamId}`,
      {
        headers: { Accept: 'application/json' },
      }
    );
    const res = await fetch(request);
    data = await res.json();
  } catch (e) {
    console.error(e);
  }
  const event = data.team.nextEvent[0];
  const homeTeam = parseTeamInfo(
    league,
    event.competitions[0].competitors.find((team: unknown) => team.homeAway === 'home').team
  );
  const awayTeam = parseTeamInfo(
    league,
    event.competitions[0].competitors.find((team: unknown) => team.homeAway === 'away').team
  );
  const timing = parseTimingInfo(event.competitions[0].status);
  return {
    id: event.id,
    name: event.name,
    date: event.date,
    homeTeam: homeTeam,
    awayTeam: awayTeam,
    state: parseEventState(event),
    gameType: sport,
    league: league,
    timingInfo: timing,
  };
}

export async function fetchScoreForGame<T extends GeneralGameScoreInfo>(
  id: string,
  league: string
): Promise<T | null> {
  let data;
  const sport = getSportFromLeagueString(league);
  const apiUrl = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard/${id}`;
  // console.log(apiUrl);
  try {
    const request = new Request(apiUrl, {
      headers: { Accept: 'application/json' },
    });
    const res = await fetch(request);
    data = await res.json();
    return parseGeneralGameScoreInfo(data, league, sport) as T;
  } catch (e) {
    console.error(e);
  }
  return null;
}

export async function fetchAllTeams(league: string): Promise<TeamInfo[]> {
  let data;
  try {
    const sport = getSportFromLeagueString(league);
    const request = new Request(
      `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams`,
      {
        headers: { Accept: 'application/json' },
      }
    );
    const res = await fetch(request);
    data = await res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
  const allTeams = data.sports[0].leagues[0].teams;
  return allTeams.map((team: unknown) => parseTeamInfo(league, team['team']));
}

function populateBaseballInfo(
  gameInfo: GeneralGameScoreInfo,
  competition: unknown
): BaseballGameScoreInfo {
  const baseballInfo: BaseballGameScoreInfo = {
    ...gameInfo,
    isRunnerOnFirst: false,
    isRunnerOnSecond: false,
    isRunnerOnThird: false,
    balls: 0,
    strikes: 0,
    outs: 0,
    pitcher: '',
    batter: '',
    inning: getInningFromString(competition.status.type.shortDetail),
    inningState: getInningStateFromString(competition.status.type.shortDetail),
    dueUp:
      competition.situation && competition.situation.dueUp
        ? competition.situation.dueUp[0].athlete.displayName
        : '',
    pitcherSummery: '',
    batterSummary: '',
  };

  // If game is in progress
  if (competition.status.type.name === 'STATUS_IN_PROGRESS' && competition.situation) {
    const situation = competition.situation;
    Object.assign(baseballInfo, {
      isRunnerOnFirst: Boolean(situation.onFirst),
      isRunnerOnSecond: Boolean(situation.onSecond),
      isRunnerOnThird: Boolean(situation.onThird),
      balls: situation.balls,
      strikes: situation.strikes,
      outs: situation.outs,
      pitcher: situation.pitcher?.athlete?.displayName || '',
      batter: situation.batter?.athlete?.displayName || '',
      pitcherSummery: situation.pitcher?.summary || '',
      batterSummary: situation.batter?.summary || '',
    });
  }

  return baseballInfo;
}

export function parseGeneralGameScoreInfo(
  event: unknown,
  league: string,
  gameType: string
): GeneralGameScoreInfo | BaseballGameScoreInfo {
  const competition = event.competitions[0];
  const homeCompetitor = competition.competitors.find((team: unknown) => team.homeAway === 'home');
  const awayCompetitor = competition.competitors.find((team: unknown) => team.homeAway === 'away');
  const currentDate = new Date();
  const gameInfo: GeneralGameScoreInfo = {
    event: {
      id: event.id,
      name: event.name,
      date: event.date,
      homeTeam: parseTeamInfo(league, homeCompetitor.team),
      awayTeam: parseTeamInfo(league, awayCompetitor.team),
      state: parseEventState(event),
      gameType: gameType,
      league: league,
      timingInfo: competition.status,
    },
    homeScore: homeCompetitor.score,
    awayScore: awayCompetitor.score,
    extraContent: competition.status.type.shortDetail,
    service: APIService.ESPN,
    generatedDate: currentDate.toISOString(),
  };

  if (gameType.includes('baseball')) {
    return populateBaseballInfo(gameInfo, competition);
  }

  return gameInfo;
}

function parseTeamInfo(league: string, team: unknown): TeamInfo {
  const val: TeamInfo = {
    id: team['id'],
    name: team['shortDisplayName'],
    abbreviation: team['abbreviation'],
    fullName: team['displayName'],
    location: team['location'],
    logo: league + '-' + team['abbreviation'].toLowerCase() + '.png',
  };
  return val;
}

function parseTimingInfo(status: unknown): GameEventTimingInfo {
  const val: GameEventTimingInfo = {
    clock: status['clock'],
    displayClock: status['displayClock'],
    period: status['period'],
  };
  return val;
}

function parseEventState(event: unknown): EventState {
  switch (event['competitions'][0]['status']['type']['name']) {
    case 'STATUS_SCHEDULED':
      return EventState.PRE;
    case 'STATUS_IN_PROGRESS':
      return EventState.LIVE;
    case 'STATUS_FINAL':
      return EventState.FINAL;
    case 'STATUS_FULL_TIME':
      return EventState.FINAL;
    case 'STATUS_DELAYED':
      return EventState.DELAYED;
    case 'STATUS_RAIN_DELAY':
      return EventState.DELAYED;
  }
  return EventState.UNKNOWN;
}

export function eventStateToString(state: EventState): string {
  switch (state) {
    case EventState.PRE:
      return 'Scheduled';
    case EventState.LIVE:
      return 'In Progress';
    case EventState.FINAL:
      return 'Final';
    case EventState.DELAYED:
      return 'Delayed';
    default:
      return '';
  }
}

function eventPeriodToString(sport: string): string {
  switch (sport) {
    case 'football':
      return 'Quarter';
    case 'basketball':
      return 'Quarter';
    case 'hockey':
      return 'Period';
    case 'soccer':
      return 'Half';
    default:
      return 'Period';
  }
}

export function eventPeriodStringShort(period: number, sport: string, league: string): string {
  if (league === League.NCAAMB) {
    switch (period) {
      case 1:
        return `1st`;
      case 2:
        return `2nd`;
      default:
        // First OT is just OT, then 2OT, 3OT, etc.
        return `${period - 2 > 1 ? period - 2 : ''}OT`;
    }
  }
  switch (period) {
    case 0.5:
      return `HT`;
    case 1:
      return `1st`;
    case 2:
      return `2nd`;
    case 3:
      return `3rd`;
    case 4:
      if (sport === 'hockey') {
        return `OT`;
      }
      return `4th`;
    default:
      if (sport === 'hockey') {
        return `${period - 3 > 1 ? period - 3 : ''}OT`;
      }
      // First OT is just OT, then 2OT, 3OT, etc.
      return `${period - 4 > 1 ? period - 4 : ''}OT`;
  }
}

export function eventPeriodString(period: number, sport: string): string {
  switch (period) {
    case 0.5:
      return `Halftime`;
    case 1:
      return `1st ${eventPeriodToString(sport)}`;
    case 2:
      return `2nd ${eventPeriodToString(sport)}`;
    case 3:
      return `3rd ${eventPeriodToString(sport)}`;
    case 4:
      return `4th ${eventPeriodToString(sport)}`;
    default:
      return `${period} ${eventPeriodToString(sport)}`;
    // todo -> special case needed for overtime
  }
}

function getInningStateFromString(state: string): InningState {
  if (state.includes('Top')) return InningState.TOP;
  if (state.includes('Bot')) return InningState.BOTTOM;
  if (state.includes('End')) return InningState.END;
  if (state.includes('Mid')) return InningState.MID;
  return InningState.UNKNOWN;
}

function getInningFromString(str: string): number {
  const matches = str.match(/(\d+)/);
  return matches ? parseInt(matches[0]) : 0;
}
