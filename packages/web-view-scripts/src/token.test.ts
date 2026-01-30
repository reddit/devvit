import type { DevvitGlobal } from '@devvit/shared-types/client/devvit-global.js';
import * as emitEffectModule from '@devvit/shared-types/client/emit-effect.js';
import type { WebbitToken } from '@devvit/shared-types/webbit.js';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { decodeToken, initToken, refreshToken, requestTokenRefresh } from './token.js';

describe('decodeRequestContext()', () => {
  test('decodes valid JWT with devvit claim', () => {
    const jwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZ2aXQiOnsiYXBwIjp7ImlkIjoiYXBwMTIzIiwibmFtZSI6InRlc3RBcHAiLCJ2ZXJzaW9uIjoiMS4wLjAiLCJzdGF0dXMiOjF9LCJzdWJyZWRkaXQiOnsiaWQiOiJ0NV8xMjMiLCJuYW1lIjoidGVzdFN1YnJlZGRpdCJ9LCJ1c2VyIjp7ImlkIjoidDJfNDU2IiwibmFtZSI6InRlc3RVc2VyIn0sInBvc3QiOnsiaWQiOiJ0M183ODkiLCJhdXRob3IiOiJ0Ml80MDAifX0sImlzcyI6InRlc3QifQ.1EjHuCuOz_-QBFLnDpNO5lE5l3X2VV0hqTwGR7sFz88';

    expect(decodeToken(jwt)).toMatchInlineSnapshot(`
      {
        "app": {
          "id": "app123",
          "name": "testApp",
          "status": 1,
          "version": "1.0.0",
        },
        "post": {
          "author": "t2_400",
          "id": "t3_789",
        },
        "subreddit": {
          "id": "t5_123",
          "name": "testSubreddit",
        },
        "user": {
          "id": "t2_456",
          "name": "testUser",
        },
      }
    `);
  });

  test('returns undefined for empty string', () => {
    expect(decodeToken('')).toBeUndefined();
  });

  test('throws for invalid JWT', () => {
    expect(() => decodeToken('invalid.jwt.token')).toThrowErrorMatchingInlineSnapshot(
      `[Error: token decode failure]`
    );
  });
});

describe('initToken()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('sets up interval to call refreshToken every 6 seconds', () => {
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');

    initToken();

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60_000);
  });
});

describe('refreshToken()', () => {
  // Helper to create a JWT with a specific expiration time
  function createJwtWithExp(expInSeconds: number): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ devvit: {}, exp: expInSeconds }));
    const signature = 'fake-signature';
    return `${header}.${payload}.${signature}`;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.devvit = {
      context: {} as DevvitGlobal['context'],
      dependencies: { client: undefined, webViewScripts: { hash: 'abc', version: '1.2.3' } },
      entrypoints: {},
      share: undefined,
      appPermissionState: undefined,
      token: '' as WebbitToken,
      webViewMode: undefined,
      startTime: undefined,
      refreshToken: undefined,
    };
  });

  test('does not refresh token if expiration is more than 5 minutes away', async () => {
    const emitEffectSpy = vi.spyOn(emitEffectModule, 'emitEffectWithResponse');
    // Token expires in 10 minutes (600 seconds from now)
    const futureExp = Math.floor(Date.now() / 1000) + 600;
    globalThis.devvit.token = createJwtWithExp(futureExp) as WebbitToken;

    await refreshToken();

    expect(emitEffectSpy).not.toHaveBeenCalled();
  });

  test('refreshes token when expiration is within 5 minutes', async () => {
    const newToken = 'new-token-from-server';
    const emitEffectSpy = vi.spyOn(emitEffectModule, 'emitEffectWithResponse').mockResolvedValue({
      id: 'test-id',
      updateRequestContext: { signedRequestContext: newToken },
    });

    // Token expires in 2 minutes (120 seconds from now)
    const soonExp = Math.floor(Date.now() / 1000) + 120;
    globalThis.devvit.token = createJwtWithExp(soonExp) as WebbitToken;

    await refreshToken();

    expect(emitEffectSpy).toHaveBeenCalled();
    expect(globalThis.devvit.token).toBe(newToken);
  });

  test('devvit.refreshToken calls requestTokenRefresh', async () => {
    const newToken = 'refreshed.token.value';
    vi.spyOn(emitEffectModule, 'emitEffectWithResponse').mockResolvedValue({
      id: 'test-id',
      updateRequestContext: { signedRequestContext: newToken },
    });

    globalThis.devvit.refreshToken = requestTokenRefresh;

    await globalThis.devvit.refreshToken();

    expect(globalThis.devvit.token).toBe(newToken);
  });
});
