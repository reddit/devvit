import { IncomingMessage } from 'node:http';
import { Socket } from 'node:net';

import { Header } from '@devvit/shared-types/Header.js';

import { metaFromIncomingMessage } from './server-context.js';

const traceparent = '00-deadbeefdeadbeefdeadbeefdeadbeef-0123456789abcdef-01';
const tracestate = 'rojo=0123456789abcdef';

describe('metaFromIncomingMessage()', () => {
  test('empty', () => expect(metaFromIncomingMessage({})).toStrictEqual({}));
  test('nonempty KV', () => {
    const headers = {
      'devvit-foo': 'bar',
      foo: 'bar',
      'devvit-list': ['a', 'b', 'c'],
      'devvit-undefined': undefined,
      [Header.Traceparent]: traceparent,
      [Header.Tracestate]: tracestate,
    };
    expect(metaFromIncomingMessage(headers)).toStrictEqual({
      'devvit-foo': { values: ['bar'] },
      'devvit-list': { values: ['a', 'b', 'c'] },
      'devvit-undefined': { values: [] },
      [Header.Traceparent]: { values: [traceparent] },
      [Header.Tracestate]: { values: [tracestate] },
    });
  });
  test('nonempty IncomingHttpHeaders', () => {
    const msg = new IncomingMessage(new Socket());
    msg.headers['devvit-foo'] = 'bar';
    msg.headers.foo = 'bar';
    msg.headers['devvit-list'] = ['a', 'b', 'c'];
    msg.headers['devvit-undefined'] = undefined;
    msg.headers[Header.Traceparent] = traceparent;
    msg.headers[Header.Tracestate] = tracestate;
    expect(metaFromIncomingMessage(msg.headers)).toStrictEqual({
      'devvit-foo': { values: ['bar'] },
      'devvit-list': { values: ['a', 'b', 'c'] },
      'devvit-undefined': { values: [] },
      [Header.Traceparent]: { values: [traceparent] },
      [Header.Tracestate]: { values: [tracestate] },
    });
  });
});
