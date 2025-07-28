import { type RedisAPI, RedisKeyScope } from '@devvit/protos';
import { expect, test, vi } from 'vitest';

import { RedisClient } from './RedisClient.js';

// TODO: This code is currently cloned into the Devvit Web world from `@devvit/public-api`. If
//  you change this code, please make sure to update the other package as well. Eventually, that
//  copy of the code will be deleted, when we move to a fully Devvit Web world.

vi.mock('@devvit/shared-types/server/get-devvit-config.js', () => {
  return {
    getDevvitConfig: () => {
      return {
        use: () => {
          return {
            Bitfield: async (_request, _metadata) => {
              return {
                results: [42],
              };
            },
          } as RedisAPI;
        },
      };
    },
  };
});

test('bitfield typing is intuitive', async () => {
  const client = new RedisClient(RedisKeyScope.INSTALLATION);

  await client.bitfield('mykey');

  // 'get' syntax
  await client.bitfield('mykey', 'get', 'i8', '#2');
  await client.bitfield('mykey', 'get', 'u8', '2');
  await client.bitfield('mykey', 'get', 'u4', 2);

  // 'set' syntax
  await client.bitfield('mykey', 'set', 'i6', '#2', 2);
  await client.bitfield('mykey', 'set', 'u2', '#2', -2);

  // 'incrBy' syntax
  await client.bitfield('mykey', 'incrBy', 'i8', '#2', 3);
  await client.bitfield('mykey', 'incrBy', 'u4', '2', -3);

  // 'overflow' syntax
  await client.bitfield('mykey', 'overflow', 'sat', 'set', 'u4', 2, 4);
  await client.bitfield('mykey', 'overflow', 'fail', 'incrBy', 'u4', 2, 4);
  await client.bitfield(
    'mykey',
    'overflow',
    'sat',
    'set',
    'u4',
    2,
    4,
    'overflow',
    'wrap',
    'incrBy',
    'u4',
    '2',
    -3
  );

  // multiple operations in one call
  await client.bitfield(
    'mykey',
    'set',
    'i6',
    '#2',
    2,
    'get',
    'i8',
    '#2',
    'overflow',
    'sat',
    'set',
    'u4',
    2,
    4
  );
  await client.bitfield(
    'mykey',
    'get',
    'i8',
    '#2',
    'set',
    'u2',
    '#2',
    -2,
    'incrBy',
    'u4',
    '2',
    -3,
    'get',
    'u4',
    2,
    'incrBy',
    'u4',
    '2',
    -3
  );
  await client.bitfield(
    'mykey',
    'overflow',
    'fail',
    'get',
    'u3',
    2,
    'set',
    'i4',
    '#2',
    4,
    'incrBy',
    'i4',
    '#2',
    2,
    'overflow',
    'wrap',
    'set',
    'u7',
    8,
    1,
    'incrBy',
    'i7',
    '2',
    5
  );

  // Invalid type/syntax tests

  // @ts-expect-error wrong operation types
  await expect(client.bitfield('mykey', 3, true, 'abc')).rejects.toThrow();
  // @ts-expect-error unknown operation
  await expect(client.bitfield('mykey', 'range', 'u3', '#2', 4)).rejects.toThrow();

  // @ts-expect-error 'get' missing parameters
  await expect(client.bitfield('mykey', 'get')).rejects.toThrow();
  // @ts-expect-error 'get' missing parameters
  await expect(client.bitfield('mykey', 'get', 'u1')).rejects.toThrow();

  // @ts-expect-error 'set' missing parameters
  await expect(client.bitfield('mykey', 'set')).rejects.toThrow();
  // @ts-expect-error 'get' missing parameters
  await expect(client.bitfield('mykey', 'set', 'u1')).rejects.toThrow();
  // @ts-expect-error 'get' missing parameters
  await expect(client.bitfield('mykey', 'set', 'u1', '#2')).rejects.toThrow();

  // @ts-expect-error 'incrBy' missing parameters
  await expect(client.bitfield('mykey', 'incrBy')).rejects.toThrow();
  // @ts-expect-error 'incrBy' missing parameters
  await expect(client.bitfield('mykey', 'incrBy', 'u1')).rejects.toThrow();
  // @ts-expect-error 'incrBy' missing parameters
  await expect(client.bitfield('mykey', 'incrBy', 'u1', '#2')).rejects.toThrow();

  // @ts-expect-error 'overflow' missing parameters
  await expect(client.bitfield('mykey', 'overflow')).rejects.toThrow();
  // @ts-expect-error 'get' missing parameters
  await expect(client.bitfield('mykey', 'get', 'u1')).rejects.toThrow();
  // @ts-expect-error 'get' missing parameters
  await expect(client.bitfield('mykey', 'get', 'u1')).rejects.toThrow();

  await expect(
    client.bitfield(
      'mykey',
      // @ts-expect-error missing parameters in multiple operations ('set' missing value)
      'set',
      'i6',
      '#2',
      'get',
      'i8',
      '#2',
      'overflow',
      'sat',
      'set',
      'u4',
      2,
      4
    )
  ).rejects.toThrow();

  await expect(
    client.bitfield(
      'mykey',
      // @ts-expect-error missing parameters in multiple operations ('get' missing offset)
      'get',
      'i8',
      'set',
      'u2',
      '#2',
      -2,
      'incrBy',
      'u4',
      '2',
      -3,
      'get',
      'u4',
      2,
      'incrBy',
      'u4',
      '2',
      -3
    )
  ).rejects.toThrow();

  await expect(
    client.bitfield(
      'mykey',
      // @ts-expect-error missing parameters in multiple operations ('incrBy' missing encoding)
      'overflow',
      'fail',
      'get',
      'u3',
      2,
      'incrBy',
      '#2',
      2,
      'overflow',
      'wrap',
      'set',
      'u7',
      8,
      1,
      'incrBy',
      'i7',
      '2',
      5
    )
  ).rejects.toThrow();

  await expect(
    client.bitfield(
      'mykey',
      // @ts-expect-error missing parameters in multiple operations ('overflow' missing behavior)
      'overflow',
      'get',
      'u3',
      2,
      'incrBy',
      'u5',
      '#2',
      2,
      'overflow',
      'wrap',
      'set',
      'u7',
      8,
      1,
      'incrBy',
      'i7',
      '2',
      5
    )
  ).rejects.toThrow();
});
