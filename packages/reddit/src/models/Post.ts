import type {
  Listing as ListingProto,
  Metadata,
  RedditObject,
  SubmitRequest,
  SubmitResponse,
} from '@devvit/protos';
import type { GalleryMediaStatus as GalleryMediaStatusProto } from '@devvit/protos';
import { Block, DevvitPostData, UIResponse } from '@devvit/protos';
import type { SplashPostData } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';
import type { Height } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';
import { BlocksHandler } from '@devvit/public-api/devvit/internals/blocks/handler/BlocksHandler.js';
import { context } from '@devvit/server';
import { Header } from '@devvit/shared-types/Header.js';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import type { PostData } from '@devvit/shared-types/PostData.js';
import { RichTextBuilder } from '@devvit/shared-types/richtext/RichTextBuilder.js';
import type { T2ID, T3ID, T5ID } from '@devvit/shared-types/tid.js';
import { asT2ID, asT3ID, asT5ID, isT3ID } from '@devvit/shared-types/tid.js';
import { Loading } from '@devvit/splash/loading.js';
import { type SplashProps } from '@devvit/splash/splash.js';

import { RunAs, type UserGeneratedContent } from '../common.js';
import { GraphQL } from '../graphql/GraphQL.js';
import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';
import { richtextToString } from '../helpers/richtextToString.js';
import { getCustomPostRichTextFallback } from '../helpers/textFallbackToRichtext.js';
import { getRedditApiPlugins, getUserActionsPlugin } from '../plugin.js';
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

export type SubmitCustomPostSplashOptions = SplashProps;

