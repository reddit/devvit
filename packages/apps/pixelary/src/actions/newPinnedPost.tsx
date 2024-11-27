import type { MenuItem } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';

import { LoadingState } from '../components/LoadingState.js';
import { Service } from '../service/Service.js';
import Settings from '../settings.json';

export const newPinnedPost: MenuItem = {
  label: '[Pixelary] New Pinned Post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const service = new Service(context);
    const community = await context.reddit.getCurrentSubreddit();
    const post = await context.reddit.submitPost({
      title: Settings.pinnedPost.title,
      subredditName: community.name,
      preview: <LoadingState />,
    });
    await post.sticky();
    await service.savePinnedPost(post.id);
    context.ui.navigateTo(post);
  },
};
