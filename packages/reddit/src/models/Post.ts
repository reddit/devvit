import type {
  Listing as ListingProto,
  Metadata,
  RedditObject,
  SubmitResponse,
} from '@devvit/protos';
import type { GalleryMediaStatus as GalleryMediaStatusProto } from '@devvit/protos';
import { Block, DevvitPostData, UIResponse } from '@devvit/protos';
import { SetCustomPostPreviewRequest_BodyType } from '@devvit/protos/json/devvit/plugin/redditapi/linksandcomments/linksandcomments_msg.js';
import { type SplashPostData } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';
import { Scope } from '@devvit/protos/json/reddit/devvit/app_permission/v1/app_permission.js';
import { BlocksHandler } from '@devvit/public-api/devvit/internals/blocks/handler/BlocksHandler.js';
import { context } from '@devvit/server';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import type { PostData } from '@devvit/shared-types/PostData.js';
import { RichTextBuilder } from '@devvit/shared-types/richtext/RichTextBuilder.js';
import type {
  AppConfig,
  AppPostEntrypointConfig,
} from '@devvit/shared-types/schemas/config-file.v1.js';
import { defaultPostEntry } from '@devvit/shared-types/schemas/constants.js';
import type { DevvitWorkerGlobal } from '@devvit/shared-types/shared/devvit-worker-global.js';
import { isT3, T2, T3, T5 } from '@devvit/shared-types/tid.js';
import { Loading } from '@devvit/splash/loading.js';
import { backgroundUrl } from '@devvit/splash/utils/assets.js';

import { assertUserScope, RunAs, type UserGeneratedContent } from '../common.js';
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
  // prettier-ignore
  location?:
    | 'GLOBAL' | 'US' | 'AR' | 'AU' | 'BG' | 'CA' | 'CL' | 'CO' | 'HR' | 'CZ'
    | 'FI' | 'FR' | 'DE' | 'GR' | 'HU' | 'IS' | 'IN' | 'IE' | 'IT' | 'JP' | 'MY'
    | 'MX' | 'NZ' | 'PH' | 'PL' | 'PT' | 'PR' | 'RO' | 'RS' | 'SG' | 'ES' | 'SE'
    | 'TW' | 'TH' | 'TR' | 'GB' | 'US_WA' | 'US_DE' | 'US_DC' | 'US_WI'
    | 'US_WV' | 'US_HI' | 'US_FL' | 'US_WY' | 'US_NH' | 'US_NJ' | 'US_NM'
    | 'US_TX' | 'US_LA' | 'US_NC' | 'US_ND' | 'US_NE' | 'US_TN' | 'US_NY'
    | 'US_PA' | 'US_CA' | 'US_NV' | 'US_VA' | 'US_CO' | 'US_AK' | 'US_AL'
    | 'US_AR' | 'US_VT' | 'US_IL' | 'US_GA' | 'US_IN' | 'US_IA' | 'US_OK'
    | 'US_AZ' | 'US_ID' | 'US_CT' | 'US_ME' | 'US_MD' | 'US_MA' | 'US_OH'
    | 'US_UT' | 'US_MO' | 'US_MN' | 'US_MI' | 'US_RI' | 'US_KS' | 'US_MT'
    | 'US_MS' | 'US_SC' | 'US_KY' | 'US_OR' | 'US_SD';
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

export type SubmitSelfPostOptions = CommonSubmitPostOptions & PostTextOptions;

/**
 * @deprecated Splash and loading screens should be implemented in HTML as an
 *             inline entrypoint. Splash support will be removed soon.
 */
