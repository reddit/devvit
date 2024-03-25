import { demoForId, leagueFromDemoId } from '../mock-scores/MockHelper.js';
import type { GeneralGameScoreInfo } from './GameEvent.js';
import { EventState } from './GameEvent.js';
import type { GameSubscription } from './Sports.js';
import { APIService, getLeagueFromString, getSportFromLeague } from './Sports.js';
import { fetchScoreForGame, parseGeneralGameScoreInfo } from './espn/espn.js';
import type { Devvit, KVStore } from '@devvit/public-api';
import { getSubscriptions, removeSubscription } from '../subscriptions.js';
import type { NFLGameScoreInfo } from './sportradar/NFLBoxscore.js';
import {
  fetchNFLBoxscore,
  fetchNFLSimulationBoxscore,
  nflGameScoreInfo,
  parseNFLBoxscore,
} from './sportradar/NFLBoxscore.js';
import { fetchSoccerEvent, parseSoccerEvent, soccerScoreInfo } from './sportradar/SoccerEvent.js';
import { storeLastEvent } from './sportradar/LastEvents.js';
import type { BasketballGameScoreInfo } from './sportradar/BasketballPlayByPlay.js';
import { fetchNBAGame, fetchNCAAMensBasketballGame } from './sportradar/BasketballPlayByPlay.js';
import { fetchSimulatedGameScoreInfo } from './GameSimulator.js';
import type { BasketballSummary } from './sportradar/BasketballSummary.js';
import { fetchBasketballSummary } from './sportradar/BasketballSummary.js';

const CLOSE_TO_GAME_THRESHOLD_HOURS = 1;
const STALE_INFO_THRESHOLD_HOURS = 1;
const MS_TO_HOURS = 1000 * 60 * 60;

export function makeKeyForSubscription(subscription: GameSubscription): string {
  if (subscription.simulationId) {
    return `info:${subscription.league}-${subscription.eventId}-${subscription.simulationId}`;
  }
  return `info:${subscription.league}-${subscription.eventId}`;
}

export function makeKeyForPostId(postId: string | undefined): string {
  if (postId === undefined) {
    throw new Error('Undefined postId in makeKeyForPostId');
  }
  return `post:${postId}`;
}

export function makeKeyForEventId(eventId: string | undefined): string {
  if (eventId === undefined) {
    throw new Error('Undefined eventId in makeKeyForEventId');
  }
  return `event:${eventId}`;
}

export async function fetchCachedBasketballSummary(
  postId: string,
  scoreInfo: BasketballGameScoreInfo,
  context: Devvit.Context
): Promise<BasketballSummary | null> {
  if (scoreInfo?.event.gameType === 'basketball' && postId !== undefined) {
    const gameSubStr: string | undefined = await context.kvStore.get(makeKeyForPostId(postId));
    if (gameSubStr === undefined) {
      return null;
    }
    const gameSubscription: GameSubscription = JSON.parse(gameSubStr);
    if (
      gameSubscription.service === APIService.SRNBA ||
      gameSubscription.service === APIService.SRNCAAMB ||
      gameSubscription.service === APIService.SimulatorNBA ||
      gameSubscription.service === APIService.SRNBASim
    ) {
      const ttl = scoreInfo.event.state === EventState.FINAL ? 1000 * 60 * 60 * 6 : 60000;
      return await context.cache(
        async () => {
          return await fetchBasketballSummary(
            scoreInfo.event.id,
            scoreInfo.event.league,
            context,
            gameSubscription.service
          );
        },
        { key: `${scoreInfo.event.id}:summary`, ttl: ttl }
      );
    }
  }
  return null;
}

