import type { Metadata } from '@devvit/protos/lib/Types.js';
import type { BaseContext } from '@devvit/shared';
import { Header, headerPrefix } from '@devvit/shared-types/Header.js';
import { BaseContextFromMetadata } from '@devvit/shared-types/server/base-context.js';

/** Devvit server context for the lifetime of a request. */
export type Context = BaseContext & {
  /** @internal - Used for caching info within the lifespan of a request. Not for public use. */
  cache?: { [key: string]: unknown };
  metadata: Metadata;
};

/** Designed to be compatible with IncomingHttpHeaders and any KV. */
type Headers = { [header: string]: string | string[] | undefined };

const nonDevvitMetadataHeaders = new Set<string>([Header.Traceparent, Header.Tracestate]);

/** Constructs a new Context. */
export let Context = (headers: Readonly<Headers>): Context => {
  const meta = metaFromIncomingMessage(headers);
  const baseCtx = BaseContextFromMetadata(
    meta,
    meta[Header.Post]?.values[0],
    meta[Header.Comment]?.values[0]
  );
  return {
    // `cache` lifetime matches `Context` so nothing to init here.
    appName: baseCtx.appName,
    appSlug: baseCtx.appSlug,
    appVersion: baseCtx.appVersion,
    commentId: baseCtx.commentId,
    loid: baseCtx.loid,
    postData: baseCtx.postData,
    postId: baseCtx.postId,
    snoovatar: baseCtx.snoovatar,
    subredditId: baseCtx.subredditId,
    subredditName: baseCtx.subredditName,
    userId: baseCtx.userId,
    username: baseCtx.username,
    metadata: meta,
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
    if (key.startsWith(headerPrefix) || nonDevvitMetadataHeaders.has(key))
      meta[key] = { values: typeof val === 'object' ? val : val == null ? [] : [val] };
  return meta;
}
