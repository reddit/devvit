import type { Metadata } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import type { BaseContext } from '../../types/context.js';

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
  const debug = { metadata };

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
