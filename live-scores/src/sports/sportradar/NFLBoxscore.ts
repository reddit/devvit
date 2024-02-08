import { Devvit } from '@devvit/public-api';
import { NFLGame, NFLSeasonInfo, NFLWeek } from './NFLSchedule.js';
import { EventState, GeneralGameScoreInfo, TeamInfo } from '../GameEvent.js';
import { APIService } from '../Sports.js';
import { APIKey } from './APIKeys.js';
import { Team, TeamRecord } from './GenericModels.js';

type NFLBoxscoreSummary = {
  season: NFLSeasonInfo;
  week: NFLWeek;
  home: NFLGameTeam;
  away: NFLGameTeam;
};

export type NFLGameTeam = Team & {
  market: string;
  used_timeouts: number;
  remaining_timeouts: number;
  points: number;
  used_challenges: number;
  remaining_challenges: number;
  record: TeamRecord;
};

type NFLBoxscoreSituation = {
  clock: string;
  down: number;
  yfd: number;
  possession: Team;
  location: {
    id: string;
    name: string;
    market: string;
    alias: string;
    sr_id: string;
    yardline: number;
  };
};

export type NFLBoxscoreLastEvent = {
  type: string;
  id: string;
  sequence: number;
  clock: string;
  event_type: string;
  description: string;
  created_at: string;
  updated_at: string;
  wall_clock: string;
};

export type NFLBoxscore = NFLGame & {
  clock: string;
  quarter: number;
  summary: NFLBoxscoreSummary;
  situation: NFLBoxscoreSituation;
  last_event: NFLBoxscoreLastEvent;
};

export enum NFLBoxscoreStatus {
  SCHEDULED = `scheduled`,
  CREATED = `created`,
  INPROGRESS = `inprogress`,
  HALFTIME = `halftime`,
  CLOSED = `closed`,
  COMPLETE = `complete`,
}

export async function fetchNFLBoxscore(
  gameId: string,
  context: Devvit.Context
): Promise<NFLGameScoreInfo | null> {
  let data;
  const apiKey = await context.settings.get(APIKey.nfl);
  try {
    const request = new Request(
      `https://api.sportradar.us/nfl/official/production/v7/en/games/${gameId}/boxscore.json?api_key=${apiKey}`
    );
    // console.log(request.url);
    const response = await fetch(request);
    data = await response.json();
  } catch (e) {
    console.error(e);
    return null;
  }
  return nflGameScoreInfo(parseNFLBoxscore(data));
}

export async function fetchNFLSimulationBoxscore(
  recordingId: string,
  sessionId: string
): Promise<NFLGameScoreInfo | null> {
  let data;
  try {
    const request = new Request(
      `https://playback.sportradar.com/replay/nfl/${recordingId}?feed=boxscore&contentType=json&sessionId=${sessionId}`
    );
    // console.log(request.url);
    const response = await fetch(request);
    data = await response.json();
  } catch (e) {
    console.error(e);
    return null;
  }
  return nflGameScoreInfo(parseNFLBoxscore(data));
}

export function parseNFLBoxscore(jsonData: any): NFLBoxscore {
  return {
    id: jsonData.id,
    status: jsonData.status,
    scheduled: jsonData.scheduled,
    attendance: jsonData.attendance,
    clock: jsonData.clock,
    quarter: jsonData.quarter,
    sr_id: jsonData.sr_id,
    game_type: jsonData.game_type,
    conference_game: jsonData.conference_game,
    duration: jsonData.duration,
    summary: jsonData.summary,
    situation: jsonData.situation,
    last_event: jsonData.last_event,
    scoring: jsonData.scoring,
  };
}

function parseTeam(league: string, team: any): TeamInfo {
  return {
    id: team.id,
    name: team.name,
    abbreviation: team.alias,
    fullName: `${team.market} ${team.name}`,
    location: team.market,
    logo: league + '-' + team.alias.toLowerCase() + '.png',
  };
}

export type NFLGameScoreInfo = GeneralGameScoreInfo & {
  summary: NFLBoxscoreSummary;
  clock?: string;
  quarter?: number;
  situation?: NFLBoxscoreSituation;
  lastEvent?: NFLBoxscoreLastEvent;
};

export function nflGameScoreInfo(game: NFLBoxscore): NFLGameScoreInfo {
  const currentDate = new Date();
  return {
    event: {
      id: game.id,
      name: `${game.summary.away.name} at ${game.summary.home.name}`,
      date: game.scheduled,
      homeTeam: parseTeam(`nfl`, game.summary.home),
      awayTeam: parseTeam(`nfl`, game.summary.away),
      state: eventState(game),
      gameType: 'football',
      league: 'nfl',
      timingInfo: {
        displayClock: game.clock,
        period: game.quarter,
      },
    },
    homeScore: game.summary.home.points,
    awayScore: game.summary.away.points,
    service: APIService.SRNFL,
    generatedDate: currentDate.toISOString(),
    summary: game.summary,
    clock: game.clock,
    quarter: game.quarter,
    situation: game.situation,
    lastEvent: game.last_event,
  };
}

function eventState(event: NFLBoxscore): EventState {
  switch (event.status) {
    case NFLBoxscoreStatus.CREATED:
    case NFLBoxscoreStatus.SCHEDULED:
      return EventState.PRE;
    case NFLBoxscoreStatus.INPROGRESS:
    case NFLBoxscoreStatus.HALFTIME:
      return EventState.LIVE;
    case NFLBoxscoreStatus.CLOSED:
    case NFLBoxscoreStatus.COMPLETE:
      return EventState.FINAL;
  }
  return EventState.UNKNOWN;
}
