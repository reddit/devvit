import type { FlairTextColor, MenuItem } from '@devvit/public-api';
import { Devvit } from '@devvit/public-api';

import { LoadingState } from '../components/LoadingState.js';
import { Service } from '../service/Service.js';
import Settings from '../settings.json';

export const installGame: MenuItem = {
  label: '[Pixelary] Install Game',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { ui, reddit } = context;
    const service = new Service(context);
    const community = await reddit.getCurrentSubreddit();

    // Check if post flairs are enabled in the community
    if (!community.postFlairsEnabled) {
      ui.showToast('Enable post flairs first!');
      return;
    }

    const [post, activeFlair, endedFlair] = await Promise.all([
      // Create the pinned post
      reddit.submitPost({
        title: Settings.pinnedPost.title,
        subredditName: community.name,
        preview: <LoadingState />,
      }),
      // Create the game "Active" flair for drawings
      reddit.createPostFlairTemplate({
        subredditName: community.name,
        text: 'Active',
        textColor: Settings.flair.active.textColor as FlairTextColor,
        backgroundColor: Settings.flair.active.backgroundColor,
      }),
      // Create the "Ended" flair for drawings
      reddit.createPostFlairTemplate({
        subredditName: community.name,
        text: 'Ended',
        textColor: Settings.flair.ended.textColor as FlairTextColor,
        backgroundColor: Settings.flair.ended.backgroundColor,
      }),
    ]);

    await Promise.all([
      // Pin the post
      post.sticky(),
      // Store the post data
      service.savePinnedPost(post.id),
      // Store the game settings
      service.storeGameSettings({
        subredditName: community.name,
        activeFlairId: activeFlair.id,
        endedFlairId: endedFlair.id,
        selectedDictionary: 'main',
      }),
    ]);

    ui.navigateTo(post);
    ui.showToast('Installed Pixelary!');
  },
};
