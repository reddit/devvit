import { RedisClient } from '@devvit/public-api';

export type Reaction = {
  id: string;
  name: string;
  url: string;
};

export type ReactionScore = {
  reaction: Reaction;
  count: number;
};

function counterKey(reactionId: string, postId: string, eventId: string) {
  return `${postId}:${eventId}:reactions:${reactionId}`;
}

export async function incrementReaction(
  reaction: Reaction,
  value: number,
  redis: RedisClient,
  postId?: string,
  eventId?: string
) {
  if (!postId || !eventId) {
    return;
  }
  const key = counterKey(reaction.id, postId, eventId);
  await redis.incrBy(key, value);
}

export async function getReactionScore(
  reaction: Reaction,
  postId: string,
  eventId: string,
  redis: RedisClient
): Promise<ReactionScore> {
  const key = counterKey(reaction.id, postId, eventId);
  const value = await redis.get(key);
  const score = value ? parseInt(value) : 0;
  return { reaction, count: score };
}

export async function configurePostWithAvailableReactions(
  postId: string,
  redis: RedisClient,
  reactions?: Reaction[]
) {
  if (!reactions) {
    return;
  }
  const key = `${postId}:reactions`;
  redis.set(key, JSON.stringify(reactions));
}

export async function getAvailableReactions(
  redis: RedisClient,
  postId?: string
): Promise<Reaction[]> {
  if (!postId) {
    return [];
  }
  const key = `${postId}:reactions`;
  const reactions = await redis.get(key);
  return reactions ? JSON.parse(reactions) : [];
}

export async function getAllReactionScores(
  redis: RedisClient,
  postId?: string,
  eventId?: string
): Promise<ReactionScore[]> {
  if (!postId || !eventId) {
    return [];
  }
  const reactions = await getAvailableReactions(redis, postId);
  const scores = await Promise.all(
    reactions.map((reaction) => getReactionScore(reaction, postId, eventId, redis))
  );
  return scores;
}

export const defaultReactions: Reaction[] = [
  {
    id: 'cheer_shark',
    name: 'Cheer Shark',
    url: 'reactions/cheer_shark.png',
  },
  {
    id: 'mind_blown',
    name: 'Mind Blown',
    url: 'reactions/mind_blown.png',
  },
  {
    id: 'snoomoji_sob',
    name: 'Sob',
    url: 'reactions/snoomoji_sob.png',
  },
];

export function friendlyNumber(num: number) {
  if (!Number.isFinite(num) || num < 0) {
    return '--'; // Input validation for non-negative numbers
  }
  if (num < 1000) {
    return num.toLocaleString(); // Formats numbers below 1000 with commas
  } else if (num < 10000) {
    return Math.floor(num / 100) / 10 + 'K';
  } else if (num < 1000000) {
    return Math.floor(num / 1000) + 'K';
  } else if (num < 1000000000) {
    return Math.floor(num / 100000) / 10 + 'M';
  } else {
    // Handles very large numbers
    return Math.floor(num / 100000000) / 10 + 'B';
  }
}

export function combineReactionScores(
  first?: ReactionScore[],
  second?: ReactionScore[]
): ReactionScore[] | undefined {
  const combinedReactions = first?.map((r) => {
    const innerReaction = second?.find((inner) => inner.reaction.id === r.reaction.id);
    return {
      reaction: r.reaction,
      count: r.count + (innerReaction ? innerReaction.count : 0),
    };
  });
  return combinedReactions;
}

export function debugReactions(): ReactionScore[] {
  return defaultReactions.map((reaction) => {
    return {
      reaction,
      count: 1335,
    };
  });
}

export function debugLocalReactions(): ReactionScore[] {
  return defaultReactions.map((reaction) => {
    return {
      reaction,
      count: 2,
    };
  });
}
