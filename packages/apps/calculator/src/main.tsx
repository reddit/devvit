import { Devvit } from '@devvit/public-api';
import { Calculator } from './components/Calculator.js';

Devvit.configure({
  redditAPI: true,
});

Devvit.addMenuItem({
  label: 'Post a calculator',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_, { reddit, ui }) => {
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      preview: (
        <vstack gap="medium" alignment="middle center" grow>
          <Calculator disabled />
        </vstack>
      ),
      title: `Calculator`,
      subredditName: subreddit.name,
    });

    ui.showToast({
      text: `Successfully created calculator!`,
      appearance: 'success',
    });

    ui.navigateTo(post);
  },
});

Devvit.addCustomPostType({
  name: 'Calculator',
  height: 'tall',
  render: () => {
    return (
      <vstack gap="medium" alignment="middle center" grow>
        <Calculator />
      </vstack>
    );
  },
});

export default Devvit;
