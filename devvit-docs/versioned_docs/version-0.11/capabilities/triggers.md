# Triggers

Build automatic actions into your app.

A trigger is an action you can build into your app that will occur automatically when the trigger condition is met.

## Event triggers

Event triggers let your app automatically respond to a user’s action. For example, if you set the PostSubmit trigger, the app will automatically respond when a new post is made in the community. These triggers types are supported:

- `PostSubmit`
- `PostCreate`
- `PostUpdate`
- `PostReport`
- `PostDelete`
- `PostFlairUpdate`
- `CommentCreate`
- `CommentDelete`
- `CommentReport`
- `CommentSubmit`
- `CommentUpdate`
- [`PostNsfwUpdate`](#nsfw-example)
- [`PostSpoilerUpdate`](#spoiler-example)
- [`AppInstall`](#setup-triggers)
- [`AppUpgrade`](#setup-triggers)
- [`ModActions`](#mod-actions)
- [`ModMail`](#modmail-trigger)
- [`AutomoderatorFilterPost`](#automoderator-triggers)
- [`AutomoderatorFilterComment`](#automoderator-triggers)

This example adds event triggers that will automatically execute your app. Once a trigger is added, your app listens for the event and the event handler executes the action.

```tsx
import { Devvit } from '@devvit/public-api';

// Handling a PostSubmit event
Devvit.addTrigger({
  event: 'PostSubmit', // Event name from above
  onEvent: async (event) => {
    console.log(`Received OnPostSubmit event:\n${JSON.stringify(event)}`);
  },
});

// Handling multiple events: PostUpdate and PostReport
Devvit.addTrigger({
  events: ['PostUpdate', 'PostReport'], // An array of events
  onEvent: async (event) => {
    if (event.type == 'PostUpdate') {
      console.log(`Received OnPostUpdate event:\n${JSON.stringify(request)}`);
    } else if (event.type === 'PostReport') {
      console.log(`Received OnPostReport event:\n${JSON.stringify(request)}`);
    }
  },
});

export default Devvit;
```

:::note

Be careful when creating recursive triggers (like a comment trigger that creates a comment). This could cause your app to crash. To avoid this, check to see if the content creator is the app.

:::

## Setup triggers

Setup triggers allow your app to automatically respond when a user is installing or configuring that app.
These triggers are supported:

- `AppInstall`
- `AppUpgrade`

## Mod triggers

### Modmail trigger

```ts
event: 'ModMail',
```

This alerts the mod when modmail is sent or received. This example enables the app to listen to modmail events and fetch the relevant message payload via the Reddit API wrapper.

```tsx
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
    console.log(`Received conversation with subject:   ${result.conversation?.subject}`);

    // Looking up the incoming message from trigger event
    // Example Message ID: ModmailMessage_2ch154
    const messageId = event.messageId.split('_')[1];
    const message = result.messages[messageId];
    console.log(`Received modmail message: ${JSON.stringify(message)}`);
  },
});

export default Devvit;
```

### NSFW and spoiler triggers

These are triggered when a mod or automod marks a post as NSFW or a spoiler.

:::note
NSFW and spoiler triggers only work for user posts that a moderator flags. Moderators cannot trigger a label for their own posts.
:::

#### NSFW example

```tsx
Devvit.addTrigger({
  event: 'PostNsfwUpdate',
  onEvent: async (event, context) => {
    // App received this event when:
    // 1. moderator changes a non-moderator post to nsfw
    // 2. automoderator changes post from nsfw to sfw
    console.log(`Received nsfw trigger event:\n${JSON.stringify(event)}`);
    if (event.isNsfw) {
      console.log(`This is event ${JSON.stringify(event)} changed to nsfw`);
    } else {
      console.log(`This is event ${JSON.stringify(event)} changed to non-nsfw`);
    }
  },
});
```

#### Spoiler example

```tsx
Devvit.addTrigger({
  event: 'PostSpoilerUpdate',
  onEvent: async (event, context) => {
    // App received this event when:
    // 1. moderator changes a non-moderator post to spoiler
    // 2. moderator changes post from spoiler to non-spoiler

    console.log(`Received spoiler trigger event:\n${JSON.stringify(event)}`);
    if (event.isSpoiler) {
      console.log(`This is event ${JSON.stringify(event)} changed to spoiler`);
    } else {
      console.log(`This is event ${JSON.stringify(event)} changed to non-spoiler`);
    }
  },
});
```

## Mod actions

Mod actions are another kind of trigger that are just for mods. These triggers show up in the mod log. Check out the list of available [mod actions](/docs/mod_actions.md), and if you don't see an action you want, let us know in [r/devvit modmail](https://reddit.com/message/compose/?to=/r/Devvit).

```ts
Devvit.addTrigger({
  event: 'ModAction',
  async onEvent(event, context) {
    if (event.action === 'banuser') {
      console.log(`A new user ${event.targetUser?.name} was banned!`);
    }
  },
});
```

## Automoderator triggers

These triggers are invoked when automoderator filters a post or a comment into the mod queue. Along with the post or comment this object also includes `removedAt` and `reason` (if available) fields.

```ts
Devvit.addTrigger({
  event: 'AutomoderatorFilterPost',
  onEvent: async (event) => {
    console.log(`Received AutomoderatorFilterPost event:\n${JSON.stringify(event)}`);
  },
});

Devvit.addTrigger({
  event: 'AutomoderatorFilterComment',
  onEvent: async (event) => {
    console.log(`Received AutomoderatorFilterComment event:\n${JSON.stringify(event)}`);
  },
});
```
