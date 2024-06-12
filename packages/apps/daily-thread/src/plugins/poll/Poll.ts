import type { Devvit } from '@devvit/public-api';
import { quickPolls } from './PollExamples.js';

export type Poll = {
  title: string;
  options: [string, number][];
  voted: boolean;
};

const pollOptionsKey = 'pollOptionsKeyTest2';
const pollResultsKey = 'pollResultsKeyTest2';
const pollUserVotedKey = 'pollUserVotedKey';

export async function initializePoll(postId: string, context: Devvit.Context): Promise<void> {
  const { redis } = context;
  const poll = quickPolls[Math.floor(Math.random() * quickPolls.length)];
  await redis.set(`${pollOptionsKey}:${postId}`, JSON.stringify(poll.options));
  await redis.del(`${pollResultsKey}:${postId}`);
}

export async function getPoll(context: Devvit.Context): Promise<Poll | undefined> {
  const { redis, postId, userId } = context;
  if (!postId || !userId) {
    return;
  }

  const poll = await redis.get(`${pollOptionsKey}:${postId}`);
  if (!poll) {
    return;
  }

  const results = await redis.hgetall(`${pollResultsKey}:${postId}`);
  const voted = await redis.get(`${pollUserVotedKey}:${postId}:${userId}`);
  // map poll options with results, default to 0
  const pollOptions: string[] = JSON.parse(poll);

  return {
    title: 'Poll of the day',
    options: pollOptions.map((option) => {
      const score = parseInt(results ? results[option] : '0');
      return [option, Number.isNaN(score) ? 0 : score];
    }),
    voted: !!voted,
  };
}

export async function vote(context: Devvit.Context, option: string): Promise<void> {
  const { redis, postId, userId } = context;
  if (!postId || !userId) {
    return;
  }
  await redis.set(`${pollUserVotedKey}:${postId}:${userId}`, 'true');
  await redis.hincrby(`${pollResultsKey}:${postId}`, option, 1);
}
