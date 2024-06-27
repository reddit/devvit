import type { Devvit } from '@devvit/public-api';
import type { TxClient } from '@devvit/public-api/apis/redis/RedisClient.js';
import type { Config, PinPostInstance } from './Schema.js';
import { Schema } from './Schema.js';

type CreateUpdateUpsertContext = {
  txn?: TxClient;
  /**
   * Used for createdAt/updatedAt if applicable
   */
  currentUserId?: string;
};

export class Redis {
  #redis: Devvit.Context['redis'];

  constructor(redis: Devvit.Context['redis']) {
    this.#redis = redis;
  }

  static keys = {
    user(userId: string) {
      return `user:${userId}` as const;
    },
    config() {
      return `config` as const;
    },
    pinPostInstance(id: string) {
      return `pin_post_instance:${id}` as const;
    },
  };

  async configGet(): Promise<Config> {
    const maybeState = await this.#redis.get(Redis.keys.config());

    if (!maybeState) {
      throw new Error(`Could not find config!`);
    }

    return Schema.configSchema.parseAsync(maybeState);
  }

  // to-do: upsert should probably return a value.
  async configUpsert(
    params: Config,
    { context }: { context?: CreateUpdateUpsertContext } = {}
  ): Promise<void> {
    const client = context?.txn ?? this.#redis;

    const oldConfig = await this.configGet().catch(() => {
      return null;
    });

    if (oldConfig == null) {
      console.log(`No config found, creating!`);

      const parsedParams = Schema.configSchema.parse(params);

      await client.set(Redis.keys.config(), JSON.stringify(parsedParams));
    } else {
      const parsedParams = Schema.configSchema.parse(params);

      await client.set(Redis.keys.config(), JSON.stringify({ ...oldConfig, ...parsedParams }));
    }
  }

  async pinPostGet(id: string): Promise<PinPostInstance> {
    const data = await this.#redis.get(Redis.keys.pinPostInstance(id));

    if (!data) {
      throw new Error(`Cannot find PinPostInstance for id: ${id}!`);
    }

    return Schema.pinPostInstance.parse(JSON.parse(data));
  }

  async pinPostCreate(
    id: string,
    {
      params,
      context,
    }: {
      params: PinPostInstance;
      context?: CreateUpdateUpsertContext;
    }
  ): Promise<PinPostInstance> {
    const client = context?.txn ?? this.#redis;
    const data = await this.#redis.get(Redis.keys.pinPostInstance(id));

    if (data) {
      throw new Error(`Cannot create because pin post instance already exists for id: ${id}`);
    }

    const parsedParams = await Schema.pinPostInstance.parseAsync(params);

    await client.set(Redis.keys.pinPostInstance(id), JSON.stringify(parsedParams));

    return parsedParams;
  }

  /**
   * IMPORTANT! This is a shallow update, not a deep merge
   */
  async pinPostUpdate(
    id: string,
    {
      params,
      context,
    }: {
      params: Partial<PinPostInstance>;
      context?: CreateUpdateUpsertContext;
    }
  ): Promise<PinPostInstance> {
    const client = context?.txn ?? this.#redis;
    const data = await this.#redis.get(Redis.keys.pinPostInstance(id));

    if (!data) {
      throw new Error(`Cannot find pin post instance for id: ${id}`);
    }

    const parsedParams = await Schema.pinPostInstance.parseAsync({
      ...JSON.parse(data),
      ...params,
    });

    await client.set(Redis.keys.pinPostInstance(id), JSON.stringify(parsedParams));

    return parsedParams;
  }

  async pinPostPinUpdate(
    id: string,
    pinId: string,
    {
      params,
      context,
    }: {
      params: Partial<PinPostInstance['pins'][number]>;
      context?: CreateUpdateUpsertContext;
    }
  ): Promise<PinPostInstance> {
    const client = context?.txn ?? this.#redis;
    const data = await this.#redis.get(Redis.keys.pinPostInstance(id));

    if (!data) {
      throw new Error(`Cannot find pin post instance for id: ${id}`);
    }

    const pinPost = await Schema.pinPostInstance.parseAsync(JSON.parse(data));

    const newPins = pinPost.pins.map((pin) => {
      // We don't want to allow people to update the id or type!
      const { id: _, type, ...paramsWithoutId } = params;

      if (pin.id === pinId) {
        if (type && pin.type !== type) {
          console.warn(`Pin types cannot be changed once created!`);
        }

        return {
          ...pin,
          ...paramsWithoutId,
        };
      }

      return pin;
    });

    const parsedParams = await Schema.pinPostInstance.parseAsync({
      ...pinPost,
      pins: newPins,
    });

    await client.set(Redis.keys.pinPostInstance(id), JSON.stringify(parsedParams));

    return parsedParams;
  }
}
