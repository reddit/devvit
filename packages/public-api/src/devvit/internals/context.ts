import type { Metadata } from '@devvit/protos';
import { getFromMetadata } from '@devvit/runtimes/common/envelope/EnvelopeUtil.js';
import { Header } from '@devvit/shared-types/Header.js';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import type { BaseContext } from '../../types/context.js';

export function getContextFromMetadata(
  metadata: Metadata,
  postId?: string,
  commentId?: string
): BaseContext {
  const subredditId = getFromMetadata(Header.Subreddit, metadata);
  assertNonNull(subredditId, 'subreddit is missing from Context');

  const appAccountId = getFromMetadata(Header.AppUser, metadata);
  assertNonNull(appAccountId, 'appAccountId is missing from Context');

  const userId = getFromMetadata(Header.User, metadata);
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