export async function fetchCachedGameInfoForPostId(
  context: Devvit.Context,
  postId: string | undefined
): Promise<GeneralGameScoreInfo | null> {
  const gameSubStr: string | undefined = await context.kvStore.get(makeKeyForPostId(postId));
  if (gameSubStr === undefined) {
    return null;
  }
  const gameSubscription: GameSubscription = JSON.parse(gameSubStr);

  if (gameSubscription.eventId.startsWith('demo')) {
    return fetchDebugGameInfo(gameSubscription.eventId);
  }
  if (gameSubscription.service === APIService.SimulatorNBA) {
    return fetchSimulatedGameScoreInfo(gameSubscription.eventId, context);
  }
  return await fetchCachedGameInfoForGameSubscription(context.kvStore, gameSubscription);
}

export async function fetchCachedGameInfoForGameSubscription(
  kvStore: KVStore,
  sub: GameSubscription
): Promise<GeneralGameScoreInfo | null> {
  const gameInfoStr: string | undefined = await kvStore.get(makeKeyForSubscription(sub));
  if (gameInfoStr === undefined) {
    return null;
  }
  const gameInfo: GeneralGameScoreInfo = JSON.parse(gameInfoStr);
  return gameInfo;
}

export function fetchDebugGameInfo(debugId: string): GeneralGameScoreInfo {
  const league = leagueFromDemoId(debugId);
  const sport = getSportFromLeague(getLeagueFromString(league));
  if (sport === `soccer`) {
    return soccerScoreInfo(`eng.1`, parseSoccerEvent(demoForId(debugId)));
  }
  if (league === `nfl`) {
    return nflGameScoreInfo(parseNFLBoxscore(demoForId(debugId)));
  }
  return parseGeneralGameScoreInfo(demoForId(debugId), league, sport);
}

export async function fetchSubscriptions(context: Devvit.Context): Promise<{
  activeGameScoreInfos: GeneralGameScoreInfo[];
  canceledGameScoreInfos: GeneralGameScoreInfo[];
}> {
  console.log('Running game_subscription_thread...');
  const subscriptions: string[] = await getSubscriptions(context.kvStore);
  console.log('Found ' + subscriptions.length + ' active subscription(s)');
  const gameSubscriptions: GameSubscription[] = subscriptions.map((sub: string) => {
    const parsedSub = JSON.parse(sub);
    return {
      league: parsedSub['league'],
      eventId: parsedSub['eventId'],
      service: parsedSub['service'],
      simulationId: parsedSub['simulationId'],
      recordingId: parsedSub['recordingId'],
    };
  });
  const filteredSubs = await filterSubscriptionsForFetch(gameSubscriptions, context.kvStore);
  const eventFetches = subscriptionFetches(filteredSubs, context);
  const results: GeneralGameScoreInfo[] = (await Promise.all(eventFetches)).flatMap((result) =>
    result ? [result] : []
  );
  const activeGameScoreInfos: GeneralGameScoreInfo[] = [];
  const canceledGameScoreInfos: GeneralGameScoreInfo[] = [];

  for (let i = 0; i < filteredSubs.length; i++) {
    // Sub means subscription, not subreddit. Need to rename me thinkies!
    const sub = filteredSubs[i];
    const info = results[i];
    await context.kvStore.put(makeKeyForSubscription(sub), JSON.stringify(info));
    if (info.event.state === EventState.FINAL) {
      console.log(`Game ID ${info.event.id} (${info.event.awayTeam.abbreviation} @ \
${info.event.homeTeam.abbreviation}) has ended. Cancelling subscription ${sub.eventId}.`);
      await removeSubscription(context.kvStore, JSON.stringify(sub));
      canceledGameScoreInfos.push(info);
    } else {
      activeGameScoreInfos.push(info);
    }
    if (info.event.gameType === 'football') {
      const footballInfo = info as NFLGameScoreInfo;
      if (footballInfo.lastEvent) {
        await storeLastEvent(footballInfo.lastEvent, context.redis, sub.eventId);
      }
    }
  }

  return { activeGameScoreInfos, canceledGameScoreInfos };
}

