import { Devvit } from '@devvit/public-api';

Devvit.configure({ redditAPI: true });

Devvit.addTrigger({
  event: 'ModMail',
  onEvent: async (event, context) => {
    // Apps receive this event when:
    // 1. A new modmail conversation thread is created
    // 2. A new modmail message is added to an existing conversation
    console.log(`Received modmail trigger event:\n${JSON.stringify(event)}`);

    // Example conversation ID: ModmailConversation_1mzkfh
    // We are fetching the latest conversation state from Reddit API
    const conversationId = event.conversationId;
    const result = await context.reddit.modMail.getConversation({
      conversationId: conversationId,
      markRead: false,
    });

    if (result.conversation) {
      console.log(`Received conversation with subject: ${result.conversation.subject}`);

      // Looking up the incoming message from trigger event
      // Example Message ID: ModmailMessage_2ch154
      const messageId = event.messageId.split('_')[1];
      const message = result.conversation.messages[messageId];
      console.log(`Received modmail message: ${JSON.stringify(message)}`);
    }
  },
});

export default Devvit;
