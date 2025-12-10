import { redis } from '@devvit/redis';
import { expect } from 'vitest';

import { createDevvitTest } from './devvitTest.js';

const test = createDevvitTest();

test('can increment a number', async () => {
  await redis.incrBy('test', 1);
  const value = await redis.get('test');
  expect(value).toBe('1');
});

test('incrementing is cleared between tests', async () => {
  // Same key as above, but redis is cleared between tests
  await redis.incrBy('test', 1);
  const value = await redis.get('test');
  expect(value).toBe('1');
});

test.each([
  { input: 'A', expected: '1' },
  { input: 'B', expected: '1' },
])('.each() silos tests $input', async ({ expected }) => {
  await redis.incrBy('test', 1);
  const value = await redis.get('test');
  expect(value).toBe(expected);
});

test('global scope is distinct from local scope', async () => {
  await redis.global.set('key', 'global');
  await redis.set('key', 'local'); // default scope

  const globalVal = await redis.global.get('key');
  const localVal = await redis.get('key');

  expect(globalVal).toBe('global');
  expect(localVal).toBe('local');
});

test('transactions within devvitTest commit queued commands', async () => {
  await redis.set('txn', '0');
  const txn = await redis.watch('txn');
  await txn.multi();
  await txn.incrBy('txn', 4);
  await txn.incrBy('txn', 1);
  const results = await txn.exec();
  expect(results).toEqual([4, 5]);
  expect(await redis.get('txn')).toBe('5');
});

test('transactions can be discarded in devvitTest', async () => {
  const txn = await redis.watch('txn-discard');
  await txn.multi();
  await txn.set('txn-discard', 'pending');
  await txn.discard();
  expect(await redis.get('txn-discard')).toBeUndefined();
});
