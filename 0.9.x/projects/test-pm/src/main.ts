import { Devvit } from '@devvit/public-api';

Devvit.addMenuItem({
  label: 'read pms',
  location: 'post',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const pms = await reddit.getMessages({ type: 'sent', limit: 10 });
    let i = 0;
    for await (const pm of pms) {
      console.log(++i);
      console.log({ pm });
    }
    ui.showToast('nice');
  },
});

Devvit.addMenuItem({
  label: 'mark all as read',
  location: 'post',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    await reddit.markAllMessagesAsRead();
    ui.showToast('marked all as read');
  },
});

export default Devvit;
