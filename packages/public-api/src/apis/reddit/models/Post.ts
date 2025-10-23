import type {
  Listing as ListingProto,
  Metadata,
  RedditObject,
  SubmitRequest,
  SubmitResponse,
} from '@devvit/protos';
import type {
  GalleryMediaStatus as GalleryMediaStatusProto,
  SetCustomPostPreviewRequest_BodyType,
} from '@devvit/protos';
import { Block, UIResponse } from '@devvit/protos';
import type { DevvitPostData } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';
import { Scope } from '@devvit/protos/json/reddit/devvit/app_permission/v1/app_permission.js';
import { Header } from '@devvit/shared-types/Header.js';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import type { PostData } from '@devvit/shared-types/PostData.js';
import { RichTextBuilder } from '@devvit/shared-types/richtext/RichTextBuilder.js';
import { fromByteArray } from 'base64-js';

import { Devvit } from '../../../devvit/Devvit.js';
import { BlocksReconciler } from '../../../devvit/internals/blocks/BlocksReconciler.js';
import { BlocksHandler } from '../../../devvit/internals/blocks/handler/BlocksHandler.js';
import type { T2ID, T3ID, T5ID } from '../../../types/tid.js';
import { asT2ID, asT3ID, asT5ID, isT3ID } from '../../../types/tid.js';
import { RunAs, type UserGeneratedContent } from '../common.js';
import { GraphQL } from '../graphql/GraphQL.js';
import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';
import { richtextToString } from '../helpers/richtextToString.js';
import { getCustomPostRichTextFallback } from '../helpers/textFallbackToRichtext.js';
import type { CommentSubmissionOptions } from './Comment.js';
import { Comment } from './Comment.js';
import type { ListingFetchOptions, ListingFetchResponse } from './Listing.js';
import { Listing } from './Listing.js';
import { ModNote } from './ModNote.js';
import { User } from './User.js';

export type GetPostsOptions = ListingFetchOptions & {
  subredditName?: string;
};

export type GetPostsOptionsWithTimeframe = GetPostsOptions & {
  timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
};

export type GetSortedPostsOptions = GetPostsOptionsWithTimeframe & {
  sort: 'top' | 'controversial';
};

export type GetHotPostsOptions = GetPostsOptions & {
  location?:
    | 'GLOBAL'
    | 'US'
    | 'AR'
    | 'AU'
    | 'BG'
    | 'CA'
    | 'CL'
    | 'CO'
    | 'HR'
    | 'CZ'
    | 'FI'
    | 'FR'
    | 'DE'
    | 'GR'
    | 'HU'
    | 'IS'
    | 'IN'
    | 'IE'
    | 'IT'
    | 'JP'
    | 'MY'
    | 'MX'
    | 'NZ'
    | 'PH'
    | 'PL'
    | 'PT'
    | 'PR'
    | 'RO'
    | 'RS'
    | 'SG'
    | 'ES'
    | 'SE'
    | 'TW'
    | 'TH'
    | 'TR'
    | 'GB'
    | 'US_WA'
    | 'US_DE'
    | 'US_DC'
    | 'US_WI'
    | 'US_WV'
    | 'US_HI'
    | 'US_FL'
    | 'US_WY'
    | 'US_NH'
    | 'US_NJ'
    | 'US_NM'
    | 'US_TX'
    | 'US_LA'
    | 'US_NC'
    | 'US_ND'
    | 'US_NE'
    | 'US_TN'
    | 'US_NY'
    | 'US_PA'
    | 'US_CA'
    | 'US_NV'
    | 'US_VA'
    | 'US_CO'
    | 'US_AK'
    | 'US_AL'
    | 'US_AR'
    | 'US_VT'
    | 'US_IL'
    | 'US_GA'
    | 'US_IN'
    | 'US_IA'
    | 'US_OK'
    | 'US_AZ'
    | 'US_ID'
    | 'US_CT'
    | 'US_ME'
    | 'US_MD'
    | 'US_MA'
    | 'US_OH'
    | 'US_UT'
    | 'US_MO'
    | 'US_MN'
    | 'US_MI'
    | 'US_RI'
    | 'US_KS'
    | 'US_MT'
    | 'US_MS'
    | 'US_SC'
    | 'US_KY'
    | 'US_OR'
    | 'US_SD';
};

export type GetPostsByUserOptions = {
  username: string;
  sort?: 'hot' | 'new' | 'top' | 'controversial';
  timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  pageSize?: number;
  limit?: number;
  after?: string;
  before?: string;
};

export type PostSuggestedCommentSort =
  | 'BLANK'
  /** "Best" sort. */
  | 'CONFIDENCE'
  | 'CONTROVERSIAL'
  | 'LIVE'
  /** Sort comments by creation time. */
  | 'NEW'
  | 'OLD'
  /** Similar to the "best" (confidence) sort, but specially designed for
    Q&A-type threads to highlight good question/answer pairs. */
  | 'QA'
  | 'RANDOM'
  /** Sort by top upvoted comments. */
  | 'TOP';

export type PostTextOptions =
  | {
      text: string;
    }
  | {
      richtext: object | RichTextBuilder;
    };

export type CustomPostRichTextFallback = RichTextBuilder | string;

export type CustomPostTextFallbackOptions =
  | {
      /**
       * May also include markdown. See https://www.reddit.com/r/reddit.com/wiki/markdown/
       */
      text: string;
    }
  | {
      richtext: CustomPostRichTextFallback;
    };

// TODO - refactor submit post options
export type SubmitLinkOptions = CommonSubmitPostOptions & {
  url: string;
  /**
   * @deprecated Unsupported. This property is for backwards compatibility and
   * has no effect. It will removed in a future version. New code should not
   * use it.
   */
  resubmit?: boolean;
};

export type SubmitMediaOptions = CommonSubmitPostOptions & {
  kind: 'image' | 'video' | 'videogif';
  // If `kind` is "video" or "videogif" this must be set to the thumbnail URL
  // https://www.reddit.com/dev/api/#POST_api_submit
  videoPosterUrl?: string;
  // If `kind` is "image" this must be set to the image URL
  // Currently Devvit only supports posts with a single image
  imageUrls?: [string];
};

