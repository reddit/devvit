import type { DevvitGlobal } from '@devvit/shared-types/client/devvit-global.js';
import { Header } from '@devvit/shared-types/Header.js';
import { type WebbitToken } from '@devvit/shared-types/webbit.js';
import { test, vi } from 'vitest';

import { fetch, isSameSite } from './fetch.js';

const location: Readonly<Location> = {
  origin: 'https://csipc4--699ce78e-44a2-43c4-b581-3f58298a2711-webview.devvit.net',
} as Location;

describe('fetch()', () => {
  const devvit: DevvitGlobal = {
    context: {} as DevvitGlobal['context'],
    dependencies: { client: undefined, webViewScripts: { hash: 'abc', version: '1.2.3' } },
    entrypoints: {},
    experiments: {},
    share: undefined,
    adPayload: undefined,
    appPermissionState: undefined,
    token: 'authToken' as WebbitToken,
    webViewMode: undefined,
    startTime: undefined,
    refreshToken: undefined,
  };

  const sameSiteUrl = `${location.origin}/api/example`;
  const crossSiteUrl = 'https://example.com/api/example';
  const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const cases: {
    name: string;
    url: string;
    init?: RequestInit;
    /** Replaces `resolvedOptions().timeZone`. Omit to use the real timezone. */
    timezone?: () => string;
    want: { authorization: string | null; timezone: string | null };
  }[] = [
    {
      name: 'same-site',
      url: sameSiteUrl,
      want: { authorization: 'Bearer authToken', timezone: systemTimezone },
    },
    {
      name: 'cross-site',
      url: crossSiteUrl,
      want: { authorization: null, timezone: null },
    },
    {
      name: 'same-site keeps app timezone',
      url: sameSiteUrl,
      init: { headers: { [Header.Timezone]: 'America/New_York' } },
      timezone: () => 'Europe/Amsterdam',
      want: { authorization: 'Bearer authToken', timezone: 'America/New_York' },
    },
    {
      name: 'same-site without timezone',
      url: sameSiteUrl,
      timezone: () => '',
      want: { authorization: 'Bearer authToken', timezone: null },
    },
    {
      name: 'same-site when timezone lookup throws',
      url: sameSiteUrl,
      timezone: () => {
        throw RangeError('unsupported');
      },
      want: { authorization: 'Bearer authToken', timezone: null },
    },
    {
      name: 'same-site with unsendable timezone',
      url: sameSiteUrl,
      timezone: () => 'Europe/\nAmsterdam',
      want: { authorization: 'Bearer authToken', timezone: null },
    },
  ];

  for (const tc of cases) {
    test(tc.name, async () => {
      const { timezone } = tc;
      if (timezone)
        vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function () {
          return { resolvedOptions: () => ({ timeZone: timezone() }) };
        } as unknown as typeof Intl.DateTimeFormat);
      let req!: Request;
      await fetch(
        devvit,
        ((arg: Request) => (req = arg)) as unknown as typeof globalThis.fetch,
        location,
        tc.url,
        tc.init
      );
      expect({
        authorization: req.headers.get('Authorization'),
        timezone: req.headers.get(Header.Timezone),
      }).toStrictEqual(tc.want);
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
