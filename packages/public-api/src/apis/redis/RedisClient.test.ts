import { Context, runWithContext } from '@devvit/server';
import { Header } from '@devvit/shared-types/Header.js';
import { expect, test, vi } from 'vitest';

import { redis } from './RedisClient.js';

const redisPlugin = vi.hoisted(() => ({
  MGet: vi.fn(),
  Watch: vi.fn(),
}));

vi.mock('@devvit/shared-types/server/get-devvit-config.js', () => ({
  getDevvitConfig: () => ({ use: () => redisPlugin }),
}));

test('deprecated strlen delegates to strLen', async () => {
  const strLen = vi.spyOn(redis, 'strLen').mockResolvedValue(1);

  await expect(redis.strlen('key')).resolves.toBe(1);
  expect(strLen).toHaveBeenCalledWith('key');
});

test('deprecated mget delegates to mGet', async () => {
  const mGet = vi.spyOn(redis, 'mGet').mockResolvedValue(['value']);

  await expect(redis.mget(['key'])).resolves.toEqual(['value']);
  expect(mGet).toHaveBeenCalledWith(['key']);
});

test('deprecated mset delegates to mSet', async () => {
  const mSet = vi.spyOn(redis, 'mSet').mockResolvedValue(undefined);

  await expect(redis.mset({ key: 'value' })).resolves.toBeUndefined();
  expect(mSet).toHaveBeenCalledWith({ key: 'value' });
});

test('deprecated hget delegates to hGet', async () => {
  const hGet = vi.spyOn(redis, 'hGet').mockResolvedValue('value');

  await expect(redis.hget('key', 'field')).resolves.toBe('value');
  expect(hGet).toHaveBeenCalledWith('key', 'field');
});

test('deprecated hset delegates to hSet', async () => {
  const hSet = vi.spyOn(redis, 'hSet').mockResolvedValue(1);

  await expect(redis.hset('key', { field: 'value' })).resolves.toBe(1);
  expect(hSet).toHaveBeenCalledWith('key', { field: 'value' });
});

test('deprecated hgetall delegates to hGetAll', async () => {
  const hGetAll = vi.spyOn(redis, 'hGetAll').mockResolvedValue({ field: 'value' });

  await expect(redis.hgetall('key')).resolves.toEqual({ field: 'value' });
  expect(hGetAll).toHaveBeenCalledWith('key');
});

test('deprecated hdel delegates to hDel', async () => {
  const hDel = vi.spyOn(redis, 'hDel').mockResolvedValue(1);

  await expect(redis.hdel('key', ['field'])).resolves.toBe(1);
  expect(hDel).toHaveBeenCalledWith('key', ['field']);
});

test('deprecated hscan delegates to hScan', async () => {
  const result = { cursor: 0, fieldValues: [] };
  const hScan = vi.spyOn(redis, 'hScan').mockResolvedValue(result);

  await expect(redis.hscan('key', 0)).resolves.toEqual(result);
  expect(hScan).toHaveBeenCalledWith('key', 0, undefined, undefined);
});

test('deprecated hkeys delegates to hKeys', async () => {
  const hKeys = vi.spyOn(redis, 'hKeys').mockResolvedValue(['field']);

  await expect(redis.hkeys('key')).resolves.toEqual(['field']);
  expect(hKeys).toHaveBeenCalledWith('key');
});

test('deprecated hincrby delegates to hIncrBy', async () => {
  const hIncrBy = vi.spyOn(redis, 'hIncrBy').mockResolvedValue(1);

  await expect(redis.hincrby('key', 'field', 1)).resolves.toBe(1);
  expect(hIncrBy).toHaveBeenCalledWith('key', 'field', 1);
});

test('deprecated hlen delegates to hLen', async () => {
  const hLen = vi.spyOn(redis, 'hLen').mockResolvedValue(1);

  await expect(redis.hlen('key')).resolves.toBe(1);
  expect(hLen).toHaveBeenCalledWith('key');
});

test('transaction clients preserve deprecated methods and chaining', async () => {
  const ctx = Context({
    [Header.AppUser]: 't2_appuser',
    [Header.Subreddit]: 't5_testsub',
    [Header.SubredditName]: 'testsub',
  });
  redisPlugin.Watch.mockResolvedValue({ id: 'transaction' });
  redisPlugin.MGet.mockResolvedValue({ values: [] });

  await runWithContext(ctx, async () => {
    const compatibleTransaction = await redis.watch('key');
    const chainedTransaction = await compatibleTransaction.mGet(['key']);

    await expect(chainedTransaction.mget(['key'])).resolves.toBe(compatibleTransaction);
  });
  expect(redisPlugin.MGet).toHaveBeenCalledWith(
    { keys: ['key'], transactionId: { id: 'transaction' } },
    ctx.metadata
  );
});

test('global clients preserve deprecated methods and identity', async () => {
  const strLen = vi.spyOn(redis.global, 'strLen').mockResolvedValue(1);

  expect(redis.global).toBe(redis.global);
  await expect(redis.global.strlen('key')).resolves.toBe(1);
  expect(strLen).toHaveBeenCalledWith('key');
});
