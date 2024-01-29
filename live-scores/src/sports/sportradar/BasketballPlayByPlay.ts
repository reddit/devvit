import { Devvit } from '@devvit/public-api';
import { EventState, GeneralGameScoreInfo, TeamInfo } from '../GameEvent.js';
import { APIKey } from './APIKeys.js';
import { APIService } from '../Sports.js';
import {
  BasketballGame,
  BasketballPeriod,
  BasketballScoring,
  BasketballTeam,
} from './BasketballModels.js';

// Reduced types from BasketballModels.ts to keep storage size (and redis read size) in check
export type BasketballGameScoreInfo = GeneralGameScoreInfo & {
  periods?: BasketballGameScoreInfoPeriod[];
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
};

export async function fetchNBAGame(
  gameId: string,
  context: Devvit.Context
): Promise<BasketballGameScoreInfo | null> {
  const apiKey = await context.settings.get(APIKey.nba);
  try {
    const url = `https://api.sportradar.us/nba/production/v8/en/games/${gameId}/pbp.json?api_key=${apiKey}`;
    // console.log(request.url);
    const response = await fetch(url);
    if (!response.ok) throw Error(`HTTP error ${response.status}: ${response.statusText}`);
    const data = await response.json();
    return basketballGameScoreInfo(data);
  } catch (e) {
    console.error(e);
    return null;
  }
}

function parseTeam(league: string, team: BasketballTeam): TeamInfo {
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
  return {
    id: team.id,
    name: teamNameWithoutMarket,
    abbreviation: team.alias,
    fullName: `${teamNameWithMarket}`,
    location: team.market ?? ``,
    logo: league + '-' + team.alias.toLowerCase() + '.png',
  };
}

export function basketballGameScoreInfo(game: any): BasketballGameScoreInfo {
  const currentDate = new Date();
  return {
    event: {
      id: game.id,
      name: `${game.away.name} at ${game.home.name}`,
      date: game.scheduled,
      homeTeam: parseTeam(`nba`, game.home),
      awayTeam: parseTeam(`nba`, game.away),
      state: eventState(game),
      gameType: 'basketball',
      league: 'nba',
      timingInfo: {
        displayClock: game.clock ?? `12:00`,
        period: game.quarter ?? 1,
      },
    },
    homeScore: game.home.points ?? 0,
    awayScore: game.away.points ?? 0,
    service: APIService.SRNBA,
    generatedDate: currentDate.toISOString(),
    periods: parsePeriods(game.periods),
  };
}

function parsePeriods(periods?: BasketballPeriod[]): BasketballGameScoreInfoPeriod[] | undefined {
  return periods?.map((period: BasketballPeriod) => {
    return {
      number: period.number,
      scoring: period.scoring,
      events: period.events.map((event: BasketballGameScoreInfoEvent) => {
        return {
          id: event.id,
          clock: event.clock,
          description: event.description,
          number: event.number,
          event_type: event.event_type,
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

/* 
  Here is a list of the valid event types you can expect to see.
    challengereview - Instant replay (challenge: <outcome>)
    challengetimeout - <team name> challenge timeout
    clearpathfoul - <charged_to> clear path foul (<drawn_by> draws the foul)
    deadball - <given_to> rebound (deadball)
    defaultviolation - <charged_to> violation
    defensivegoaltending - <charged_to> defensive goaltending violation
    delay - <charged_to> delay of game violation
    doublelane - <charged_to> double lane violation
    ejection - <given_to> ejected from the game (<ejection_type>)
    endperiod - End of <nth period/half>
    flagrantone - <charged_to> flagrant 1 (<drawn_by> draws the foul)
    flagranttwo - <charged_to> flagrant 2 (<drawn_by> draws the foul)
    freethrowmade - <taken_by> makes <free_throw_type> free throw <attempt>
    freethrowmiss - <taken_by> misses <free_throw_type> free throw <attempt> (<charged_to> lane_violation)
    jumpball - Jump ball <reason>. <possessor> vs <challenger> (<possession> gains possession)
    jumpballviolation - <charged_to> jump ball violation
    kickball - <charged_to> kicked ball violation
    lane - <charged_to> lane violation
    lineupchange - <team_name> lineup change (<players>)
    offensivefoul - <charged_to> offensive foul (<foul_type_desc>) (<drawn_by> draws the foul)
    officialtimeout - Official timeout
    openinbound - Open inbound <team_name>
    opentip - <home> vs <away> (<possession> gains possession)
    personalfoul - <charged_to> personal foul (<foul_type_desc>) (<drawn_by> draws the foul)
    possession - <possession> gain possession
    rebound - <given_to> <offensive/defensive> rebound
    requestreview - Instant replay (request)
    review - Play review (<reason>, <outcome>)
    shootingfoul - <charged_to> shooting foul (<drawn_by> draws the foul)
    stoppage - Stoppage (<reason>)
    teamtimeout - <team_name> <duration> second timeout
    technicalfoul - <charged_to> technical foul (<foul_type_desc>)
    technicalfoulnonunsportsmanlike - <charged_to> technical foul (<foul_type_desc>)
    threepointmade - <taken_by> makes three point <shot_type_desc> <shot_type> (<assisted_by> assists)
    threepointmiss - <taken_by> misses three point <shot_type_desc> <shot_type> or <blocked_by> blocks <taken_by> three point <shot_type_desc> <shot_type>
    turnover - <charged_to> turnover (turnover_type_desc>)
    tvtimeout - TV Timeout
    twopointmade - <taken_by> makes two point <shot_type_desc> <shot_type> (<assisted_by> assists)
    twopointmiss - <taken_by> misses two point <shot_type_desc> <shot_type> or <blocked_by> blocks <taken_by> two point <shot_type_desc> <shot_type>
*/
