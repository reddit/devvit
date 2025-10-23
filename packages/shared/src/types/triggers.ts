// See TestInvokeAllTypes for what's actually wired up (votes are not).
// Export enums functionally and everything else as types. The current
// implementation is getting ts-proto hydrated events from the Devvit singleton
// but then serializes those to JSON so Date, Duration, Timestamp, and
// bytes / Uint8Array differ.

import {
  type AppInstall,
  type AppUpgrade,
  type AutomoderatorFilterComment,
  type AutomoderatorFilterPost,
  type CommentCreate,
  type CommentDelete,
  type CommentReport,
  type CommentSubmit,
  type CommentUpdate,
  type PostCreate,
  type PostDelete,
  type PostFlairUpdate,
  type PostNsfwUpdate,
  type PostReport,
  type PostSpoilerUpdate,
  type PostSubmit,
  type PostUpdate,
} from '@devvit/protos/json/devvit/events/v1alpha/events.js';
import type { ModAction } from '@devvit/protos/json/devvit/reddit/v2alpha/modaction.js';
import type { ModMail } from '@devvit/protos/json/devvit/reddit/v2alpha/modmail.js';

export { DeletionReason, EventSource } from '@devvit/protos/json/devvit/events/v1alpha/events.js';
export type { CommentV2 } from '@devvit/protos/json/devvit/reddit/v2alpha/commentv2.js';
export type { LinkFlairV2, UserFlairV2 } from '@devvit/protos/json/devvit/reddit/v2alpha/flair.js';
export {
  CrowdControlLevel,
  DistinguishType,
  type MediaObject,
  type Oembed,
  type PostV2,
  type RedditVideo,
} from '@devvit/protos/json/devvit/reddit/v2alpha/postv2.js';
export {
  SubredditRating,
  SubredditType,
  type SubredditV2,
} from '@devvit/protos/json/devvit/reddit/v2alpha/subredditv2.js';
export type { UserV2 } from '@devvit/protos/json/devvit/reddit/v2alpha/userv2.js';
export type OnAppInstallRequest = AppInstall & { type: 'AppInstall' };
export type OnAppUpgradeRequest = AppUpgrade & { type: 'AppUpgrade' };
export type OnAutomoderatorFilterCommentRequest = AutomoderatorFilterComment & {
  type: 'AutomoderatorFilterComment';
};
export type OnAutomoderatorFilterPostRequest = AutomoderatorFilterPost & {
  type: 'AutomoderatorFilterPost';
};
export type OnCommentCreateRequest = CommentCreate & { type: 'CommentCreate' };
export type OnCommentDeleteRequest = CommentDelete & { type: 'CommentDelete' };
export type OnCommentReportRequest = CommentReport & { type: 'CommentReport' };
export type OnCommentSubmitRequest = CommentSubmit & { type: 'CommentSubmit' };
export type OnCommentUpdateRequest = CommentUpdate & { type: 'CommentUpdate' };
export type OnModActionRequest = ModAction & { type: 'ModAction' };
export type OnModMailRequest = ModMail & { type: 'ModMail' };
export type OnPostCreateRequest = PostCreate & { type: 'PostCreate' };
export type OnPostDeleteRequest = PostDelete & { type: 'PostDelete' };
export type OnPostFlairUpdateRequest = PostFlairUpdate & { type: 'PostFlairUpdate' };
export type OnPostNsfwUpdateRequest = PostNsfwUpdate & { type: 'PostNsfwUpdate' };
export type OnPostReportRequest = PostReport & { type: 'PostReport' };
export type OnPostSpoilerUpdateRequest = PostSpoilerUpdate & { type: 'PostSpoilerUpdate' };
export type OnPostSubmitRequest = PostSubmit & { type: 'PostSubmit' };
export type OnPostUpdateRequest = PostUpdate & { type: 'PostUpdate' };

export type TriggerRequest =
  | OnAppInstallRequest
  | OnAppUpgradeRequest
  | OnAutomoderatorFilterCommentRequest
  | OnAutomoderatorFilterPostRequest
  | OnCommentCreateRequest
  | OnCommentDeleteRequest
  | OnCommentReportRequest
  | OnCommentSubmitRequest
  | OnCommentUpdateRequest
  | OnModActionRequest
  | OnModMailRequest
  | OnPostCreateRequest
  | OnPostDeleteRequest
  | OnPostFlairUpdateRequest
  | OnPostNsfwUpdateRequest
  | OnPostReportRequest
  | OnPostSpoilerUpdateRequest
  | OnPostSubmitRequest
  | OnPostUpdateRequest;

export type TriggerResponse = {};
