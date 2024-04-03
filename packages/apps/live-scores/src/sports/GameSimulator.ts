import type { Devvit, Post } from '@devvit/public-api';
import type { BasketballGameScoreInfo } from './sportradar/BasketballPlayByPlay.js';
import { basketballGameScoreInfo } from './sportradar/BasketballPlayByPlay.js';
import type { GameSubscription } from './Sports.js';
import { APIService, League, getLeagueFromString } from './Sports.js';
import { EventState } from './GameEvent.js';
import { addSubscription } from '../subscriptions.js';
import { makeKeyForSubscription, makeKeyForPostId, makeKeyForEventId } from './GameFetch.js';
import { APIKey } from './sportradar/APIKeys.js';
import { filteredBasketballEvents } from './sportradar/BasketballPlayByPlayEvents.js';
import { LoadingState } from '../components/Loading.js';
import { configurePostWithAvailableReactions, defaultReactions } from '../Reactions.js';

export type SimulatorProps = {
  gameId: string;
  timeMultiplier: number;
  timeOffsetMinutes: number;
  gameLengthMinutes: number;
};

type SimulatorConfig = {
  props: SimulatorProps;
  startTime: string;
};

function configKey(gameId: string): string {
  return `sim:config:${gameId}`;
}

function fullGameDataKey(gameId: string): string {
  return `sim:full-game:${gameId}`;
}

let storedFullGame: unknown = null;

