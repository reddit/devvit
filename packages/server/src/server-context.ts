import type { Metadata } from '@devvit/protos';
import { getContextFromMetadata } from '@devvit/public-api/devvit/internals/context.js';
import { type BaseContext, T2, T3, T5 } from '@devvit/shared';
import { Header, headerPrefix } from '@devvit/shared-types/Header.js';

/** Devvit server context for the lifetime of a request. */
export type Context = BaseContext & {
  cache?: { [key: string]: unknown };
  metadata: Metadata;
};

/** Designed to be compatible with IncomingHttpHeaders and any KV. */
type Headers = { [header: string]: string | string[] | undefined };

/** Constructs a new Context. */
export let Context = (headers: Readonly<Headers>): Context => {
  const meta = metaFromIncomingMessage(headers);
  const publicApiContext = getContextFromMetadata(meta, meta[Header.Post]?.values[0]);
  return {
    ...publicApiContext,
    subredditId: T5(publicApiContext.subredditId),
    userId: publicApiContext.userId ? T2(publicApiContext.userId) : undefined,
    postId: publicApiContext.postId ? T3(publicApiContext.postId) : undefined,
    subredditName: publicApiContext.subredditName!, // This is guaranteed to be defined
  };
};

/**
 * Overwrite the context provider for test.
 * @experimental
 */
export function setContext(fn: typeof Context): void {
  Context = fn;
}

/** @internal */
export function metaFromIncomingMessage(headers: Readonly<Headers>): Metadata {
  const meta: Metadata = {};
  for (const [key, val] of Object.entries(headers))
    if (key.startsWith(headerPrefix))
      meta[key] = { values: typeof val === 'object' ? val : val == null ? [] : [val] };
  return meta;
}
