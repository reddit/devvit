import { gzipSync } from 'node:zlib';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { redis } from './RedisClient.js';
import { REDIS_COMPRESSION_PREFIX, redisCompressed } from './redisCompression.js';

vi.mock('./RedisClient.js', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    hGet: vi.fn(),
    hSet: vi.fn(),
    hSetNX: vi.fn(),
    hGetAll: vi.fn(),
    hMGet: vi.fn(),
    mGet: vi.fn(),
    mSet: vi.fn(),
    del: vi.fn(),
    incrBy: vi.fn(),
  },
}));

describe('redisCompressed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const LONG_STRING = 'a'.repeat(1000);
  const SHORT_STRING = 'short string';

  const compress = (val: string) => {
    const compressed = gzipSync(val);
    return `${REDIS_COMPRESSION_PREFIX}${compressed.toString('base64')}`;
  };

  test('compression logic: does not compress uncompressible data if size increases', async () => {
    // Create a random string that likely won't compress well
    const randomString = Array.from({ length: 100 }, () =>
      Math.random().toString(36).substring(2)
    ).join('');

    // We rely on the internal implementation details here a bit, but we want to ensure
    // we don't store larger data
    await redisCompressed.set('key', randomString);

    // The mock should have received the original string if compression wasn't beneficial
    const calls = vi.mocked(redis.set).mock.calls;
    expect(calls.length).toBe(1);
    const storedValue = calls[0][1];

    // We expect the stored value to be the smaller of the two.
    // If gzip+base64 made it larger, it should be original.
    const manualCompressed = compress(randomString);
    const expected =
      manualCompressed.length < randomString.length ? manualCompressed : randomString;

    expect(storedValue).toBe(expected);
  });

  test('decompression logic: returns original value if decompression fails', async () => {
    const corruptedValue = `${REDIS_COMPRESSION_PREFIX}not-valid-base64-or-gzip`;
    vi.mocked(redis.get).mockResolvedValue(corruptedValue);

    const result = await redisCompressed.get('key');
    // Should return the raw value instead of crashing
    expect(result).toBe(corruptedValue);
  });

  test('get: returns uncompressed value as is', async () => {
    vi.mocked(redis.get).mockResolvedValue(SHORT_STRING);
    const result = await redisCompressed.get('key');
    expect(result).toBe(SHORT_STRING);
    expect(redis.get).toHaveBeenCalledWith('key');
  });

  test('get: decompresses compressed value', async () => {
    const compressed = compress(LONG_STRING);
    vi.mocked(redis.get).mockResolvedValue(compressed);
    const result = await redisCompressed.get('key');
    expect(result).toBe(LONG_STRING);
    expect(redis.get).toHaveBeenCalledWith('key');
  });

  test('get: handles null/undefined', async () => {
    vi.mocked(redis.get).mockResolvedValue(undefined);
    const result = await redisCompressed.get('key');
    expect(result).toBeUndefined();
  });

  test('set: compresses long strings', async () => {
    await redisCompressed.set('key', LONG_STRING);
    const expectedCompressed = compress(LONG_STRING);
    expect(redis.set).toHaveBeenCalledWith('key', expectedCompressed, undefined);
  });

  test('set: skips compression for short strings', async () => {
    await redisCompressed.set('key', SHORT_STRING);
    expect(redis.set).toHaveBeenCalledWith('key', SHORT_STRING, undefined);
  });

  test('set: passes options', async () => {
    const opts = { nx: true };
    await redisCompressed.set('key', SHORT_STRING, opts);
    expect(redis.set).toHaveBeenCalledWith('key', SHORT_STRING, opts);
  });

  test('hGet: returns uncompressed value as is', async () => {
    vi.mocked(redis.hGet).mockResolvedValue(SHORT_STRING);
    const result = await redisCompressed.hGet('key', 'field');
    expect(result).toBe(SHORT_STRING);
  });

  test('hGet: decompresses compressed value', async () => {
    const compressed = compress(LONG_STRING);
    vi.mocked(redis.hGet).mockResolvedValue(compressed);
    const result = await redisCompressed.hGet('key', 'field');
    expect(result).toBe(LONG_STRING);
  });

  test('hSet: compresses long strings in field values', async () => {
    await redisCompressed.hSet('key', { field1: LONG_STRING, field2: SHORT_STRING });

    const expectedCompressed = compress(LONG_STRING);
    expect(redis.hSet).toHaveBeenCalledWith('key', {
      field1: expectedCompressed,
      field2: SHORT_STRING,
    });
  });

  test('hSetNX: compresses long string value', async () => {
    await redisCompressed.hSetNX('key', 'field', LONG_STRING);
    const expectedCompressed = compress(LONG_STRING);
    expect(redis.hSetNX).toHaveBeenCalledWith('key', 'field', expectedCompressed);
  });

  test('hSetNX: does not compress short string value', async () => {
    await redisCompressed.hSetNX('key', 'field', SHORT_STRING);
    expect(redis.hSetNX).toHaveBeenCalledWith('key', 'field', SHORT_STRING);
  });

  test('hGetAll: decompresses values in hash', async () => {
    const compressed = compress(LONG_STRING);
    vi.mocked(redis.hGetAll).mockResolvedValue({
      field1: compressed,
      field2: SHORT_STRING,
    });

    const result = await redisCompressed.hGetAll('key');
    expect(result).toEqual({
      field1: LONG_STRING,
      field2: SHORT_STRING,
    });
  });

  test('hMGet: decompresses values in list', async () => {
    const compressed = compress(LONG_STRING);
    vi.mocked(redis.hMGet).mockResolvedValue([compressed, SHORT_STRING, null]);

    const result = await redisCompressed.hMGet('key', ['f1', 'f2', 'f3']);
    expect(result).toEqual([LONG_STRING, SHORT_STRING, null]);
  });

  test('mGet: decompresses values in list', async () => {
    const compressed = compress(LONG_STRING);
    vi.mocked(redis.mGet).mockResolvedValue([compressed, SHORT_STRING, null]);

    const result = await redisCompressed.mGet(['k1', 'k2', 'k3']);
    expect(result).toEqual([LONG_STRING, SHORT_STRING, null]);
  });

  test('mSet: compresses long values', async () => {
    await redisCompressed.mSet({ k1: LONG_STRING, k2: SHORT_STRING });
    const expectedCompressed = compress(LONG_STRING);
    expect(redis.mSet).toHaveBeenCalledWith({
      k1: expectedCompressed,
      k2: SHORT_STRING,
    });
  });

  test('passthrough: passes through other methods', async () => {
    await redisCompressed.del('key');
    expect(redis.del).toHaveBeenCalledWith('key');
  });
});
