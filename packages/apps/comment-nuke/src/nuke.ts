import { Comment, Devvit, Post } from '@devvit/public-api';

export type NukeProps = {
  remove: boolean;
  lock: boolean;
  skipDistinguished: boolean;
  commentId: string;
  subredditId: string;
};

export type NukePostProps = {
  remove: boolean;
  lock: boolean;
  skipDistinguished: boolean;
  postId: string;
  subredditId: string;
};

async function* getAllCommentsInThread(comment: Comment, skipDistinguished: boolean): AsyncGenerator<Comment> {
  const replies = await comment.replies.all();
  for (const reply of replies) {
    if (!skipDistinguished || !reply.isDistinguished()) {
      yield* getAllCommentsInThread(reply, skipDistinguished);
      yield reply;
    }
  }
}

async function* getAllCommentsInPost(post: Post, skipDistinguished: boolean): AsyncGenerator<Comment> {
  const comments = await post.comments.all();
  for (const comment of comments) {
    if (!skipDistinguished || !comment.isDistinguished()) {
      yield* getAllCommentsInThread(comment, skipDistinguished);
      yield comment;
    }
  }
}

export async function handleNukePost(props: NukePostProps, context: Devvit.Context) {
  const startTime = new Date();
  let success = true;
  let message: string;

  const shouldLock = props.lock;
  const shouldRemove = props.remove;
  const skipDistinguished = props.skipDistinguished;

  try {
    const [user, post] = await Promise.all([
      context.reddit.getCurrentUser(),
      context.reddit.getPostById(props.postId)
    ]);

    if (!user) {
      return { success: false, message: "Can't get user" };
    }

    const modPermissions = await user.getModPermissionsForSubreddit(post.subredditName);
    const canManagePosts = modPermissions.includes('all') || modPermissions.includes('posts');

    console.log(
      `Mod Info: r/${post.subredditName} u/${user.username} permissions:${modPermissions}: ${
        canManagePosts ? 'Can mod' : 'Cannot mod'
      }`
    );

    if (!canManagePosts) {
      console.info('A user without the correct mod permissions tried to nuke all comments of a post.');
      return {
        message: 'You do not have the correct mod permissions to do this.',
        success: false,
      };
    }

    const comments: Comment[] = [];
    for await (const eachComment of getAllCommentsInPost(post, skipDistinguished)) {
      comments.push(eachComment);
    }

    if (shouldLock) {
      await Promise.all(comments.map(comment => comment.locked || comment.lock()));
    }

    if (shouldRemove) {
      await Promise.all(comments.map(comment => comment.removed || comment.remove()));
    }

    const verbage =
      shouldLock && shouldRemove ? 'removed and locked' : shouldLock ? 'locked' : 'removed';

    if (shouldRemove) {
      /* try {
        await context.modLog.add({
          action: 'removecomment',
          target: props.postId,
          details: 'comment-mop app',
          description: `u/${user.username} used comment-mop to ${verbage} all comments of this post.`,
        });
      } catch (e: any) {
        console.error(`Failed to add modlog for post: ${props.postId}.`, e.message);
      } */
    }

    success = true;
    message = `Comments ${verbage}! Refresh the page to see the cleanup.`;
    const finishTime = new Date();
    console.info(`Operation completed in ${(finishTime.getTime() - startTime.getTime()) / 1000} seconds.`);
  } catch (err: any) {
    success = false;
    message = 'Mop failed! Please try again later.';
    console.error(err);
  }

  return { success, message };
}

export async function handleNuke(props: NukeProps, context: Devvit.Context) {
  const startTime = new Date();
  let success = true;
  let message: string;

  const shouldLock = props.lock;
  const shouldRemove = props.remove;
  const skipDistinguished = props.skipDistinguished;

  try {
    const comment = await context.reddit.getCommentById(props.commentId);
    const user = await context.reddit.getCurrentUser();

    if (!user) {
      return { success: false, message: "Can't get user" };
    }

    const modPermissions = await user.getModPermissionsForSubreddit(comment.subredditName);
    const canManagePosts = modPermissions.includes('all') || modPermissions.includes('posts');

    console.log(
      `Mod Info: r/${comment.subredditName} u/${user.username} permissions:${modPermissions}: ${
        canManagePosts ? 'Can mod' : 'Cannot mod'
      }`
    );

    if (!canManagePosts) {
      console.info('A user without the correct mod permissions tried to comment mop.');
      return {
        message: 'You do not have the correct mod permissions to do this.',
        success: false,
      };
    }

    const comments: Comment[] = [];
    for await (const eachComment of getAllCommentsInThread(comment, skipDistinguished)) {
      comments.push(eachComment);
    }

    if (shouldLock) {
      await Promise.all(comments.map(comment => comment.locked || comment.lock()));
    }

    if (shouldRemove) {
      await Promise.all(comments.map(comment => comment.removed || comment.remove()));
    }

    const verbage =
      shouldLock && shouldRemove ? 'removed and locked' : shouldLock ? 'locked' : 'removed';

    if (shouldRemove) {
      /* try {
        await context.modLog.add({
          action: 'removecomment',
          target: props.commentId,
          details: 'comment-mop app',
          description: `u/${user.username} used comment-mop to ${verbage} this comment and all child comments.`,
        });
      } catch (e: any) {
        console.error(`Failed to add modlog for comment: ${props.commentId}.`, e.message);
      } */
    }

    success = true;
    message = `Comments ${verbage}! Refresh the page to see the cleanup.`;
    const finishTime = new Date();
    console.info(`Operation completed in ${(finishTime.getTime() - startTime.getTime()) / 1000} seconds.`);
  } catch (err: any) {
    success = false;
    message = 'Mop failed! Please try again later.';
    console.error(err);
  }

  return { success, message };
}
