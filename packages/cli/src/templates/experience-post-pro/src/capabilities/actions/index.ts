import { Devvit } from '@devvit/public-api';

import { CreatePreview } from '../../components/Preview.js';

/*
Menu action to create an experience post.
 */
Devvit.addMenuItem({
  label: 'New devvit post',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const subreddit = await context.reddit.getCurrentSubreddit();

    const post = await context.reddit.submitPost({
      // This will show while your post is loading
      preview: CreatePreview(),
      title: `Hello ${subreddit.name}`,
      subredditName: subreddit.name,
    });

    context.ui.showToast({
      text: `Successfully created your post!`,
      appearance: 'success',
    });

    context.ui.navigateTo(post);
  },
});
