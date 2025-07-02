import type { Metadata } from '@devvit/protos';
import type { BaseContext } from '@devvit/public-api';
import { getContextFromMetadata } from '@devvit/public-api/devvit/internals/context.js';
import { Header, headerPrefix } from '@devvit/shared-types/Header.js';

/** Devvit server context for the lifetime of a request. */
export type RequestContext = Omit<BaseContext, 'toJSON'>;

/** Designed to be compatible with IncomingHttpHeaders and any KV. */
type Headers = { [header: string]: string | string[] | undefined };

/** Constructs a new RequestContext. */
export let RequestContext = (headers: Readonly<Headers>): RequestContext => {
  const meta = metaFromIncomingMessage(headers);
  return getContextFromMetadata(meta, meta[Header.Post]?.values[0]);
};

/**
 * Overwrite the context provider for test.
 * @experimental
 */
export function setRequestContext(fn: typeof RequestContext): void {
  RequestContext = fn;
}

/** @internal */
export function metaFromIncomingMessage(headers: Readonly<Headers>): Metadata {
  const meta: Metadata = {};
  for (const [key, val] of Object.entries(headers))
    if (key.startsWith(headerPrefix))
      meta[key] = { values: typeof val === 'object' ? val : val == null ? [] : [val] };
  return meta;
}