async function filterSubscriptionsForFetch(
  subs: GameSubscription[],
  kvStore: KVStore
): Promise<GameSubscription[]> {
  const filteredSubs: GameSubscription[] = [];
  for (let i = 0; i < subs.length; i++) {
    const sub = subs[i];
    const info = await fetchCachedGameInfoForGameSubscription(kvStore, sub);
    console.log(`Checking subscription ${sub.eventId} with event state ${info?.event.state}...`);
    if (info && info.event.state === EventState.LIVE) {
      filteredSubs.push(sub);
    } else if (info) {
      const now = new Date();
      const start = new Date(info.event.date);
      const lastFetch = info.generatedDate ? new Date(info.generatedDate) : null;
      const closeToGameThreshold = CLOSE_TO_GAME_THRESHOLD_HOURS * MS_TO_HOURS;
      const stalePregameThreshold = STALE_INFO_THRESHOLD_HOURS * MS_TO_HOURS;
      if (
        lastFetch === null ||
        start.getTime() - now.getTime() < closeToGameThreshold ||
        now.getTime() - lastFetch.getTime() > stalePregameThreshold
      ) {
        filteredSubs.push(sub);
      } else {
        console.log(`Skipping fetch on subscription - ${sub.eventId}`);
      }
    }
  }
  return filteredSubs;
}

function subscriptionFetches(
  gameSubscriptions: GameSubscription[],
  context: Devvit.Context
): Promise<GeneralGameScoreInfo | null>[] {
  const eventFetches: Promise<GeneralGameScoreInfo | null>[] = [];
  gameSubscriptions.forEach((gameSub: GameSubscription) => {
    if (gameSub.service === APIService.SRNFL) {
      eventFetches.push(fetchNFLBoxscore(gameSub.eventId, context));
    } else if (gameSub.service === APIService.SRSoccer) {
      eventFetches.push(fetchSoccerEvent(gameSub.league, gameSub.eventId, context));
    } else if (gameSub.service === APIService.SRNBA || gameSub.service === APIService.SRNBASim) {
      eventFetches.push(fetchNBAGame(gameSub.eventId, context, gameSub.service));
    } else if (gameSub.service === APIService.SRNCAAMB) {
      eventFetches.push(fetchNCAAMensBasketballGame(gameSub.eventId, context));
    } else if (gameSub.service === APIService.SRNFLSim) {
      if (!gameSub.simulationId || !gameSub.recordingId) {
        console.log(
          `No simulation or recording ID found for NFL simulation subscription ${gameSub.eventId}`
        );
      } else {
        eventFetches.push(fetchNFLSimulationBoxscore(gameSub.recordingId, gameSub.simulationId));
      }
    } else if (gameSub.service === APIService.SimulatorNBA) {
      eventFetches.push(fetchSimulatedGameScoreInfo(gameSub.eventId, context));
    } else {
      eventFetches.push(fetchScoreForGame(gameSub.eventId, gameSub.league));
    }
  });
  return eventFetches;
}

export async function handlePostRemoval(postId: string, kvStore: KVStore): Promise<boolean> {
  const key = makeKeyForPostId(postId);
  const gameSubString = await kvStore.get<string>(key);
  if (!gameSubString) {
    return false;
  }
  const gameSubscription: GameSubscription = JSON.parse(gameSubString);
  const postsKey = makeKeyForEventId(gameSubscription.eventId);
  const rawPosts = await kvStore.get<string>(postsKey);
  console.log(
    `Beginning removal of post ${postId} from event ${gameSubscription.eventId} with posts: ${rawPosts}`
  );
  let posts: string[] = [];
  if (rawPosts) {
    const postIdsForEventId: { postIds: string[] } = JSON.parse(rawPosts);
    posts = postIdsForEventId.postIds.filter((id) => id !== postId);
    if (postIdsForEventId.postIds.length !== posts.length) {
      console.log(`Detected change, rewriting posts for event`);
      await kvStore.put(postsKey, JSON.stringify({ postIds: posts }));
    }
  }
  if (posts.length > 0) {
    console.log(`Leaving subscription alive for other posts... ${gameSubscription.eventId}`);
    return false;
  }
  if (gameSubString && typeof gameSubString === 'string') {
    return removeSubscription(kvStore, gameSubString);
  }
  return false;
}
