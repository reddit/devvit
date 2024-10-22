import { Devvit } from '@devvit/public-api';

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Create CI payments post',
  onPress: async (_, context) => {
    const { reddit, ui } = context;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'Payments playground',
      subredditName: currentSubreddit.name,
      preview: (
        <vstack padding="medium" cornerRadius="medium">
          <text style="heading" size="medium">
            Loading payments playground...
          </text>
        </vstack>
      ),
    });
    ui.navigateTo(post.url);
  },
});
