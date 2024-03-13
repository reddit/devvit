import type { RedisClient } from '@devvit/public-api';

export type Reaction = {
  id: string;
  name: string;
  url: string;
};

export type ReactionScore = {
  reaction: Reaction;
  count: number;
  eventId?: string;
};

function reactionsHashKey(postId: string, eventId: string): string {
  return `${postId}:${eventId}:reactions`;
}

export async function incrementReaction(
  reaction: Reaction,
  value: number,
  redis: RedisClient,
  postId?: string,
  eventId?: string
): Promise<void> {
  if (!postId || !eventId) {
    return;
  }
  const key = reactionsHashKey(postId, eventId);
  await redis.hincrby(key, reaction.id, value);
}

export async function configurePostWithAvailableReactions(
  postId: string,
  redis: RedisClient,
  reactions?: Reaction[]
): Promise<void> {
  if (!reactions) {
    return;
  }
  const key = `${postId}:reactions`;
  await redis.set(key, JSON.stringify(reactions));
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
  eventId?: string,
  sport?: string
): Promise<ReactionScore[]> {
  if (!postId || !eventId) {
    return [];
  }
  const isBasketball = sport === `basketball`;
  const reactions = await getAvailableReactions(redis, postId);
  const scores = await redis.hgetall(reactionsHashKey(postId, eventId));
  return reactions.map((reaction) => {
    const scoreValue = scores ? scores[reaction.id] : '0';
    const score = scoreValue ? parseInt(scoreValue) : 0;
    return { reaction: reaction, count: score, eventId: isBasketball ? eventId : undefined };
  });
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

export function friendlyNumber(num: number): string {
  if (!Number.isFinite(num) || num < 0) {
    return '0'; // Input validation for non-negative numbers
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
  second?: ReactionScore[],
  sport?: string
): ReactionScore[] | undefined {
  const isBasketball = sport === `basketball`;
  return first?.map((r) => {
    const innerReaction = second?.find(
      (inner) => inner.reaction.id === r.reaction.id && inner.eventId === r.eventId
    );
    return {
      reaction: r.reaction,
      count: r.count + (innerReaction ? innerReaction.count : 0),
      eventId: isBasketball ? r.eventId : undefined,
    };
  });
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
