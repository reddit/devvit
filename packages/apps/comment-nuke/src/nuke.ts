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

   async function getAllCommentsInPost(
    post: Post,
    result: Comment[] = []
  ): Promise<Comment[]> {
    const comments = await post.comments.all();
    if (comments.length > 0) {
      for (const comment of comments) {
        await getAllCommentsInThread(comment, result);
      }
    }
    return result;
  }
  
  export async function handleNukePost(props: NukePostProps, context: Devvit.Context) {
    const startTime = new Date();
    let success = true;
    let message: string;
  
    const shouldLock = props.lock;
    const shouldRemove = props.remove;
    const skipDistinguished = props.skipDistinguished;
  
    if (!shouldLock && !shouldRemove) {
      return { message: 'You must select either lock or remove.', success: false };
    }
  
    try {
      const post = await context.reddit.getPostById(props.postId);
      const user = await context.reddit.getCurrentUser();
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
          message: 'You do you not have the correct mod permissions to do this.',
          success: false,
        };
      }
  
      const allComments = await getAllCommentsInPost(post);
      const comments = allComments.filter(
        (eachComment: any) => !(skipDistinguished && eachComment.isDistinguished())
      );
  
      const lockPromises: Promise<any>[] = [];
      const removePromises: Promise<any>[] = [];
  
      for (const eachComment of comments) {
        const commentId = eachComment.id;
        if (shouldLock && !eachComment.locked) {
          lockPromises.push(eachComment.lock());
        }
  
        if (shouldRemove && !eachComment.removed) {
          removePromises.push(eachComment.remove());
        }
      }
      const responses = await Promise.all([...removePromises, ...lockPromises]);
  
      for (const r of responses) {
        if (r && r.status === 'rejected') {
          console.error('Failed to remove or lock a comment.');
          console.info(r.reason);
        }
      }
  
      const verbage =
        shouldLock && shouldRemove ? 'removed and locked' : shouldLock ? 'locked' : 'removed';
  
      if (shouldRemove) {
        const postId = props.postId;
        await context.modLog
          .add({
            action: 'removecomment',
            target: postId,
            details: 'comment-mop app',
            description: `u/${user.username} used comment-mop to ${verbage} all comments of this post.`,
          })
          .catch((e: any) =>
            console.error(`Failed to add modlog for post: ${postId}.`, e.message)
          );
      }
  
      success = true;
      message = `${comments.length} comment${
        comments.length > 1 ? 's' : ''
      } ${verbage}! Refresh the page to see the cleanup.`;
  
      const finishTime = new Date();
      const timeElapsed = (finishTime as any) - (startTime as any);
      console.info(`${comments.length} comment(s) handled in ${timeElapsed / 1000} seconds.`);
    } catch (err: any) {
      success = false;
      message = 'Mop failed! Please try again later.';
      console.error(`${err.toString()}`);
    }
  
    return { success, message };
  }

async function getAllCommentsInThread(
  comment: Comment,
  result: Comment[] = []
): Promise<Comment[]> {
  result.push(comment);
  const replies = await comment.replies.all();
  // console.log(`added comment - ${comment.id} - ${comment.body} - replies: ${replies.length}`);
  if (replies.length > 0) {
    for (const reply of replies) {
      await getAllCommentsInThread(reply, result);
    }
  }
  return result;
}

export async function handleNuke(props: NukeProps, context: Devvit.Context) {
  const startTime = new Date();
  let success = true;
  let message: string;

  const shouldLock = props.lock;
  const shouldRemove = props.remove;
  const skipDistinguished = props.skipDistinguished;

  if (!shouldLock && !shouldRemove) {
    return { message: 'You must select either lock or remove.', success: false };
  }

  try {
    const comment = await context.reddit.getCommentById(props.commentId);
    const user = await context.reddit.getCurrentUser();
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
        message: 'You do you not have the correct mod permissions to do this.',
        success: false,
      };
    }

    const allComments = await getAllCommentsInThread(comment);
    const comments = allComments.filter(
      (eachComment) => !(skipDistinguished && eachComment.isDistinguished())
    );

    // Build lock and remove promise arrays
    const lockPromises: Promise<any>[] = [];
    const removePromises: Promise<any>[] = [];

    for (const eachComment of comments) {
      const commentId = eachComment.id;
      if (shouldLock && !eachComment.locked) {
        console.info(`Locking comment ${commentId}.`);
        lockPromises.push(eachComment.lock());
      }

      if (shouldRemove && !eachComment.removed) {
        console.info(`Removing comment ${commentId}.`);
        removePromises.push(eachComment.remove());
      }
    }
    const responses = await Promise.all([...removePromises, ...lockPromises]);

    for (const r of responses) {
      if (r && r.status === 'rejected') {
        console.error('Failed to remove or lock a comment.');
        console.info(r.reason);
      }
    }

    const verbage =
      shouldLock && shouldRemove ? 'removed and locked' : shouldLock ? 'locked' : 'removed';

    if (shouldRemove) {
      const commentId = props.commentId;
      await context.modLog
        .add({
          action: 'removecomment',
          target: commentId,
          details: 'comment-mop app',
          description: `u/${user.username} used comment-mop to ${verbage} this comment and all child comments.`,
        })
        .catch((e: any) =>
          console.error(`Failed to add modlog for comment: ${commentId}.`, e.message)
        );
    }

    success = true;
    message = `${comments.length} comment${
      comments.length > 1 ? 's' : ''
    } ${verbage}! Refresh the page to see the cleanup.`;

    // Log out how long the action took to run.
    const finishTime = new Date();
    const timeElapsed = (finishTime as any) - (startTime as any);
    console.info(`${comments.length} comment(s) handled in ${timeElapsed / 1000} seconds.`);
  } catch (err: any) {
    success = false;
    message = 'Mop failed! Please try again later.';
    console.error(`${err.toString()}`);
  }
  

  return { success, message };
}
