import { Devvit, RedisClient } from '@devvit/public-api';
import { GeneralGameScoreInfo } from './sports/GameEvent.js';
import { makeKeyForEventId } from './sports/GameFetch.js';
import { SoccerGameScoreInfo } from './sports/sportradar/SoccerEvent.js';
import { NFLGameScoreInfo } from './sports/sportradar/NFLBoxscore.js';
import { stringsForLatestEvent } from './components/EventBubble.js';

const eventCommentsEnabledKey = (postId: string) => `${postId}:eventCommentsEnabled`;
const eventCommentsPostedKey = (postId: string) => `${postId}:eventCommentsPosted`;

export async function toggleEventComments(enabled: boolean, postId: string, redis: RedisClient) {
  await redis.set(eventCommentsEnabledKey(postId), enabled ? 'true' : 'false');
}

export async function isEventCommentsEnabled(postId: string, redis: RedisClient): Promise<boolean> {
  const isEnabled = await redis.get(eventCommentsEnabledKey(postId));
  return isEnabled === 'true';
}

export async function postLatestEvents(
  context: Devvit.Context,
  scoreInfos?: GeneralGameScoreInfo[]
) {
  if (!scoreInfos) {
    return;
  }
  for (const scoreInfo of scoreInfos) {
    const rawEventId = await context.kvStore.get<string>(makeKeyForEventId(scoreInfo.event.id));
    if (!rawEventId) {
      console.error(
        `Cannot get posts associated to eventID ${scoreInfo.event.id} because nothing exists in KVStore!`
      );
      return;
    }
    const postIdsForEventId: { postIds: string[] } = JSON.parse(rawEventId);
    console.log(`Adding comments for:`, postIdsForEventId.postIds.join(', '));

    for (const postId of postIdsForEventId.postIds) {
      const isEnabled = await isEventCommentsEnabled(postId, context.redis);
      if (!isEnabled) {
        console.log(`Event comments disabled for ${postId}`);
        continue;
      }
      const commentsPostedData = await context.redis.get(eventCommentsPostedKey(postId));
      const commentsPosted = commentsPostedData ? JSON.parse(commentsPostedData) : [];

      if (scoreInfo.event.gameType === 'soccer') {
        const soccerGameScoreInfo = scoreInfo as SoccerGameScoreInfo;
        let latestEvent = soccerGameScoreInfo.summary?.latestEvent;
        if (latestEvent) {
          if (commentsPosted.includes(latestEvent.id)) {
            console.log(`Already posted comment for ${latestEvent.id} on ${postId}`);
            continue;
          }
          const { primaryString, secondaryString } = stringsForLatestEvent(soccerGameScoreInfo);
          const commentString = primaryString + '\n\n' + secondaryString;
          console.log(`Posting Soccer comment: ${commentString}`);
          await context.reddit.submitComment({ text: commentString, id: postId });
          await context.redis.set(
            eventCommentsPostedKey(postId),
            JSON.stringify([...commentsPosted, latestEvent.id])
          );
        }
      } else if (scoreInfo.event.gameType === 'football') {
        const footballGameScoreInfo = scoreInfo as NFLGameScoreInfo;
        let latestEvent = footballGameScoreInfo.lastEvent;
        if (latestEvent) {
          if (commentsPosted.includes(latestEvent.id)) {
            console.log(`Already posted comment for ${latestEvent.id} on ${postId}`);
            continue;
          }
          const primaryString = `🏈 Latest Update (${latestEvent.clock ?? ''})`;
          const secondaryString = latestEvent.description ?? '';

          const commentString = primaryString + '\n\n' + secondaryString;
          console.log(`Posting football comment: ${commentString}`);
          await context.reddit.submitComment({ text: commentString, id: postId });
          await context.redis.set(
            eventCommentsPostedKey(postId),
            JSON.stringify([...commentsPosted, latestEvent.id])
          );
        }
      }
    }
  }
}
