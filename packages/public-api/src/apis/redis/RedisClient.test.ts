import type { Metadata } from '@devvit/protos';
import { LocalRedis } from '@devvit/shared-types/test/LocalRedis.js';
import { Devvit } from '../../devvit/Devvit.js';
import { RedisClient } from './RedisClient.js';

let localRedis: LocalRedis;
let client: RedisClient;

beforeEach(async () => {
  Devvit.configure({ redis: true });

  localRedis = await LocalRedis.create();
  const metadata: Metadata = {
    'devvit-installation': { values: ['abc'] },
    'devvit-app': { values: ['test'] },
  };
  client = new RedisClient(metadata, localRedis);
});

describe('functionality', () => {
  test.skip('Set and Get', async () => {
    await client.set('test', 'value');
    await expect(client.get('test')).resolves.toEqual('value');
  });

  test.skip('Set and Get with differing metadata doesnt conflict', async () => {
    const alt = new RedisClient(
      { 'devvit-installation': { values: ['def'] }, 'devvit-app': { values: ['test'] } },
      localRedis
    );
    await client.set('test', 'value');
    await expect(client.get('test')).resolves.toEqual('value');
    await expect(alt.get('test')).resolves.toEqual('');
  });

  test.skip('transaction', async () => {
    const transaction = await client.watch();
    await transaction.multi();
    expect(await transaction.set('test', 'value')).toBe(transaction);
    await transaction.set('test2', 'value2');
    await transaction.get('test2');
    const [x, y, getter] = await transaction.exec();
    expect(x).toEqual('OK');
    expect(y).toEqual('OK');
    expect(getter).toEqual('value2');
    await expect(client.get('test')).resolves.toEqual('value');
    await expect(client.get('test2')).resolves.toEqual('value2');
  });
});