export type SubmitSelfPostOptions = PostTextOptions & CommonSubmitPostOptions;

export type SubmitCustomPostTextFallbackOptions = {
  textFallback?: CustomPostTextFallbackOptions;
};

export type SubmitCustomPostOptions = CommonSubmitPostOptions &
  SubmitCustomPostTextFallbackOptions & {
    preview: JSX.Element;
    userGeneratedContent?: UserGeneratedContent;
    postData?: PostData;
  };

export type CommonSubmitPostOptions = {
  title: string;
  sendreplies?: boolean;
  nsfw?: boolean;
  spoiler?: boolean;
  flairId?: string;
  flairText?: string;
  runAs?: 'USER' | 'APP';
};

export type SubmitPostOptions = (
  | SubmitLinkOptions
  | SubmitSelfPostOptions
  | SubmitCustomPostOptions
  | SubmitMediaOptions
) & {
  subredditName: string;
};

const SetCustomPostPreviewRequestBodyType = {
  NONE: 0,
  BLOCKS: 1,
  UNRECOGNIZED: -1,
} as const;

type SetCustomPostPreviewRequestBodyType =
  (typeof SetCustomPostPreviewRequest_BodyType)[keyof typeof SetCustomPostPreviewRequest_BodyType];

export type CrosspostOptions = CommonSubmitPostOptions & {
  subredditName: string;
  postId: string;
};

export type LinkFlair = {
  /**
   * One of: "text", "richtext"
   */
  type?: string;
  /**
   * Flair template ID to use when rendering this flair
   */
  templateId?: string;
  /**
   * Plain text representation of the flair
   */
  text?: string;
  /**
   * RichText object representation of the flair
   */
  richtext: {
    /**
     * Enum of element types.  e.g. emoji or text
     */
    elementType?: string;
    /**
     * Text to show up in the flair, e.g. "Need Advice"
     */
    text?: string;
    /**
     * Emoji references, e.g. ":rainbow:"
     */
    emojiRef?: string;
    /**
     * url string, e.g. "https://reddit.com/"
     */
    url?: string;
  }[];
  /**
   * Custom CSS classes from the subreddit's stylesheet to apply to the flair if rendered as HTML
   */
  cssClass?: string;
  /**
   * One of: "light", "dark"
   */
  textColor?: string;
  /**
   * Flair background color as a hex color string (# prefixed)
   * @example "#FF4500"
   */
  backgroundColor?: string;
};

/**
 * oEmbed is a format for allowing an embedded representation of a URL on third party sites.
 * The simple API allows a website to display embedded content (such as photos or videos)
 * when a user posts a link to that resource, without having to parse the resource directly.
 * See: https://oembed.com/
 */
export type OEmbed = {
  /** The resource type. Valid values, along with value-specific parameters, are described below. E.g. "video" */
  type: string;
  /** A text title, describing the resource. */
  title?: string | undefined;
  /** A URL for the author/owner of the resource. E.g. "YouTube" */
  providerName?: string | undefined;
  /** The name of the resource provider. E.g "https://www.youtube.com/" */
  providerUrl?: string | undefined;
  /** The oEmbed version number. This must be 1.0. */
  version: string;
  /** The width of the optional thumbnail in pixels */
  thumbnailWidth?: number;
  /** The height of the optional thumbnail in pixels */
  thumbnailHeight?: number;
  /** A URL to a thumbnail image representing the resource. */
  thumbnailUrl?: string | undefined;
  /** The HTML required to embed a video player. The HTML should have no padding or margins. Consumers may wish to load the HTML in an off-domain iframe to avoid XSS vulnerabilities. */
  html: string;
  /** The width in pixels required to display the HTML. */
  height?: number;
  /** The height in pixels required to display the HTML. */
  width?: number;
  /** A URL for the author/owner of the resource. E.g. "https://www.youtube.com/@Reddit" */
  authorUrl?: string | undefined;
  /** The name of the author/owner of the resource. E.g. "Reddit" */
  authorName?: string | undefined;
};

/**
 * Contains the data for a video hosted on Reddit that is in a post
 */
export type RedditVideo = {
  /** The bitrate of the video in kilobits per second. E.g. 450 */
  bitrateKbps?: number;
  /** The URL to the DASH playlist file. E.g. "https://v.redd.it/abc123/DASHPlaylist.mpd" */
  dashUrl?: string;
  /** The duration of the video in seconds. E.g. 30 */
  duration?: number;
  /** The direct URL to the video. E.g. "https://v.redd.it/abc123/DASH_1080.mp4?source=fallback" */
  fallbackUrl?: string;
  /** The height of the video in pixels. E.g. 1080 */
  height?: number;
  /** The URL to the HLS playlist file. E.g. "https://v.redd.it/abc123/HLSPlaylist.m3u8" */
  hlsUrl?: string;
  /** If `true`, the video is a GIF */
  isGif?: boolean;
  /** The URL to the scrubber media file. E.g. "https://v.redd.it/abc123/DASH_96.mp4" */
  scrubberMediaUrl?: string;
  /** The status of the transcoding process. E.g. "completed" */
  transcodingStatus?: string;
  /** The width of the video in pixels. E.g. 1920 */
  width?: number;
};

export type SecureMedia = {
  /** The type of the OEmbed media, if present (e.g. "youtube.com") */
  type?: string;
  oembed?: OEmbed;
  redditVideo?: RedditVideo;
};

/**
 * Contains data about a post's thumbnail. Also contains a blurred version if the thumbnail is NSFW.
 */
export type EnrichedThumbnail = {
  /** Attribution text for the thumbnail */
  attribution?: string;
  /** The image used for the thumbnail. May have different resolution from Post.thumbnail */
  image: {
    url: string;
    height: number;
    width: number;
  };
  /** Whether this thumbnail appears blurred by default */
  isObfuscatedDefault: boolean;
  /** The blurred image for NSFW thumbnails */
  obfuscatedImage?: {
    url: string;
    height: number;
    width: number;
  };
};

export const GalleryMediaStatus = {
  UNKNOWN: 0,
  VALID: 1,
  FAILED: 2,
} as const;

export type GalleryMediaStatus =
  (typeof GalleryMediaStatusProto)[keyof typeof GalleryMediaStatusProto];

