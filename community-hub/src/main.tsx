import { Context, Devvit } from '@devvit/public-api';
import { App } from './pages/app.js';
import { PinPost } from './api/PinPost.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Create Hub',
  forUserType: 'moderator',
  onPress: async (_, context) => {
    const { reddit, userId } = context;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    const subName = currentSubreddit.name;
    const user = await reddit.getUserById(userId!);

    context.ui.showForm(createPost, { subName, username: user.username });
  },
});

const createPost = Devvit.createForm(
  (data) => {
    return {
      fields: [
        {
          name: 'title',
          label: `Post Title`,
          type: 'string',
          defaultValue: `${data.subName} Info`,
        },
        {
          name: 'subName',
          label: `Subreddit`,
          type: 'string',
          defaultValue: `${data.subName}`,
          disabled: true,
        },
        {
          name: 'username',
          label: `Creator`,
          type: 'string',
          defaultValue: `${data.username}`,
          disabled: true,
        },
      ],
      title: 'Create Hub',
      acceptLabel: 'Create',
    };
  },
  async ({ values }, context) => {
    const { reddit } = context;
    const { title, username, subName } = values;

    const post = await reddit.submitPost({
      title,
      subredditName: subName,
      preview: (
        <vstack>
          <text color="black white">Loading...</text>
        </vstack>
      ),
    });

    const svc = new PinPost(post.id, context);
    await svc.createPinPost({
      username,
      title,
      url: post.url,
      header: `Welcome to ${post.subredditName}`,
    });

    context.ui.showToast(`Success! Check your inbox.`);

    await reddit.sendPrivateMessage({
      to: username,
      subject: 'Set up your Community Hub',
      text: `View your post to set it up: ${post.url}`,
    });
  }
);

Devvit.addCustomPostType({
  name: 'pInfo',
  description: 'Info Post for Pinning',
  render: App,
});

export default Devvit;
