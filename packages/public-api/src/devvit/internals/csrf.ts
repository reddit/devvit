import type { ContextActionRequest, HandleUIEventRequest } from '@devvit/protos';
import { Header } from '@devvit/shared-types/Header.js';

import type { BaseContext, ContextAPIClients } from '../../types/context.js';
import { getMenuItemById } from './menu-items.js';

type CSRF = {
  needsModCheck: boolean;
};

export async function addCSRFTokenToContext(
  context: BaseContext & ContextAPIClients,
  req: ContextActionRequest
) {
  const commentId = req.comment?.id && `t1_${req.comment.id}`;
  const postId = req.post?.id && `t3_${req.post.id}`;
  const subredditId = req.subreddit?.id && `t5_${req.subreddit.id}`;
  const targetId = commentId || postId || subredditId;

  if (!targetId) {
    throw new Error('targetId is missing from ContextActionRequest');
  }

  const currentUser = context.debug.metadata[Header.User].values[0];
  const subredditHeader = context.debug.metadata[Header.Subreddit].values[0];

  if (!currentUser || !subredditHeader) {
    throw new Error('User or subreddit missing from context');
  }

  if (commentId) {
    const comment = await context.reddit.getCommentById(commentId);
    if (!comment) {
      throw new Error(`Comment ${commentId} not found`);
    }
    if (comment.subredditId !== subredditId) {
      throw new Error('Comment does not belong to the subreddit');
    }
  }

  if (postId) {
    const post = await context.reddit.getPostById(postId);
    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }
    if (post.subredditId !== subredditId) {
      throw new Error('Post does not belong to the subreddit');
    }
  }

  if (subredditId && subredditId !== subredditHeader) {
    throw new Error(`Subreddit ${subredditId} ${subredditHeader} not found`);
  }

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

  await context.redis.set(
    `${currentUser}${subredditHeader}${targetId}${req.actionId}`,
    JSON.stringify(val)
  );
  await context.redis.expire(`${currentUser}${subredditHeader}${targetId}${req.actionId}`, 600);
  console.debug('CSRF token added: ' + JSON.stringify(val));
}

async function isModerator(context: BaseContext & ContextAPIClients) {
  const currentUser = context.debug.metadata[Header.User].values[0];
  if (!currentUser) {
    throw new Error('User missing from context');
  }
  const subredditHeader = context.debug.metadata[Header.Subreddit].values[0];
  if (!subredditHeader) {
    throw new Error('Subreddit missing from context');
  }

  const subreddit = await context.reddit.getSubredditInfoById(subredditHeader);
  const mods = await context.reddit.getModerators({ subredditName: subreddit.name! }).all();
  return !!mods.find((mod) => mod.id === currentUser);
}

export async function validateCSRFToken(
  context: BaseContext & ContextAPIClients,
  req: HandleUIEventRequest
) {
  const currentUser = context.debug.metadata[Header.User].values[0];
  const subredditHeader = context.debug.metadata[Header.Subreddit].values[0];
  const { actionId, thingId } = req.state?.__contextAction ?? {};
  const csrfData = await context.redis.get(`${currentUser}${subredditHeader}${thingId}${actionId}`);
  if (!csrfData) {
    throw new Error('CSRF token not found');
  }
  const csrf = JSON.parse(csrfData) as CSRF;
  if (csrf.needsModCheck && !(await isModerator(context))) {
    throw new Error('User is not a moderator: ' + currentUser + '; ' + subredditHeader);
  }
  console.debug('CSRF token validated: ' + csrfData);
}
