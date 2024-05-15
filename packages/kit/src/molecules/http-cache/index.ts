import type { Context } from '@devvit/public-api';

export type CacheConfig = {
  // This uses redis keys to store cache values, formatted as `${cacheKeyPrefix}_${url}`
  // Default: 'http_cache'
  cacheKeyPrefix: string;
  // How long to keep something in cache, in seconds.
  // Default: 60 * 60 * 24 (= 1 day)
  ageOffSecs: number;
};
const CACHE_DEFAULTS: CacheConfig = {
  cacheKeyPrefix: 'http_cache',
  ageOffSecs: 60 * 60 * 24, // 1 day
};

export type GetWithCacheRequest = {
  // Reference to the current context that Devvit is running off of. (We only use the redis
  // property from it though.)
  context: Pick<Context, 'redis'>;
  // What URL to GET
  url: string;
  // What type of response to expect - default is 'text'. This is the name of the method to call on
  // the response object to get the response data.
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
  // If you have any custom request init options, you can pass them here - they're passed directly
  // to fetch, but the method is always 'GET'.
  init?: Omit<RequestInit, 'method'>;
  // If you want to override the cache config for this request, you can do so here.
  cacheOverrides?: Partial<CacheConfig>;
};

/**
 * A simple HTTP cache that uses Redis to store the cache values. This is useful for caching GET
 * requests to external services that don't have their own caching. If you need to cache other
 * types of requests, or you want to cache response headers, you'll need to use a more complex
 * caching solution - check out [context.cache]{@link @devvit/public-api#Context.cache} for a
 * more flexible (and slightly more complex) solution.
 */
export class HttpCache {
  readonly #defaultConfig: CacheConfig;

  constructor(cacheConfig: Partial<CacheConfig> = {}) {
    this.#defaultConfig = {
      ...CACHE_DEFAULTS,
      ...cacheConfig,
    };
  }

  async getWithCache(request: GetWithCacheRequest): Promise<Response> {
    const { context, url } = request;
    const responseType = request.responseType ?? 'text';
    const init: RequestInit = {
      ...(request.init ?? {}),
      method: 'GET',
    };
    const config = {
      ...this.#defaultConfig,
      ...(request.cacheOverrides ?? {}),
    };
    const key = this.#formatKey(config.cacheKeyPrefix, url);

    const cachedValue = await context.redis.get(key);
    if (cachedValue) {
      // Cache hit - return it!
      return new Response(JSON.parse(cachedValue), { status: 200 });
    }

    // Cache miss - try and fetch it
    const response = await fetch(url, init);
    if (response.ok) {
      // If the response was okay, get the response, and save the value in the cache
      const data = await response[responseType]();
      await context.redis.set(key, JSON.stringify(data));
      await context.redis.expire(key, config.ageOffSecs);
    }

    return response;
  }

  // Why do this instead of an hkey? Because this lets us set the expiration on the key!
  #formatKey(prefix: string, url: string): string {
    return `${prefix}_${url}`;
  }
}
