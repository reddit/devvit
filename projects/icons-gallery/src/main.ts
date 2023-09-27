// Visit developers.reddit.com/docs to learn Devvit!

import { Devvit } from '@devvit/public-api';

import { IconsGallery } from './components/IconsGallery.js';
import { Preview } from './components/Preview.js';

Devvit.debug.emitSnapshots = true;

Devvit.configure({
  redditAPI: true,
});

Devvit.addCustomPostType({
  name: 'Icon Gallery',
  render: IconsGallery,
});

Devvit.addMenuItem({
  label: 'Post Icon Gallery',
  description: 'Create an Icon Gallery post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      preview: Preview(context),
      subredditName: subreddit.name,
      title: 'Icon Gallery',
    });
    ui.showToast('Icon Gallery posted!');
  },
});

export default Devvit;
