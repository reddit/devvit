import type { DevvitGlobal } from '@devvit/shared-types/client/devvit-global.js';
import { type WebbitToken } from '@devvit/shared-types/webbit.js';
import { test } from 'vitest';

import { fetch, isSameSite } from './fetch.js';

const location: Readonly<Location> = {
  origin: 'https://csipc4--699ce78e-44a2-43c4-b581-3f58298a2711-webview.devvit.net',
} as Location;

describe('fetch()', () => {
  const devvit: DevvitGlobal = {
    context: {} as DevvitGlobal['context'],
    dependencies: { client: undefined, webViewScripts: { hash: 'abc', version: '1.2.3' } },
    entrypoints: {},
    share: undefined,
    appPermissionState: undefined,
    token: 'authToken' as WebbitToken,
    webViewMode: undefined,
    startTime: undefined,
    refreshToken: undefined,
  };

  for (const { same, url } of [
    { same: false, url: 'https://example.com/api/example' },
    {
      same: true,
      url: 'https://csipc4--699ce78e-44a2-43c4-b581-3f58298a2711-webview.devvit.net/api/example',
    },
  ]) {
    test(same ? 'same-site' : 'cross-site', async () => {
      let req!: Request;
      await fetch(
        devvit,
        ((arg: Request) => (req = arg)) as unknown as typeof globalThis.fetch,
        location,
        url
      );
      expect(req.headers.get('Authorization')).toBe(same ? 'Bearer authToken' : null);
    });
  }
});

describe('isSameSite()', () => {
  test('cross-site', () =>
    expect(isSameSite(location, new URL('https://example.com/api/example'))).toBe(false));

  test('same-site', () =>
    expect(
      isSameSite(
        location,
        new URL(
          'https://csipc4--699ce78e-44a2-43c4-b581-3f58298a2711-webview.devvit.net/api/example'
        )
      )
    ).toBe(true));
});
