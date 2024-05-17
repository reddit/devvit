// Learn more at developers.reddit.com/docs
import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
});

// Add a menu item to the subreddit menu
// for instantiating the new custom post
Devvit.addMenuItem({
  label: 'Add my custom post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: 'My custom post',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.showToast({ text: 'Created post!' });
  },
});

// Add a custom post type definition
Devvit.addCustomPostType({
  name: 'Custom Post',
  height: 'regular',
  render: (context) => {
    const { useState } = context;
    const [counter, setCounter] = useState(0);

    return (
      <vstack height="100%" width="100%" gap="medium" alignment="center middle">
        <image
          url="logo.png"
          description="logo"
          imageHeight={256}
          imageWidth={256}
          height="48px"
          width="48px"
        />
        <text size="large">{`Click counter: ${counter}`}</text>
        <button appearance="primary" onPress={() => setCounter((counter) => counter + 1)}>
          Click me!
        </button>
      </vstack>
    );
  },
});

export default Devvit;
