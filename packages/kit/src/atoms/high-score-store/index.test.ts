import { describe, expect, it, vi } from 'vitest';
import { HighStoreStore } from './index.js';
import type { Context, TxClientLike } from '@devvit/public-api';

type TestScoreObject = { name: string; score: number };

describe('high-score-store', () => {
  const implementation = new HighStoreStore<TestScoreObject>('score');

  const getContextMock = (): [Pick<Context, 'redis'>, Partial<TxClientLike>] => {
    // We only use a few redis functions; just mock those out.
    const watchResult = {
      multi: vi.fn().mockName('redis.multi'),
      zAdd: vi.fn().mockName('redis.zAdd'),
      zRemRangeByRank: vi.fn().mockName('redis.zRemRangeByRank'),
      exec: vi.fn().mockName('redis.exec'),
    } satisfies Partial<TxClientLike>;

    return [
      {
        redis: {
          watch: vi.fn().mockName('redis.watch').mockReturnValue(watchResult),
        } as unknown as Pick<Context, 'redis'>['redis'],
      },
      watchResult,
    ];
  };

  it('should work as expected', async () => {
    const [context, watchResult] = getContextMock();
    const score = { name: 'Alice', score: 100 };
    await implementation.saveScore(context, score);
    expect(watchResult.zAdd).toHaveBeenCalledWith('high_score_store', {
      score: score.score,
      member: JSON.stringify(score),
    });
  });
});
