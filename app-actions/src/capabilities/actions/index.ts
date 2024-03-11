import { Devvit } from '@devvit/public-api';
import { CreatePreview } from '../../components/Preview.js';

/*
 * Menu action to create a custom post
 */
Devvit.addMenuItem({
  label: 'New custom post',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const subreddit = await context.reddit.getCurrentSubreddit();

    const post = await context.reddit.submitPost({
      // This will show while your custom post is loading
      preview: CreatePreview(),
      title: `${subreddit.name} Hello Custom Post`,
      subredditName: subreddit.name,
    });

    context.ui.showToast({
      text: `Successfully created a custom post!`,
      appearance: 'success',
    });

    context.ui.navigateTo(post);
  },
});
