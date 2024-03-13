import type { Devvit } from '@devvit/public-api';
import type { GeneralGameScoreInfo, TeamInfo } from '../GameEvent.js';
import { EventState } from '../GameEvent.js';
import { APIKey } from './APIKeys.js';
import { APIService, League } from '../Sports.js';
import type {
  BasketballGame,
  BasketballPeriod,
  BasketballScoring,
  BasketballTeam,
} from './BasketballModels.js';
import { filteredBasketballEvents } from './BasketballPlayByPlayEvents.js';

// Reduced types from BasketballModels.ts to keep storage size (and redis read size) in check
export type BasketballGameScoreInfo = GeneralGameScoreInfo & {
  periods?: BasketballGameScoreInfoPeriod[];
  latestEvent?: BasketballGameScoreInfoEvent;
};

export type BasketballGameScoreInfoPeriod = {
  number: number;
  scoring: BasketballScoring;
  events: BasketballGameScoreInfoEvent[];
};

export type BasketballGameScoreInfoEvent = {
  id: string;
  clock: string;
  description: string;
  number: number;
  event_type: string;
  home_points: number;
  away_points: number;
};

export async function fetchNBAGame(
  gameId: string,
  context: Devvit.Context,
  service: APIService
): Promise<BasketballGameScoreInfo | null> {
  const apiKey = await context.settings.get(APIKey.nba);
  const apiType = service === APIService.SRNBASim ? 'simulation' : 'production';
  try {
    const url = `https://api.sportradar.us/nba/${apiType}/v8/en/games/${gameId}/pbp.json?api_key=${apiKey}`;
    // console.log(request.url);
    const response = await fetch(url);
    if (!response.ok) throw Error(`HTTP error ${response.status}: ${response.statusText}`);
    const data = await response.json();
    return basketballGameScoreInfo(data, League.NBA, service);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function fetchNCAAMensBasketballGame(
  gameId: string,
  context: Devvit.Context
): Promise<BasketballGameScoreInfo | null> {
  const apiKey = await context.settings.get(APIKey.ncaamb);
  try {
    const url = `https://api.sportradar.us/ncaamb/production/v8/en/games/${gameId}/pbp.json?api_key=${apiKey}`;
    // console.log(url);
    const response = await fetch(url);
    if (!response.ok) throw Error(`HTTP error ${response.status}: ${response.statusText}`);
    const data = await response.json();
    return basketballGameScoreInfo(data, League.NCAAMB, APIService.SRNCAAMB);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function parseTeam(league: string, team: BasketballTeam): TeamInfo {
  // I can't believe I need to do this - pregame data has market in the name, live data does not
  let teamNameWithoutMarket: string;
  let teamNameWithMarket: string;
  if (team.market && team.name.includes(team.market)) {
    teamNameWithMarket = team.name;
    teamNameWithoutMarket = team.name.replace(team.market, '').trim();
  } else if (team.market) {
    teamNameWithMarket = team.market + ' ' + team.name;
    teamNameWithoutMarket = team.name;
  } else {
    teamNameWithMarket = team.name;
    teamNameWithoutMarket = team.name;
  }
  const logo =
    league === 'ncaamb' ? `${team.id}.png` : league + '-' + team.alias.toLowerCase() + '.png';
  return {
    id: team.id,
    name: teamNameWithoutMarket,
    abbreviation: team.alias,
    fullName: `${teamNameWithMarket}`,
    location: team.market ?? ``,
    logo: logo,
  };
}

export function basketballGameScoreInfo(
  game: unknown,
  league: League,
  service: APIService
): BasketballGameScoreInfo {
  const currentDate = new Date();
  const period = league === League.NCAAMB ? game.half : game.quarter;
  const defaultClock = league === League.NCAAMB ? '20:00' : '12:00';
  return {
    event: {
      id: game.id,
      name: `${game.away.name} at ${game.home.name}`,
      date: game.scheduled,
      homeTeam: parseTeam(league, game.home),
      awayTeam: parseTeam(league, game.away),
      state: eventState(game),
      gameType: 'basketball',
      league: league,
      timingInfo: {
        displayClock: game.clock ?? defaultClock,
        period: period ?? 1,
      },
    },
    homeScore: game.home.points ?? 0,
    awayScore: game.away.points ?? 0,
    service: service,
    generatedDate: currentDate.toISOString(),
    periods: parsePeriods(game.periods),
    latestEvent: latestEvent(game.periods),
  };
}

function latestEvent(
  periods?: BasketballGameScoreInfoPeriod[]
): BasketballGameScoreInfoEvent | undefined {
  if (!periods) return undefined;
  const lastPeriod = periods[periods.length - 1];
  if (!lastPeriod) return undefined;
  return lastPeriod.events[lastPeriod.events.length - 1];
}

function parsePeriods(periods?: BasketballPeriod[]): BasketballGameScoreInfoPeriod[] | undefined {
  return periods?.map((period: BasketballPeriod) => {
    const filteredEvents = filteredBasketballEvents(period.events);
    return {
      number: period.number,
      scoring: period.scoring,
      events: filteredEvents.map((event: BasketballGameScoreInfoEvent) => {
        return {
          id: event.id,
          clock: event.clock,
          description: event.description,
          number: event.number,
          event_type: event.event_type,
          home_points: event.home_points,
          away_points: event.away_points,
        };
      }),
    };
  });
}

export enum BasketballGameStatus {
  SCHEDULED = `scheduled`,
  CREATED = `created`,
  INPROGRESS = `inprogress`,
  HALFTIME = `halftime`,
  CLOSED = `closed`,
  COMPLETE = `complete`,
  // TODO: Add the rest of the statuses
}

function eventState(event: BasketballGame): EventState {
  switch (event.status) {
    case BasketballGameStatus.CREATED:
    case BasketballGameStatus.SCHEDULED:
      return EventState.PRE;
    case BasketballGameStatus.INPROGRESS:
    case BasketballGameStatus.HALFTIME:
      return EventState.LIVE;
    case BasketballGameStatus.CLOSED:
    case BasketballGameStatus.COMPLETE:
      return EventState.FINAL;
  }
  return EventState.UNKNOWN;
}

/* 
  Here is a list of the valid game statuses you can expect to see, and their definitions.
    scheduled - The game is scheduled to occur.
    created – The game has been created and we have begun logging information.
    inprogress – The game is in progress.
    halftime - The game is currently at halftime.
    complete – The game is over, but stat validation is not complete.
    closed – The game is over and the stats have been validated.
    cancelled – The game has been cancelled. No makeup game will be played as a result.
    delayed – The start of the game is currently delayed or the game has gone from in progress to delayed for some reason.
    postponed – The game has been postponed, to be made up at another day and time. Once the makeup game is announced, a new game and ID will be created and scheduled on the announced makeup date.
    time-tbd – The game has been scheduled, but a time has yet to be announced.
    if-necessary – The game will be scheduled if it is required.
    unnecessary – The series game was scheduled to occur, but will not take place due to one team clinching the series early.
*/