/**
 * Represents media that the post may contain.
 */
export type GalleryMedia = {
  /** Status of the media. Media that were successfully uplaoded will have GalleryMediaStatus.VALID status */
  status: GalleryMediaStatus;
  url: string;
  height: number;
  width: number;
};

export class Post {
  #id: T3ID;
  #authorId?: T2ID;
  #authorName: string;
  #createdAt: Date;
  #subredditId: T5ID;
  #subredditName: string;
  #permalink: string;
  #title: string;
  #body?: string;
  #bodyHtml?: string;
  #url: string;
  #score: number;
  #numberOfComments: number;
  #numberOfReports: number;
  #thumbnail?: {
    url: string;
    height: number;
    width: number;
  };
  #approved: boolean;
  #approvedAtUtc: number;
  #bannedAtUtc: number;
  #spam: boolean;
  #stickied: boolean;
  #removed: boolean;
  #removedBy: string | undefined;
  #removedByCategory: string | undefined;
  #archived: boolean;
  #edited: boolean;
  #locked: boolean;
  #nsfw: boolean;
  #quarantined: boolean;
  #spoiler: boolean;
  #hidden: boolean;
  #ignoringReports: boolean;
  #distinguishedBy?: string;
  #flair?: LinkFlair;
  #secureMedia?: SecureMedia;
  #modReportReasons: string[];
  #userReportReasons: string[];
  #gallery: GalleryMedia[];

  #metadata: Metadata | undefined;

  /**
   * @internal
   */
  constructor(data: RedditObject, metadata: Metadata | undefined) {
    makeGettersEnumerable(this);

    assertNonNull(data.id, 'Post is missing id');
    assertNonNull(data.title, 'Post is missing title');
    assertNonNull(data.createdUtc, 'Post is missing created date');
    assertNonNull(data.author, 'Post is missing author name');
    assertNonNull(data.subreddit, 'Post is missing subreddit name');
    assertNonNull(data.subredditId, 'Post is missing subreddit id');
    assertNonNull(data.url, 'Post is missing url');
    assertNonNull(data.permalink, 'Post is missing permalink');

    this.#id = asT3ID(`t3_${data.id}`);

    this.#authorName = data.author;
    this.#authorId = data.authorFullname ? asT2ID(data.authorFullname) : undefined;
    this.#subredditId = asT5ID(data.subredditId);
    this.#subredditName = data.subreddit;
    this.#score = data.score ?? 0;
    this.#numberOfComments = data.numComments ?? 0;
    this.#numberOfReports = data.numReports ?? 0;

    const createdAt = new Date(0);
    createdAt.setUTCSeconds(data.createdUtc);
    this.#createdAt = createdAt;

    this.#title = data.title;
    this.#body = data.selftext;
    this.#bodyHtml = data.selftextHtml;
    this.#url = data.url;
    this.#permalink = data.permalink;

    if (
      data.thumbnail &&
      data.thumbnail !== 'self' &&
      data.thumbnail !== 'nsfw' &&
      data.thumbnailHeight != null &&
      data.thumbnailWidth != null
    ) {
      this.#thumbnail = {
        url: data.thumbnail,
        height: data.thumbnailHeight,
        width: data.thumbnailWidth,
      };
    }

    this.#approved = data.approved ?? false;
    this.#approvedAtUtc = data.approvedAtUtc ?? 0;
    this.#bannedAtUtc = data.bannedAtUtc ?? 0;
    this.#removed = data.removed ?? false;
    this.#removedBy = data.removedBy;
    this.#removedByCategory = data.removedByCategory;
    this.#spam = data.spam ?? false;
    this.#stickied = data.stickied ?? false;
    this.#archived = data.archived ?? false;
    this.#edited = data.edited ?? false;
    this.#locked = data.locked ?? false;
    this.#nsfw = data.over18 ?? false;
    this.#quarantined = data.quarantine ?? false;
    this.#spoiler = data.spoiler;
    this.#hidden = data.hidden ?? false;
    this.#ignoringReports = data.ignoreReports ?? false;
    this.#distinguishedBy = data.distinguished;
    this.#secureMedia = data.secureMedia;

    this.#modReportReasons = ((data.modReports as unknown as [string, string]) ?? []).map(
      ([reason]) => reason
    );
    this.#userReportReasons = ((data.userReports as unknown as [string, string]) ?? []).map(
      ([reason]) => reason
    );

    this.#metadata = metadata;

    if (
      data.linkFlairBackgroundColor ||
      data.linkFlairCssClass ||
      data.linkFlairText ||
      data.linkFlairType ||
      data.linkFlairTemplateId ||
      data.linkFlairRichtext ||
      data.linkFlairTextColor
    ) {
      this.#flair = {
        backgroundColor: data.linkFlairBackgroundColor,
        cssClass: data.linkFlairCssClass,
        text: data.linkFlairText,
        type: data.linkFlairType,
        templateId: data.linkFlairTemplateId,
        // Map linkFlairRichtext[] into the objects with more user-friendly property names
        richtext: (data.linkFlairRichtext ?? []).map(({ e, t, a, u }) => ({
          elementType: e,
          text: t,
          emojiRef: a,
          url: u,
        })),
        textColor: data.linkFlairTextColor,
      };
    }

    if (data.gallery) {
      this.#gallery = data.gallery.map((item) => ({
        status: item.status,
        url: item.url,
        height: item.height,
        width: item.width,
      }));
    } else {
      this.#gallery = [];
    }
  }

  get id(): T3ID {
    return this.#id;
  }

  get authorId(): T2ID | undefined {
    return this.#authorId;
  }

  get authorName(): string {
    return this.#authorName;
  }

  get subredditId(): T5ID {
    return this.#subredditId;
  }

  get subredditName(): string {
    return this.#subredditName;
  }

  get permalink(): string {
    return this.#permalink;
  }

  get title(): string {
    return this.#title;
  }

  get body(): string | undefined {
    return this.#body;
  }

  get bodyHtml(): string | undefined {
    return this.#bodyHtml;
  }

  get url(): string {
    return this.#url;
  }

  get thumbnail(): { url: string; height: number; width: number } | undefined {
    return this.#thumbnail;
  }

  get createdAt(): Date {
    return this.#createdAt;
  }

  get score(): number {
    return this.#score;
  }

  get numberOfComments(): number {
    return this.#numberOfComments;
  }

  get numberOfReports(): number {
    return this.#numberOfReports;
  }

  get approved(): boolean {
    return this.#approved;
  }

  get approvedAtUtc(): number {
    return this.#approvedAtUtc;
  }

  get bannedAtUtc(): number {
    return this.#bannedAtUtc;
  }

  get spam(): boolean {
    return this.#spam;
  }

  get stickied(): boolean {
    return this.#stickied;
  }

  get removed(): boolean {
    return this.#removed;
  }

  /**
   * Who removed this object (username)
   */
  get removedBy(): string | undefined {
    return this.#removedBy;
  }

  /**
   * who/what removed this object. It will return one of the following:
   * - "anti_evil_ops": object is removed by a aeops member
   * - "author": object is removed by author of the post
   * - "automod_filtered": object is filtered by automod
   * - "community_ops": object is removed by a community team member
   * - "content_takedown": object is removed due to content violation
   * - "copyright_takedown": object is removed due to copyright violation
   * - "deleted": object is deleted
   * - "moderator": object is removed by a mod of the sub
   * - "reddit": object is removed by anyone else
   * - undefined: object is not removed
   */
  get removedByCategory(): string | undefined {
    return this.#removedByCategory;
  }

  get archived(): boolean {
    return this.#archived;
  }

  get edited(): boolean {
    return this.#edited;
  }

  get locked(): boolean {
    return this.#locked;
  }

  get nsfw(): boolean {
    return this.#nsfw;
  }

  get quarantined(): boolean {
    return this.#quarantined;
  }

  get spoiler(): boolean {
    return this.#spoiler;
  }

  get hidden(): boolean {
    return this.#hidden;
  }

  get ignoringReports(): boolean {
    return this.#ignoringReports;
  }

  get distinguishedBy(): string | undefined {
    return this.#distinguishedBy;
  }

  get comments(): Listing<Comment> {
    return Comment.getComments(
      {
        postId: this.id,
      },
      this.#metadata
    );
  }

  get flair(): LinkFlair | undefined {
    return this.#flair;
  }

  get secureMedia(): SecureMedia | undefined {
    return this.#secureMedia;
  }

  get userReportReasons(): string[] {
    return this.#userReportReasons;
  }

  get modReportReasons(): string[] {
    return this.#modReportReasons;
  }

  /**
   * Get the media in the post. Empty if the post doesn't have any media.
   */
  get gallery(): GalleryMedia[] {
    return this.#gallery;
  }

  toJSON(): Pick<
    Post,
    | 'id'
    | 'authorId'
    | 'authorName'
    | 'subredditId'
    | 'subredditName'
    | 'permalink'
    | 'title'
    | 'body'
    | 'bodyHtml'
    | 'url'
    | 'thumbnail'
    | 'score'
    | 'numberOfComments'
    | 'numberOfReports'
    | 'createdAt'
    | 'approved'
    | 'spam'
    | 'stickied'
    | 'removed'
    | 'removedBy'
    | 'removedByCategory'
    | 'archived'
    | 'edited'
    | 'locked'
    | 'nsfw'
    | 'quarantined'
    | 'spoiler'
    | 'hidden'
    | 'ignoringReports'
    | 'distinguishedBy'
    | 'flair'
    | 'secureMedia'
    | 'userReportReasons'
    | 'modReportReasons'
  > {
    return {
      id: this.id,
      authorId: this.authorId,
      authorName: this.authorName,
      subredditId: this.subredditId,
      subredditName: this.subredditName,
      permalink: this.permalink,
      title: this.title,
      body: this.body,
      bodyHtml: this.bodyHtml,
      url: this.url,
      thumbnail: this.thumbnail,
      score: this.score,
      numberOfComments: this.numberOfComments,
      numberOfReports: this.numberOfReports,
      createdAt: this.createdAt,
      approved: this.approved,
      spam: this.spam,
      stickied: this.stickied,
      removed: this.removed,
      removedBy: this.#removedBy,
      removedByCategory: this.#removedByCategory,
      archived: this.archived,
      edited: this.edited,
      locked: this.locked,
      nsfw: this.nsfw,
      quarantined: this.quarantined,
      spoiler: this.spoiler,
      hidden: this.hidden,
      ignoringReports: this.ignoringReports,
      distinguishedBy: this.distinguishedBy,
      flair: this.flair,
      secureMedia: this.secureMedia,
      modReportReasons: this.#modReportReasons,
      userReportReasons: this.#userReportReasons,
    };
  }

  isApproved(): boolean {
    return this.#approved;
  }

  isSpam(): boolean {
    return this.#spam;
  }

  isStickied(): boolean {
    return this.#stickied;
  }

  isRemoved(): boolean {
    return this.#removed;
  }

  isArchived(): boolean {
    return this.#archived;
  }

  isEdited(): boolean {
    return this.#edited;
  }

  isLocked(): boolean {
    return this.#locked;
  }

  isNsfw(): boolean {
    return this.#nsfw;
  }

  isQuarantined(): boolean {
    return this.#quarantined;
  }

  isSpoiler(): boolean {
    return this.#spoiler;
  }

  isHidden(): boolean {
    return this.#hidden;
  }

  isIgnoringReports(): boolean {
    return this.#ignoringReports;
  }

  isDistinguishedBy(): string | undefined {
    return this.#distinguishedBy;
  }

  async edit(options: PostTextOptions): Promise<void> {
    const newPost = await Post.edit(
      {
        id: this.id,
        ...options,
      },
      this.#metadata
    );

    this.#body = newPost.body;
    this.#edited = newPost.edited;
  }

  /**
   * Set the suggested sort for comments on a Post.
   *
   * @throws {Error} Throws an error if the suggested sort could not be set.
   * @example
   * ```ts
   * const post = await reddit.getPostById(context.postId);
   * await post.setSuggestedCommentSort("NEW");
   * ```
   */
  async setSuggestedCommentSort(suggestedSort: PostSuggestedCommentSort): Promise<void> {
    await Post.setSuggestedCommentSort(
      { id: this.id, subredditId: this.#subredditId, suggestedSort },
      this.#metadata
    );
  }

  /**
   * Get the postData for the post.
   *
   * @example
   * ```ts
   * const post = await context.reddit.getPostById(context.postId);
   * const postData = await post.getPostData();
   * ```
   */
  async getPostData(): Promise<PostData | undefined> {
    const devvitPostData = await Post.getDevvitPostData(this.id, this.#metadata);
    return devvitPostData?.developerData;
  }

  /**
   * Set the postData on a custom post.
   *
   * @param {PostData} postData - Represents the postData to be set, eg: { currentScore: 55, secretWord: 'barbeque' }
   * @throws {Error} Throws an error if the postData could not be set.
   * @example
   * ```ts
   * const post = await reddit.getPostById(context.postId);
   * await post.setPostData({
   *   currentScore: 55,
   *   secretWord: 'barbeque',
   * });
   * ```
   */
  async setPostData(postData: PostData): Promise<void> {
    const prev = await Post.getDevvitPostData(this.id, this.#metadata);
    await Post.setPostData(
      { postId: this.id, postData: { ...prev, developerData: postData } },
      this.#metadata
    );
  }

  /**
   * Set a lightweight UI that shows while the custom post renders
   *
   * @param {JSX.ComponentFunction} ui - A JSX component function that returns a simple ui to be rendered.
   * @throws {Error} Throws an error if the preview could not be set.
   * @example
   * ```ts
   * const preview = (
   *   <vstack height="100%" width="100%" alignment="middle center">
   *     <text size="large">An updated preview!</text>
   *   </vstack>
   * );
   * const post = await reddit.getPostById(context.postId);
   * await post.setCustomPostPreview(() => preview);
   * ```
   */
  async setCustomPostPreview(ui: JSX.ComponentFunction): Promise<void> {
    await Post.setCustomPostPreview(
      {
        id: this.id,
        ui,
      },
      this.#metadata
    );
  }

  /**
   * Set a text fallback for the custom post
   *
   * @param {CustomPostTextFallbackOptions} options - A text or a richtext to render in a fallback
   * @throws {Error} Throws an error if the fallback could not be set.
   * @example
   * ```ts
   * // from a menu action, form, scheduler, trigger, custom post click event, etc
   * const newTextFallback = { text: 'This is an updated text fallback' };
   * const post = await context.reddit.getPostById(context.postId);
   * await post.setTextFallback(newTextFallback);
   * ```
   */
  async setTextFallback(options: CustomPostTextFallbackOptions): Promise<void> {
    const newPost = await Post.setTextFallback(options, this.id, this.#metadata);

    this.#body = newPost.body;
    this.#edited = newPost.edited;
  }

  async addComment(options: CommentSubmissionOptions): Promise<Comment> {
    return Comment.submit(
      {
        id: this.id,
        ...options,
      },
      this.#metadata
    );
  }

  async delete(): Promise<void> {
    assertNonNull(this.#metadata);
    const appUsername = this.#metadata?.[Header.App]?.values[0];
    if (appUsername !== this.#authorName) {
      throw new Error(
        `App '${appUsername}' is not the author of Post ${this.id}, delete not allowed.`
      );
    }
    return Post.delete(this.id, this.#metadata);
  }

  async approve(): Promise<void> {
    await Post.approve(this.id, this.#metadata);
    this.#approved = true;
    this.#removed = false;
  }

  async remove(isSpam: boolean = false): Promise<void> {
    await Post.remove(this.id, isSpam, this.#metadata);
    this.#removed = true;
    this.#spam = isSpam;
    this.#approved = false;
  }

  async lock(): Promise<void> {
    await Post.lock(this.id, this.#metadata);
    this.#locked = true;
  }

  async unlock(): Promise<void> {
    await Post.unlock(this.id, this.#metadata);
    this.#locked = false;
  }

  async hide(): Promise<void> {
    await Post.hide(this.id, this.#metadata);
    this.#hidden = true;
  }

  async unhide(): Promise<void> {
    await Post.unhide(this.id, this.#metadata);
    this.#hidden = false;
  }

  async markAsNsfw(): Promise<void> {
    await Post.markAsNsfw(this.id, this.#metadata);
    this.#nsfw = true;
  }

  async unmarkAsNsfw(): Promise<void> {
    await Post.unmarkAsNsfw(this.id, this.#metadata);
    this.#nsfw = false;
  }

  async markAsSpoiler(): Promise<void> {
    await Post.markAsSpoiler(this.id, this.#metadata);
    this.#spoiler = true;
  }

  async unmarkAsSpoiler(): Promise<void> {
    await Post.unmarkAsSpoiler(this.id, this.#metadata);
    this.#spoiler = false;
  }

  async sticky(position?: 1 | 2 | 3 | 4): Promise<void> {
    await Post.sticky(this.id, position, this.#metadata);
  }

  async unsticky(): Promise<void> {
    await Post.unsticky(this.id, this.#metadata);
  }

  async distinguish(): Promise<void> {
    const { distinguishedBy } = await Post.distinguish(this.id, false, this.#metadata);
    this.#distinguishedBy = distinguishedBy;
  }

  async distinguishAsAdmin(): Promise<void> {
    const { distinguishedBy } = await Post.distinguish(this.id, true, this.#metadata);
    this.#distinguishedBy = distinguishedBy;
  }

  async undistinguish(): Promise<void> {
    const { distinguishedBy } = await Post.undistinguish(this.id, this.#metadata);
    this.#distinguishedBy = distinguishedBy;
  }

  async ignoreReports(): Promise<void> {
    await Post.ignoreReports(this.id, this.#metadata);
    this.#ignoringReports = true;
  }

  async unignoreReports(): Promise<void> {
    await Post.unignoreReports(this.id, this.#metadata);
    this.#ignoringReports = false;
  }

  async getAuthor(): Promise<User | undefined> {
    return User.getByUsername(this.#authorName, this.#metadata);
  }

  async crosspost(options: Omit<CrosspostOptions, 'postId'>): Promise<Post> {
    return Post.crosspost(
      {
        ...options,
        postId: this.id,
      },
      this.#metadata
    );
  }

  /**
   * Add a mod note for why the post was removed
   *
   * @param options.reasonId id of a Removal Reason - you can leave this as an empty string if you don't have one
   * @param options.modNote the reason for removal (maximum 100 characters) (optional)
   * @returns
   */
  addRemovalNote(options: { reasonId: string; modNote?: string }): Promise<void> {
    return ModNote.addRemovalNote({ itemIds: [this.#id], ...options }, this.#metadata);
  }

  /**
   * Get a thumbnail that contains a preview image and also contains a blurred preview for
   * NSFW images. The thumbnail returned has higher resolution than Post.thumbnail.
   * Returns undefined if the post doesn't have a thumbnail
   *
   * @returns {EnrichedThumbnail | undefined}
   * @throws {Error} Throws an error if the thumbnail could not be fetched
   * @example
   * ```ts
   * // from a menu action, form, scheduler, trigger, custom post click event, etc
   * const post = await context.reddit.getPostById(context.postId);
   * const enrichedThumbnail = await post.getEnrichedThumbnail();
   * ```
   */
  async getEnrichedThumbnail(): Promise<EnrichedThumbnail | undefined> {
    return getThumbnailV2({ id: this.id }, this.#metadata);
  }

  // TODO: flair methods

  /** @internal */
  static async getById(id: T3ID, metadata: Metadata | undefined): Promise<Post> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    const postId: T3ID = isT3ID(id) ? id : `t3_${id}`;

    const response = await client.Info(
      {
        subreddits: [],
        thingIds: [postId],
      },
      metadata
    );

    if (!response.data?.children?.length) {
      throw new Error('could not find post');
    }

    const postData = response.data.children[0];

    if (!postData?.data) {
      throw new Error('could not find post');
    }

    return new Post(postData.data, metadata);
  }

  /** @internal */
  static async submit(options: SubmitPostOptions, metadata: Metadata | undefined): Promise<Post> {
    const { runAs = 'APP' } = options;
    const runAsType = RunAs[runAs];
    const client =
      runAsType === RunAs.USER
        ? Devvit.userActionsPlugin
        : Devvit.redditAPIPlugins.LinksAndComments;

    if (runAsType === RunAs.USER) {
      Devvit.assertUserScope(Scope.SUBMIT_POST);
    }

    let response: SubmitResponse;

    if ('preview' in options) {
      assertNonNull(metadata, 'Missing metadata in `SubmitPostOptions`');
      if (runAsType === RunAs.USER) {
        assertNonNull(
          options.userGeneratedContent,
          'userGeneratedContent must be set in `SubmitPostOptions` when RunAs=USER for experience posts'
        );
      }
      const reconciler = new BlocksReconciler(
        () => options.preview,
        undefined,
        {},
        metadata,
        undefined
      );
      const previewBlock = await reconciler.buildBlocksUI();
      const encodedCached = Block.encode(previewBlock).finish();

      const { textFallback, ...sanitizedOptions } = options;
      const richtextFallback = textFallback ? getCustomPostRichTextFallback(textFallback) : '';

      const userGeneratedContent = options.userGeneratedContent
        ? {
            text: options.userGeneratedContent.text ?? '',
            imageUrls: options.userGeneratedContent.imageUrls ?? [],
          }
        : undefined;

      const devvitPostData = options.postData
        ? {
            developerData: options.postData,
          }
        : undefined;

      const submitRequest: SubmitRequest = {
        kind: 'custom',
        sr: options.subredditName,
        richtextJson: fromByteArray(encodedCached),
        richtextFallback,
        ...sanitizedOptions,
        userGeneratedContent,
        runAs: runAsType,
        postData: devvitPostData,
      };

      response = await client.SubmitCustomPost(submitRequest, metadata);
    } else {
      response = await client.Submit(
        {
          kind: 'kind' in options ? options.kind : 'url' in options ? 'link' : 'self',
          sr: options.subredditName,
          richtextJson: 'richtext' in options ? richtextToString(options.richtext) : undefined,
          ...options,
          runAs: runAsType,
        },
        metadata
      );
    }

    // Post Id might not be present as image/video post creation can happen asynchronously
    const isAllowedMediaType =
      'kind' in options && ['image', 'video', 'videogif'].includes(options.kind);
    if (isAllowedMediaType && !response.json?.data?.id) {
      if (options.kind === 'image' && 'imageUrls' in options) {
        throw new Error(
          `Image post type with ${options.imageUrls} is being created asynchronously and should be updated in the subreddit soon.`
        );
      } else if ('videoPosterUrl' in options) {
        throw new Error(
          `Post of ${options.kind} type with ${options.videoPosterUrl} is being created asynchronously and should be updated in the subreddit soon.`
        );
      }
    }

    if (response.json?.errors?.length) {
      throw new Error(`failed to submit post - errors: ${response.json?.errors.join(', ')}`);
    } else if (!response.json?.data?.id) {
      throw new Error(`failed to submit post - no post ID returned but no error details found`);
    }

    return Post.getById(`t3_${response.json.data.id}`, metadata);
  }

  /** @internal */
  static async crosspost(options: CrosspostOptions, metadata: Metadata | undefined): Promise<Post> {
    const { runAs = 'APP' } = options;
    const runAsType = RunAs[runAs];
    const client =
      runAsType === RunAs.USER
        ? Devvit.userActionsPlugin
        : Devvit.redditAPIPlugins.LinksAndComments;
    const { postId, subredditName, ...rest } = options;

    if (runAsType === RunAs.USER) {
      Devvit.assertUserScope(Scope.SUBMIT_POST);
    }

    const response = await client.Submit(
      {
        kind: 'crosspost',
        sr: subredditName,
        crosspostFullname: asT3ID(postId),
        ...rest,
        runAs: runAsType,
      },
      metadata
    );

    if (!response.json?.data?.id || response.json?.errors?.length) {
      throw new Error('failed to crosspost post');
    }

    return Post.getById(`t3_${response.json.data.id}`, metadata);
  }

  /** @internal */
  static async edit(
    options: PostTextOptions & { id: T3ID },
    metadata: Metadata | undefined
  ): Promise<Post> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    const { id } = options;

    let richtextString: string | undefined;
    if ('richtext' in options) {
      richtextString = richtextToString(options.richtext);
    }

    const response = await client.EditUserText(
      {
        thingId: id,
        text: 'text' in options ? options.text : '',
        richtextJson: richtextString,
        runAs: RunAs.APP,
      },
      metadata
    );

    if (response.json?.errors?.length) {
      throw new Error('Failed to edit post');
    }

    // The LinksAndComments.EditUserText response is wrong and assumes that
    // the API is only used to for comments so we fetch the new post here.
    return Post.getById(id, metadata);
  }

  /** @internal */
  static async setSuggestedCommentSort(
    options: { suggestedSort: PostSuggestedCommentSort; id: T3ID; subredditId: T5ID },
    metadata: Metadata | undefined
  ): Promise<void> {
    const operationName = 'SetSuggestedSort';
    const persistedQueryHash = 'cf6052acc7fefaa65b710625b81dba8041f258313aafe9730e2a3dc855e5d10d';
    const response = await GraphQL.query(
      operationName,
      persistedQueryHash,
      {
        input: {
          subredditId: options.subredditId,
          postId: options.id,
          sort: options.suggestedSort,
        },
      },
      metadata
    );

    if (!response.data?.setSuggestedSort?.ok) {
      throw new Error('Failed to set suggested sort');
    }
  }

  /** @internal */
  static async getDevvitPostData(
    id: T3ID,
    metadata: Metadata | undefined
  ): Promise<DevvitPostData | undefined> {
    const operationName = 'GetDevvitPostData';
    const persistedQueryHash = 'd349c9bee385336e44837c4a041d4b366fa32f16121cef7f12e1e3f230340696';
    const response = await GraphQL.query(
      operationName,
      persistedQueryHash,
      {
        id,
      },
      metadata
    );

    if (response.data?.postInfoById?.errors) {
      throw new Error(
        `Failed to get devvit post data due to errors: ${response.data?.postInfoById?.errors.join(', ')}`
      );
    }

    // GQL returns postData as a JSON string
    const devvitPostData: string = response.data?.postInfoById?.devvit?.postData;

    if (!devvitPostData) {
      return undefined;
    }

    return JSON.parse(devvitPostData) as DevvitPostData;
  }

  /** @internal */
  static async setPostData(
    options: { postId: T3ID; postData: DevvitPostData },
    metadata: Metadata | undefined
  ): Promise<void> {
    const res = await Devvit.redditAPIPlugins.LinksAndComments.EditCustomPost(
      {
        thingId: options.postId,
        postData: options.postData,
      },
      metadata
    );
    if (res.json?.errors?.length) {
      throw new Error(`Failed to set post data, errors: ${res.json?.errors}`);
    }
  }

  /** @internal */
  static async setCustomPostPreview(
    options: { id: T3ID; ui: JSX.ComponentFunction },
    metadata: Metadata | undefined
  ): Promise<void> {
    if (!metadata) {
      throw new Error('Failed to set custom post preview. Metadata not found');
    }

    const client = Devvit.redditAPIPlugins.LinksAndComments;

    const handler = new BlocksHandler(options.ui);
    const handlerResponse = UIResponse.fromJSON(await handler.handle({ events: [] }, metadata));
    const block = handlerResponse.blocks as Block;
    const blocksRenderContent = fromByteArray(Block.encode(block).finish());

    await client.SetCustomPostPreview(
      {
        thingId: options.id,
        bodyType: SetCustomPostPreviewRequestBodyType.BLOCKS,
        blocksRenderContent,
      },
      metadata
    );
  }

  /** @internal */
  static async setTextFallback(
    options: CustomPostTextFallbackOptions,
    postId: T3ID,
    metadata: Metadata | undefined
  ): Promise<Post> {
    if (!('text' in options) && !('richtext' in options)) {
      throw new Error(`No text fallback provided for post ${postId}.`);
    }

    const client = Devvit.redditAPIPlugins.LinksAndComments;

    const richtextFallback = getCustomPostRichTextFallback(options);

    const response = await client.EditCustomPost(
      {
        thingId: postId,
        richtextFallback,
      },
      metadata
    );

    if (response.json?.errors?.length)
      // to-do: why is errors `Any[]`?
      throw Error(
        `set post ${postId} text fallback failed: ${JSON.stringify(response.json.errors)}`
      );

    return Post.getById(postId, metadata);
  }

  /** @internal */
  static async delete(id: T3ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    await client.Del(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async approve(id: T3ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.Moderation;

    await client.Approve(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async remove(
    id: T3ID,
    isSpam: boolean = false,
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.Moderation;

    await client.Remove(
      {
        id,
        spam: isSpam,
      },
      metadata
    );
  }

  /** @internal */
  static async hide(id: T3ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    await client.Hide(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async unhide(id: T3ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    await client.Unhide(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async markAsNsfw(id: T3ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    await client.MarkNSFW(
      {
        id,
      },
      metadata
    );
  }
  /** @internal */
  static async unmarkAsNsfw(id: T3ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    await client.UnmarkNSFW(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async markAsSpoiler(id: T3ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    await client.Spoiler(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async unmarkAsSpoiler(id: T3ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    await client.Unspoiler(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async sticky(
    id: T3ID,
    position: 1 | 2 | 3 | 4 | undefined,
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    await client.SetSubredditSticky(
      {
        id,
        state: true,
        num: position,
      },
      metadata
    );
  }

  /** @internal */
  static async unsticky(id: T3ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    await client.SetSubredditSticky(
      {
        id,
        state: false,
      },
      metadata
    );
  }

  /** @internal */
  static async lock(id: T3ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    await client.Lock(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async unlock(id: T3ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.LinksAndComments;

    await client.Unlock(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async distinguish(
    id: T3ID,
    asAdmin: boolean,
    metadata: Metadata | undefined
  ): Promise<{ distinguishedBy: string | undefined }> {
    const client = Devvit.redditAPIPlugins.Moderation;

    const response = await client.Distinguish(
      {
        id,
        how: asAdmin ? 'admin' : 'yes',
        sticky: false,
      },
      metadata
    );

    const post = response.json?.data?.things?.[0]?.data;

    assertNonNull(post);

    return {
      distinguishedBy: post.distinguished,
    };
  }

  /** @internal */
  static async undistinguish(
    id: T3ID,
    metadata: Metadata | undefined
  ): Promise<{ distinguishedBy: string | undefined }> {
    const client = Devvit.redditAPIPlugins.Moderation;

    const response = await client.Distinguish(
      {
        id,
        how: 'no',
        sticky: false,
      },
      metadata
    );

    const post = response.json?.data?.things?.[0]?.data;

    assertNonNull(post);

    return {
      distinguishedBy: post.distinguished,
    };
  }

  /** @internal */
  static async ignoreReports(id: T3ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.Moderation;

    await client.IgnoreReports(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static async unignoreReports(id: T3ID, metadata: Metadata | undefined): Promise<void> {
    const client = Devvit.redditAPIPlugins.Moderation;

    await client.UnignoreReports(
      {
        id,
      },
      metadata
    );
  }

  /** @internal */
  static getControversialPosts(
    options: GetPostsOptionsWithTimeframe = {},
    metadata: Metadata | undefined
  ): Listing<Post> {
    return this.getSortedPosts(
      {
        ...options,
        sort: 'controversial',
      },
      metadata
    );
  }

  /** @internal */
  static getTopPosts(
    options: GetPostsOptionsWithTimeframe = {},
    metadata: Metadata | undefined
  ): Listing<Post> {
    return this.getSortedPosts(
      {
        ...options,
        sort: 'top',
      },
      metadata
    );
  }

  /** @internal */
  static getSortedPosts(
    options: GetSortedPostsOptions,
    metadata: Metadata | undefined
  ): Listing<Post> {
    const client = Devvit.redditAPIPlugins.Listings;

    return new Listing({
      hasMore: true,
      before: options.before,
      after: options.after,
      pageSize: options.pageSize,
      limit: options.limit,
      fetch: async (fetchOptions: ListingFetchOptions) => {
        const response = await client.Sort(
          {
            show: 'all',
            sort: options.sort,
            t: options.timeframe,
            subreddit: options.subredditName,
            ...fetchOptions,
          },
          metadata
        );

        return listingProtosToPosts(response, metadata);
      },
    });
  }

  /** @internal */
  static getHotPosts(
    options: GetHotPostsOptions = {
      location: 'GLOBAL',
    },
    metadata: Metadata | undefined
  ): Listing<Post> {
    const client = Devvit.redditAPIPlugins.Listings;

    return new Listing({
      hasMore: true,
      before: options.before,
      after: options.after,
      pageSize: options.pageSize,
      limit: options.limit,
      fetch: async (fetchOptions: ListingFetchOptions) => {
        const response = await client.Hot(
          {
            g: options.location,
            show: 'all',
            subreddit: options.subredditName,
            ...fetchOptions,
          },
          metadata
        );

        return listingProtosToPosts(response, metadata);
      },
    });
  }

  /** @internal */
  static getNewPosts(options: GetPostsOptions, metadata: Metadata | undefined): Listing<Post> {
    const client = Devvit.redditAPIPlugins.Listings;

    return new Listing({
      hasMore: true,
      before: options.before,
      after: options.after,
      pageSize: options.pageSize,
      limit: options.limit,
      fetch: async (fetchOptions: ListingFetchOptions) => {
        const response = await client.New(
          {
            show: 'all',
            subreddit: options.subredditName,
            ...fetchOptions,
          },
          metadata
        );

        return listingProtosToPosts(response, metadata);
      },
    });
  }

  /** @internal */
  static getRisingPosts(options: GetPostsOptions, metadata: Metadata | undefined): Listing<Post> {
    const client = Devvit.redditAPIPlugins.Listings;

    return new Listing({
      hasMore: true,
      before: options.before,
      after: options.after,
      pageSize: options.pageSize,
      limit: options.limit,
      fetch: async (fetchOptions: ListingFetchOptions) => {
        const response = await client.Rising(
          {
            show: 'all',
            subreddit: options.subredditName,
            ...fetchOptions,
          },
          metadata
        );

        return listingProtosToPosts(response, metadata);
      },
    });
  }

  /** @internal */
  static getPostsByUser(
    options: GetPostsByUserOptions,
    metadata: Metadata | undefined
  ): Listing<Post> {
    const client = Devvit.redditAPIPlugins.Users;
    return new Listing({
      hasMore: true,
      before: options.before,
      after: options.after,
      pageSize: options.pageSize,
      limit: options.limit,
      async fetch(fetchOptions) {
        const response = await client.UserWhere(
          {
            username: options.username,
            where: 'submitted',
            ...fetchOptions,
          },
          metadata
        );

        return listingProtosToPosts(response, metadata);
      },
    });
  }
}

function listingProtosToPosts(
  listingProto: ListingProto,
  metadata: Metadata | undefined
): ListingFetchResponse<Post> {
  if (!listingProto.data?.children) {
    throw new Error('Listing response is missing children');
  }

  const children = listingProto.data.children.map((child) => new Post(child.data!, metadata));

  return {
    children,
    before: listingProto.data.before,
    after: listingProto.data.after,
  };
}

/** @internal */
async function getThumbnailV2(
  options: { id: T3ID },
  metadata: Metadata | undefined
): Promise<EnrichedThumbnail | undefined> {
  const operationName = 'GetThumbnailV2';
  const persistedQueryHash = '81580ce4e23d748c5a59a1618489b559bf4518b6a73af41f345d8d074c8b2ce9';
  const response = await GraphQL.query(
    operationName,
    persistedQueryHash,
    {
      id: options.id,
    },
    metadata
  );

  const thumbnail = response.data?.postInfoById?.thumbnailV2;

  if (!thumbnail) {
    throw new Error('Failed to get thumbnail');
  } else if (!thumbnail.image) {
    return undefined;
  }

  return {
    attribution: thumbnail.attribution,
    image: {
      url: thumbnail.image.url,
      width: thumbnail.image.dimensions.width,
      height: thumbnail.image.dimensions.height,
    },
    isObfuscatedDefault: thumbnail.isObfuscatedDefault,
    ...(thumbnail.obfuscatedImage && {
      obfuscatedImage: {
        url: thumbnail.obfuscatedImage.url,
        width: thumbnail.obfuscatedImage.dimensions.width,
        height: thumbnail.obfuscatedImage.dimensions.height,
      },
    }),
  };
}
