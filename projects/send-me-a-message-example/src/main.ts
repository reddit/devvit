import { Devvit } from '@devvit/public-api';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';

Devvit.addMenuItem({
  label: 'Send PM',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { userId, reddit, ui } = context;

    if (!userId) {
      ui.showToast('Unknown user!');
      return;
    }

    try {
      await reddit.sendPrivateMessage({
        to: userId,
        subject: 'Hello World!',
        text: 'Hey, the test action worked!',
      });
      ui.showToast('Message sent!');
    } catch (err) {
      ui.showToast(StringUtil.caughtToString(err));
    }
  },
});

export default Devvit;
