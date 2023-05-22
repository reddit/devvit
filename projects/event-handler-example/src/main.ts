import {
  PostSubmit,
  CommentUpdate,
  CommentReport,
  SubredditSubscribe,
  CommentSubmit,
  Metadata,
  AppInstall,
  AppUpgrade,
} from '@devvit/protos';
import { Devvit, getFromMetadata, Header } from '@devvit/public-api';

Devvit.addTrigger({
  event: Devvit.Trigger.PostSubmit,
  handler(request: PostSubmit) {
    console.log(`Received OnPostSubmit event:\n${JSON.stringify(request)}`);
  },
});

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
  handler(request: CommentSubmit, metadata?: Metadata) {
    console.log(`Received OnCommentSubmit event:\n${JSON.stringify(request)}`);

    if (request.author?.id === getFromMetadata(Header.AppUser, metadata)) {
      console.log('hey! I created this comment; not going to respond');
    }
  },
});

Devvit.addTrigger({
  event: Devvit.Trigger.CommentUpdate,
  async handler(request: CommentUpdate) {
    console.log(`Received OnCommentUpdate event:\n${JSON.stringify(request)}`);
  },
});

Devvit.addTrigger({
  event: Devvit.Trigger.CommentReport,
  async handler(request: CommentReport) {
    console.log(`Received OnCommentReport event:\n${JSON.stringify(request)}`);
  },
});

Devvit.addTrigger({
  event: Devvit.Trigger.SubredditSubscribe,
  async handler(request: SubredditSubscribe) {
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
