import type { DevvitGlobal } from '@devvit/shared-types/client/devvit-global.js';

/** Injects an auth token into /api/ requests. */
export async function fetch(
  devvit: Readonly<DevvitGlobal>,
  globalFetch: typeof globalThis.fetch,
  location: Readonly<Location>,
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const req = new Request(input, init);
  if (isSameSite(location, new URL(req.url)))
    req.headers.set('Authorization', `Bearer ${devvit.token}`);
  // to-do: pass devvit-debug from BridgeContext.
  return await globalFetch(req);
}

export function initFetch(): void {
  globalThis.fetch = fetch.bind(undefined, globalThis.devvit, globalThis.fetch, location);
}

/** @internal */
export function isSameSite(location: Readonly<Location>, url: URL): boolean {
  return url.origin === location.origin;
}
