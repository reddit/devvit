// eslint-disable-next-line no-restricted-imports
import type * as EventTypes from '@devvit/protos/types/devvit/events/v1alpha/events.d.ts';
// eslint-disable-next-line no-restricted-imports
import type * as Events from '@devvit/protos/types/devvit/events/v1alpha/events.js';
// eslint-disable-next-line no-restricted-imports
import type { ModAction } from '@devvit/protos/types/devvit/reddit/v2alpha/modaction.js';
// eslint-disable-next-line no-restricted-imports
import type { ModMail } from '@devvit/protos/types/devvit/reddit/v2alpha/modmail.js';

import type { Devvit } from '../devvit/Devvit.js';

export { DeletionReason, EventSource } from '@devvit/protos/json/devvit/events/v1alpha/events.js';
export type { EventTypes };

/** The event name for when a post is submitted */
export type PostSubmit = 'PostSubmit';
/** The event name for when a post is created, after safety delay */
export type PostCreate = 'PostCreate';
/** The event name for when a post is updated */
export type PostUpdate = 'PostUpdate';
/** The event name for when a post is reported */
export type PostReport = 'PostReport';
/** The event name for when a post is deleted */
export type PostDelete = 'PostDelete';
/** The event name for when the flair of a post is updated */
export type PostFlairUpdate = 'PostFlairUpdate';
/** The event name for when a comment is submitted */
export type CommentSubmit = 'CommentSubmit';
/** The event name for when a comment is created, after safety delay */
export type CommentCreate = 'CommentCreate';
/** The event name for when a comment is updated */
export type CommentUpdate = 'CommentUpdate';
/** The event name for when a comment is reported */
export type CommentReport = 'CommentReport';
/** The event name for when a comment is deleted */
export type CommentDelete = 'CommentDelete';
/** The event name for when your app is installed */
export type AppInstall = 'AppInstall';
/** The event name for when your app is upgraded */
export type AppUpgrade = 'AppUpgrade';
/** The event name for when a moderator action is recorded to a subreddit's modlog */
export type ModActionTrigger = 'ModAction';
/** The event name for when a mod mail is sent/received */
export type ModMailTrigger = 'ModMail';
/** The event name for when a post is marked/unmarked as nsfw*/
export type PostNsfwUpdate = 'PostNsfwUpdate';
/** The event name for when a post is marked/unmarked as spoiler*/
export type PostSpoilerUpdate = 'PostSpoilerUpdate';
/** The event name for when a post is filtered by automoderator */
export type AutomoderatorFilterPost = 'AutomoderatorFilterPost';
/** The event name for when a comment is filtered by automoderator */
export type AutomoderatorFilterComment = 'AutomoderatorFilterComment';

/** Maps a TriggerEvent to a Protobuf message and type. */
export type TriggerEventType = {
  PostSubmit: { type: 'PostSubmit' } & Events.PostSubmit;
  PostCreate: { type: 'PostCreate' } & Events.PostCreate;
  PostUpdate: { type: 'PostUpdate' } & Events.PostUpdate;
  PostReport: { type: 'PostReport' } & Events.PostReport;
  PostDelete: { type: 'PostDelete' } & Events.PostDelete;
  PostFlairUpdate: { type: 'PostFlairUpdate' } & Events.PostFlairUpdate;
  CommentSubmit: { type: 'CommentSubmit' } & Events.CommentSubmit;
  CommentCreate: { type: 'CommentCreate' } & Events.CommentCreate;
  CommentUpdate: { type: 'CommentUpdate' } & Events.CommentUpdate;
  CommentReport: { type: 'CommentReport' } & Events.CommentReport;
  CommentDelete: { type: 'CommentDelete' } & Events.CommentDelete;
  AppInstall: { type: 'AppInstall' } & Events.AppInstall;
  AppUpgrade: { type: 'AppUpgrade' } & Events.AppUpgrade;
  ModAction: { type: 'ModAction' } & ModAction;
  ModMail: { type: 'ModMail' } & ModMail;
  PostNsfwUpdate: { type: 'PostNsfwUpdate' } & Events.PostNsfwUpdate;
  PostSpoilerUpdate: { type: 'PostSpoilerUpdate' } & Events.PostSpoilerUpdate;
  AutomoderatorFilterPost: { type: 'AutomoderatorFilterPost' } & Events.AutomoderatorFilterPost;
  AutomoderatorFilterComment: {
    type: 'AutomoderatorFilterComment';
  } & Events.AutomoderatorFilterComment;
};

export type TriggerEvent =
  | PostSubmit
  | PostCreate
  | PostUpdate
  | PostReport
  | PostDelete
  | PostFlairUpdate
  | CommentSubmit
  | CommentCreate
  | CommentUpdate
  | CommentReport
  | CommentDelete
  | AppInstall
  | AppUpgrade
  | ModActionTrigger
  | ModMailTrigger
  | PostNsfwUpdate
  | PostSpoilerUpdate
  | AutomoderatorFilterPost
  | AutomoderatorFilterComment;

