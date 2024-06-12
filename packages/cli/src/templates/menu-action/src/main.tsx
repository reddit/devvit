// Visit developers.reddit.com/docs to learn Devvit!
import { Devvit } from '@devvit/public-api';

Devvit.addMenuItem({
  location: 'post', // location where the menu item appears
  label: 'Post Action', // text to display in the menu (keep it short!)
  onPress: async (event, context) => {
    const { ui } = context;
    ui.showToast(`Post ID: ${event.targetId}`);
  },
});

Devvit.addMenuItem({
  location: 'comment',
  forUserType: 'moderator', // limit the action to moderators
  label: 'Post Action, only for mods!',
  onPress: async (event, context) => {
    const { ui } = context;
    ui.showToast(`Post ID: ${event.targetId}`);
  },
});

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Custom Subreddit Action',
  onPress: async (event, context) => {
    const { ui } = context;
    ui.showToast(`Subreddit ID: ${event.targetId}`);
  },
});

export default Devvit;
