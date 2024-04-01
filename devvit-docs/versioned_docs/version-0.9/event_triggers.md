# Event triggers

An event trigger allows your app to automatically respond to a user’s action. For example, if you set the OnSubredditSubscribe trigger, the app will automatically respond when a user joins the community.

## Supported triggers

### Setup triggers

- OnAppInstall
- OnAppUpgrade

### Reddit event triggers

- OnPostSubmit
- OnPostUpdate
- OnPostReport
- OnCommentSubmit
- OnCommentUpdate
- OnCommentReport
- OnSubredditSubscribe

## Example

This example adds supported event triggers that will automatically execute your app. Once a trigger is added, your app listens for the event, and the event handler executes the action.

```ts
import {
  CommentReport,
  CommentSubmit,
  CommentUpdate,
  PostSubmit,
  Metadata,
  SubredditSubscribe,
} from '@devvit/protos';
import { Devvit, getFromMetadata, Header } from '@devvit/public-api';

// Logging on a PostSubmit event
Devvit.addTrigger({
  event: Devvit.Trigger.PostSubmit,
  async handler(request: PostSubmit, metadata?: Metadata) {
    console.log(`Received OnPostSubmit event:\n${JSON.stringify(request)}`);
  },
});

// Logging on multiple events: PostUpdate and PostReport
Devvit.addTrigger({
  events: [Devvit.Trigger.PostUpdate, Devvit.Trigger.PostReport],
  handler(request) {
    if (request.type == Devvit.Trigger.PostUpdate) {
      console.log(`Received OnPostUpdate event:\n${JSON.stringify(request)}`);
    } else if (request.type === Devvit.Trigger.PostReport) {
      console.log(`Received OnPostReport event:\n${JSON.stringify(request)}`);
    }
  },
});

Devvit.addTrigger({
  event: Devvit.Trigger.CommentSubmit,
  async handler(request: CommentSubmit, metadata?: Metadata) {
    if (request.author?.id === getFromMetadata(Header.AppUser, metadata)) {
      console.log('hey! my app created this comment; not going to respond');
      return;
    }
    console.log(`Received OnCommentSubmit event:\n${JSON.stringify(request)}`);
  },
});

Devvit.addTrigger({
  event: Devvit.Trigger.CommentUpdate,
  async handler(request: CommentUpdate, metadata?: Metadata) {
    console.log(`Received OnCommentUpdate event:\n${JSON.stringify(request)}`);
  },
});

Devvit.addTrigger({
  event: Devvit.Trigger.CommentReport,
  async handler(request: CommentReport, metadata?: Metadata) {
    console.log(`Received OnCommentReport event:\n${JSON.stringify(request)}`);
  },
});

Devvit.addTrigger({
  event: Devvit.Trigger.SubredditSubscribe,
  async handler(request: SubredditSubscribe, metadata?: Metadata) {
    console.log(`Received OnSubredditSubscribe event:\n${JSON.stringify(request)}`);
  },
});

Devvit.addTrigger({
  event: Devvit.Trigger.AppInstall,
  async handler(request: AppInstall) {
    console.log(`Received AppInstall event:\n${JSON.stringify(request)}`);
  },
});

Devvit.addTrigger({
  event: Devvit.Trigger.AppUpgrade,
  async handler(request: AppUpgrade) {
    console.log(`Received AppUpgrade event:\n${JSON.stringify(request)}`);
  },
});

export default Devvit;
```

:::note

Be careful creating recursive triggers (like a comment trigger that creates a comment). This could cause your app to crash. To avoid this, check to see if the content creator is the app. The `CommentSubmit` example above shows how to do this.

:::
