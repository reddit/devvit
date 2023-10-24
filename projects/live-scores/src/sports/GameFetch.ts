import { mlbDemoForId } from '../mock-scores/mlb/mock-mlb.js';
import { EventState, GeneralGameScoreInfo } from './GameEvent.js';
import { APIService, GameSubscription } from './Sports.js';
import { fetchScoreForGame, parseGeneralGameScoreInfo } from './espn/espn.js';
import { Devvit, KVStore } from '@devvit/public-api';
import { getSubscriptions, removeSubscription } from '../subscriptions.js';
import { fetchNFLBoxscore } from './sportradar/NFLBoxscore.js';
import { fetchSoccerEvent } from './sportradar/SoccerEvent.js';

export function makeKeyForSubscription(subscription: GameSubscription): string {
  return `info:${subscription.league}-${subscription.eventId}`;
}

export function makeKeyForPostId(postId: string | undefined): string {
  if (postId === undefined) {
    throw new Error('Undefined postId in makeKeyForPostId');
  }
  return `post:${postId}`;
}

export async function fetchCachedGameInfo(
  kvStore: KVStore,
  postId: string | undefined
): Promise<GeneralGameScoreInfo | null> {
  const gameSubStr: string | undefined = await kvStore.get(makeKeyForPostId(postId));
  if (gameSubStr === undefined) {
    return null;
  }
  const gameSubscription: GameSubscription = JSON.parse(gameSubStr);

  if (gameSubscription.eventId.startsWith('demo')) {
    const demo = mlbDemoForId(gameSubscription.eventId);
    return parseGeneralGameScoreInfo(demo, `mlb`, `baseball`);
  }

  const gameInfoStr: string | undefined = await kvStore.get(
    makeKeyForSubscription(gameSubscription)
  );
  if (gameInfoStr === undefined) {
    return null;
  }
  const gameInfo: GeneralGameScoreInfo = JSON.parse(gameInfoStr);
  return gameInfo;
}

export function fetchDebugGameInfo(debugId: string): GeneralGameScoreInfo {
  return parseGeneralGameScoreInfo(mlbDemoForId(debugId), `mlb`, `baseball`);
}

export async function fetchSubscriptions(context: Devvit.Context) {
  console.log('Running game_subscription_thread...');
  const subscriptions: string[] = await getSubscriptions(context);
  console.log('Found ' + subscriptions.length + ' active subscription(s)');
  const gameSubscriptions: GameSubscription[] = subscriptions.map((sub: string) => ({
    league: JSON.parse(sub)['league'],
    eventId: JSON.parse(sub)['eventId'],
    service: JSON.parse(sub)['service'],
  }));
  const eventFetches = subscriptionFetches(gameSubscriptions, context);
  const results: GeneralGameScoreInfo[] = (await Promise.all(eventFetches)).flatMap((result) =>
    result ? [result] : []
  );
  for (let i = 0; i < gameSubscriptions.length; i++) {
    await context.kvStore.put(
      makeKeyForSubscription(gameSubscriptions[i]),
      JSON.stringify(results[i])
    );
    if (results[i].event.state === EventState.FINAL) {
      console.log(`Game ID ${results[i].event.id} (${results[i].event.awayTeam.abbreviation} @ \
${results[i].event.homeTeam.abbreviation}) has ended. Cancelling subscription ${subscriptions[i]}.`);
      await removeSubscription(context, subscriptions[i]);
    }
  }
}

function subscriptionFetches(
  gameSubscriptions: GameSubscription[],
  context: Devvit.Context
): Promise<GeneralGameScoreInfo | null>[] {
  const eventFetches: Promise<GeneralGameScoreInfo | null>[] = [];
  gameSubscriptions.forEach((gameSub: GameSubscription) => {
    if (gameSub.service === APIService.SRNFL) {
      eventFetches.push(fetchNFLBoxscore(gameSub.eventId, context));
    }
    if (gameSub.service === APIService.SRSoccer) {
      eventFetches.push(fetchSoccerEvent(gameSub.league, gameSub.eventId, context));
    } else {
      eventFetches.push(fetchScoreForGame(gameSub.eventId, gameSub.league));
    }
  });
  return eventFetches;
}

export async function unsubscribePost(
  postId: string,
  context: Devvit.Context
): Promise<boolean | undefined> {
  const gameSubStr: string | undefined = await context.kvStore.get(makeKeyForPostId(postId));
  if (gameSubStr === undefined) {
    return;
  }
  return await removeSubscription(context, gameSubStr);
}
