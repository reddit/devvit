import { Devvit } from '@devvit/public-api';
import SlotMachine from './SlotMachine.js';

Devvit.debug.emitSnapshots = true;
Devvit.configure({
  redditAPI: true,
});

Devvit.addMenuItem({
  label: 'Add Slot Machine',
  location: 'subreddit',

  onPress: async (_, { reddit, ui }) => {
    const subreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      preview: <></>,
      title: 'Slot Machine',
      subredditName: subreddit.name,
    });

    ui.showToast({
      text: `Created a slot machine post!`,
      appearance: 'success',
    });
  },
});

Devvit.addCustomPostType({
  name: 'slot-machine',
  render: SlotMachine,
});

export default Devvit;
