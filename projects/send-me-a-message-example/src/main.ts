import { Context, Devvit, getFromMetadata, Header, NameLookup } from '@devvit/public-api-old';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';

const PrivateMessages = Devvit.use(Devvit.Types.RedditAPI.PrivateMessages);
const nameLookup = new NameLookup();

export default Devvit.addAction({
  name: 'Send PM',
  description: 'Send yourself a private message',
  context: Context.SUBREDDIT,
  handler: async (_event, metadata) => {
    const userId = getFromMetadata(Header.User, metadata);
    const subredditId = getFromMetadata(Header.Subreddit, metadata);
    try {
      if (!userId) {
        return {
          success: false,
          message: "I don't know who you are!",
        };
      }

      if (!subredditId) {
        return {
          success: false,
          message: "I don't know what subreddit you're currently in...",
        };
      }

      // The one-at-a-time way:
      const to = await nameLookup.get(userId);
      const fromSr = await nameLookup.get(subredditId);
      // Or the many-at-a-time way:
      const idMap = await nameLookup.getAll([userId, subredditId]);
      // Verify both gave back the same answer!
      console.log(JSON.stringify({ to, fromSr, idMap }));
      if (idMap[userId] !== to) {
        return {
          success: false,
          message: `Assertion failed: idMap[userId] !== to (${idMap[userId]} !== ${to})`,
        };
      }
      if (idMap[subredditId] !== fromSr) {
        return {
          success: false,
          message: `Assertion failed: idMap[subredditId] !== fromSr (${idMap[subredditId]} !== ${fromSr})`,
        };
      }

      await PrivateMessages.Compose({
        to,
        fromSr,
        subject: 'Hello World!',
        text: 'Hey, the test action worked!',
      });
      return {
        success: true,
        message: 'Message sent!',
      };
    } catch (err) {
      return {
        success: false,
        message: StringUtil.caughtToString(err),
      };
    }
  },
});
