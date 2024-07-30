import type { Metadata } from '@devvit/protos';
import type { AppDebug } from '@devvit/shared-types/Header.js';
import { Header } from '@devvit/shared-types/Header.js';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import type { BaseContext, ContextDebugInfo } from '../../types/context.js';
import pkg from '../../version.json' with { type: 'json' };

export function getContextFromMetadata(
  metadata: Metadata,
  postId?: string,
  commentId?: string
): BaseContext {
  const subredditId = metadata[Header.Subreddit]?.values[0];
  assertNonNull<string | undefined>(subredditId, 'subreddit is missing from Context');

  // devvit-app-user is only available in the remote runtime.
  const appAccountId = metadata[Header.AppUser]?.values[0];

  const userId = metadata[Header.User]?.values[0];
  const debug = parseDebug(metadata);

  return {
    get appAccountId() {
      assertNonNull<string | undefined>(appAccountId, 'appAccountId is missing from Context');
      return appAccountId;
    },
    subredditId,
    userId,
    postId,
    commentId,
    debug,
    toJSON() {
      return {
        appAccountId,
        subredditId,
        userId,
        postId,
        commentId,
        debug,
      };
    },
  };
}

/** @internal */
export function parseDebug(meta: Readonly<Metadata>): ContextDebugInfo {
  // Roughly aligns to initDevvitGlobal() except an empty devvit-debug doesn't
  // enable all.

  // All known AppDebug keys.
  const keyset: { readonly [key in AppDebug]: undefined } = {
    blocks: undefined,
    emitSnapshots: undefined,
    emitState: undefined,
    realtime: undefined,
    runtime: undefined,
    surface: undefined,
    useAsync: undefined,
    payments: undefined,
  };
  // {[key: Lowercase<AppDebug>]: AppDebug}
  const lowerKeyToKey: { [lower: string]: string } = {};
  for (const key in keyset) lowerKeyToKey[key.toLowerCase()] = key;

  const debug: { [key in AppDebug]?: string } = {};
  // hack: gRPC-web header values don't split in compute. always join then split
  //       for parity in both local and remote runtimes.
  for (const kv of (meta[Header.Debug]?.values ?? []).join().split(',')) {
    let [k, v] = kv.split('=');
    if (!k) continue;

    k = k.trim();
    v = v?.trim();

    if (k.toLowerCase() in lowerKeyToKey) k = lowerKeyToKey[k.toLowerCase()];

    debug[k as AppDebug] ??= v || `${true}`;
  }

  // @devvit/public-api v1.2.3 emitSnapshots=true foo=bar
  if (meta[Header.Debug])
    console.info(
      `[api] @devvit/public-api v${pkg.version} ${Object.entries(debug)
        .map(([k, v]) => `${k}=${v}`)
        .join(' ')}`
    );

  return { ...debug, metadata: meta };
}
