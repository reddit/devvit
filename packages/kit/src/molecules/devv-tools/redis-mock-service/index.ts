import type { RedisClient } from '@devvit/public-api';
import type {
  BasicRedisMethods,
  NonKeyRedisParams,
  RedisOverride,
  RedisSyncResponse,
  Unpacked,
} from './types.js';
import type { HandlerOverride } from '../types/internal.js';

export const createDevvRedis = (
  realRedis: RedisClient,
  overrides: RedisOverride[]
): RedisClient => {
  const override = createOverrideFactory(realRedis, overrides);
  return {
    get: override('get'),
    set: override('set'),
    type: override('type'),
    del: getDel(overrides, realRedis),

    mget: getMget(overrides, realRedis),
    mset: getMset(overrides, realRedis),

    // watch: override('watch'),

    getRange: override('getRange'),
    setRange: override('setRange'),
    strlen: override('strlen'),

    hget: override('hget'),
    hset: override('hset'),
    hdel: override('hdel'),
    hgetall: override('hgetall'),
    hkeys: override('hkeys'),
    hscan: override('hscan'),
    hincrby: override('hincrby'),

    incrBy: override('incrBy'),

    expire: override('expire'),
    expireTime: override('expireTime'),

    zAdd: override('zAdd'),
    zCard: override('zCard'),
    zRange: override('zRange'),
    zRem: override('zRem'),
    zScore: override('zScore'),
    zRank: override('zRank'),
    zIncrBy: override('zIncrBy'),
    zRemRangeByLex: override('zRemRangeByLex'),
    zRemRangeByRank: override('zRemRangeByRank'),
    zRemRangeByScore: override('zRemRangeByScore'),
    global: realRedis.global,
  } as RedisClient;
};

const createOverrideFactory = (realRedis: RedisClient, overrides: RedisOverride[]) =>
  function genericOverride<Method extends keyof BasicRedisMethods>(method: Method) {
    return (key: string, ...rest: NonKeyRedisParams<Method>) => {
      for (let i = 0; i < overrides.length; i++) {
        if (overrides[i].method === method && overrides[i].key === key) {
          return overrides[i].handler(...rest);
        }
      }
      // @ts-ignore
      return realRedis[method](key, ...rest);
    };
  };

function getDel(overrides: RedisOverride[], realRedis: RedisClient) {
  return async (...keys: string[]) => {
    const nonMockedKeys: string[] = [];
    keys.forEach((key) => {
      const matchingOverride = overrides.find((override) => {
        return override.method === 'del' && override.key === key;
      });
      if (matchingOverride) {
        matchingOverride.handler();
      } else {
        nonMockedKeys.push(key);
      }
    });

    if (nonMockedKeys.length) {
      await realRedis.del(...nonMockedKeys);
    }
  };
}

function getMset(overrides: RedisOverride[], realRedis: RedisClient) {
  return async (keyValues: { [key: string]: string }) => {
    const nonMockedKeyValues: Record<string, string> = {};
    const keys = Object.keys(keyValues);
    keys.forEach((key) => {
      const matchingOverride = overrides.find((override) => {
        return override.method === 'mset' && override.key === key;
      });
      if (matchingOverride) {
        matchingOverride.handler({ [key]: keyValues[key] });
      } else {
        nonMockedKeyValues[key] = keyValues[key];
      }
    });

    if (Object.keys(nonMockedKeyValues).length) {
      return await realRedis.mset(nonMockedKeyValues);
    }
  };
}

function getMget(overrides: RedisOverride[], realRedis: RedisClient) {
  return async (keys: string[]) => {
    const responses: Record<string, null | string> = {};
    const nonMockedKeys: string[] = [];
    keys.forEach((key) => {
      const matchingOverride = overrides.find((override) => {
        return override.method === 'mget' && override.key === key;
      });
      if (matchingOverride) {
        responses[key] = matchingOverride.handler();
      } else {
        nonMockedKeys.push(key);
      }
    });

    if (nonMockedKeys.length) {
      const realData = await realRedis.mget(nonMockedKeys);
      nonMockedKeys.forEach((key, index) => {
        responses[key] = realData[index];
      });
    }

    return keys.map((key) => responses[key]);
  };
}

function genericRedisHandler<Method extends keyof BasicRedisMethods>(method: Method) {
  return (
    key: string,
    handler: (...params: NonKeyRedisParams<Method>) => RedisSyncResponse<Method>
  ): RedisOverride => {
    return {
      __type: 'Redis',
      method: method,
      key,
      handler,
    };
  };
}

export const redisHandler = {
  get: genericRedisHandler('get'),
  set: genericRedisHandler('set'),
  del: (key: string, handler: () => RedisSyncResponse<'del'>): RedisOverride => {
    return {
      __type: 'Redis',
      method: 'del',
      key,
      handler,
    };
  },
  mget: (key: string, handler: () => Unpacked<RedisSyncResponse<'mget'>>): RedisOverride => {
    return {
      __type: 'Redis',
      method: 'mget',
      key,
      handler,
    };
  },
  mset: (key: string, handler: () => RedisSyncResponse<'mset'>): RedisOverride => {
    return {
      __type: 'Redis',
      method: 'mset',
      key,
      handler,
    };
  },
  type: genericRedisHandler('type'),
  getRange: genericRedisHandler('getRange'),
  setRange: genericRedisHandler('setRange'),
  strlen: genericRedisHandler('strlen'),
  hget: genericRedisHandler('hget'),
  hset: genericRedisHandler('hset'),
  hdel: genericRedisHandler('hdel'),
  hgetall: genericRedisHandler('hgetall'),
  hkeys: genericRedisHandler('hkeys'),
  hscan: genericRedisHandler('hscan'),
  hincrby: genericRedisHandler('hincrby'),
  incrBy: genericRedisHandler('incrBy'),
  expire: genericRedisHandler('expire'),
  expireTime: genericRedisHandler('expireTime'),
  zAdd: genericRedisHandler('zAdd'),
  zCard: genericRedisHandler('zCard'),
  zRange: genericRedisHandler('zRange'),
  zRem: genericRedisHandler('zRem'),
  zScore: genericRedisHandler('zScore'),
  zRank: genericRedisHandler('zRank'),
  zIncrBy: genericRedisHandler('zIncrBy'),
  zRemRangeByLex: genericRedisHandler('zRemRangeByLex'),
  zRemRangeByRank: genericRedisHandler('zRemRangeByRank'),
  zRemRangeByScore: genericRedisHandler('zRemRangeByScore'),
} as const;

export const isRedisHandler = (handler: HandlerOverride): handler is RedisOverride =>
  handler.__type === 'Redis';
