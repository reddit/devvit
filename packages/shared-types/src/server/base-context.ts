import type { RequestContext } from '@devvit/protos/json/devvit/platform/v1/request_context.js';
import type { DevvitPostData } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

import { Header } from '../Header.js';
import { assertNonNull } from '../NonNull.js';
import type { PostData } from '../PostData.js';
import type { BaseContext } from '../shared/baseContext.js';
import { T1, T2, T3, T5 } from '../tid.js';

/**
 * Claims payload extracted from a Devvit JWT.
 * This represents a JSON Web Token (JWT) that holds the `devvit` platform request context
 */
type ContextClaims = JwtPayload & { devvit: RequestContext };

export function BaseContextFromMetadata(
  meta: Metadata,
  postId: string | undefined,
  commentId: string | undefined
): BaseContext {
  const subredditId = meta[Header.Subreddit]?.values[0];
  assertNonNull<string | undefined>(subredditId, 'subreddit is missing from Context');

  // 'devvit-post-data' is a JSON string. If set in the header, parse it as
  // DevvitPostData.
  let postData: PostData | undefined;
  const postDataJson = meta[Header.PostData]?.values[0];
  if (postDataJson) {
    // Hack: assume DevvitPostData is JSON compatible for outdated iOS releases
    //       around 2025.39.1.616587.
    postData = (JSON.parse(postDataJson) as DevvitPostData).developerData;
  }

  const appSlug = meta[Header.App]?.values[0];
  let signedRequestContext: RequestContext | undefined;
  try {
    // TODO - Use the RequestContext to extract other metadata like postData,
    // userId, username, etc.
    signedRequestContext = decodeSignedRequestContext(meta[Header.Context]?.values[0]);
  } catch {
    //
  }
  const loid =
    signedRequestContext?.user?.devvitLoid ??
    // to-do: stop sending snake_case for some data inconsistently.
    (signedRequestContext?.user as { devvit_loid?: string } | undefined)?.devvit_loid;
  const userId = meta[Header.User]?.values[0];

  return {
    appName: appSlug,
    appSlug,
    appVersion: meta[Header.Version]?.values[0],
    commentId: commentId ? T1(commentId) : undefined,
    loid,
    postData,
    postId: postId ? T3(postId) : undefined,
    snoovatar: meta[Header.UserSnoovatarUrl]?.values[0],
    subredditId: T5(subredditId),
    subredditName: meta[Header.SubredditName]?.values[0],
    userId: userId ? T2(userId) : undefined,
    username: meta[Header.Username]?.values[0],
  };
}

/** Decodes the signed request-context JWT. */
function decodeSignedRequestContext(token: string | undefined): RequestContext | undefined {
  if (!token) return;
  try {
    return jwtDecode<ContextClaims>(token)?.devvit;
  } catch (err) {
    throw Error('token decode failure', { cause: err });
  }
}
