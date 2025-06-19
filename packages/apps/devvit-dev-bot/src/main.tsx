import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
});

// Allows reddit admins to automatically join playtest subreddits created through the CLI
Devvit.addTrigger({
  event: 'ModMail',
  onEvent: async (event, context) => {
    if (!event) {
      return;
    }
    console.log('\n====\nReceived modmail trigger event:');
    const userName = event.messageAuthor?.name;
    const subredditName = event.conversationSubreddit?.name;
    if (!userName || !subredditName) {
      return;
    }
    const authorType = event.messageAuthorType;
    const user = await context.reddit.getUserByUsername(userName);

    console.log({ authorType, userName, isAdmin: user?.isAdmin });

    if (!user?.isAdmin) {
      console.log(`[Declined] Non-admin account ${userName}.`);
      return;
    }

    await context.reddit.approveUser(userName, subredditName);
    console.log(`[Approved] Admin account ${userName}.`);
  },
});

export default Devvit;
