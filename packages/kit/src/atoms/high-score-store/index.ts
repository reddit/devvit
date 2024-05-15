import type { Context } from '@devvit/public-api';

export type HighStoreStoreConfig = {
  // This uses a redis key to store high scores.
  // Default: 'high_score_store'
  storeKey: string;
  // How many high scores to store.
  // Default: 10
  maxScores: number;
};
const CONFIG_DEFAULTS: HighStoreStoreConfig = {
  storeKey: 'high_score_store',
  maxScores: 10,
};

type KeysWithNumberValues<T> = {
  [K in keyof T]-?: T[K] extends number ? K : never;
}[keyof T];

export class HighStoreStore<T extends Record<KeysWithNumberValues<T>, number>> {
  readonly #config: HighStoreStoreConfig;
  readonly #scoreKey: KeysWithNumberValues<T>;

  constructor(scoreKey: KeysWithNumberValues<T>, config: Partial<HighStoreStoreConfig> = {}) {
    this.#scoreKey = scoreKey;
    this.#config = {
      ...CONFIG_DEFAULTS,
      ...config,
    };
  }

  async getScores(context: Pick<Context, 'redis'>): Promise<T[]> {
    const scores = await context.redis.zRange(this.#config.storeKey, 0, -1, { by: 'score' });
    if (!scores) {
      return [];
    }
    return scores.map((score) => JSON.parse(score.member));
  }

  async saveScore(context: Pick<Context, 'redis'>, score: T): Promise<void> {
    const tx = await context.redis.watch(); // TODO Fix this when the TXN API improves
    await tx.multi();
    await tx.zAdd(this.#config.storeKey, {
      score: score[this.#scoreKey],
      member: JSON.stringify(score),
    });
    await tx.zRemRangeByRank(this.#config.storeKey, 0, -this.#config.maxScores - 1);
    await tx.exec();
  }
}
