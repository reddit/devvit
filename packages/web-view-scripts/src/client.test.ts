import { JSDOM } from 'jsdom';
import { test } from 'vitest';

import { queryClientVersion } from './client.js';

test.each([
  ['no version', undefined, undefined],
  ['data attribute', '1.2.3', '1.2.3'],
] as const)('%s', (_name, version, expected) => {
  const script = new JSDOM().window.document.createElement('script');
  script.src = 'https://webview.devvit.net/scripts/devvit.v1.min.js';
  if (version != null) script.setAttribute('data-client-version', version);
  expect(queryClientVersion({ currentScript: script })).toBe(expected);
});

test('no current script', () => {
  expect(queryClientVersion({ currentScript: null })).toBeUndefined();
});
