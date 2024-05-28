import type * as protos from '@devvit/protos';
import type { Devvit } from '../devvit/Devvit.js';

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

/** Maps a TriggerEvent to a Protobuf message and type. */
export type TriggerEventType = {
  PostSubmit: { type: 'PostSubmit' } & protos.PostSubmit;
  PostCreate: { type: 'PostCreate' } & protos.PostCreate;
  PostUpdate: { type: 'PostUpdate' } & protos.PostUpdate;
  PostReport: { type: 'PostReport' } & protos.PostReport;
  PostDelete: { type: 'PostDelete' } & protos.PostDelete;
  PostFlairUpdate: { type: 'PostFlairUpdate' } & protos.PostFlairUpdate;
  CommentSubmit: { type: 'CommentSubmit' } & protos.CommentSubmit;
  CommentCreate: { type: 'CommentCreate' } & protos.CommentCreate;
  CommentUpdate: { type: 'CommentUpdate' } & protos.CommentUpdate;
  CommentReport: { type: 'CommentReport' } & protos.CommentReport;
  CommentDelete: { type: 'CommentDelete' } & protos.CommentDelete;
  AppInstall: { type: 'AppInstall' } & protos.AppInstall;
  AppUpgrade: { type: 'AppUpgrade' } & protos.AppUpgrade;
  ModAction: { type: 'ModAction' } & protos.ModAction;
  ModMail: { type: 'ModMail' } & protos.ModMail;
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
  | ModMailTrigger;

type TriggerResult = Promise<void> | void;

export type TriggerContext = Omit<Devvit.Context, 'ui' | 'dimensions' | 'modLog' | 'uiEnvironment'>;

export type TriggerOnEventHandler<RequestType> = (
  event: RequestType,
  context: TriggerContext
) => TriggerResult;

export type PostSubmitDefinition = {
  event: PostSubmit;
  onEvent: TriggerOnEventHandler<protos.PostSubmit>;
};

export type PostCreateDefinition = {
  event: PostCreate;
  onEvent: TriggerOnEventHandler<protos.PostCreate>;
};

export type PostUpdateDefinition = {
  event: PostUpdate;
  onEvent: TriggerOnEventHandler<protos.PostUpdate>;
};

export type PostReportDefinition = {
  event: PostReport;
  onEvent: TriggerOnEventHandler<protos.PostReport>;
};

export type PostDeleteDefinition = {
  event: PostDelete;
  onEvent: TriggerOnEventHandler<protos.PostDelete>;
};

export type PostFlairUpdateDefinition = {
  event: PostFlairUpdate;
  onEvent: TriggerOnEventHandler<protos.PostFlairUpdate>;
};

export type CommentSubmitDefinition = {
  event: CommentSubmit;
  onEvent: TriggerOnEventHandler<protos.CommentSubmit>;
};

export type CommentCreateDefinition = {
  event: CommentCreate;
  onEvent: TriggerOnEventHandler<protos.CommentCreate>;
};

export type CommentUpdateDefinition = {
  event: CommentUpdate;
  onEvent: TriggerOnEventHandler<protos.CommentUpdate>;
};

export type CommentReportDefinition = {
  event: CommentReport;
  onEvent: TriggerOnEventHandler<protos.CommentReport>;
};

export type CommentDeleteDefinition = {
  event: CommentDelete;
  onEvent: TriggerOnEventHandler<protos.CommentDelete>;
};

export type AppInstallDefinition = {
  event: AppInstall;
  onEvent: TriggerOnEventHandler<protos.AppInstall>;
};

export type AppUpgradeDefinition = {
  event: AppUpgrade;
  onEvent: TriggerOnEventHandler<protos.AppUpgrade>;
};

export type ModActionDefinition = {
  event: ModActionTrigger;
  onEvent: TriggerOnEventHandler<protos.ModAction>;
};

export type ModMailDefinition = {
  event: ModMailTrigger;
  onEvent: TriggerOnEventHandler<protos.ModMail>;
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
  | ModMailDefinition;

export type OnTriggerRequest =
  | protos.PostFlairUpdate
  | protos.PostSubmit
  | protos.PostCreate
  | protos.PostUpdate
  | protos.PostReport
  | protos.PostDelete
  | protos.CommentSubmit
  | protos.CommentCreate
  | protos.CommentUpdate
  | protos.CommentReport
  | protos.CommentDelete
  | protos.AppInstall
  | protos.AppUpgrade
  | protos.ModAction
  | protos.ModMail;
