import { IncomingMessage } from 'node:http';
import { Socket } from 'node:net';

import { metaFromIncomingMessage } from './request-context.js';

describe('metaFromIncomingMessage()', () => {
  test('empty', () => expect(metaFromIncomingMessage({})).toStrictEqual({}));
  test('nonempty KV', () => {
    const headers = {
      'devvit-foo': 'bar',
      foo: 'bar',
      'devvit-list': ['a', 'b', 'c'],
      'devvit-undefined': undefined,
    };
    expect(metaFromIncomingMessage(headers)).toStrictEqual({
      'devvit-foo': { values: ['bar'] },
      'devvit-list': { values: ['a', 'b', 'c'] },
      'devvit-undefined': { values: [] },
    });
  });
  test('nonempty IncomingHttpHeaders', () => {
    const msg = new IncomingMessage(new Socket());
    msg.headers['devvit-foo'] = 'bar';
    msg.headers.foo = 'bar';
    msg.headers['devvit-list'] = ['a', 'b', 'c'];
    msg.headers['devvit-undefined'] = undefined;
    expect(metaFromIncomingMessage(msg.headers)).toStrictEqual({
      'devvit-foo': { values: ['bar'] },
      'devvit-list': { values: ['a', 'b', 'c'] },
      'devvit-undefined': { values: [] },
    });
  });
});
