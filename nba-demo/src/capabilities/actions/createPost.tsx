import { Devvit } from '@devvit/public-api';
import { Preview } from '../../components/Preview.js';

Devvit.addMenuItem({
  location: 'subreddit',
  label: '[Demo] Create an NBA post',
  onPress: async (event, context) => {
    const subreddit = await context.reddit.getCurrentSubreddit();
    const post = await context.reddit.submitPost({
      title: `NBA Scoreboard`,
      subredditName: subreddit.name,
      preview: <Preview />,
    });
    context.ui.showToast('NBA Scoreboard Post created successfully!');
    context.ui.navigateTo(post);
  },
});
