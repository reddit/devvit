import type { BaseContext } from '../types/context.js';

const WEBBIT_LOCAL_HOST = 'webbit.local';
const WEBBIT_LOCAL_PORT = 3000;

const allowedPathPrefixes = ['/api', '/internal'];

/**
 * Makes a fetch request to the devvit web backend server from your block app
 * This is a migration tool to help you migrate your block app to the new Devvit Web architecture.
 *
 * @param ctx - the devvit context
 * @param endpoint - the endpoint to make the request to
 * @param init - the request init options
 * @returns a promise that resolves to the fetch response
 */
export async function fetchDevvitWeb(
  ctx: BaseContext,
  endpoint: string,
  init?: RequestInit
): Promise<Response> {
  if (!allowedPathPrefixes.some((prefix) => endpoint.startsWith(prefix))) {
    throw new Error(`url must start with prefixes: /api or /internal. Got: ${endpoint}`);
  }

  // convert context metadata into headers
  const metadata = Object.entries(ctx.metadata ?? {}).reduce(
    (out, [k, v]) => {
      out[k] = v.values[0];
      return out;
    },
    {} as Record<string, string>
  );

  const url = new URL(endpoint, `http://${WEBBIT_LOCAL_HOST}:${WEBBIT_LOCAL_PORT}/`);
  return await fetch(url, {
    ...init,
    headers: {
      // apply any headers passed in from the app
      ...init?.headers,
      // apply devvit system headers, ovewritting anything from the app
      ...metadata,
    },
  });
}
