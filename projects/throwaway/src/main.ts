// Visit developers.reddit.com/docs to learn Devvit!
import { Devvit } from '@devvit/public-api';
import { commentForm, postForm } from './forms.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Create Anonymous Post',
  onPress: async (_event, context) => {
    const isBanned = await context.redis.get('banned:' + context.userId);
    if (isBanned) {
      const expireTime =
        Math.round(((await context.redis.expireTime('banned:' + context.userId)) / 3600) * 100) /
        100;
      return context.ui.showToast(
        `You are banned from using this feature for ${expireTime} hours.`
      );
    }

    const subredditName = (await context.reddit.getSubredditById(context.subredditId)).name;
    let flairs = await context.reddit.getPostFlairTemplates(subredditName);
    return context.ui.showForm(postForm, { flairs: flairs });
  },
});

Devvit.addMenuItem({
  location: ['post', 'comment'],
  label: 'Reply Anonymously',
  onPress: async (event, context) => {
    const isBanned = await context.redis.get('banned:' + context.userId);
    if (isBanned) {
      const expireTime =
        Math.round(((await context.redis.expireTime('banned:' + context.userId)) / 3600) * 100) /
        100;
      return context.ui.showToast(
        `You are banned from using this feature for ${expireTime} hours.`
      );
    }

    let targetId;
    let postId;
    if (event.location === 'comment') {
      targetId = context.commentId || '';
      postId = (await context.reddit.getCommentById(targetId)).postId || '';
    } else {
      targetId = context.postId;
      postId = context.postId;
    }
    return context.ui.showForm(commentForm, { targetId: targetId, postId: postId });
  },
});

Devvit.addMenuItem({
  location: ['post', 'comment'],
  forUserType: 'moderator',
  label: 'Ban anon usage for 7 days',
  onPress: async (event, context) => {
    let user;
    if (event.location === 'post') user = await context.redis.hget(context.postId || '', 'author');
    else {
      let comment = await context.reddit.getCommentById(context.commentId || '');
      if (comment.authorId !== context.appAccountId)
        return context.ui.showToast('Unable to ban from non-anonymous post');
      user = await context.redis.hget(comment.postId || '', comment.id || '');
    }
    if (!user) return context.ui.showToast('Unable to find user to ban.');

    if (user) {
      await context.redis.set(`banned:${user}`, 'true');
      await context.redis.expire(`banned:${user}`, 604800);
      return context.ui.showToast('User banned for 7 days, referesh to update.');
    }
  },
});

Devvit.addMenuItem({
  location: ['post'],
  label: 'Delete Anonymous Post',
  onPress: async (_event, context) => {
    let postId = context.postId || '';
    let author = await context.redis.hget(postId, 'author');
    if (author !== context.userId)
      return context.ui.showToast('You can only delete posts you made.');
    let post = await context.reddit.getPostById(postId);
    await post.remove();
    await context.redis.del(postId);
    return context.ui.showToast('Post deleted, referesh to update.');
  },
});

export default Devvit;
