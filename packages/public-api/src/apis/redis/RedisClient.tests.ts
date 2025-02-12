import { RedisClient } from './RedisClient.js';

test('bitfield typing is intuitive', () => {
  const client = new RedisClient({});

  client.bitfield('mykey');

  // 'get' syntax
  client.bitfield('mykey', 'get', 'i8', '#2');
  client.bitfield('mykey', 'get', 'u8', '2');
  client.bitfield('mykey', 'get', 'u4', 2);

  // 'set' syntax
  client.bitfield('mykey', 'set', 'i6', '#2', 2);
  client.bitfield('mykey', 'set', 'u2', '#2', -2);

  // 'incrBy' syntax
  client.bitfield('mykey', 'incrBy', 'i8', '#2', 3);
  client.bitfield('mykey', 'incrBy', 'u4', '2', -3);

  // 'overflow' syntax
  client.bitfield('mykey', 'overflow', 'sat', 'set', 'u4', 2, 4);
  client.bitfield('mykey', 'overflow', 'fail', 'incrBy', 'u4', 2, 4);
  client.bitfield(
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
  client.bitfield(
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
  client.bitfield(
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
  client.bitfield(
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
  client.bitfield('mykey', 3, true, 'abc');
  // @ts-expect-error unknown operation
  client.bitfield('mykey', 'range', 'u3', '#2', 4);

  // @ts-expect-error 'get' missing parameters
  client.bitfield('mykey', 'get');
  // @ts-expect-error 'get' missing parameters
  client.bitfield('mykey', 'get', 'u1');

  // @ts-expect-error 'set' missing parameters
  client.bitfield('mykey', 'set');
  // @ts-expect-error 'get' missing parameters
  client.bitfield('mykey', 'set', 'u1');
  // @ts-expect-error 'get' missing parameters
  client.bitfield('mykey', 'set', 'u1', '#2');

  // @ts-expect-error 'incrBy' missing parameters
  client.bitfield('mykey', 'incrBy');
  // @ts-expect-error 'incrBy' missing parameters
  client.bitfield('mykey', 'incrBy', 'u1');
  // @ts-expect-error 'incrBy' missing parameters
  client.bitfield('mykey', 'incrBy', 'u1', '#2');

  // @ts-expect-error 'overflow' missing parameters
  client.bitfield('mykey', 'overflow');
  // @ts-expect-error 'get' missing parameters
  client.bitfield('mykey', 'get', 'u1');
  // @ts-expect-error 'get' missing parameters
  client.bitfield('mykey', 'get', 'u1');

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
  );

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
  );

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
  );

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
  );
});
