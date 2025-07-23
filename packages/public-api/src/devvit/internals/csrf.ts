import type { ContextActionRequest, HandleUIEventRequest } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';

import type { BaseContext, ContextAPIClients } from '../../types/context.js';
import { getMenuItemById } from './menu-items.js';

type CSRF = {
  needsModCheck: boolean;
};

function getUserHeader(context: BaseContext & ContextAPIClients): string {
  const userHeader = context.metadata[Header.User].values[0];
  if (!userHeader) {
    throw new Error('User missing from context');
  }
  return userHeader;
}

function getSubredditHeader(context: BaseContext & ContextAPIClients): string {
  const subredditHeader = context.metadata[Header.Subreddit].values[0];
  if (!subredditHeader) {
    throw new Error('Subreddit missing from context');
  }
  return subredditHeader;
}

export async function addCSRFTokenToContext(
  context: BaseContext & ContextAPIClients,
  req: ContextActionRequest
) {
  /**
   * These headers represent the canonical user and subreddit for the current context.  The user is validated by gateway against
   * the edge context, so we trust it.
   */
  const userHeader = getUserHeader(context);
  const subredditHeader = getSubredditHeader(context);

  if (!userHeader || !subredditHeader) {
    throw new Error('User or subreddit missing from context');
  }

  /**
   * These are the target ids for the action.  They are provided by the user, but we need to validate them.
   */
  const commentId = req.comment?.id && `t1_${req.comment.id}`;
  const postId = req.post?.id && `t3_${req.post.id}`;
  const subredditId = req.subreddit?.id && `t5_${req.subreddit.id}`;
  const targetId = commentId || postId || subredditId;

  if (!targetId) {
    throw new Error('targetId is missing from ContextActionRequest');
  }

  /**
   * Validate user-provided commentId
   */
  if (commentId) {
    const comment = await context.reddit.getCommentById(commentId);
    if (!comment) {
      throw new Error(`Comment ${commentId} not found`);
    }
    if (comment.subredditId !== subredditHeader) {
      throw new Error(`Comment does not belong to the subreddit`);
    }
  }

  /**
   * Validate user-provided postId
   */
  if (postId) {
    const post = await context.reddit.getPostById(postId);
    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }
    if (post.subredditId !== subredditHeader) {
      throw new Error(`Post does not belong to the subreddit`);
    }
  }

  /**
   * Validate user-provided subredditId
   */
  if (subredditId && subredditId !== subredditHeader) {
    throw new Error(`Subreddit ${subredditId} ${subredditHeader} not found`);
  }

  /**
   * Validate moderator status if needed
   */
  const thisItem = getMenuItemById(req.actionId);
  if (!thisItem) {
    throw new Error('Action not found');
  }
  const needsModCheck = !!thisItem.forUserType?.includes('moderator');
  if (needsModCheck && !isModerator(context)) {
    throw new Error('User is not a moderator');
  }

  const val: CSRF = {
    needsModCheck,
  };

  /**
   * Store a CSRF token in redis for this action.  There's no way to pass this along, so we need to store it in redis.
   */
  await context.redis.set(
    `${userHeader}${subredditHeader}${targetId}${req.actionId}`,
    JSON.stringify(val)
  );
  await context.redis.expire(`${userHeader}${subredditHeader}${targetId}${req.actionId}`, 600);
}

async function isModerator(context: BaseContext & ContextAPIClients) {
  const userHeader = getUserHeader(context);
  const subredditHeader = getSubredditHeader(context);

  const subreddit = await context.reddit.getSubredditInfoById(subredditHeader);
  const mods = await context.reddit.getModerators({ subredditName: subreddit.name! }).all();
  return !!mods.find((mod) => mod.id === userHeader);
}

export async function validateCSRFToken(
  context: BaseContext & ContextAPIClients,
  req: HandleUIEventRequest
) {
  const userHeader = getUserHeader(context);
  const subredditHeader = getSubredditHeader(context);
  const { actionId, thingId } = req.state?.__contextAction ?? {};
  const csrfData = await context.redis.get(`${userHeader}${subredditHeader}${thingId}${actionId}`);
  if (!csrfData) {
    throw new Error('CSRF token not found');
  }
  const csrf = JSON.parse(csrfData) as CSRF;
  if (csrf.needsModCheck && !(await isModerator(context))) {
    throw new Error('User is not a moderator: ' + userHeader + '; ' + subredditHeader);
  }
}
