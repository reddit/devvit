import { Devvit } from '@devvit/public-api-next';

/**
 * Declare the custom actions we'd like to add to the subreddit
 */
Devvit.addMenuItem({
  location: 'post', // location where the menu item appears
  label: 'Custom Post Action', // text to display in the menu (keep it short!)
  onPress: async (event, context) => {
    const message = `Post action! Post ID: ${event.targetId}`;
    console.log(message);
    const { ui } = context;
    ui.showToast(message);
  },
});

Devvit.addMenuItem({
  location: 'post',
  forUserType: 'moderator', // limit the action to moderators
  label: 'Custom Post Action, only for mods!',
  onPress: async (event, context) => {
    const message = `Post action for mods! Post ID: ${event.targetId}`;
    console.log(message);
    const { ui } = context;
    ui.showToast(message);
  },
});

Devvit.addMenuItem({
  location: 'comment',
  label: 'Custom Comment Action',
  onPress: async (event, context) => {
    const message = `Comment action! Comment ID: ${event.targetId}`;
    console.log(message);
    const { ui } = context;
    ui.showToast(message);
  },
});

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Custom Subreddit Action',
  onPress: async (event, context) => {
    const message = `Subreddit action! Subreddit ID: ${event.targetId}`;
    console.log(message);
    const { ui } = context;
    ui.showToast(message);
  },
});

export default Devvit;
