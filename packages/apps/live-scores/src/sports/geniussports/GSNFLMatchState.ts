// Fetch match state for game

import type { Devvit } from '@devvit/public-api';

import type { TeamInfo } from '../GameEvent.js';
import { EventState } from '../GameEvent.js';
import type {
  NFLBoxscoreLastEvent,
  NFLBoxscoreSituation,
  NFLGameScoreInfo,
  NFLTimeoutsRemaining,
} from '../sportradar/NFLBoxscore.js';
import { APIService } from '../Sports.js';
import {
  currentGSAPIEnvironment,
  getAuthentication,
  GSAPIEndpoint,
  GSAPIEnvironment,
} from './GSAuthentication.js';
import type { GSCompetitor, GSNFLFixture } from './GSNFLSchedule.js';
import { fetchFixtures } from './GSNFLSchedule.js';
import { teamInfoForId } from './GSNFLTeams.js';

export async function fetchGSNFLGame(
  fixtureId: string,
  context: Devvit.Context
): Promise<NFLGameScoreInfo | null> {
  const { cache } = context;

  const matchState = await fetchMatchState(context, fixtureId);

  // Fixture info doesn't change much, so cache it for 30 minutes
  const fixtureInfo = await cache(async () => fetchFixture(context, fixtureId), {
    key: `gsapi:nflfixture:${fixtureId}`,
    ttl: 30 * 60 * 1000,
  });

  if (!fixtureInfo || !matchState) {
    return null;
  }

  return gsNflGameScoreInfo({ fixtureInfo, matchState });
}

async function fetchFixture(
  context: Devvit.Context,
  fixtureId: string
): Promise<GSNFLFixture | null> {
  const auth = await getAuthentication(GSAPIEndpoint.Fixtures, context);
  if (!auth) {
    return null;
  }
  const fixtures = await fetchFixtures([fixtureId], auth);
  return fixtures[0];
}

