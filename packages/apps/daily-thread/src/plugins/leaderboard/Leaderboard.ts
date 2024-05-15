import type { Devvit } from '@devvit/public-api';
import { HOUR_IN_MS } from '../../utils/Time.js';

export type LeaderboardStats = {
  topCommentersByCommentCount: [string, CommenterScore][];
  topCommentersByKarma: [string, CommenterScore][];
};

export type CommenterScore = {
  numberOfComments: number;
  karma: number;
};

const leaderboardCacheKey = 'leaderboardCacheKey';

export async function getLeaderboard(
  context: Devvit.Context
): Promise<LeaderboardStats | undefined> {
  const { cache, postId } = context;
  if (!postId) {
    return;
  }

  return await cache(
    async () => {
      return await calculateLeaderboard(postId, context);
    },
    { key: `${leaderboardCacheKey}:${postId}`, ttl: 1 * HOUR_IN_MS }
  );
}

async function calculateLeaderboard(
  postId: string,
  context: Devvit.Context
): Promise<LeaderboardStats> {
  const { reddit } = context;
  const topComments = (
    await reddit
      .getComments({
        postId: postId,
        limit: 100,
        sort: 'top',
      })
      .all()
  )
    .filter((comment) => comment.isRemoved() === false)
    .filter((comment) => comment.isSpam() === false);

  const topCommenters: Record<string, CommenterScore> = {};

  topComments.forEach((comment) => {
    const author = comment.authorName;
    if (!author) return;
    if (!topCommenters[author]) {
      topCommenters[author] = {
        numberOfComments: 1,
        karma: comment.score,
      };
    } else {
      topCommenters[author].numberOfComments++;
      topCommenters[author].karma += comment.score;
    }
  });

  // rank topCommenters by numberOfComments, return top 3
  const topCommentersArray = Object.entries(topCommenters)
    .sort((a, b) => b[1].numberOfComments - a[1].numberOfComments)
    .slice(0, 3);

  // rank topCommenters by karma, return top 3
  const topCommentersByKarma = Object.entries(topCommenters)
    .sort((a, b) => b[1].karma - a[1].karma)
    .slice(0, 3);

  return {
    topCommentersByCommentCount: topCommentersArray,
    topCommentersByKarma: topCommentersByKarma,
  };
}
