/** Injects an auth token into /api/ requests. */
export async function fetch(
  authToken: string,
  globalFetch: typeof globalThis.fetch,
  location: Readonly<Location>,
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const req = new Request(input, init);
  if (isSameSite(location, new URL(req.url)))
    req.headers.set('Authorization', `Bearer ${authToken}`);
  // to-do: pass devvit-debug from BridgeContext.
  return await globalFetch(req);
}

/** @internal */
export function isSameSite(location: Readonly<Location>, url: URL): boolean {
  return url.origin === location.origin;
}
