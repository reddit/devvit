import type { RedisClient } from '@devvit/public-api';
import type { Mock } from 'vitest';
import { createDevvRedis, redisHandler } from './index.js';

describe('redis mock service', () => {
  const nativeRedis = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    mget: vi.fn(),
    mset: vi.fn(),
  } as unknown as RedisClient;

  afterEach(() => {
    (nativeRedis.get as Mock).mockReset();
    (nativeRedis.set as Mock).mockReset();
    (nativeRedis.del as Mock).mockReset();
    (nativeRedis.mget as Mock).mockReset();
    (nativeRedis.mset as Mock).mockReset();
  });

  describe('when no handlers provided', () => {
    it('uses vanilla redis', async () => {
      const devvRedis = createDevvRedis(nativeRedis, []);
      (nativeRedis.get as Mock).mockResolvedValue('real value');
      const response = await devvRedis.get('key');
      expect(nativeRedis.get).toHaveBeenCalledOnce();
      expect(response).toBe('real value');
    });
  });

  describe('with handlers provided', () => {
    it('returns value from handler for overriden method and key', async () => {
      const devvRedis = createDevvRedis(nativeRedis, [
        redisHandler.get('mocked_key', () => 'mocked response'),
      ]);
      (nativeRedis.get as Mock).mockResolvedValue('real value');
      const response = await devvRedis.get('mocked_key');
      expect(nativeRedis.get).not.toBeCalled();
      expect(response).toBe('mocked response');
    });

    it('returns real value for overriden method if key does not match', async () => {
      const devvRedis = createDevvRedis(nativeRedis, [
        redisHandler.get('mocked_key', () => 'mocked response'),
      ]);
      (nativeRedis.get as Mock).mockResolvedValue('real value');
      const response = await devvRedis.get('another_key');
      expect(nativeRedis.get).toHaveBeenCalledOnce();
      expect(response).toBe('real value');
    });

    it('uses appropriate handler based on the key', async () => {
      const devvRedis = createDevvRedis(nativeRedis, [
        redisHandler.get('mocked_key_1', () => 'mock 1'),
        redisHandler.get('mocked_key_2', () => 'mock 2'),
      ]);
      (nativeRedis.get as Mock).mockResolvedValue('real value');
      const response1 = await devvRedis.get('mocked_key_1');
      expect(response1).toBe('mock 1');
      const response2 = await devvRedis.get('mocked_key_2');
      expect(response2).toBe('mock 2');
    });

    it('passes args to a handler', async () => {
      const setHandler = vi.fn();
      const devvRedis = createDevvRedis(nativeRedis, [
        redisHandler.set('mocked_key_1', setHandler),
      ]);
      (nativeRedis.set as Mock).mockResolvedValue('');
      await devvRedis.set('mocked_key_1', 'arg_value');
      expect(nativeRedis.set).not.toBeCalled();
      expect(setHandler).toHaveBeenCalledOnce();
      expect(setHandler).toBeCalledWith('arg_value');
    });

    it('only overrides specified methods', async () => {
      const setHandler = vi.fn();
      const devvRedis = createDevvRedis(nativeRedis, [
        redisHandler.set('mocked_key_1', setHandler),
      ]);
      (nativeRedis.set as Mock).mockResolvedValue('');
      await devvRedis.set('mocked_key_1', 'arg_value');
      await devvRedis.get('mocked_key_1');
      expect(nativeRedis.set).not.toBeCalled();
      expect(nativeRedis.get).toBeCalled();
      expect(setHandler).toHaveBeenCalledOnce();
    });

    it('calls original method if it is stored in prototype', async () => {
      const setHandler = vi.fn();
      const extendedRedis = {
        incrBy: vi.fn(),
      };
      const nativeRedisWithPrototype = {
        get: vi.fn(),
        set: vi.fn(),
      } as unknown as RedisClient;
      Object.setPrototypeOf(nativeRedisWithPrototype, extendedRedis);
      (nativeRedisWithPrototype.incrBy as Mock).mockResolvedValue(15);

      const devvRedis = createDevvRedis(nativeRedisWithPrototype, [
        redisHandler.set('mocked_key_1', setHandler),
      ]);

      await devvRedis.incrBy('mocked_key_1', 2);
      expect(extendedRedis.incrBy).toHaveBeenCalledWith('mocked_key_1', 2);
    });

    it('accepts del overrides', async () => {
      const delHandler1 = vi.fn();
      const delHandler2 = vi.fn();
      const devvRedis = createDevvRedis(nativeRedis, [
        redisHandler.del('mocked_key_1', delHandler1),
        redisHandler.del('mocked_key_2', delHandler2),
      ]);
      (nativeRedis.del as Mock).mockResolvedValue('');
      const response = await devvRedis.del('mocked_key_1', 'mocked_key_2', 'non_mocked_key');
      expect(response).toBeUndefined();
      expect(delHandler1).toHaveBeenCalledOnce();
      expect(delHandler2).toHaveBeenCalledOnce();

      expect(nativeRedis.del).toHaveBeenCalledOnce();
      expect(nativeRedis.del).toBeCalledWith('non_mocked_key');
    });

    it('accepts mget overrides and applies the correct order of args', async () => {
      const devvRedis = createDevvRedis(nativeRedis, [
        redisHandler.mget('mocked_key_1', () => 'mock_response_1'),
        redisHandler.mget('mocked_key_2', () => null),
      ]);
      (nativeRedis.mget as Mock).mockResolvedValue(['real_response_1', 'real_response_2']);
      const response = await devvRedis.mget([
        'mocked_key_1',
        'non_mocked_key_1',
        'mocked_key_2',
        'non_mocked_key_2',
      ]);

      expect(nativeRedis.mget).toHaveBeenCalledOnce();
      expect(nativeRedis.mget).toBeCalledWith(['non_mocked_key_1', 'non_mocked_key_2']);

      expect(response).toEqual(['mock_response_1', 'real_response_1', null, 'real_response_2']);
    });

    it('accepts mset overrides', async () => {
      const msetHandler1 = vi.fn();
      const msetHandler2 = vi.fn();
      const devvRedis = createDevvRedis(nativeRedis, [
        redisHandler.mset('mocked_key_1', msetHandler1),
        redisHandler.mset('mocked_key_2', msetHandler2),
      ]);
      const response = await devvRedis.mset({
        mocked_key_1: '1',
        non_mocked_key_1: '2',
        mocked_key_2: '3',
        non_mocked_key_2: '4',
      });
      expect(response).toBeUndefined();

      expect(nativeRedis.mset).toHaveBeenCalledOnce();
      expect(nativeRedis.mset).toBeCalledWith({
        non_mocked_key_1: '2',
        non_mocked_key_2: '4',
      });

      expect(msetHandler1).toBeCalledWith({ mocked_key_1: '1' });
      expect(msetHandler2).toBeCalledWith({ mocked_key_2: '3' });
    });
  });
});
