import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GetWithCacheRequest } from './index.js';
import { HttpCache } from './index.js';

describe('http-cache', () => {
  let fetchMock: Mock;
  const implementation = new HttpCache();

  const getContextMock = (): GetWithCacheRequest['context'] => ({
    redis: {
      // We only use a few redis functions; just mock those out.
      get: vi.fn().mockName('redis.get'),
      set: vi.fn().mockName('redis.set'),
      expire: vi.fn().mockName('redis.expire'),
    } as unknown as GetWithCacheRequest['context']['redis'],
  });

  beforeEach(() => {
    fetchMock = vi.fn().mockName('fetch');
    global.fetch = fetchMock;
  });

  it('should work as expected', async () => {
    const responseText = 'Response text';
    fetchMock.mockResolvedValueOnce(new Response(responseText, { status: 200 }));

    const context = getContextMock();
    const url = 'https://example.com/foo/bar';

    await implementation.getWithCache({ context, url });

    const expectedHashKey = `http_cache_${url}`;
    expect(context.redis.get).toHaveBeenCalledWith(expectedHashKey);
    expect(context.redis.set).toHaveBeenCalledWith(expectedHashKey, JSON.stringify(responseText));
    expect(context.redis.expire).toHaveBeenCalledWith(expectedHashKey, 60 * 60 * 24);
  });
});