type TriggerResult = Promise<void> | void;

export type TriggerContext = Omit<Devvit.Context, 'ui' | 'dimensions' | 'modLog' | 'uiEnvironment'>;

export type TriggerOnEventHandler<RequestType> = (
  event: RequestType,
  context: TriggerContext
) => TriggerResult;

export type PostSubmitDefinition = {
  event: PostSubmit;
  onEvent: TriggerOnEventHandler<Events.PostSubmit>;
};

export type PostCreateDefinition = {
  event: PostCreate;
  onEvent: TriggerOnEventHandler<Events.PostCreate>;
};

export type PostUpdateDefinition = {
  event: PostUpdate;
  onEvent: TriggerOnEventHandler<Events.PostUpdate>;
};

export type PostReportDefinition = {
  event: PostReport;
  onEvent: TriggerOnEventHandler<Events.PostReport>;
};

export type PostDeleteDefinition = {
  event: PostDelete;
  onEvent: TriggerOnEventHandler<Events.PostDelete>;
};

export type PostFlairUpdateDefinition = {
  event: PostFlairUpdate;
  onEvent: TriggerOnEventHandler<Events.PostFlairUpdate>;
};

export type CommentSubmitDefinition = {
  event: CommentSubmit;
  onEvent: TriggerOnEventHandler<Events.CommentSubmit>;
};

export type CommentCreateDefinition = {
  event: CommentCreate;
  onEvent: TriggerOnEventHandler<Events.CommentCreate>;
};

export type CommentUpdateDefinition = {
  event: CommentUpdate;
  onEvent: TriggerOnEventHandler<Events.CommentUpdate>;
};

export type CommentReportDefinition = {
  event: CommentReport;
  onEvent: TriggerOnEventHandler<Events.CommentReport>;
};

export type CommentDeleteDefinition = {
  event: CommentDelete;
  onEvent: TriggerOnEventHandler<Events.CommentDelete>;
};

export type AppInstallDefinition = {
  event: AppInstall;
  onEvent: TriggerOnEventHandler<Events.AppInstall>;
};

export type AppUpgradeDefinition = {
  event: AppUpgrade;
  onEvent: TriggerOnEventHandler<Events.AppUpgrade>;
};

export type ModActionDefinition = {
  event: ModActionTrigger;
  onEvent: TriggerOnEventHandler<ModAction>;
};

export type ModMailDefinition = {
  event: ModMailTrigger;
  onEvent: TriggerOnEventHandler<ModMail>;
};

export type PostNsfwUpdateDefinition = {
  event: PostNsfwUpdate;
  onEvent: TriggerOnEventHandler<Events.PostNsfwUpdate>;
};

export type PostSpoilerUpdateDefinition = {
  event: PostSpoilerUpdate;
  onEvent: TriggerOnEventHandler<Events.PostSpoilerUpdate>;
};

export type OnAutomoderatorFilterPostDefinition = {
  event: AutomoderatorFilterPost;
  onEvent: TriggerOnEventHandler<Events.AutomoderatorFilterPost>;
};

export type OnAutomoderatorFilterCommentDefinition = {
  event: AutomoderatorFilterComment;
  onEvent: TriggerOnEventHandler<Events.AutomoderatorFilterComment>;
};

export type MultiTriggerDefinition<Event extends TriggerEvent> = {
  events: readonly Event[];
  onEvent: TriggerOnEventHandler<TriggerEventType[Event]>;
};

export type TriggerDefinition =
  | PostSubmitDefinition
  | PostCreateDefinition
  | PostUpdateDefinition
  | PostFlairUpdateDefinition
  | PostReportDefinition
  | PostDeleteDefinition
  | CommentSubmitDefinition
  | CommentCreateDefinition
  | CommentUpdateDefinition
  | CommentReportDefinition
  | CommentDeleteDefinition
  | AppInstallDefinition
  | AppUpgradeDefinition
  | ModActionDefinition
  | ModMailDefinition
  | PostSpoilerUpdateDefinition
  | PostNsfwUpdateDefinition
  | OnAutomoderatorFilterPostDefinition
  | OnAutomoderatorFilterCommentDefinition;

export type OnTriggerRequest =
  | Events.PostFlairUpdate
  | Events.PostSubmit
  | Events.PostCreate
  | Events.PostUpdate
  | Events.PostReport
  | Events.PostDelete
  | Events.CommentSubmit
  | Events.CommentCreate
  | Events.CommentUpdate
  | Events.CommentReport
  | Events.CommentDelete
  | Events.AppInstall
  | Events.AppUpgrade
  | ModAction
  | ModMail
  | Events.PostNsfwUpdate
  | Events.PostSpoilerUpdate
  | Events.AutomoderatorFilterPost
  | Events.AutomoderatorFilterComment;
