import type { Metadata } from '@devvit/protos/lib/Types.js';
// to-do: inline a copy here. this is the only dependency on @devvit/public-api
//        and it's a functional one, not a devDependencies.
import { getContextFromMetadata } from '@devvit/public-api/devvit/internals/context.js';
import type { BaseContext } from '@devvit/shared';
import { T1, T2 as asT2, T3 as asT3, T5 as asT5 } from '@devvit/shared';
import { Header, headerPrefix } from '@devvit/shared-types/Header.js';

/** Devvit server context for the lifetime of a request. */
export type Context = BaseContext & {
  /** @internal - Used for caching info within the lifespan of a request. Not for public use. */
  cache?: { [key: string]: unknown };
  metadata: Metadata;
};

/** Designed to be compatible with IncomingHttpHeaders and any KV. */
type Headers = { [header: string]: string | string[] | undefined };

/** Constructs a new Context. */
export let Context = (headers: Readonly<Headers>): Context => {
  const meta = metaFromIncomingMessage(headers);
  const publicApiContext = getContextFromMetadata(
    meta,
    meta[Header.Post]?.values[0],
    meta[Header.Comment]?.values[0]
  );
  return {
    ...publicApiContext,
    commentId: publicApiContext.commentId ? T1(publicApiContext.commentId) : undefined,
    subredditId: asT5(publicApiContext.subredditId),
    userId: publicApiContext.userId ? asT2(publicApiContext.userId) : undefined,
    postId: publicApiContext.postId ? asT3(publicApiContext.postId) : undefined,
    subredditName: publicApiContext.subredditName!, // This is guaranteed to be defined
    snoovatar: publicApiContext.snoovatar,
    username: publicApiContext.username,
    loid: publicApiContext.loid,
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