async function initializeSimulator(
  props: SimulatorProps,
  context: Devvit.Context
): Promise<BasketballGameScoreInfo | null> {
  const currentDate = new Date();
  const config: SimulatorConfig = {
    props,
    startTime: currentDate.toISOString(),
  };
  await context.redis.set(configKey(props.gameId), JSON.stringify(config));

  // check if we already have this game downloaded
  const existingGame = await context.redis.get(`sim:full-game:${props.gameId}`);
  if (existingGame) {
    console.log(`Lucky you! we already have this simulator game cached! GameID: ${props.gameId}`);
    storedFullGame = JSON.parse(existingGame);
    return simulatedGameScoreInfo(JSON.parse(existingGame), config, context);
  }

  const apiKey = await context.settings.get(APIKey.nba);
  try {
    const url = `https://api.sportradar.us/nba/production/v8/en/games/${props.gameId}/pbp.json?api_key=${apiKey}`;
    // console.log(url);
    const response = await fetch(url);
    if (!response.ok) throw Error(`HTTP error ${response.status}: ${response.statusText}`);
    const data = await response.json();
    console.log('Simulator Game fetched from API');
    storedFullGame = basketballGameScoreInfo(data, League.NBA, APIService.SimulatorNBA);
    await context.redis.set(`sim:full-game:${props.gameId}`, JSON.stringify(storedFullGame));
    return simulatedGameScoreInfo(storedFullGame, config, context);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function fetchSimulatedGameScoreInfo(
  gameId: string,
  context: Devvit.Context
): Promise<BasketballGameScoreInfo | null> {
  const configString = await context.redis.get(configKey(gameId));
  if (!configString) {
    return null;
  }
  const config: SimulatorConfig = JSON.parse(configString);
  if (storedFullGame !== null) {
    return simulatedGameScoreInfo(storedFullGame, config, context);
  }
  const fullGameString = await context.redis.get(fullGameDataKey(gameId));
  if (fullGameString) {
    const fullGame: unknown = JSON.parse(fullGameString);
    storedFullGame = fullGame;
    return simulatedGameScoreInfo(fullGame, config, context);
  }
  return null;
}

function simulatedGameScoreInfo(
  game: unknown,
  config: SimulatorConfig,
  context: Devvit.Context
): BasketballGameScoreInfo {
  const startTime = new Date(config.startTime);
  const currentDate = new Date();

  const realTimeElapsed = currentDate.getTime() - startTime.getTime();
  const gameTimeElapsedSeconds = (realTimeElapsed / 1000) * config.props.timeMultiplier;

  const clockTime = 720 - (gameTimeElapsedSeconds % 720);
  const clockMinutes = Math.floor(clockTime / 60);
  const clockSeconds = Math.floor(clockTime % 60)
    .toString()
    .padStart(2, '0');

  const gameLengthSeconds = config.props.gameLengthMinutes * 60;
  const periods = parsePeriods(gameTimeElapsedSeconds, game.periods);
  const latestPeriod = periods?.[periods.length - 1];
  const latestEvent = latestPeriod?.events[latestPeriod.events.length - 1];
  // console.log(`Latest Event: Q${latestPeriod.number} ${latestEvent.clock} ${latestEvent.description}`)

  return {
    event: {
      id: game.event.id,
      name: `${game.event.awayTeam.name} at ${game.event.homeTeam.name}`,
      date: config.startTime,
      homeTeam: game.event.homeTeam,
      awayTeam: game.event.awayTeam,
      state: eventStateForTimeElapsed(gameTimeElapsedSeconds, gameLengthSeconds),
      gameType: 'basketball',
      league: 'nba',
      timingInfo: {
        displayClock: `${clockMinutes}:${clockSeconds}`,
        period: latestPeriod?.number ?? 1,
      },
    },
    homeScore: String(latestEvent?.home_points ?? 0),
    awayScore: String(latestEvent?.away_points ?? 0),
    service: APIService.SimulatorNBA,
    generatedDate: currentDate.toISOString(),
    periods: periods,
    latestEvent: latestEvent,
  };
}

export function eventStateForTimeElapsed(
  timeElapsedSeconds: number,
  gameLengthSeconds: number
): EventState {
  if (timeElapsedSeconds >= gameLengthSeconds) {
    return EventState.FINAL;
  }
  return EventState.LIVE;
}

export function parsePeriods(secondsElapsed: number, periods?: unknown): unknown {
  // round up to nearest 12 minute period
  const maxPeriod = Math.ceil(secondsElapsed / 720);
  // get the time elapsed in the current period, convert to time going DOWN
  const currentPeriodTime = 720 - (secondsElapsed % 720);
  // console.log(`Period Parser - Max Period: ${maxPeriod} Current Period Time: ${currentPeriodTime}`)
  const filteredPeriods = periods.filter((period: unknown) => period.number <= maxPeriod);
  return filteredPeriods.map((period: unknown) => {
    if (period.number < maxPeriod) {
      return period;
    }
    const filteredEvents = filteredBasketballEvents(
      period.events.filter((event: unknown) => {
        // input clock string (mm:ss) "2:20" -> output seconds number 140
        const clockParts = event.clock.split(':');
        const clockSeconds = parseInt(clockParts[0]) * 60 + parseInt(clockParts[1]);
        return clockSeconds >= currentPeriodTime;
      })
    );
    return {
      number: period.number,
      scoring: period.scoring,
      events: filteredEvents,
    };
  });
}

export async function createNBASimulationPost(context: Devvit.Context): Promise<void> {
  const league = 'nba';
  const eventId = `3dd75ea4-1678-4a5b-84b7-b5402b31d435`;
  const gameSub: GameSubscription = {
    league: getLeagueFromString(league),
    eventId: eventId,
    service: APIService.SimulatorNBA,
  };

  const nbaSimProps = {
    gameId: eventId,
    timeMultiplier: 1,
    timeOffsetMinutes: 0,
    gameLengthMinutes: 48,
  };
  const gameInfo = await initializeSimulator(nbaSimProps, context);

  let gameTitle: string = '';
  if (gameInfo !== null && gameInfo !== undefined) {
    gameTitle = `${gameInfo.event.awayTeam.fullName} @ ${gameInfo.event.homeTeam.fullName}`;
    await context.kvStore.put(makeKeyForSubscription(gameSub), JSON.stringify(gameInfo));
  }
  const success: boolean = await addSubscription(context, JSON.stringify(gameSub));
  if (!success) {
    return context.ui.showToast(`An error occurred. Please try again.`);
  }

  const currentSubreddit = await context.reddit.getCurrentSubreddit();
  const post: Post = await context.reddit.submitPost({
    preview: LoadingState(),
    title: `Simulator: ${gameTitle}`,
    subredditName: currentSubreddit.name,
  });

  const eventPostIdInfo = await context.kvStore.get<string>(makeKeyForEventId(gameSub.eventId));
  let newEventPostIdInfo: { postIds: string[] } | undefined = undefined;
  if (eventPostIdInfo) {
    const info = JSON.parse(eventPostIdInfo);

    newEventPostIdInfo = {
      ...info,
      postIds: [...info.postIds, post.id],
    };
  } else {
    newEventPostIdInfo = {
      postIds: [post.id],
    };
  }

  await Promise.all([
    configurePostWithAvailableReactions(post.id, context.redis, defaultReactions),
    /**
     * We need this so that inside of the task scheduler we can find postIDs for given events.
     * This is used to create a cached loading screen as a fallback for errors in case something
     * breaks. It also makes the loading experience look very similar to the live version.
     */
    context.kvStore.put(makeKeyForEventId(gameSub.eventId), JSON.stringify(newEventPostIdInfo)),
    context.kvStore.put(makeKeyForPostId(post.id), JSON.stringify(gameSub)),
  ]);
  return context.ui.showToast({
    text: 'Scoreboard Post Created!',
    appearance: 'success',
  });
}

export async function resetSimulator(context: Devvit.Context): Promise<void> {
  const eventId = `3dd75ea4-1678-4a5b-84b7-b5402b31d435`;
  const configString = await context.redis.get(configKey(eventId));
  if (!configString) {
    return;
  }
  const config: SimulatorConfig = JSON.parse(configString);
  config.startTime = new Date().toISOString();
  await context.redis.set(configKey(eventId), JSON.stringify(config));
  return context.ui.showToast({
    text: 'Simulator restarted! Refresh your page to catch the action.',
    appearance: 'success',
  });
}
