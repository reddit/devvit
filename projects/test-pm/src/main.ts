import { Context, Devvit, RedditAPIClient, UserContext } from '@devvit/public-api-old';
const reddit = new RedditAPIClient();

Devvit.addAction({
  name: 'read pms',
  description: 'Reads your private messages',
  context: Context.POST,
  userContext: UserContext.MEMBER,
  handler: async (_ctx, md) => {
    const pms = await reddit.getMessages({ type: 'sent', limit: 10 }, md);
    let i = 0;
    for await (const pm of pms) {
      console.log(++i);
      console.log({ pm });
    }
    return { success: true, message: 'nice' };
  },
});

Devvit.addAction({
  name: 'mark all as read',
  description: 'Marks all your messages as read',
  context: Context.POST,
  userContext: UserContext.MEMBER,
  handler: async (_ctx, md) => {
    await reddit.markAllMessagesAsRead(md);
    return { success: true, message: 'marked all as read' };
  },
});

// Visit developers.reddit.com/docs to view documentation for the Devvit api
export default Devvit;
