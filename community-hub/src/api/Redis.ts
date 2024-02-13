import { Devvit } from '@devvit/public-api';
import { TxClientLike } from '@devvit/public-api/apis/redis/RedisClient.js';
import { z } from 'zod';
import { Schema } from './Schema.js';

type CreateUpdateUpsertContext = {
  txn?: TxClientLike;
  /**
   * Used for createdAt/updatedAt if applicable
   */
  currentUserId?: string;
};

export class Redis {
  private redis: Devvit.Context['redis'];

  constructor(redis: Devvit.Context['redis']) {
    this.redis = redis;
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

  async configGet() {
    const maybeState = await this.redis.get(Redis.keys.config());

    if (!maybeState) {
      throw new Error(`Could not find config!`);
    }

    return Schema.configSchema.parseAsync(maybeState);
  }

  async configUpsert(
    params: z.input<typeof Schema.configSchema>,
    { context }: { context?: CreateUpdateUpsertContext } = {}
  ) {
    const client = context?.txn ?? this.redis;

    const oldConfig = await this.configGet().catch(() => {
      return null;
    });

    if (oldConfig == null) {
      console.log(`No config found, creating!`);

      const parsedParams = Schema.configSchema.parse(params);

      client.set(Redis.keys.config(), JSON.stringify(parsedParams));
    } else {
      const parsedParams = Schema.configSchema.parse(params);

      client.set(Redis.keys.config(), JSON.stringify({ ...oldConfig, ...parsedParams }));
    }
  }

  async pinPostGet(id: string) {
    const data = await this.redis.get(Redis.keys.pinPostInstance(id));

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
      params: z.input<(typeof Schema)['pinPostInstance']>;
      context?: CreateUpdateUpsertContext;
    }
  ) {
    const client = context?.txn ?? this.redis;
    const data = await this.redis.get(Redis.keys.pinPostInstance(id));

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
      params: Partial<z.input<(typeof Schema)['pinPostInstance']>>;
      context?: CreateUpdateUpsertContext;
    }
  ) {
    const client = context?.txn ?? this.redis;
    const data = await this.redis.get(Redis.keys.pinPostInstance(id));

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
      params: Partial<z.input<(typeof Schema)['pinPostInstance']>['pins'][number]>;
      context?: CreateUpdateUpsertContext;
    }
  ) {
    const client = context?.txn ?? this.redis;
    const data = await this.redis.get(Redis.keys.pinPostInstance(id));

    if (!data) {
      throw new Error(`Cannot find pin post instance for id: ${id}`);
    }

    const pinPost = await Schema.pinPostInstance.parseAsync(JSON.parse(data));

    const newPins = pinPost.pins.map((pin) => {
      // We don't want to allow people to update the id or type!
      const { id, type, ...paramsWithoutId } = params;

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
