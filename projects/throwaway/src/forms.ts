import { Devvit } from '@devvit/public-api';

export const postForm = Devvit.createForm(
  ({ flairs }) => {
    const flairOptions = flairs.map((flair: any) => {
      return { label: flair.text, value: flair.id };
    });

    return {
      fields: [
        { name: 'title', label: `Post Title`, type: 'string', required: true },
        { name: 'body', label: `Post Body`, type: 'paragraph' },
        { name: 'flair', label: `Flair`, options: flairOptions, type: 'select' },
      ],
      title: 'Post Form',
      acceptLabel: 'Post Anonymously',
    };
  },
  async ({ values }, context) => {
    if (!context.userId)
      return context.ui.showToast("Unable to post anonymously unless you're logged in.");
    let sr = await context.reddit.getSubredditById(context.subredditId);
    let post = await context.reddit.submitPost({
      subredditName: sr.name,
      title: values['title'],
      text: `Anonymous OP says: \n\n${values['body']}`,
    });
    await context.redis.hset(post.id, {
      author: post.id,
      [context.userId]: `Anonymous OP`,
    });
    return context.ui.showToast('Post created, referesh to update.');
  }
);

export const commentForm = Devvit.createForm(
  (data) => {
    return {
      fields: [
        {
          name: 'targetId',
          label: 'Post or Comment ID',
          type: 'string',
          hidden: true,
          disabled: true,
          defaultValue: data.targetId,
        },
        {
          name: 'postId',
          label: 'Post ID',
          type: 'string',
          hidden: true,
          disabled: true,
          defaultValue: data.postId,
        },
        {
          name: 'body',
          label: `Comment Body`,
          type: 'paragraph',
          required: true,
        },
      ],
      title: 'Comment Form',
      acceptLabel: 'Comment Anonymously',
    };
  },
  async ({ values }, context) => {
    const { targetId, postId } = values;
    if (!context.userId)
      return context.ui.showToast("Unable to comment anonymously unless you're logged in.");
    let alias;
    let author = await context.redis.hget(postId, 'author');
    if (author === context.userId) {
      alias = 'Anonymous OP';
    } else {
      alias = await context.redis.hget(postId, context.userId);
      if (!alias) alias = Math.random().toString(36).substring(2, 6);
      await context.redis.hset(postId, {
        [context.userId]: alias,
      });
    }
    let comment = await context.reddit.submitComment({
      id: targetId,
      text: `${alias} commented: \n\n${values['body']}`,
    });
    await context.redis.hset(postId, {
      [comment.id]: context.userId,
    });

    return context.ui.showToast('Comment created, referesh to update.');
  }
);