export type SubmitCustomPostOptions = CommonSubmitPostOptions &
  SubmitCustomPostTextFallbackOptions & {
    userGeneratedContent?: UserGeneratedContent;
    postData?: PostData;
    splash: SubmitCustomPostSplashOptions;
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

export type CrosspostOptions = CommonSubmitPostOptions & {
  subredditName: string;
  postId: string;
};

export type LinkFlair = {
  /**
   * One of: "text", "richtext"
   */
  type?: string | undefined;
  /**
   * Flair template ID to use when rendering this flair
   */
  templateId?: string | undefined;
  /**
   * Plain text representation of the flair
   */
  text?: string | undefined;
  /**
   * RichText object representation of the flair
   */
  richtext: {
    /**
     * Enum of element types.  e.g. emoji or text
     */
    elementType?: string | undefined;
    /**
     * Text to show up in the flair, e.g. "Need Advice"
     */
    text?: string | undefined;
    /**
     * Emoji references, e.g. ":rainbow:"
     */
    emojiRef?: string | undefined;
    /**
     * url string, e.g. "https://reddit.com/"
     */
    url?: string | undefined;
  }[];
  /**
   * Custom CSS classes from the subreddit's stylesheet to apply to the flair if rendered as HTML
   */
  cssClass?: string | undefined;
  /**
   * One of: "light", "dark"
   */
  textColor?: string | undefined;
  /**
   * Flair background color as a hex color string (# prefixed)
   * @example "#FF4500"
   */
  backgroundColor?: string | undefined;
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
  thumbnailWidth?: number | undefined;
  /** The height of the optional thumbnail in pixels */
  thumbnailHeight?: number | undefined;
  /** A URL to a thumbnail image representing the resource. */
  thumbnailUrl?: string | undefined;
  /** The HTML required to embed a video player. The HTML should have no padding or margins. Consumers may wish to load the HTML in an off-domain iframe to avoid XSS vulnerabilities. */
  html: string;
  /** The width in pixels required to display the HTML. */
  height?: number | undefined;
  /** The height in pixels required to display the HTML. */
  width?: number | undefined;
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
  bitrateKbps?: number | undefined;
  /** The URL to the DASH playlist file. E.g. "https://v.redd.it/abc123/DASHPlaylist.mpd" */
  dashUrl?: string | undefined;
  /** The duration of the video in seconds. E.g. 30 */
  duration?: number | undefined;
  /** The direct URL to the video. E.g. "https://v.redd.it/abc123/DASH_1080.mp4?source=fallback" */
  fallbackUrl?: string | undefined;
  /** The height of the video in pixels. E.g. 1080 */
  height?: number | undefined;
  /** The URL to the HLS playlist file. E.g. "https://v.redd.it/abc123/HLSPlaylist.m3u8" */
  hlsUrl?: string | undefined;
  /** If `true`, the video is a GIF */
  isGif?: boolean | undefined;
  /** The URL to the scrubber media file. E.g. "https://v.redd.it/abc123/DASH_96.mp4" */
  scrubberMediaUrl?: string | undefined;
  /** The status of the transcoding process. E.g. "completed" */
  transcodingStatus?: string | undefined;
  /** The width of the video in pixels. E.g. 1920 */
  width?: number | undefined;
};

export type SecureMedia = {
  /** The type of the OEmbed media, if present (e.g. "youtube.com") */
  type?: string | undefined;
  oembed?: OEmbed | undefined;
  redditVideo?: RedditVideo | undefined;
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
  #authorId: T2ID | undefined;
  #authorName: string;
  #createdAt: Date;
  #subredditId: T5ID;
  #subredditName: string;
  #permalink: string;
  #title: string;
  #body: string | undefined;
  #bodyHtml: string | undefined;
  #url: string;
  #score: number;
  #numberOfComments: number;
  #numberOfReports: number;
  #thumbnail:
    | {
        url: string;
        height: number;
        width: number;
      }
    | undefined;
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
  #distinguishedBy: string | undefined;
  #flair: LinkFlair | undefined;
  #secureMedia: SecureMedia | undefined;
  #modReportReasons: string[];
  #userReportReasons: string[];
  #gallery: GalleryMedia[];

  /**
   * @internal
   */
  constructor(data: RedditObject) {
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
    return Comment.getComments({
      postId: this.id,
    });
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
    const newPost = await Post.edit({
      id: this.id,
      ...options,
    });

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
    await Post.setSuggestedCommentSort({
      id: this.id,
      subredditId: this.#subredditId,
      suggestedSort,
    });
  }

  /**
   * Set the postData on a custom post.
   *
   * @param postData - Represents the postData to be set, eg: { currentScore: 55, secretWord: 'barbeque' }
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
    const json = context.metadata[Header.PostData]?.values[0];
    const prev: DevvitPostData = json ? JSON.parse(json) : {};
    await Post.setPostData({ postId: this.id, postData: { ...prev, developerData: postData } });
  }

  /**
   * Set the launch and loading screens of a custom post.
   *
   * @example
   * ```ts
   * const post = await reddit.getPostById(context.postId);
   * await post.setSplash({ appDisplayName: "Pixelary" });
   * ```
   */
  async setSplash(opts: Readonly<SubmitCustomPostSplashOptions>): Promise<void> {
    const json = context.metadata[Header.PostData]?.values[0];
    const prev: DevvitPostData = json ? JSON.parse(json) : {};
    const postData = { ...prev, splash: SplashPostData(opts, this.title) };
    await Post.setPostData({ postId: this.id, postData });
  }

  /**
   * Set a text fallback for the custom post
   *
   * @param options - A text or a richtext to render in a fallback
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
    const newPost = await Post.setTextFallback(options, this.id);

    this.#body = newPost.body;
    this.#edited = newPost.edited;
  }

  async addComment(options: CommentSubmissionOptions): Promise<Comment> {
    return Comment.submit({
      id: this.id,
      ...options,
    });
  }

  async delete(): Promise<void> {
    const appUsername = context.appName;
    if (appUsername !== this.#authorName) {
      throw new Error(
        `App '${appUsername}' is not the author of Post ${this.id}, delete not allowed.`
      );
    }
    return Post.delete(this.id);
  }

  async approve(): Promise<void> {
    await Post.approve(this.id);
    this.#approved = true;
    this.#removed = false;
  }

  async remove(isSpam: boolean = false): Promise<void> {
    await Post.remove(this.id, isSpam);
    this.#removed = true;
    this.#spam = isSpam;
    this.#approved = false;
  }

  async lock(): Promise<void> {
    await Post.lock(this.id);
    this.#locked = true;
  }

  async unlock(): Promise<void> {
    await Post.unlock(this.id);
    this.#locked = false;
  }

  async hide(): Promise<void> {
    await Post.hide(this.id);
    this.#hidden = true;
  }

  async unhide(): Promise<void> {
    await Post.unhide(this.id);
    this.#hidden = false;
  }

  async markAsNsfw(): Promise<void> {
    await Post.markAsNsfw(this.id);
    this.#nsfw = true;
  }

  async unmarkAsNsfw(): Promise<void> {
    await Post.unmarkAsNsfw(this.id);
    this.#nsfw = false;
  }

  async markAsSpoiler(): Promise<void> {
    await Post.markAsSpoiler(this.id);
    this.#spoiler = true;
  }

  async unmarkAsSpoiler(): Promise<void> {
    await Post.unmarkAsSpoiler(this.id);
    this.#spoiler = false;
  }

  async sticky(position?: 1 | 2 | 3 | 4): Promise<void> {
    await Post.sticky(this.id, position);
  }

  async unsticky(): Promise<void> {
    await Post.unsticky(this.id);
  }

  async distinguish(): Promise<void> {
    const { distinguishedBy } = await Post.distinguish(this.id, false);
    this.#distinguishedBy = distinguishedBy;
  }

  async distinguishAsAdmin(): Promise<void> {
    const { distinguishedBy } = await Post.distinguish(this.id, true);
    this.#distinguishedBy = distinguishedBy;
  }

  async undistinguish(): Promise<void> {
    const { distinguishedBy } = await Post.undistinguish(this.id);
    this.#distinguishedBy = distinguishedBy;
  }

  async ignoreReports(): Promise<void> {
    await Post.ignoreReports(this.id);
    this.#ignoringReports = true;
  }

  async unignoreReports(): Promise<void> {
    await Post.unignoreReports(this.id);
    this.#ignoringReports = false;
  }

  async getAuthor(): Promise<User | undefined> {
    return User.getByUsername(this.#authorName);
  }

  async crosspost(options: Omit<CrosspostOptions, 'postId'>): Promise<Post> {
    return Post.crosspost({
      ...options,
      postId: this.id,
    });
  }

  /**
   * Add a mod note for why the post was removed
   *
   * @param options.reasonId id of a Removal Reason - you can leave this as an empty string if you don't have one
   * @param options.modNote the reason for removal (maximum 100 characters) (optional)
   * @returns
   */
  addRemovalNote(options: { reasonId: string; modNote?: string }): Promise<void> {
    return ModNote.addRemovalNote({ itemIds: [this.#id], ...options });
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
    return getThumbnailV2({ id: this.id });
  }

  // TODO: flair methods

  /** @internal */
  static async getById(id: T3ID): Promise<Post> {
    const client = getRedditApiPlugins().LinksAndComments;

    const postId: T3ID = isT3ID(id) ? id : `t3_${id}`;

    const response = await client.Info(
      {
        subreddits: [],
        thingIds: [postId],
      },
      this.#metadata
    );

    if (!response.data?.children?.length) {
      throw new Error('could not find post');
    }

    const postData = response.data.children[0];

    if (!postData?.data) {
      throw new Error('could not find post');
    }

    return new Post(postData.data);
  }

  /** @internal */
  static async submit(options: SubmitPostOptions): Promise<Post> {
    const { runAs = 'APP' } = options;
    const runAsType = RunAs[runAs];
    const client =
      runAsType === RunAs.USER ? getUserActionsPlugin() : getRedditApiPlugins().LinksAndComments;

    let response: SubmitResponse;

    if ('splash' in options) {
      if (runAsType === RunAs.USER) {
        assertNonNull(
          options.userGeneratedContent,
          'userGeneratedContent must be set in `SubmitPostOptions` when RunAs=USER for custom posts'
        );
      }
      const handler = new BlocksHandler(() => Loading(options.splash));
      const rsp = UIResponse.fromJSON(await handler.handle({ events: [] }, this.#metadata));
      const encodedCached = Block.encode(rsp.blocks!).finish();

      const { textFallback, ...sanitizedOptions } = options;
      const richtextFallback = textFallback ? getCustomPostRichTextFallback(textFallback) : '';

      const userGeneratedContent = options.userGeneratedContent
        ? {
            text: options.userGeneratedContent.text ?? '',
            imageUrls: options.userGeneratedContent.imageUrls ?? [],
          }
        : undefined;

      const postData: DevvitPostData = {
        developerData: options.postData,
        splash: SplashPostData(options.splash, options.title),
      };
      const submitRequest: SubmitRequest = {
        kind: 'custom',
        sr: options.subredditName,
        richtextJson: Buffer.from(encodedCached).toString('base64'),
        richtextFallback,
        ...sanitizedOptions,
        userGeneratedContent,
        runAs: runAsType,
        postData,
      };
      response = await client.SubmitCustomPost(submitRequest, this.#metadata);
    } else {
      response = await client.Submit(
        {
          kind: 'kind' in options ? options.kind : 'url' in options ? 'link' : 'self',
          sr: options.subredditName,
          richtextJson: 'richtext' in options ? richtextToString(options.richtext) : undefined,
          ...options,
          runAs: runAsType,
        },
        this.#metadata
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

    if (!response.json?.data?.id || response.json?.errors?.length) {
      throw new Error(
        `failed to submit post - either post ID is empty or request failed with errors: ${response.json?.errors}`
      );
    }

    return Post.getById(`t3_${response.json.data.id}`);
  }

  /** @internal */
  static async crosspost(options: CrosspostOptions): Promise<Post> {
    const { runAs = 'APP' } = options;
    const runAsType = RunAs[runAs];
    const client =
      runAsType === RunAs.USER ? getUserActionsPlugin() : getRedditApiPlugins().LinksAndComments;
    const { postId, subredditName, ...rest } = options;

    const response = await client.Submit(
      {
        kind: 'crosspost',
        sr: subredditName,
        crosspostFullname: asT3ID(postId),
        ...rest,
        runAs: runAsType,
      },
      this.#metadata
    );

    if (!response.json?.data?.id || response.json?.errors?.length) {
      throw new Error('failed to crosspost post');
    }

    return Post.getById(`t3_${response.json.data.id}`);
  }

  /** @internal */
  static async edit(options: PostTextOptions & { id: T3ID }): Promise<Post> {
    const client = getRedditApiPlugins().LinksAndComments;

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
      this.#metadata
    );

    if (response.json?.errors?.length) {
      throw new Error('Failed to edit post');
    }

    // The LinksAndComments.EditUserText response is wrong and assumes that
    // the API is only used to for comments so we fetch the new post here.
    return Post.getById(id);
  }

  /** @internal */
  static async setSuggestedCommentSort(options: {
    suggestedSort: PostSuggestedCommentSort;
    id: T3ID;
    subredditId: T5ID;
  }): Promise<void> {
    const operationName = 'SetSuggestedSort';
    const persistedQueryHash = 'cf6052acc7fefaa65b710625b81dba8041f258313aafe9730e2a3dc855e5d10d';
    const response = await GraphQL.query(operationName, persistedQueryHash, {
      input: {
        subredditId: options.subredditId,
        postId: options.id,
        sort: options.suggestedSort,
      },
    });

    if (!response.data?.setSuggestedSort?.ok) {
      throw new Error('Failed to set suggested sort');
    }
  }

  /** @internal */
  static async setPostData(options: { postId: T3ID; postData: DevvitPostData }): Promise<void> {
    const [res] = await Promise.all([
      getRedditApiPlugins().LinksAndComments.EditCustomPost(
        {
          thingId: options.postId,
          postData: options.postData,
        },
        this.#metadata
      ),
    ]);
    if (res.json?.errors?.length) {
      throw new Error(`Failed to set post data, errors: ${res.json?.errors}`);
    }
  }

  /** @internal */
  static async setTextFallback(
    options: CustomPostTextFallbackOptions,
    postId: T3ID
  ): Promise<Post> {
    if (!('text' in options) && !('richtext' in options)) {
      throw new Error(`No text fallback provided for post ${postId}.`);
    }

    const client = getRedditApiPlugins().LinksAndComments;

    const richtextFallback = getCustomPostRichTextFallback(options);

    const response = await client.EditCustomPost(
      {
        thingId: postId,
        richtextFallback,
      },
      this.#metadata
    );

    if (response.json?.errors?.length) {
      throw new Error('Failed to set post text fallback');
    }

    return Post.getById(postId);
  }

  /** @internal */
  static async delete(id: T3ID): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Del(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async approve(id: T3ID): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.Approve(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async remove(id: T3ID, isSpam: boolean = false): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.Remove(
      {
        id,
        spam: isSpam,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async hide(id: T3ID): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Hide(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async unhide(id: T3ID): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Unhide(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async markAsNsfw(id: T3ID): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.MarkNSFW(
      {
        id,
      },
      this.#metadata
    );
  }
  /** @internal */
  static async unmarkAsNsfw(id: T3ID): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.UnmarkNSFW(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async markAsSpoiler(id: T3ID): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Spoiler(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async unmarkAsSpoiler(id: T3ID): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Unspoiler(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async sticky(id: T3ID, position: 1 | 2 | 3 | 4 | undefined): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.SetSubredditSticky(
      {
        id,
        state: true,
        num: position,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async unsticky(id: T3ID): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.SetSubredditSticky(
      {
        id,
        state: false,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async lock(id: T3ID): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Lock(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async unlock(id: T3ID): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Unlock(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async distinguish(
    id: T3ID,
    asAdmin: boolean
  ): Promise<{ distinguishedBy: string | undefined }> {
    const client = getRedditApiPlugins().Moderation;

    const response = await client.Distinguish(
      {
        id,
        how: asAdmin ? 'admin' : 'yes',
        sticky: false,
      },
      this.#metadata
    );

    const post = response.json?.data?.things?.[0]?.data;

    assertNonNull(post);

    return {
      distinguishedBy: post.distinguished,
    };
  }

  /** @internal */
  static async undistinguish(id: T3ID): Promise<{ distinguishedBy: string | undefined }> {
    const client = getRedditApiPlugins().Moderation;

    const response = await client.Distinguish(
      {
        id,
        how: 'no',
        sticky: false,
      },
      this.#metadata
    );

    const post = response.json?.data?.things?.[0]?.data;

    assertNonNull(post);

    return {
      distinguishedBy: post.distinguished,
    };
  }

  /** @internal */
  static async ignoreReports(id: T3ID): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.IgnoreReports(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async unignoreReports(id: T3ID): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.UnignoreReports(
      {
        id,
      },
      this.#metadata
    );
  }

  /** @internal */
  static getControversialPosts(options: GetPostsOptionsWithTimeframe = {}): Listing<Post> {
    return this.getSortedPosts({
      ...options,
      sort: 'controversial',
    });
  }

  /** @internal */
  static getTopPosts(options: GetPostsOptionsWithTimeframe = {}): Listing<Post> {
    return this.getSortedPosts({
      ...options,
      sort: 'top',
    });
  }

  /** @internal */
  static getSortedPosts(options: GetSortedPostsOptions): Listing<Post> {
    const client = getRedditApiPlugins().Listings;

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
          this.#metadata
        );

        return listingProtosToPosts(response);
      },
    });
  }

  /** @internal */
  static getHotPosts(
    options: GetHotPostsOptions = {
      location: 'GLOBAL',
    }
  ): Listing<Post> {
    const client = getRedditApiPlugins().Listings;

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
          this.#metadata
        );

        return listingProtosToPosts(response);
      },
    });
  }

  /** @internal */
  static getNewPosts(options: GetPostsOptions): Listing<Post> {
    const client = getRedditApiPlugins().Listings;

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
          this.#metadata
        );

        return listingProtosToPosts(response);
      },
    });
  }

  /** @internal */
  static getRisingPosts(options: GetPostsOptions): Listing<Post> {
    const client = getRedditApiPlugins().Listings;

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
          this.#metadata
        );

        return listingProtosToPosts(response);
      },
    });
  }

  /** @internal */
  static getPostsByUser(options: GetPostsByUserOptions): Listing<Post> {
    const client = getRedditApiPlugins().Users;
    return new Listing({
      hasMore: true,
      before: options.before,
      after: options.after,
      pageSize: options.pageSize,
      limit: options.limit,
      fetch: async (fetchOptions) => {
        const response = await client.UserWhere(
          {
            username: options.username,
            where: 'submitted',
            ...fetchOptions,
          },
          this.#metadata
        );

        return listingProtosToPosts(response);
      },
    });
  }

  static get #metadata(): Metadata {
    return context.metadata;
  }
}

function listingProtosToPosts(listingProto: ListingProto): ListingFetchResponse<Post> {
  if (!listingProto.data?.children) {
    throw new Error('Listing response is missing children');
  }

  const children = listingProto.data.children.map((child) => new Post(child.data!));

  return {
    children,
    before: listingProto.data.before,
    after: listingProto.data.after,
  };
}

/** @internal */
async function getThumbnailV2(options: { id: T3ID }): Promise<EnrichedThumbnail | undefined> {
  const operationName = 'GetThumbnailV2';
  const persistedQueryHash = '81580ce4e23d748c5a59a1618489b559bf4518b6a73af41f345d8d074c8b2ce9';
  const response = await GraphQL.query(operationName, persistedQueryHash, {
    id: options.id,
  });

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

function SplashPostData(
  opts: Readonly<SubmitCustomPostSplashOptions>,
  title: string | undefined
): SplashPostData {
  return {
    appDisplayName: opts.appDisplayName,
    appIconUri: opts.appIconURI,
    backgroundUri: opts.backgroundURI,
    buttonLabel: opts.buttonLabel,
    description: opts.description,
    // to-do: use entry _name_ and fish out URL in Splash component using
    //        entrypoints recorded in LinkedBundle.
    entryUri: opts.entryURI,
    height: opts.height === 'tall' ? (2 satisfies Height.TALL) : (1 satisfies Height.REGULAR),
    title: opts.title ?? title,
  };
}