export type SubmitCustomPostSplashOptions = {
  /**
   * Application name.
   *
   * @deprecated Splash and loading screens should be implemented in HTML as an
   *             inline entrypoint. Splash support will be removed soon.
   * @example `'Comment Mop'`.
   */
  appDisplayName?: string;
  /**
   * @deprecated Splash screens should be implemented in HTML as an inline
   *             entrypoint. Splash support will be removed soon.
   */
  appIconUri?: string | undefined;
  /**
   * Media directory relative background image URL without a leading slash or
   * data URI.
   *
   * @deprecated Splash and loading screens should be implemented in HTML as an
   *             inline entrypoint. Splash support will be removed soon.
   * @example `'background.png'`.
   */
  backgroundUri?: string;
  /**
   * @deprecated Splash screens should be implemented in HTML as an inline
   *             entrypoint. Splash support will be removed soon.
   */
  buttonLabel?: string | undefined;
  /**
   * @deprecated Splash screens should be implemented in HTML as an inline
   *             entrypoint. Splash support will be removed soon.
   */
  description?: string | undefined;
  /**
   * The inline screen entrypoint name. Must correspond to a `post.entrypoints`
   * key in the app's `devvit.json`.
   *
   * @default The default `devvit.json` entrypoint (`'default'`).
   *
   * @example Only `'default'` and `'game'` are valid entries given the
   * following `devvit.json` configuration:
   * ```json
   * {
   *   "$schema": "https://developers.reddit.com/schema/config-file.v1.json",
   *   "name": "example",
   *   "post": {
   *     "entrypoints": {
   *       "default": {"entry": "splash.html"},
   *       "game": {"entry": "game.html"}
   *     }
   *   }
   * }
   * ```
   *
   * @deprecated Use `SubmitCustomPostOptions.entry`.
   */
  entry?: string;
  /**
   * @deprecated Splash screens should be implemented in HTML as an inline
   *             entrypoint. Splash support will be removed soon.
   */
  heading?: string | undefined;
};

