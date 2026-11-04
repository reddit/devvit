import type { DevvitGlobal } from '@devvit/shared-types/client/devvit-global.js';
import { Header } from '@devvit/shared-types/Header.js';

/**
 * Injects the auth token and the user's timezone into same-site requests,
 * such as calls to the app's /api/ routes.
 */
export async function fetch(
  devvit: Readonly<DevvitGlobal>,
  globalFetch: typeof globalThis.fetch,
  location: Readonly<Location>,
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const req = new Request(input, init);
  if (isSameSite(location, new URL(req.url))) {
    req.headers.set('Authorization', `Bearer ${devvit.token}`);
    setTimezone(req.headers);
  }
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

/**
 * Sets the IANA timezone (like `Europe/Amsterdam`) the server SDK forwards to
 * plugins, which use it to customize the experience for the user's local time.
 * A timezone the app already set wins. Failures leave the header unset rather
 * than fail the app's request.
 */
function setTimezone(headers: Headers): void {
  if (headers.has(Header.Timezone)) return;
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) headers.set(Header.Timezone, timezone);
  } catch {
    // Intl may be unavailable or report an unsendable value.
  }
}
