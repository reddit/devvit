import {
  BitfieldOverflowBehavior,
  BitfieldRequest,
  ExpireRequest,
  HDelRequest,
  HGetRequest,
  HIncrByRequest,
  HMGetRequest,
  HScanRequest,
  HSetNXRequest,
  HSetRequest,
  IncrByRequest,
  KeyRangeRequest,
  KeyRequest,
  KeysRequest,
  KeyValuesRequest,
  RenameRequest,
  SetRangeRequest,
  SetRequest,
  WatchRequest,
  ZAddRequest,
  ZIncrByRequest,
  ZRangeRequest,
  ZRankRequest,
  ZRemRangeByLexRequest,
  ZRemRangeByRankRequest,
  ZRemRangeByScoreRequest,
  ZRemRequest,
  ZScanRequest,
  ZScoreRequest,
} from '@devvit/protos/types/devvit/plugin/redis/redisapi.js';
import { Redis } from 'ioredis';
import { RedisMemoryServer } from 'redis-memory-server';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { RedisMock } from './RedisMock.js';

describe('RedisMock', () => {
  let redisServer: RedisMemoryServer;
  let conn: Redis;
  let redis: RedisMock;

  beforeAll(async () => {
    redisServer = new RedisMemoryServer();
    const host = await redisServer.getHost();
    const port = await redisServer.getPort();
    conn = new Redis({ host, port });
  });

  afterAll(async () => {
    conn.disconnect();
    await redisServer.stop();
  });

  beforeEach(async () => {
    redis = new RedisMock(conn);
    await redis.clear();
  });

  describe('Key-Value Operations', () => {
    it('should set and get a value', async () => {
      await redis.plugin.Set(SetRequest.create({ key: 'foo', value: 'bar' }));
      const res = await redis.plugin.Get(KeyRequest.create({ key: 'foo' }));
      expect(res.value).toBe('bar');
    });

    it('should handle missing values', async () => {
      const res = await redis.plugin.Get(KeyRequest.create({ key: 'missing' }));
      expect(res.value).toBe('');
    });

    it('should handle throw-redis-nil header', async () => {
      // This mocks the behavior when the client requests throwing on nil
      await expect(
        redis.plugin.Get(KeyRequest.create({ key: 'missing' }), {
          'throw-redis-nil': { values: ['true'] },
        })
      ).rejects.toThrow('redis: nil');
    });

    it('should get bytes', async () => {
      await redis.plugin.Set(SetRequest.create({ key: 'foo', value: 'bar' }));
      const res = await redis.plugin.GetBytes(KeyRequest.create({ key: 'foo' }));
      expect(res.value).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(res.value)).toBe('bar');
    });

    it('should check existence', async () => {
      await redis.plugin.Set(SetRequest.create({ key: 'foo', value: 'bar' }));
      const res = await redis.plugin.Exists(KeysRequest.create({ keys: ['foo', 'missing'] }));
      expect(res.existingKeys).toBe(1);
    });

    it('should delete keys', async () => {
      await redis.plugin.Set(SetRequest.create({ key: 'foo', value: 'bar' }));
      const delRes = await redis.plugin.Del(KeysRequest.create({ keys: ['foo'] }));
      expect(delRes.value).toBe(1);
      const getRes = await redis.plugin.Get(KeyRequest.create({ key: 'foo' }));
      expect(getRes.value).toBe('');
    });

    it('should get type', async () => {
      await redis.plugin.Set(SetRequest.create({ key: 'foo', value: 'bar' }));
      const res = await redis.plugin.Type(KeyRequest.create({ key: 'foo' }));
      expect(res.value).toBe('string');
    });

    it('should rename keys', async () => {
      await redis.plugin.Set(SetRequest.create({ key: 'foo', value: 'bar' }));
      await redis.plugin.Rename(RenameRequest.create({ key: 'foo', newKey: 'baz' }));
      const oldRes = await redis.plugin.Get(KeyRequest.create({ key: 'foo' }));
      expect(oldRes.value).toBe('');
      const newRes = await redis.plugin.Get(KeyRequest.create({ key: 'baz' }));
      expect(newRes.value).toBe('bar');
    });

    it('should handle Set NX (Not Exists)', async () => {
      await redis.plugin.Set(SetRequest.create({ key: 'foo', value: 'bar' }));
      const res1 = await redis.plugin.Set(
        SetRequest.create({ key: 'foo', value: 'baz', nx: true })
      );
      expect(res1.value).toBe(''); // Returns empty string for failed NX (nil)
    });

    it('should handle Set options correctly', async () => {
      // Basic Set
      await redis.plugin.Set(SetRequest.create({ key: 'foo', value: 'bar' }));
      expect((await redis.plugin.Get(KeyRequest.create({ key: 'foo' }))).value).toBe('bar');

      // Expiration
      await redis.plugin.Set(SetRequest.create({ key: 'exp', value: 'val', expiration: 100 }));
      expect((await redis.plugin.Get(KeyRequest.create({ key: 'exp' }))).value).toBe('val');
    });

    it('should set values when NX succeeds', async () => {
      const res = await redis.plugin.Set(
        SetRequest.create({ key: 'nx-success', value: 'one', nx: true })
      );
      expect(res.value).toBe('OK');
      expect((await redis.plugin.Get(KeyRequest.create({ key: 'nx-success' }))).value).toBe('one');
    });

    it('should only set values when XX precondition is met', async () => {
      const miss = await redis.plugin.Set(
        SetRequest.create({ key: 'xx-key', value: 'no-op', xx: true })
      );
      expect(miss.value).toBe('');

      await redis.plugin.Set(SetRequest.create({ key: 'xx-key', value: 'seed' }));
      const hit = await redis.plugin.Set(
        SetRequest.create({ key: 'xx-key', value: 'updated', xx: true })
      );
      expect(hit.value).toBe('OK');
      expect((await redis.plugin.Get(KeyRequest.create({ key: 'xx-key' }))).value).toBe('updated');
    });

    it('should reject when NX and XX are both enabled', async () => {
      await expect(
        redis.plugin.Set(SetRequest.create({ key: 'invalid', value: 'boom', nx: true, xx: true }))
      ).rejects.toThrow('invalid Set');
    });

    it('should return empty bytes for missing keys and respect throw-on-nil header', async () => {
      const res = await redis.plugin.GetBytes(KeyRequest.create({ key: 'missing-bytes' }));
      expect(res.value).toBeInstanceOf(Uint8Array);
      expect(res.value).toHaveLength(0);

      await expect(
        redis.plugin.GetBytes(KeyRequest.create({ key: 'missing-bytes' }), {
          'throw-redis-nil': { values: ['true'] },
        })
      ).rejects.toThrow('redis: nil');
    });
  });

  describe('Number Operations', () => {
    it('should increment values', async () => {
      await redis.plugin.Set(SetRequest.create({ key: 'count', value: '10' }));
      const res = await redis.plugin.IncrBy(IncrByRequest.create({ key: 'count', value: 5 }));
      expect(res.value).toBe(15);
      const getRes = await redis.plugin.Get(KeyRequest.create({ key: 'count' }));
      expect(getRes.value).toBe('15');
    });
  });

  describe('Hash Operations', () => {
    it('should set and get hash fields', async () => {
      await redis.plugin.HSet(
        HSetRequest.create({ key: 'myhash', fv: [{ field: 'f1', value: 'v1' }] })
      );
      const res = await redis.plugin.HGet(HGetRequest.create({ key: 'myhash', field: 'f1' }));
      expect(res.value).toBe('v1');
    });

    it('should get multiple fields', async () => {
      await redis.plugin.HSet(
        HSetRequest.create({
          key: 'myhash',
          fv: [
            { field: 'f1', value: 'v1' },
            { field: 'f2', value: 'v2' },
          ],
        })
      );
      const res = await redis.plugin.HMGet(
        HMGetRequest.create({ key: 'myhash', fields: ['f1', 'f2', 'missing'] })
      );
      expect(res.values).toEqual(['v1', 'v2', '']);
    });

    it('should get all fields', async () => {
      await redis.plugin.HSet(
        HSetRequest.create({
          key: 'myhash',
          fv: [
            { field: 'f1', value: 'v1' },
            { field: 'f2', value: 'v2' },
          ],
        })
      );
      const res = await redis.plugin.HGetAll(KeyRequest.create({ key: 'myhash' }));
      expect(res.fieldValues).toEqual({ f1: 'v1', f2: 'v2' });
    });

    it('should delete fields', async () => {
      await redis.plugin.HSet(
        HSetRequest.create({ key: 'myhash', fv: [{ field: 'f1', value: 'v1' }] })
      );
      const res = await redis.plugin.HDel(HDelRequest.create({ key: 'myhash', fields: ['f1'] }));
      expect(res.value).toBe(1);
      const check = await redis.plugin.HGet(HGetRequest.create({ key: 'myhash', field: 'f1' }));
      expect(check.value).toBe('');
    });

    it('should scan hash', async () => {
      await redis.plugin.HSet(
        HSetRequest.create({
          key: 'myhash',
          fv: [
            { field: 'f1', value: 'v1' },
            { field: 'f2', value: 'v2' },
          ],
        })
      );
      const res = await redis.plugin.HScan(
        HScanRequest.create({ key: 'myhash', cursor: 0, count: 10 })
      );
      expect(res.fieldValues).toHaveLength(2);
      expect(res.fieldValues).toContainEqual({ field: 'f1', value: 'v1' });
      expect(res.fieldValues).toContainEqual({ field: 'f2', value: 'v2' });
    });

    it('should filter HScan results with patterns', async () => {
      await redis.plugin.HSet(
        HSetRequest.create({
          key: 'pattern-hash',
          fv: [
            { field: 'alpha', value: '1' },
            { field: 'beta', value: '2' },
            { field: 'bravo', value: '3' },
          ],
        })
      );
      const res = await redis.plugin.HScan(
        HScanRequest.create({ key: 'pattern-hash', cursor: 0, pattern: 'b*', count: 10 })
      );
      expect(res.fieldValues).toHaveLength(2);
      expect(res.fieldValues.map((fv) => fv.field).sort()).toEqual(['beta', 'bravo']);
    });

    it('should get hash keys', async () => {
      await redis.plugin.HSet(
        HSetRequest.create({ key: 'myhash', fv: [{ field: 'f1', value: 'v1' }] })
      );
      const res = await redis.plugin.HKeys(KeyRequest.create({ key: 'myhash' }));
      expect(res.keys).toEqual(['f1']);
    });

    it('should increment hash field', async () => {
      await redis.plugin.HSet(
        HSetRequest.create({ key: 'myhash', fv: [{ field: 'count', value: '10' }] })
      );
      const res = await redis.plugin.HIncrBy(
        HIncrByRequest.create({ key: 'myhash', field: 'count', value: 5 })
      );
      expect(res.value).toBe(15);
    });

    it('should get hash length', async () => {
      await redis.plugin.HSet(
        HSetRequest.create({
          key: 'myhash',
          fv: [
            { field: 'f1', value: 'v1' },
            { field: 'f2', value: 'v2' },
          ],
        })
      );
      const res = await redis.plugin.HLen(KeyRequest.create({ key: 'myhash' }));
      expect(res.value).toBe(2);
    });

    it('should set hash field if not exists', async () => {
      await redis.plugin.HSet(
        HSetRequest.create({ key: 'myhash', fv: [{ field: 'f1', value: 'v1' }] })
      );
      const res1 = await redis.plugin.HSetNX(
        HSetNXRequest.create({ key: 'myhash', field: 'f1', value: 'new' })
      );
      expect(res1.success).toBe(0);
      const res2 = await redis.plugin.HSetNX(
        HSetNXRequest.create({ key: 'myhash', field: 'f2', value: 'v2' })
      );
      expect(res2.success).toBe(1);
    });

    it('should throw on missing hash fields when requested', async () => {
      await redis.plugin.HSet(
        HSetRequest.create({ key: 'throw-hash', fv: [{ field: 'exists', value: '1' }] })
      );
      await expect(
        redis.plugin.HGet(HGetRequest.create({ key: 'throw-hash', field: 'missing' }), {
          'throw-redis-nil': { values: ['true'] },
        })
      ).rejects.toThrow('redis: nil');
    });
  });

  describe('String Operations', () => {
    it('should get and set ranges', async () => {
      await redis.plugin.Set(SetRequest.create({ key: 's', value: 'Hello World' }));
      const range = await redis.plugin.GetRange(
        KeyRangeRequest.create({ key: 's', start: 0, end: 4 })
      );
      expect(range.value).toBe('Hello');

      const len = await redis.plugin.SetRange(
        SetRangeRequest.create({ key: 's', offset: 6, value: 'Redis' })
      );
      expect(len.value).toBe(11);
      const full = await redis.plugin.Get(KeyRequest.create({ key: 's' }));
      expect(full.value).toBe('Hello Redis');
    });

    it('should get string length', async () => {
      await redis.plugin.Set(SetRequest.create({ key: 's', value: 'Hello' }));
      const len = await redis.plugin.Strlen(KeyRequest.create({ key: 's' }));
      expect(len.value).toBe(5);
    });
  });

  describe('Batch Operations', () => {
    it('should mset and mget', async () => {
      await redis.plugin.MSet(
        KeyValuesRequest.create({
          kv: [
            { key: 'k1', value: 'v1' },
            { key: 'k2', value: 'v2' },
          ],
        })
      );
      const res = await redis.plugin.MGet(KeysRequest.create({ keys: ['k1', 'k2', 'k3'] }));
      expect(res.values).toEqual(['v1', 'v2', '']);
    });
  });

  describe('Expiration Operations', () => {
    it('should expire keys', async () => {
      await redis.plugin.Set(SetRequest.create({ key: 'temp', value: 'val' }));
      await redis.plugin.Expire(ExpireRequest.create({ key: 'temp', seconds: 100 }));
      const ttl = await redis.plugin.ExpireTime(KeyRequest.create({ key: 'temp' }));
      expect(ttl.value).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe('Sorted Set Operations', () => {
    it('should add and score members', async () => {
      await redis.plugin.ZAdd(
        ZAddRequest.create({
          key: 'zset',
          members: [
            { member: 'm1', score: 1 },
            { member: 'm2', score: 2 },
          ],
        })
      );
      const score = await redis.plugin.ZScore(
        ZScoreRequest.create({ key: KeyRequest.create({ key: 'zset' }), member: 'm1' })
      );
      expect(score.value).toBe(1);
      const card = await redis.plugin.ZCard(KeyRequest.create({ key: 'zset' }));
      expect(card.value).toBe(2);
    });

    it('should range by score/rank', async () => {
      await redis.plugin.ZAdd(
        ZAddRequest.create({
          key: 'zset',
          members: [
            { member: 'm1', score: 1 },
            { member: 'm2', score: 2 },
            { member: 'm3', score: 3 },
          ],
        })
      );

      const range = await redis.plugin.ZRange(
        ZRangeRequest.create({
          key: KeyRequest.create({ key: 'zset' }),
          start: '0',
          stop: '-1',
        })
      );
      expect(range.members.map((m) => m.member)).toEqual(['m1', 'm2', 'm3']);

      const revRange = await redis.plugin.ZRange(
        ZRangeRequest.create({
          key: KeyRequest.create({ key: 'zset' }),
          start: '0',
          stop: '-1',
          rev: true,
        })
      );
      expect(revRange.members.map((m) => m.member)).toEqual(['m3', 'm2', 'm1']);
    });

    it('should remove members', async () => {
      await redis.plugin.ZAdd(
        ZAddRequest.create({ key: 'zset', members: [{ member: 'm1', score: 1 }] })
      );
      const res = await redis.plugin.ZRem(
        ZRemRequest.create({ key: KeyRequest.create({ key: 'zset' }), members: ['m1'] })
      );
      expect(res.value).toBe(1);
    });

    it('should rank members', async () => {
      await redis.plugin.ZAdd(
        ZAddRequest.create({
          key: 'zset',
          members: [
            { member: 'm1', score: 1 },
            { member: 'm2', score: 2 },
          ],
        })
      );
      const rank = await redis.plugin.ZRank(
        ZRankRequest.create({ key: KeyRequest.create({ key: 'zset' }), member: 'm2' })
      );
      expect(rank.value).toBe(1); // 0-based
    });

    it('should increment score', async () => {
      await redis.plugin.ZAdd(
        ZAddRequest.create({ key: 'zset', members: [{ member: 'm1', score: 1 }] })
      );
      const res = await redis.plugin.ZIncrBy(
        ZIncrByRequest.create({ key: 'zset', member: 'm1', value: 2.5 })
      );
      expect(res.value).toBe(3.5);
    });

    it('should paginate score-based ranges in both directions', async () => {
      await redis.plugin.ZAdd(
        ZAddRequest.create({
          key: 'score-range',
          members: [
            { member: 'a', score: 1 },
            { member: 'b', score: 2 },
            { member: 'c', score: 3 },
            { member: 'd', score: 4 },
            { member: 'e', score: 5 },
          ],
        })
      );

      const forward = await redis.plugin.ZRange(
        ZRangeRequest.create({
          key: KeyRequest.create({ key: 'score-range' }),
          start: '1',
          stop: '5',
          byScore: true,
          offset: 1,
          count: 2,
        })
      );
      expect(forward.members.map((m) => m.member)).toEqual(['b', 'c']);

      const reverse = await redis.plugin.ZRange(
        ZRangeRequest.create({
          key: KeyRequest.create({ key: 'score-range' }),
          start: '1',
          stop: '5',
          byScore: true,
          rev: true,
          offset: 1,
          count: 2,
        })
      );
      expect(reverse.members.map((m) => m.member)).toEqual(['d', 'c']);
    });

    it('should support lexicographical ranges with limits', async () => {
      await redis.plugin.ZAdd(
        ZAddRequest.create({
          key: 'lex-range',
          members: [
            { member: 'alpha', score: 0 },
            { member: 'beta', score: 0 },
            { member: 'carrot', score: 0 },
            { member: 'delta', score: 0 },
            { member: 'echo', score: 0 },
          ],
        })
      );

      const asc = await redis.plugin.ZRange(
        ZRangeRequest.create({
          key: KeyRequest.create({ key: 'lex-range' }),
          start: '[beta',
          stop: '[delta',
          byLex: true,
          offset: 1,
          count: 2,
        })
      );
      expect(asc.members.map((m) => m.member)).toEqual(['carrot', 'delta']);

      const desc = await redis.plugin.ZRange(
        ZRangeRequest.create({
          key: KeyRequest.create({ key: 'lex-range' }),
          start: '[delta',
          stop: '[alpha',
          byLex: true,
          rev: true,
          offset: 0,
          count: 2,
        })
      );
      expect(desc.members.map((m) => m.member)).toEqual(['delta', 'carrot']);
    });

    it('should respect rank offsets and counts', async () => {
      await redis.plugin.ZAdd(
        ZAddRequest.create({
          key: 'rank-range',
          members: [
            { member: 'one', score: 1 },
            { member: 'two', score: 2 },
            { member: 'three', score: 3 },
            { member: 'four', score: 4 },
            { member: 'five', score: 5 },
          ],
        })
      );

      const offsetOnly = await redis.plugin.ZRange(
        ZRangeRequest.create({
          key: KeyRequest.create({ key: 'rank-range' }),
          start: '0',
          stop: '4',
          offset: 2,
        })
      );
      expect(offsetOnly.members.map((m) => m.member)).toEqual(['three', 'four', 'five']);

      const reverseLimited = await redis.plugin.ZRange(
        ZRangeRequest.create({
          key: KeyRequest.create({ key: 'rank-range' }),
          start: '0',
          stop: '4',
          rev: true,
          offset: 1,
          count: 2,
        })
      );
      expect(reverseLimited.members.map((m) => m.member)).toEqual(['four', 'three']);
    });

    it('should remove members by lex range', async () => {
      await redis.plugin.ZAdd(
        ZAddRequest.create({
          key: 'remove-lex',
          members: [
            { member: 'ant', score: 0 },
            { member: 'bird', score: 0 },
            { member: 'cat', score: 0 },
          ],
        })
      );
      const removed = await redis.plugin.ZRemRangeByLex(
        ZRemRangeByLexRequest.create({
          key: KeyRequest.create({ key: 'remove-lex' }),
          min: '[bird',
          max: '[cat',
        })
      );
      expect(removed.value).toBe(2);
      const remaining = await redis.plugin.ZRange(
        ZRangeRequest.create({
          key: KeyRequest.create({ key: 'remove-lex' }),
          start: '0',
          stop: '-1',
        })
      );
      expect(remaining.members.map((m) => m.member)).toEqual(['ant']);
    });

    it('should remove members by rank range', async () => {
      await redis.plugin.ZAdd(
        ZAddRequest.create({
          key: 'remove-rank',
          members: [
            { member: 'aa', score: 1 },
            { member: 'bb', score: 2 },
            { member: 'cc', score: 3 },
            { member: 'dd', score: 4 },
          ],
        })
      );
      const removed = await redis.plugin.ZRemRangeByRank(
        ZRemRangeByRankRequest.create({
          key: KeyRequest.create({ key: 'remove-rank' }),
          start: 0,
          stop: 1,
        })
      );
      expect(removed.value).toBe(2);
      const card = await redis.plugin.ZCard(KeyRequest.create({ key: 'remove-rank' }));
      expect(card.value).toBe(2);
    });

    it('should remove members by score range', async () => {
      await redis.plugin.ZAdd(
        ZAddRequest.create({
          key: 'remove-score',
          members: [
            { member: 'low', score: 1 },
            { member: 'mid', score: 5 },
            { member: 'high', score: 10 },
          ],
        })
      );
      const removed = await redis.plugin.ZRemRangeByScore(
        ZRemRangeByScoreRequest.create({
          key: KeyRequest.create({ key: 'remove-score' }),
          min: 1,
          max: 5,
        })
      );
      expect(removed.value).toBe(2);
      const remaining = await redis.plugin.ZRange(
        ZRangeRequest.create({
          key: KeyRequest.create({ key: 'remove-score' }),
          start: '0',
          stop: '-1',
        })
      );
      expect(remaining.members.map((m) => m.member)).toEqual(['high']);
    });

    it('should scan sorted sets with patterns', async () => {
      await redis.plugin.ZAdd(
        ZAddRequest.create({
          key: 'scan-z',
          members: [
            { member: 'alpha', score: 1 },
            { member: 'beta', score: 2 },
            { member: 'berry', score: 3 },
            { member: 'carrot', score: 4 },
          ],
        })
      );
      const res = await redis.plugin.ZScan(
        ZScanRequest.create({ key: 'scan-z', cursor: 0, pattern: 'b*', count: 10 })
      );
      expect(res.members.map((m) => m.member).sort()).toEqual(['berry', 'beta']);
    });

    it('should handle missing ZScore responses', async () => {
      const missing = await redis.plugin.ZScore(
        ZScoreRequest.create({
          key: KeyRequest.create({ key: 'missing-score' }),
          member: 'ghost',
        })
      );
      expect(missing.value).toBe(0);
      await expect(
        redis.plugin.ZScore(
          ZScoreRequest.create({
            key: KeyRequest.create({ key: 'missing-score' }),
            member: 'ghost',
          }),
          { 'throw-redis-nil': { values: ['true'] } }
        )
      ).rejects.toThrow('redis: nil');
    });

    it('should handle missing ZRank responses', async () => {
      const missing = await redis.plugin.ZRank(
        ZRankRequest.create({
          key: KeyRequest.create({ key: 'missing-rank' }),
          member: 'ghost',
        })
      );
      expect(missing.value).toBe(-1);
      await expect(
        redis.plugin.ZRank(
          ZRankRequest.create({
            key: KeyRequest.create({ key: 'missing-rank' }),
            member: 'ghost',
          }),
          { 'throw-redis-nil': { values: ['true'] } }
        )
      ).rejects.toThrow('redis: nil');
    });
  });

  describe('Bitfield Operations', () => {
    it('should perform bitfield operations', async () => {
      // Set i8 at offset 0 to 100
      // Get i8 at offset 0
      const res = await redis.plugin.Bitfield(
        BitfieldRequest.create({
          key: 'bf',
          commands: [
            { set: { encoding: 'i8', offset: '0', value: '100' } },
            { get: { encoding: 'i8', offset: '0' } },
          ],
        })
      );
      // Result of SET is old value (0), result of GET is new value (100)
      expect(res.results).toEqual([0, 100]);
    });

    it('should honor different overflow behaviors', async () => {
      const res = await redis.plugin.Bitfield(
        BitfieldRequest.create({
          key: 'bf-overflow',
          commands: [
            { set: { encoding: 'i8', offset: '0', value: '127' } },
            {
              overflow: { behavior: BitfieldOverflowBehavior.BITFIELD_OVERFLOW_BEHAVIOR_WRAP },
            },
            { incrBy: { encoding: 'i8', offset: '0', increment: '1' } },
            { set: { encoding: 'i8', offset: '0', value: '127' } },
            {
              overflow: { behavior: BitfieldOverflowBehavior.BITFIELD_OVERFLOW_BEHAVIOR_SAT },
            },
            { incrBy: { encoding: 'i8', offset: '0', increment: '1' } },
            {
              overflow: { behavior: BitfieldOverflowBehavior.BITFIELD_OVERFLOW_BEHAVIOR_FAIL },
            },
            { incrBy: { encoding: 'i8', offset: '0', increment: '1' } },
          ],
        })
      );
      expect(res.results).toEqual([0, -128, -128, 127, null]);
    });
  });

  describe('Transactions', () => {
    it('queues commands until exec is called', async () => {
      await redis.plugin.Set(SetRequest.create({ key: 'txn-key', value: '0' }));
      const txId = await redis.plugin.Watch(WatchRequest.create({ keys: ['txn-key'] }));
      await redis.plugin.Multi(txId);

      await redis.plugin.IncrBy(
        IncrByRequest.create({ key: 'txn-key', value: 1, transactionId: txId })
      );
      await redis.plugin.IncrBy(
        IncrByRequest.create({ key: 'txn-key', value: 2, transactionId: txId })
      );

      // Value shouldn't change until exec runs
      const mid = await redis.plugin.Get(KeyRequest.create({ key: 'txn-key' }));
      expect(mid.value).toBe('0');

      const execResponse = await redis.plugin.Exec(txId);
      expect(execResponse.response.map((entry) => entry.num ?? entry.str)).toEqual([1, 3]);

      const final = await redis.plugin.Get(KeyRequest.create({ key: 'txn-key' }));
      expect(final.value).toBe('3');
    });

    it('supports unwatch without tearing down the transaction', async () => {
      const txId = await redis.plugin.Watch(WatchRequest.create({ keys: ['txn-unwatch'] }));
      await redis.plugin.Unwatch(txId);
      await redis.plugin.Multi(txId);
      await redis.plugin.Set(
        SetRequest.create({ key: 'txn-unwatch', value: 'watched', transactionId: txId })
      );
      await redis.plugin.Exec(txId);
      const stored = await redis.plugin.Get(KeyRequest.create({ key: 'txn-unwatch' }));
      expect(stored.value).toBe('watched');
    });

    it('discards queued commands when requested', async () => {
      const txId = await redis.plugin.Watch(WatchRequest.create({ keys: ['txn-discard'] }));
      await redis.plugin.Multi(txId);
      await redis.plugin.Set(
        SetRequest.create({ key: 'txn-discard', value: 'should-not-commit', transactionId: txId })
      );
      await redis.plugin.Discard(txId);
      const res = await redis.plugin.Get(KeyRequest.create({ key: 'txn-discard' }));
      expect(res.value).toBe('');
    });

    it('throws when commands are queued before multi', async () => {
      const txId = await redis.plugin.Watch(WatchRequest.create({ keys: ['txn-error'] }));
      await expect(
        redis.plugin.Set(
          SetRequest.create({ key: 'txn-error', value: 'boom', transactionId: txId })
        )
      ).rejects.toThrow(/multi/);
    });
  });
});