export type SubmitCustomPostOptions = CommonSubmitPostOptions & {
  /**
   * The entrypoint name. Must correspond to a `post.entrypoints` key in the
   * app's `devvit.json`.
   *
   * @default The default `devvit.json` entrypoint (`'default'`).
   *
   * @example Only `'default'` and `'game'` are valid entries given the
   * following `devvit.json` configuration:
   * ```json
   * {
   *   "$schema": "https://developers.reddit.com/schema/config-file.v1.json",
   *   "name": "example",
   *   "post": {
   *     "entrypoints": {
   *       "default": {"entry": "splash.html"},
   *       "game": {"entry": "game.html"}
   *     }
   *   }
   * }
   * ```
   */
  entry?: string;
  /**
   * Arbitrary data to associate to the post. Limited to two kilobytes.
   *
   * @see {@link PostData}.
   */
  postData?: PostData;
  /** Content to show when rendered on `https://old.reddit.com`. */
  textFallback?: CustomPostTextFallbackOptions;
  userGeneratedContent?: UserGeneratedContent;
  /**
   * Override the splash loading screen with the provided Blocks component.
   * @example
   * ```ts
   * Devvit.createElement(
   *   'blocks',
   *   {height: 'tall'},
   *   Devvit.createElement(
   *     'vstack',
   *     {backgroundColor: '#abc123', height: '100%'},
   *     Devvit.createElement('text', {}, 'hello'),
   *   ),
   * )
   * ```
   * @deprecated Loading screens should be implemented in HTML as an inline
   *             entrypoint.
   */
  loading?: JSX.Element;
  /**
   * @deprecated Splash and loading screens should be implemented in HTML as an
   *             inline entrypoint. Splash support will be removed soon.
   */
  splash?: SubmitCustomPostSplashOptions;
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

export type SubredditOptions = {
  /** Defaults to the current subreddit name. */
  subredditName?: string;
};

/** Link, self, or media post options exclusively. */
export type SubmitPostOptions =
  | (SubmitLinkOptions & { richtext?: never; text?: never; kind?: never })
  | (SubmitSelfPostOptions & { kind?: never; url?: never })
  | (SubmitMediaOptions & { richtext?: never; text?: never; url?: never });

export type CrosspostOptions = CommonSubmitPostOptions &
  Required<SubredditOptions> & { postId: T3 };

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
export type Oembed = {
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
  /** The type of the oEmbed media, if present (e.g. "youtube.com") */
  type?: string | undefined;
  oembed?: Oembed | undefined;
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
  #id: T3;
  #authorId: T2 | undefined;
  #authorName: string;
  #createdAt: Date;
  #subredditId: T5;
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

    this.#id = `t3_${data.id}`;

    this.#authorName = data.author;
    this.#authorId = data.authorFullname ? T2(data.authorFullname) : undefined;
    this.#subredditId = T5(data.subredditId);
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

  get id(): T3 {
    return this.#id;
  }

  get authorId(): T2 | undefined {
    return this.#authorId;
  }

  get authorName(): string {
    return this.#authorName;
  }

  get subredditId(): T5 {
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

  async edit(opts: Readonly<PostTextOptions>): Promise<void> {
    const newPost = await Post.edit({
      id: this.id,
      ...opts,
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
   * Get the postData for the custom post.
   *
   * @example
   * ```ts
   * const post = await reddit.getPostById(context.postId);
   * const postData = await post.getPostData();
   * ```
   */
  async getPostData(): Promise<PostData | undefined> {
    const devvitPostData = await Post.getDevvitPostData(this.id);
    return devvitPostData?.developerData;
  }

  /**
   * Set the postData for the custom post. This will replace the existing
   * postData with the postData specified in the input.
   *
   * @param postData - Represents the postData to be set, eg: { currentScore: 55, secretWord: 'barbeque' }
   * @throws {Error} Throws an error if the postData could not be set.
   * @example
   * ```ts
   * const post = await reddit.getPostById(context.postId);
   *
   * // Existing postData: { settings: { theme: 'dark', fontSize: 12 } }
   *
   * await post.setPostData({
   *   currentScore: 55,
   *   secretWord: 'barbeque',
   * });
   * // Result: { currentScore: 55, secretWord: 'barbeque' }
   * ```
   */
  async setPostData(postData: PostData): Promise<void> {
    const prev = await Post.getDevvitPostData(this.id);
    await Post.setPostData({ postId: this.id, postData: { ...prev, developerData: postData } });
  }

  /**
   * Merge the postData on a custom post with the postData specified in the input. This performs a shallow merge.
   *
   * @param postData - Represents the postData to be merged with the existing postData.
   * @throws {Error} Throws an error if the postData could not be merged.
   * @example
   * ```ts
   * const post = await reddit.getPostById(context.postId);
   *
   * // Existing postData: { currentScore: 55, settings: { theme: 'dark', fontSize: 12 } }
   *
   * await post.mergePostData({ settings: { fontSize: 14 } });
   * // Result: { currentScore: 55, settings: { fontSize: 14 } }
   * ```
   */
  async mergePostData(postData: PostData): Promise<void> {
    const prev = await Post.getDevvitPostData(this.id);
    const mergedDeveloperData = { ...prev?.developerData, ...postData };
    await Post.setPostData({
      postId: this.id,
      postData: { ...prev, developerData: mergedDeveloperData },
    });
  }

  /**
   * Set the launch and loading screens for the custom post.
   *
   * @deprecated Splash screens should be implemented in HTML as an inline
   *             entrypoint. Splash support will be removed soon.
   * @example
   * ```ts
   * const post = await reddit.getPostById(context.postId);
   * await post.setSplash({ appDisplayName: "Pixelary" });
   * ```
   */
  async setSplash(opts: Readonly<SubmitCustomPostSplashOptions> | undefined): Promise<void> {
    const prev = await Post.getDevvitPostData(this.id);
    const config = getConfig();
    const entry = getEntry(config, opts?.entry);
    const splash = SplashPostData(config, entry, opts, this.title);
    await Promise.all([
      Post.setPostData({ postId: this.id, postData: { ...prev, splash } }),
      this.#setCustomPostPreview(
        Loading({
          appDisplayName: splash.appDisplayName,
          backgroundUri: splash.backgroundUri,
          height: entry.height,
        })
      ),
    ]);
  }

  /**
   * Override the splash loading screen with the provided Blocks component for
   * the custom post.
   *
   * @example
   * ```ts
   * const loading = Devvit.createElement(
   *   'blocks',
   *   {height: 'tall'},
   *   Devvit.createElement(
   *     'vstack',
   *     {backgroundColor: '#abc123', height: '100%'},
   *     Devvit.createElement('text', {}, 'hello'),
   *   ),
   * )
   * const post = await reddit.getPostById(context.postId);
   * await post.setLoadingScreen(loading);
   * ```
   * @deprecated Loading screens should be implemented in HTML as an inline
   *             entrypoint.
   */
  async setLoadingScreen(loading: JSX.Element): Promise<void> {
    await this.#setCustomPostPreview(loading);
  }

  /**
   * Set a text fallback for the custom post.
   *
   * @param opts - A text or a richtext to render in a fallback
   * @throws {Error} Throws an error if the fallback could not be set.
   * @example
   * ```ts
   * // from a menu action, form, scheduler, trigger, custom post click event, etc
   * const newTextFallback = { text: 'This is an updated text fallback' };
   * const post = await context.reddit.getPostById(context.postId);
   * await post.setTextFallback(newTextFallback);
   * ```
   */
  async setTextFallback(opts: Readonly<CustomPostTextFallbackOptions>): Promise<void> {
    const newPost = await Post.setTextFallback(opts, this.id);

    this.#body = newPost.body;
    this.#edited = newPost.edited;
  }

  async addComment(opts: Readonly<CommentSubmissionOptions>): Promise<Comment> {
    return Comment.submit({
      id: this.id,
      ...opts,
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

  async crosspost(opts: Readonly<Omit<CrosspostOptions, 'postId'>>): Promise<Post> {
    return Post.crosspost({ ...opts, postId: this.id });
  }

  /**
   * Add a mod note for why the post was removed
   *
   * @param options.reasonId id of a Removal Reason - you can leave this as an empty string if you don't have one
   * @param options.modNote the reason for removal (maximum 100 characters) (optional)
   * @returns
   */
  addRemovalNote(opts: { readonly reasonId: string; readonly modNote?: string }): Promise<void> {
    return ModNote.addRemovalNote({ itemIds: [this.#id], ...opts });
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
  static async getById(id: T3): Promise<Post> {
    const client = getRedditApiPlugins().LinksAndComments;

    const postId: T3 = isT3(id) ? id : `t3_${id}`;

    const rsp = await client.Info(
      {
        subreddits: [],
        thingIds: [postId],
      },
      context.metadata
    );

    if (!rsp.data?.children?.length) throw Error(`no post ${id}`);

    const postData = rsp.data.children[0];

    if (!postData?.data) throw Error(`no post ${id}`);

    return new Post(postData.data);
  }

  /** @internal */
  static async submit(opts: Readonly<SubredditOptions & SubmitPostOptions>): Promise<Post> {
    const runAsType = RunAs[opts.runAs ?? 'APP'];
    const client =
      runAsType === RunAs.USER ? getUserActionsPlugin() : getRedditApiPlugins().LinksAndComments;

    if (runAsType === RunAs.USER) {
      assertUserScope(Scope.SUBMIT_POST);
    }

    const rsp = await client.Submit(
      {
        kind: 'kind' in opts ? opts.kind : 'url' in opts ? 'link' : 'self',
        sr: opts.subredditName ?? context.subredditName,
        richtextJson: 'richtext' in opts ? richtextToString(opts.richtext) : undefined,
        ...opts,
        runAs: runAsType,
      },
      context.metadata
    );

    // Post Id might not be present as image/video post creation can happen asynchronously
    const isAllowedMediaType = 'kind' in opts && ['image', 'video', 'videogif'].includes(opts.kind);
    if (isAllowedMediaType && !rsp.json?.data?.id) {
      if (opts.kind === 'image' && 'imageUrls' in opts) {
        throw new Error(
          `Image post type with ${opts.imageUrls} is being created asynchronously and should be updated in the subreddit soon.`
        );
      } else if ('videoPosterUrl' in opts) {
        throw new Error(
          `Post of ${opts.kind} type with ${opts.videoPosterUrl} is being created asynchronously and should be updated in the subreddit soon.`
        );
      }
    }

    return postFromSubmitResponse(rsp);
  }

  /** @internal */
  static async submitCustomPost(
    opts: Readonly<SubredditOptions & SubmitCustomPostOptions>
  ): Promise<Post> {
    const runAsType = RunAs[opts.runAs ?? 'APP'];
    if (runAsType === RunAs.USER && !opts.userGeneratedContent) {
      throw Error('userGeneratedContent must be set when `runAs` is `USER`');
    }
    if (runAsType === RunAs.USER) {
      assertUserScope(Scope.SUBMIT_POST);
    }

    const config = getConfig();
    const entry = getEntry(config, opts.entry ?? opts.splash?.entry);
    const splash = SplashPostData(config, entry, opts.splash, opts.title);
    const richtextJson = await renderLoadingAsRichTextJson(
      'loading' in opts
        ? opts.loading
        : Loading({
            appDisplayName: splash.appDisplayName,
            backgroundUri: splash.backgroundUri,
            height: entry.height,
          }),
      context.metadata
    );

    const richtextFallback = opts.textFallback
      ? getCustomPostRichTextFallback(opts.textFallback)
      : '';

    const userGeneratedContent = opts.userGeneratedContent
      ? {
          text: opts.userGeneratedContent.text ?? '',
          imageUrls: opts.userGeneratedContent.imageUrls ?? [],
        }
      : undefined;

    const client =
      runAsType === RunAs.USER ? getUserActionsPlugin() : getRedditApiPlugins().LinksAndComments;
    const rsp = await client.SubmitCustomPost(
      {
        kind: 'custom',
        sr: opts.subredditName ?? context.subredditName,
        richtextJson,
        richtextFallback,
        flairId: opts.flairId,
        flairText: opts.flairText,
        nsfw: opts.nsfw,
        sendreplies: opts.sendreplies,
        spoiler: opts.spoiler,
        title: opts.title,
        userGeneratedContent,
        runAs: runAsType,
        postData: { developerData: opts.postData, splash },
      },
      context.metadata
    );
    return postFromSubmitResponse(rsp);
  }

  /** @internal */
  static async crosspost(opts: Readonly<CrosspostOptions>): Promise<Post> {
    const { runAs = 'APP' } = opts;
    const runAsType = RunAs[runAs];
    const client =
      runAsType === RunAs.USER ? getUserActionsPlugin() : getRedditApiPlugins().LinksAndComments;
    const { postId, subredditName, ...rest } = opts;

    if (runAsType === RunAs.USER) {
      assertUserScope(Scope.SUBMIT_POST);
    }

    const rsp = await client.Submit(
      {
        kind: 'crosspost',
        sr: subredditName,
        crosspostFullname: postId,
        ...rest,
        runAs: runAsType,
      },
      context.metadata
    );

    return postFromSubmitResponse(rsp);
  }

  /** @internal */
  static async edit(opts: Readonly<PostTextOptions & { id: T3 }>): Promise<Post> {
    const client = getRedditApiPlugins().LinksAndComments;

    const { id } = opts;

    let richtextString: string | undefined;
    if ('richtext' in opts) {
      richtextString = richtextToString(opts.richtext);
    }

    const rsp = await client.EditUserText(
      {
        thingId: id,
        text: 'text' in opts ? opts.text : '',
        richtextJson: richtextString,
        runAs: RunAs.APP,
      },
      context.metadata
    );

    if (rsp.json?.errors?.length)
      throw Error(`post ${id} edit failed: ${rsp.json?.errors.join(', ')}`);

    // The LinksAndComments.EditUserText response is wrong and assumes that
    // the API is only used to for comments so we fetch the new post here.
    return Post.getById(id);
  }

  /** @internal */
  static async setSuggestedCommentSort(opts: {
    suggestedSort: PostSuggestedCommentSort;
    id: T3;
    subredditId: T5;
  }): Promise<void> {
    const operationName = 'SetSuggestedSort';
    const persistedQueryHash = 'cf6052acc7fefaa65b710625b81dba8041f258313aafe9730e2a3dc855e5d10d';
    // Legacy GQL query. Do not copy this pattern.
    // eslint-disable-next-line no-restricted-properties
    const rsp = await GraphQL.query(operationName, persistedQueryHash, {
      input: {
        subredditId: opts.subredditId,
        postId: opts.id,
        sort: opts.suggestedSort,
      },
    });

    if (!rsp.data?.setSuggestedSort?.ok)
      throw Error(
        `set post ${opts.id} suggested comment sort failed: ${rsp.errors.map((err) => `error ${err.code} (${err.message})`).join('; ')}`
      );
  }

  /** @internal */
  static async getDevvitPostData(id: T3): Promise<DevvitPostData | undefined> {
    const operationName = 'GetDevvitPostData';
    const persistedQueryHash = 'd349c9bee385336e44837c4a041d4b366fa32f16121cef7f12e1e3f230340696';
    // Legacy GQL query. Do not copy this pattern.
    // eslint-disable-next-line no-restricted-properties
    const rsp = await GraphQL.query(operationName, persistedQueryHash, {
      id,
    });

    // to-do: why is postInfoById a `Record<string, any>`?
    if (rsp.data?.postInfoById?.errors?.length) {
      throw new Error(
        `Failed to get devvit post data due to errors: ${rsp.data?.postInfoById?.errors.join(', ')}`
      );
    }

    // GQL returns postData as a JSON string
    const devvitPostData: string = rsp.data?.postInfoById?.devvit?.postData;

    if (!devvitPostData) {
      return undefined;
    }

    return JSON.parse(devvitPostData) as DevvitPostData;
  }

  /** @internal */
  static async setPostData(opts: { postId: T3; postData: DevvitPostData }): Promise<void> {
    const [rsp] = await Promise.all([
      getRedditApiPlugins().LinksAndComments.EditCustomPost(
        {
          thingId: opts.postId,
          postData: opts.postData,
        },
        context.metadata
      ),
    ]);
    if (rsp.json?.errors?.length)
      // to-do: why is errors `Any[]`?
      throw Error(`set post ${opts.postId} data failed: ${JSON.stringify(rsp.json.errors)}`);
  }

  /** @internal */
  static async setTextFallback(opts: CustomPostTextFallbackOptions, postId: T3): Promise<Post> {
    if (!('text' in opts) && !('richtext' in opts)) {
      throw new Error(`No text fallback provided for post ${postId}.`);
    }

    const client = getRedditApiPlugins().LinksAndComments;

    const richtextFallback = getCustomPostRichTextFallback(opts);

    const rsp = await client.EditCustomPost(
      {
        thingId: postId,
        richtextFallback,
        // to-do: remove once server doesn't wipe post data (DXC-2359).
        postData: await this.getDevvitPostData(postId),
      },
      context.metadata
    );

    if (rsp.json?.errors?.length)
      // to-do: why is errors `Any[]`?
      throw Error(`set post ${postId} text fallback failed: ${JSON.stringify(rsp.json.errors)}`);

    return Post.getById(postId);
  }

  /** @internal */
  static async delete(id: T3): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Del(
      {
        id,
      },
      context.metadata
    );
  }

  /** @internal */
  static async approve(id: T3): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.Approve(
      {
        id,
      },
      context.metadata
    );
  }

  /** @internal */
  static async remove(id: T3, isSpam: boolean = false): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.Remove(
      {
        id,
        spam: isSpam,
      },
      context.metadata
    );
  }

  /** @internal */
  static async hide(id: T3): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Hide(
      {
        id,
      },
      context.metadata
    );
  }

  /** @internal */
  static async unhide(id: T3): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Unhide(
      {
        id,
      },
      context.metadata
    );
  }

  /** @internal */
  static async markAsNsfw(id: T3): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.MarkNSFW(
      {
        id,
      },
      context.metadata
    );
  }
  /** @internal */
  static async unmarkAsNsfw(id: T3): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.UnmarkNSFW(
      {
        id,
      },
      context.metadata
    );
  }

  /** @internal */
  static async markAsSpoiler(id: T3): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Spoiler(
      {
        id,
      },
      context.metadata
    );
  }

  /** @internal */
  static async unmarkAsSpoiler(id: T3): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Unspoiler(
      {
        id,
      },
      context.metadata
    );
  }

  async #setCustomPostPreview(loading: JSX.Element): Promise<void> {
    const richtextJson = await renderLoadingAsRichTextJson(loading, context.metadata);
    const client = getRedditApiPlugins().LinksAndComments;
    await client.SetCustomPostPreview(
      {
        thingId: this.id,
        bodyType: SetCustomPostPreviewRequest_BodyType.BLOCKS,
        blocksRenderContent: richtextJson,
      },
      context.metadata
    );
  }

  /** @internal */
  static async sticky(id: T3, position: 1 | 2 | 3 | 4 | undefined): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.SetSubredditSticky(
      {
        id,
        state: true,
        num: position,
      },
      context.metadata
    );
  }

  /** @internal */
  static async unsticky(id: T3): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.SetSubredditSticky(
      {
        id,
        state: false,
      },
      context.metadata
    );
  }

  /** @internal */
  static async lock(id: T3): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Lock(
      {
        id,
      },
      context.metadata
    );
  }

  /** @internal */
  static async unlock(id: T3): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;

    await client.Unlock(
      {
        id,
      },
      context.metadata
    );
  }

  /** @internal */
  static async distinguish(
    id: T3,
    asAdmin: boolean
  ): Promise<{ distinguishedBy: string | undefined }> {
    const client = getRedditApiPlugins().Moderation;

    const response = await client.Distinguish(
      {
        id,
        how: asAdmin ? 'admin' : 'yes',
        sticky: false,
      },
      context.metadata
    );

    const post = response.json?.data?.things?.[0]?.data;

    assertNonNull(post);

    return {
      distinguishedBy: post.distinguished,
    };
  }

  /** @internal */
  static async undistinguish(id: T3): Promise<{ distinguishedBy: string | undefined }> {
    const client = getRedditApiPlugins().Moderation;

    const response = await client.Distinguish(
      {
        id,
        how: 'no',
        sticky: false,
      },
      context.metadata
    );

    const post = response.json?.data?.things?.[0]?.data;

    assertNonNull(post);

    return {
      distinguishedBy: post.distinguished,
    };
  }

  /** @internal */
  static async ignoreReports(id: T3): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.IgnoreReports(
      {
        id,
      },
      context.metadata
    );
  }

  /** @internal */
  static async unignoreReports(id: T3): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.UnignoreReports(
      {
        id,
      },
      context.metadata
    );
  }

  /** @internal */
  static getControversialPosts(opts: Readonly<GetPostsOptionsWithTimeframe>): Listing<Post> {
    return this.getSortedPosts({ ...opts, sort: 'controversial' });
  }

  /** @internal */
  static getTopPosts(opts: Readonly<GetPostsOptionsWithTimeframe>): Listing<Post> {
    return this.getSortedPosts({ ...opts, sort: 'top' });
  }

  /** @internal */
  static getSortedPosts(opts: Readonly<GetSortedPostsOptions>): Listing<Post> {
    const client = getRedditApiPlugins().Listings;

    return new Listing({
      hasMore: true,
      before: opts.before,
      after: opts.after,
      pageSize: opts.pageSize,
      limit: opts.limit,
      fetch: async (fetchOpts: ListingFetchOptions) => {
        const response = await client.Sort(
          {
            show: 'all',
            sort: opts.sort,
            t: opts.timeframe,
            subreddit: opts.subredditName,
            ...fetchOpts,
          },
          context.metadata
        );

        return listingProtosToPosts(response);
      },
    });
  }

  /** @internal */
  static getHotPosts(
    opts: GetHotPostsOptions = {
      location: 'GLOBAL',
    }
  ): Listing<Post> {
    const client = getRedditApiPlugins().Listings;

    return new Listing({
      hasMore: true,
      before: opts.before,
      after: opts.after,
      pageSize: opts.pageSize,
      limit: opts.limit,
      fetch: async (fetchOpts: ListingFetchOptions) => {
        const response = await client.Hot(
          {
            g: opts.location,
            show: 'all',
            subreddit: opts.subredditName,
            ...fetchOpts,
          },
          context.metadata
        );

        return listingProtosToPosts(response);
      },
    });
  }

  /** @internal */
  static getNewPosts(opts: Readonly<GetPostsOptions>): Listing<Post> {
    const client = getRedditApiPlugins().Listings;

    return new Listing({
      hasMore: true,
      before: opts.before,
      after: opts.after,
      pageSize: opts.pageSize,
      limit: opts.limit,
      fetch: async (fetchOpts: ListingFetchOptions) => {
        const response = await client.New(
          {
            show: 'all',
            subreddit: opts.subredditName,
            ...fetchOpts,
          },
          context.metadata
        );

        return listingProtosToPosts(response);
      },
    });
  }

  /** @internal */
  static getRisingPosts(opts: Readonly<GetPostsOptions>): Listing<Post> {
    const client = getRedditApiPlugins().Listings;

    return new Listing({
      hasMore: true,
      before: opts.before,
      after: opts.after,
      pageSize: opts.pageSize,
      limit: opts.limit,
      fetch: async (fetchOpts: ListingFetchOptions) => {
        const response = await client.Rising(
          {
            show: 'all',
            subreddit: opts.subredditName,
            ...fetchOpts,
          },
          context.metadata
        );

        return listingProtosToPosts(response);
      },
    });
  }

  /** @internal */
  static getPostsByUser(opts: Readonly<GetPostsByUserOptions>): Listing<Post> {
    const client = getRedditApiPlugins().Users;
    return new Listing({
      hasMore: true,
      before: opts.before,
      after: opts.after,
      pageSize: opts.pageSize,
      limit: opts.limit,
      fetch: async (fetchOptions) => {
        const response = await client.UserWhere(
          {
            username: opts.username,
            where: 'submitted',
            ...fetchOptions,
          },
          context.metadata
        );

        return listingProtosToPosts(response);
      },
    });
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
async function getThumbnailV2(opts: { id: T3 }): Promise<EnrichedThumbnail | undefined> {
  const operationName = 'GetThumbnailV2';
  const persistedQueryHash = '81580ce4e23d748c5a59a1618489b559bf4518b6a73af41f345d8d074c8b2ce9';
  // Legacy GQL query. Do not copy this pattern.
  // eslint-disable-next-line no-restricted-properties
  const rsp = await GraphQL.query(operationName, persistedQueryHash, {
    id: opts.id,
  });

  // to-do: why is postInfoById a `Record<string, any>`?
  const thumbnail = rsp.data?.postInfoById?.thumbnailV2;

  if (!thumbnail || rsp.errors.length)
    throw Error(
      `get post ${opts.id} thumbnail failed: ${rsp.errors.map((err) => `error ${err.code} (${err.message})`).join('; ')}`
    );

  if (!thumbnail.image) return;

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

function getConfig(): AppConfig {
  const config = (devvit as DevvitWorkerGlobal)?.appConfig;
  if (!config) throw Error('no config');
  return config;
}

function getEntry(
  config: Readonly<AppConfig>,
  entry: string | undefined
): Readonly<AppPostEntrypointConfig> {
  entry ??= defaultPostEntry;
  const entrypoint = config.post?.entrypoints[entry];
  if (!entrypoint) throw Error(`missing "${entry}" in \`devvit.json\` \`post.entrypoints\``);
  return entrypoint;
}

function SplashPostData(
  config: Readonly<AppConfig>,
  entry: Readonly<AppPostEntrypointConfig>,
  opts: Readonly<SubmitCustomPostSplashOptions> | undefined,
  title: string
): SplashPostData & { appDisplayName: string; backgroundUri: string } {
  // Align to `blocks.template.tsx`. The "preview" or loading screen is rendered
  // at post time so it can't float to whatever the current code default is. The
  // recorded post data must record the current state for `LoadingProps` and no
  // defaults for anything else.
  return {
    // Loading. In the case that `loading` is provided, a `Loading` component is
    // never used. If the user wants to change these props, they have to also
    // provide a `splash` prop.
    appDisplayName: opts?.appDisplayName ?? config.name,
    backgroundUri: opts?.backgroundUri ?? backgroundUrl,

    appIconUri: opts?.appIconUri,
    buttonLabel: opts?.buttonLabel,
    description: opts?.description,
    entry: entry.name,
    title: opts?.heading ?? title,
  };
}

function postFromSubmitResponse(rsp: Readonly<SubmitResponse>): Promise<Post> {
  if (!rsp.json?.data?.id || rsp.json.errors?.length)
    throw Error(
      // to-do: why is errors an `Any[]`?
      `post ${rsp.json?.data?.id} submission failed: ${JSON.stringify(rsp.json?.errors)}`
    );

  return Post.getById(`t3_${rsp.json.data.id}`);
}

async function renderLoadingAsRichTextJson(
  loading: JSX.Element,
  meta: Readonly<Metadata>
): Promise<string> {
  const handler = new BlocksHandler(() => loading);
  const { blocks } = UIResponse.fromJSON(await handler.handle({ events: [] }, meta));
  const encodedCached = Block.encode(blocks!).finish();
  return Buffer.from(encodedCached).toString('base64');
}
