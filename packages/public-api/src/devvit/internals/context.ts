import type { Metadata } from '@devvit/protos';
import type { AppDebug } from '@devvit/shared-types/Header.js';
import { Header } from '@devvit/shared-types/Header.js';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import pkg from '../../../package.json' assert { type: 'json' };
import type { BaseContext, ContextDebugInfo } from '../../types/context.js';

let loggedVersion: boolean = false;

export function getContextFromMetadata(
  metadata: Metadata,
  postId?: string,
  commentId?: string
): BaseContext {
  const subredditId = metadata[Header.Subreddit]?.values[0];
  assertNonNull<string | undefined>(subredditId, 'subreddit is missing from Context');

  const appAccountId = metadata[Header.AppUser]?.values[0];
  assertNonNull<string | undefined>(appAccountId, 'appAccountId is missing from Context');

  const userId = metadata[Header.User]?.values[0];
  const debug = parseDebug(metadata);

  return {
    appAccountId,
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
    runtime: undefined,
    surface: undefined,
    useAsync: undefined,
    useChannel: undefined,
  };
  // {[key: Lowercase<AppDebug>]: AppDebug}
  const lowerKeyToKey: { [lower: string]: string } = {};
  for (const key in keyset) lowerKeyToKey[key.toLowerCase()] = key;

  // Report package version once if debug mode is set.
  if (!loggedVersion && meta[Header.Debug]) {
    loggedVersion = true;
    console.info(`[api] @devvit/public-api v${pkg.version}`);
  }

  const debug: ContextDebugInfo = { metadata: meta };
  // hack: gRPC-web header values don't split in compute. always join then split
  //       for parity in both local and remote runtimes.
  for (const kv of (meta[Header.Debug]?.values ?? []).join().split(',')) {
    let [key, val] = kv.split('=');
    if (!key) continue;

    key = key.trim();
    val = val?.trim();

    if (key.toLowerCase() in lowerKeyToKey) key = lowerKeyToKey[key.toLowerCase()];
    else console.warn(`[api] unknown devvit-debug header "${key}"`);

    debug[key as AppDebug] ??= val || `${true}`;
    console.info(`[api] set devvit-debug ${key}=${debug[key as AppDebug]}`);
  }
  return debug;
}
