import { test } from 'vitest';

import { queryClientVersion } from './client.js';

test('no version', () =>
  expect(
    queryClientVersion({
      currentScript: {
        src: 'https://webview.devvit.net/scripts/devvit.v1.min.js',
      },
    } as Document)
  ).toBe(undefined));

test('version', () =>
  expect(
    queryClientVersion({
      currentScript: {
        src: 'https://webview.devvit.net/scripts/devvit.v1.min.js?clientVersion=1.2.3',
      },
    } as Document)
  ).toBe('1.2.3'));