async function fetchMatchState(
  context: Devvit.Context,
  fixtureId: string
): Promise<GSNFLMatchState | null> {
  const envParam = currentGSAPIEnvironment === GSAPIEnvironment.UAT ? 'uat.' : '';
  const url = `https://platform.${envParam}matchstate.api.geniussports.com/api/v2/sources/GeniusPremium/sports/17/fixtures/${fixtureId}`;
  const auth = await getAuthentication(GSAPIEndpoint.MatchState, context);

  if (!auth) {
    return null;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: auth.bearerToken,
        'x-api-key': auth.apiKey,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

function removeHoursFromClock(clock: string): string {
  const clockParts = clock.split(':');
  return clockParts.length === 3 ? clockParts.slice(1).join(':') : clock;
}

export function gsNflGameScoreInfo(game: GSNFLGame): NFLGameScoreInfo {
  // if clock is in format "00:00:00" then trim the hours from the start
  const displayClock = removeHoursFromClock(game.matchState.gameTime.clock);
  const currentDate = new Date();
  const homeTeam = teamInfo(game.fixtureInfo.competitors[0]);
  const awayTeam = teamInfo(game.fixtureInfo.competitors[1]);
  const gameEventState = eventState(game.matchState);
  return {
    event: {
      id: String(game.fixtureInfo.id),
      name: game.fixtureInfo.name,
      date: game.fixtureInfo.startDate,
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      state: gameEventState,
      gameType: 'football',
      league: 'nfl',
      timingInfo: {
        displayClock: displayClock,
        period: game.matchState.period?.number ?? 0,
      },
    },
    homeScore: String(game.matchState.score.home),
    awayScore: String(game.matchState.score.away),
    service: APIService.GSNFL,
    generatedDate: currentDate.toISOString(),
    clock: displayClock,
    quarter: game.matchState.period?.number ?? 0,
    situation:
      gameEventState === EventState.LIVE
        ? situation(game.matchState, homeTeam, awayTeam)
        : undefined,
    lastEvent: parseLatestEvent(game.matchState),
    allEvents: allEvents(game.matchState),
    timeouts: timeouts(gameEventState, game.matchState),
  };
}

function situation(
  matchState: GSNFLMatchState,
  homeTeam: TeamInfo,
  awayTeam: TeamInfo
): NFLBoxscoreSituation {
  const currentHalf = matchState.period.number <= 2 ? matchState.firstHalf : matchState.secondHalf;
  const latestDrive = currentHalf.drives[currentHalf.drives.length - 1];
  const latestPlay = latestDrive.plays[latestDrive.plays.length - 1];
  const location = latestPlay.scrimmageLocation;

  const posessionTeam = latestDrive.teamInPossession === 'Home' ? homeTeam : awayTeam;
  const locationTeam = location.sideOfPitch === 'Home' ? homeTeam : awayTeam;
  return {
    clock: matchState.gameTime.clock,
    down: latestPlay.downNumber ?? 0,
    yfd: latestPlay.yardsToGo ?? 0,
    possession: {
      id: posessionTeam.id,
      name: posessionTeam.name,
      alias: posessionTeam.abbreviation,
      sr_id: posessionTeam.id,
    },
    location: {
      id: locationTeam.id,
      name: locationTeam.name,
      alias: locationTeam.abbreviation,
      sr_id: locationTeam.id,
      market: locationTeam.location,
      yardline: location.scrimmageYard ?? 0,
    },
  };
}

function parseLatestEvent(matchState: GSNFLMatchState): NFLBoxscoreLastEvent | undefined {
  if (matchState.firstHalf.drives.length === 0) {
    return undefined;
  }

  const currentHalf = matchState.period.number <= 2 ? matchState.firstHalf : matchState.secondHalf;

  const latestDrive = currentHalf.drives[currentHalf.drives.length - 1];
  const latestPlay =
    latestDrive.plays.length > 1
      ? latestDrive.plays[latestDrive.plays.length - 2]
      : latestDrive.plays[0];
  const clock =
    latestPlay.endedAtGameTime ?? latestPlay.startedAtGameTime ?? matchState.gameTime.clock;

  return {
    id: latestPlay.id,
    clock: removeHoursFromClock(clock),
    description: latestPlay.description,
  };
}

function allEvents(matchState: GSNFLMatchState): NFLBoxscoreLastEvent[] {
  const events: NFLBoxscoreLastEvent[] = [];
  const halfs = [matchState.firstHalf, matchState.secondHalf];
  halfs.forEach((half) => {
    half.drives.forEach((drive) => {
      drive.plays.forEach((play) => {
        const clock = play.endedAtGameTime ?? play.startedAtGameTime ?? '';
        if (!play.description) {
          return;
        }
        events.push({
          id: play.id,
          clock: removeHoursFromClock(clock),
          description: play.description,
        });
      });
    });
  });
  return events;
}

function teamInfo(competitor: GSCompetitor): TeamInfo {
  const info = teamInfoForId(competitor.id);
  return {
    id: competitor.id,
    name: info.shortName,
    abbreviation: info.abbreviation,
    fullName: info.fullName,
    location: info.market,
    logo: info.logo,
  };
}

function timeouts(eventState: EventState, matchState: GSNFLMatchState): NFLTimeoutsRemaining {
  if (eventState !== EventState.LIVE || matchState.period.number == null) {
    return {
      home: 3,
      away: 3,
    };
  }
  const currentHalf = matchState.period.number <= 2 ? matchState.firstHalf : matchState.secondHalf;
  if (currentHalf.timeoutsRemaining.home === null || currentHalf.timeoutsRemaining.away === null) {
    return {
      home: 3,
      away: 3,
    };
  }
  return {
    home: currentHalf.timeoutsRemaining.home,
    away: currentHalf.timeoutsRemaining.away,
  };
}

function eventState(event: GSNFLMatchState): EventState {
  switch (event.matchStatus) {
    //Unknown, NotStarted, Warmup, InProgress, Postponed, Finished, Interrupted, CoverageStopped, Abandoned, Cancelled, Delayed
    case 'NotStarted':
    case 'Warmup':
    case 'Postponed':
      return EventState.PRE;
    case 'InProgress':
      return EventState.LIVE;
    case 'Finished':
      return EventState.FINAL;
    case 'Delayed':
      return EventState.DELAYED;
    case 'CoverageStopped':
    case 'Interrupted':
    case 'Abandoned':
    case 'Cancelled':
    case 'Unknown':
      return EventState.UNKNOWN;
    default:
      return EventState.UNKNOWN;
  }
}

export type GSNFLGame = {
  fixtureInfo: GSNFLFixture;
  matchState: GSNFLMatchState;
};

export type GSNFLMatchState = {
  firstHalf: Half;
  secondHalf: Half;
  overtimePeriods: unknown[];
  challenges: unknown[];
  gameTime: GSNFLClock;
  playClock: GSNFLClock;
  matchStatus: string;
  period: Period;
  periodWithStatus: PeriodWithStatus;
  score: GSNFLGameScore;
  homeTeam: GSNFLTeam;
  awayTeam: GSNFLTeam;
  injuries: Injury[];
  comments: Comment[];
  currentPossession: CurrentPossession;
  yardsToEndzone: YardsToEndzone;
  risks: Risks;
  isPlayUnderReview: unknown;
  nextPlay: unknown;
  source: string;
  fixtureId: string;
  sequence: number;
  messageTimestampUtc: string;
  isReliable: boolean;
  isCoverageCancelled: boolean;
  reliabilityReasons: ReliabilityReasons;
};

type Half = {
  drives: Drive[];
  timeouts: Timeout[];
  timeoutsRemaining: TimeoutsRemaining;
  coinToss: CoinToss;
};

type Drive = {
  teamInPossession: string;
  isKickOff: boolean;
  plays: Play[];
  conversionPlays: ConversionPlay[];
  score: DriveScore[];
  isFinished: boolean;
};

type Play = {
  sequence: number;
  downNumber?: number;
  yardsToGo?: number;
  scrimmageLocation: ScrimmageLocation;
  snap?: Snap;
  id: string;
  isVoid: boolean;
  isConfirmed: boolean;
  isFinished: boolean;
  period: Period;
  actions: Action[];
  penalties: Penalty[];
  startedAtGameTime: string;
  endedAtGameTime: string;
  startedAtUtc: string;
  endedAtUtc: unknown;
  description: string;
  sourcePlayId: string;
};

type ScrimmageLocation = {
  scrimmageYard: number;
  sideOfPitch: string;
};

type Snap = {
  id: string;
  isConfirmed: boolean;
  timestampUtc: string;
};

type Period = {
  number: number;
  type: string;
};

type Action = {
  id: string;
  sequence: number;
  team: string;
  type: string;
  subType?: string;
  players: Player[];
  yards?: number;
  yardLine?: YardLine;
  isNullified: boolean;
  activeUnits: ActiveUnits;
};

type Player = {
  playerType: string;
  id: string;
};

type YardLine = {
  type?: string;
  yards: number;
  sideOfPitch: string;
};

type ActiveUnits = {
  home: string;
  away: string;
};

type Penalty = {
  id: string;
  team: string;
  playerId?: string;
  type: string;
  outcome: string;
  yards?: number;
  yardLines: YardLine[];
  enforcementSpot: string;
  nextDown: string;
  activeUnits: ActiveUnits;
  utcTimestamp: string;
};

type ConversionPlay = {
  teamInPossession: string;
  type: string;
  id: string;
  isVoid: boolean;
  isConfirmed: boolean;
  isFinished: boolean;
  period: Period;
  actions: Action[];
  penalties: unknown[];
  startedAtGameTime: string;
  endedAtGameTime: unknown;
  startedAtUtc: string;
  endedAtUtc: unknown;
  description: string;
  sourcePlayId: string;
};

type DriveScore = {
  period: Period;
  type: string;
  team: string;
  points: number;
  isConfirmed: boolean;
  utcTimestamp: string;
};

type Timeout = {
  team: string;
  gameTime: string;
  period: Period;
  utcTimestamp: string;
  isConfirmed: boolean;
};

type TimeoutsRemaining = {
  away: number;
  home: number;
};

type CoinToss = {
  winnerTeam: string;
  wasDeferred: boolean;
  awayChoice: string;
  homeChoice: string;
};

type GSNFLClock = {
  clock: string;
  lastUpdatedUtc: string;
  isRunning: boolean;
};

type PeriodWithStatus = {
  status: string;
  isConfirmed: boolean;
  number: number;
  type: string;
};

type GSNFLGameScore = {
  home: number;
  away: number;
  isConfirmed: boolean;
};

type GSNFLTeam = {
  offensive: Offensive[];
  defensive: Defensive[];
  special: Special[];
};

type Offensive = {
  id?: string;
  position: string;
  side: string;
  status: string;
};

type Defensive = {
  id?: string;
  position: string;
  side: string;
  status: string;
};

type Special = {
  id: string;
  position: string;
  side: string;
  status: string;
};

type Injury = {
  id: string;
  playId?: string;
  team: string;
  playerId: string;
  status: string;
  isConfirmed: boolean;
  utcTimestamp: string;
};

type Comment = {
  value: string;
  utcTimestamp: string;
};

type CurrentPossession = {
  team: string;
  lastUpdatedUtc: string;
};

type YardsToEndzone = {
  yards: number;
  team: string;
  lastUpdatedUtc: string;
  isConfirmed: boolean;
};

type Risks = {
  touchdown: string;
  onsideKick: string;
  fieldGoal: string;
  fourthDown: string;
  safety: string;
  challenge: string;
  penalty: string;
  videoReview: string;
  turnover: string;
  other: string;
  playAboutToStart: string;
  injury: string;
  bigPlay: string;
  statDelay: string;
};

type ReliabilityReasons = {
  heartbeat: string;
  feedReliability: string;
  coverage: string;
};
