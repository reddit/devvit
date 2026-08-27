import { GalleryMediaStatus as GalleryMediaStatusProto } from '@devvit/protos/json/devvit/plugin/redditapi/common/common_msg.js';
import { type CustomPostStylesInput } from '@devvit/protos/json/devvit/plugin/redditapi/linksandcomments/linksandcomments_msg.js';
import { type DevvitPostData } from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';
import { Scope } from '@devvit/protos/json/reddit/devvit/app_permission/v1/app_permission.js';
import { EntrypointHeight, RenderStyle } from '@devvit/protos/json/reddit/devvit/post/v1/post.js';
// eslint-disable-next-line no-restricted-imports
import type {
  Listing as ListingProto,
  RedditObject,
} from '@devvit/protos/types/devvit/plugin/redditapi/common/common_msg.js';
// eslint-disable-next-line no-restricted-imports
import { type SubmitResponse } from '@devvit/protos/types/devvit/plugin/redditapi/linksandcomments/linksandcomments_msg.js';
import { context } from '@devvit/server';
import { decodeProtoErrors } from '@devvit/shared-types/helpers/protoErrorDecoder.js';
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

import { assertUserScope, RunAs, type UserGeneratedContent } from '../common.js';
import { GraphQL } from '../graphql/GraphQL.js';
import { type FilterOptions, filterThing } from '../helpers/filterThing.js';
import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';
import { richtextToString } from '../helpers/richtextToString.js';
import { getCustomPostRichTextFallback } from '../helpers/textFallbackToRichtext.js';
import { getRedditApiPlugins, getUserActionsPlugin } from '../plugin.js';
import type { CustomPostStyles } from '../RedditClient.js';
import type { CommentSubmissionOptions } from './Comment.js';
import { Comment } from './Comment.js';
import type { CommonFlair } from './Flair.js';
import { convertProtosFlairToCommonFlair } from './Flair.js';
import type { ListingFetchOptions, ListingFetchResponse } from './Listing.js';
import { Listing } from './Listing.js';
import { type AddRemovalNoteOptions, ModNote } from './ModNote.js';
import { User } from './User.js';

/** A moderator report attached to a post or comment. */
export type ModeratorReport = {
  reason: string;
  /** Username of the author without the u/ prefix, e.g. 'spez' */
  author: string;
};

/**
 * Crowd Control threshold for comments on a post. Determines which comments
 * should be collapsed by default.
 *
 * OFF: Do not collapse or filter comments through Crowd Control.
 * LENIENT: Collapse or filter comments from accounts with negative community
 *          karma.
 * MEDIUM: LENIENT but also applies to new accounts.
 * STRICT: MEDIUM but applies to accounts that have not joined the community.
 */
export type CrowdControlLevel = 'OFF' | 'LENIENT' | 'MEDIUM' | 'STRICT';

const CROWD_CONTROL_LEVEL_TO_PROTO: Readonly<Record<CrowdControlLevel, number>> = Object.freeze({
  OFF: 0,
  LENIENT: 1,
  MEDIUM: 2,
  STRICT: 3,
});

function crowdControlLevelToProto(level: CrowdControlLevel): number {
  return CROWD_CONTROL_LEVEL_TO_PROTO[level];
}

export type GetPostsOptions = ListingFetchOptions & {
  subredditName?: string;
};

export type GetBestPostsOptions = ListingFetchOptions;

export type SearchPostsOptions = ListingFetchOptions & {
  /** Search query. */
  query: string;
  /**
   * The subreddit to search without the `r/` prefix. If specified, restricts
   * the search to posts in this subreddit.
   */
  subredditName?: string;
  /** How to sort the search results. Defaults to `relevance`. */
  sort?: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
  /** Limit search results to a timeframe. Defaults to `all`. */
  timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
};

export type GetDuplicatesOptions = ListingFetchOptions & {
  /** The post identifier. */
  postId: T3;
  /** One of: "num_comments", "new" */
  sort?: 'num_comments' | 'new';
  /** Limit search to the given subreddit name. The r/ prefix is optional. */
  subredditName?: string;
  /** Only return duplicates that are crossposting this post. */
  crosspostsOnly?: boolean;
  /** Use `"all"` to include results hidden by the account's preferences. */
  show?: string;
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

/** Options for replacing a post body. */
export type PostTextOptions =
  | {
      /** The post body in Markdown. */
      text: string;
    }
  | {
      /** The post body as rich text. */
      richtext: object | RichTextBuilder;
    };

export type CustomPostRichTextFallback = RichTextBuilder | string;

export type CustomPostTextFallbackOptions =
  | {
      /**
       * The fallback content as plaintext or Markdown. See
       * https://www.reddit.com/r/reddit.com/wiki/markdown/.
       */
      text: string;
    }
  | {
      /** The fallback content as richtext. */
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
   * Styles associated with the custom post, such as height or background color.
   */
  styles?: CustomPostStylesInput;
};

export type CommonSubmitPostOptions = {
  /** The title of the new post. */
  title: string;
  /** Whether the author receives notifications for new comments. */
  sendreplies?: boolean;
  /** Whether to mark the new post as NSFW. */
  nsfw?: boolean;
  /** Whether to mark the new post as a spoiler. */
  spoiler?: boolean;
  /** The flair template to apply to the new post. */
  flairId?: string;
  /** The flair text to apply to the new post. */
  flairText?: string;
  /** The account that creates the post. Defaults to the app account. */
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

/** Options for creating a crosspost. */
export type CrosspostOptions = CommonSubmitPostOptions &
  Required<SubredditOptions> & { postId: T3 };

/** @deprecated Use {@link CommonFlair}. */
export type LinkFlair = CommonFlair;

/**
 * oEmbed is a format for allowing an embedded representation of a URL on
 * third-party sites. The API lets a website display embedded content, such as
 * photos or videos, without parsing the resource directly.
 * See: https://oembed.com/
 */
export type Oembed = {
  /** The resource type and its type-specific parameters, such as `"video"`. */
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
  /**
   * The HTML required to embed a video player. It should have no padding or
   * margins. Consider loading it in a separate-origin iframe to avoid XSS
   * vulnerabilities.
   */
  html: string;
  /** The height in pixels required to display the HTML. */
  height?: number | undefined;
  /** The width in pixels required to display the HTML. */
  width?: number | undefined;
  /**
   * A URL for the resource's author or owner.
   *
   * @example "https://www.youtube.com/@Reddit"
   */
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
  /**
   * The URL to the DASH playlist file.
   *
   * @example "https://v.redd.it/abc123/DASHPlaylist.mpd"
   */
  dashUrl?: string | undefined;
  /** The duration of the video in seconds. E.g. 30 */
  duration?: number | undefined;
  /**
   * The direct URL to the video.
   *
   * @example "https://v.redd.it/abc123/DASH_1080.mp4?source=fallback"
   */
  fallbackUrl?: string | undefined;
  /** The height of the video in pixels. E.g. 1080 */
  height?: number | undefined;
  /**
   * The URL to the HLS playlist file.
   *
   * @example "https://v.redd.it/abc123/HLSPlaylist.m3u8"
   */
  hlsUrl?: string | undefined;
  /** If `true`, the video is a GIF */
  isGif?: boolean | undefined;
  /**
   * The URL to the scrubber media file.
   *
   * @example "https://v.redd.it/abc123/DASH_96.mp4"
   */
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
 * Contains a post's thumbnail and, for NSFW content, its blurred version.
 */
export type EnrichedThumbnail = {
  /** Attribution text for the thumbnail */
  attribution?: string;
  /**
   * The thumbnail image. Its resolution can differ from {@link Post.thumbnail}.
   */
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
  /** The media processing status. Successful uploads have `VALID` status. */
  status: GalleryMediaStatus;
  url: string;
  height: number;
  width: number;
};

/** Poll option on a poll post. */
export type PollOption = {
  /** ID of the poll option. */
  id: string;
  /** The text of the poll option. */
  text: string;
  /** The number of votes this poll option has received. */
  voteCount: number;
};

/** Aggregated poll data for a poll post. */
export type PollData = {
  /** Options in the poll. */
  options: PollOption[];
  /** Total votes cast across all of the poll's options. */
  totalVoteCount: number;
  /** Time the poll voting closes, in Unix milliseconds. */
  votingEndTimestamp: number;
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
  #flair: CommonFlair | undefined;
  #authorFlair: CommonFlair | undefined;
  #secureMedia: SecureMedia | undefined;
  #modReports: ModeratorReport[];
  #modReportReasons: string[];
  #userReportReasons: string[];
  #gallery: GalleryMedia[];
  #pollData: PollData | undefined;
  #crosspostParentId: T3 | undefined;

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

    this.#modReports = ((data.modReports as unknown as [string, string][]) ?? []).map(
      ([reason, author]) => ({ reason, author })
    );
    this.#modReportReasons = ((data.modReports as unknown as [string, string]) ?? []).map(
      ([reason]) => reason
    );
    this.#userReportReasons = ((data.userReports as unknown as [string, string]) ?? []).map(
      ([reason]) => reason
    );

    this.#flair = convertProtosFlairToCommonFlair({
      flairBackgroundColor: data.linkFlairBackgroundColor,
      flairCssClass: data.linkFlairCssClass,
      flairText: data.linkFlairText,
      flairType: data.linkFlairType,
      flairTemplateId: data.linkFlairTemplateId,
      flairRichtext: data.linkFlairRichtext,
      flairTextColor: data.linkFlairTextColor,
    });

    this.#authorFlair = convertProtosFlairToCommonFlair({
      flairBackgroundColor: data.authorFlairBackgroundColor,
      flairCssClass: data.authorFlairCssClass,
      flairText: data.authorFlairText,
      flairType: data.authorFlairType,
      flairTemplateId: data.authorFlairTemplateId,
      flairRichtext: data.authorFlairRichtext,
      flairTextColor: data.authorFlairTextColor,
    });

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

    if (data.pollData) {
      const raw = data.pollData;
      this.#pollData = {
        options: (raw.options ?? []).map((opt) => ({
          id: opt.id,
          text: opt.text,
          voteCount: opt.voteCount,
        })),
        totalVoteCount: raw.totalVoteCount,
        votingEndTimestamp: raw.votingEndTimestamp,
      };
    }

    this.#crosspostParentId = data.crosspostParent ? T3(data.crosspostParent) : undefined;
  }

  get id(): T3 {
    return this.#id;
  }

  /** The creator's account identifier, or `undefined` when unavailable. */
  get authorId(): T2 | undefined {
    return this.#authorId;
  }

  /** The creator's username without the leading `u/`. */
  get authorName(): string {
    return this.#authorName;
  }

  /** The subreddit identifier where the post was created. */
  get subredditId(): T5 {
    return this.#subredditId;
  }

  /** The owning subreddit's name without the leading `r/`. */
  get subredditName(): string {
    return this.#subredditName;
  }

  /**
   * The post's path relative to `https://www.reddit.com`.
   *
   * @example "/r/wallstreetbets/comments/abc123/post/"
   */
  get permalink(): string {
    return this.#permalink;
  }

  /** The title displayed for the post. */
  get title(): string {
    return this.#title;
  }

  /** The post body in Markdown. `undefined` if absent. */
  get body(): string | undefined {
    return this.#body;
  }

  /** The post body rendered as HTML, or `undefined` when unavailable. */
  get bodyHtml(): string | undefined {
    return this.#bodyHtml;
  }

  /**
   * The post URL.
   *
   * This is the submitted URL for a link post or the full-size media URL for an
   * image or video post. Use {@link permalink} for the relative path.
   *
   * @example "https://www.reddit.com/r/wallstreetbets/comments/abc123/post/"
   */
  get url(): string {
    return this.#url;
  }

  /**
   * The post's preview thumbnail URL and dimensions in pixels.
   *
   * `undefined` means no thumbnail is available or the source field contains a
   * placeholder such as `"self"` or `"nsfw"`.
   */
  get thumbnail(): { url: string; height: number; width: number } | undefined {
    return this.#thumbnail;
  }

  /** The date when the post was created. */
  get createdAt(): Date {
    return this.#createdAt;
  }

  /** The post's upvotes minus downvotes, or `0` when unavailable. */
  get score(): number {
    return this.#score;
  }

  /** The number of comments, or `0` when none are available. */
  get numberOfComments(): number {
    return this.#numberOfComments;
  }

  /** The number of reports, or `0` when none are available. */
  get numberOfReports(): number {
    return this.#numberOfReports;
  }

  /** Whether the post has been approved by a moderator. */
  get approved(): boolean {
    return this.#approved;
  }

  /**
   * The moderation approval time as Unix seconds, or `0` when unavailable.
   *
   * Use {@link approved} to check the current approval state. Convert a nonzero
   * value to a `Date` with `new Date(post.approvedAtUtc * 1000)`.
   */
  get approvedAtUtc(): number {
    return this.#approvedAtUtc;
  }

  /**
   * The ban time as Unix seconds, or `0` when unavailable.
   *
   * Convert a nonzero value to a `Date` with
   * `new Date(post.bannedAtUtc * 1000)`.
   */
  get bannedAtUtc(): number {
    return this.#bannedAtUtc;
  }

  /** Whether the post has been marked as spam by a moderator. */
  get spam(): boolean {
    return this.#spam;
  }

  /** Whether the post is presented before other posts in its subreddit. */
  get stickied(): boolean {
    return this.#stickied;
  }

  /** Whether the post has been removed by a moderator. */
  get removed(): boolean {
    return this.#removed;
  }

  /**
   * The username of the account that removed the post, without the leading
   * `u/`, or `undefined` when unavailable.
   */
  get removedBy(): string | undefined {
    return this.#removedBy;
  }

  /**
   * Identifies who or what removed the post:
   *
   * - `"anti_evil_ops"`: Reddit Anti-Evil Operations.
   * - `"author"`: The post's author.
   * - `"automod_filtered"`: AutoModerator filtering.
   * - `"community_ops"`: Reddit Community Operations.
   * - `"content_takedown"`: A content-policy takedown.
   * - `"copyright_takedown"`: A copyright takedown.
   * - `"deleted"`: The post was deleted.
   * - `"moderator"`: A subreddit moderator.
   * - `"reddit"`: Any other remover.
   * - `undefined`: No removal category is available.
   */
  get removedByCategory(): string | undefined {
    return this.#removedByCategory;
  }

  /** Whether the post is archived. */
  get archived(): boolean {
    return this.#archived;
  }

  /** Whether the post body has been edited since it was created. */
  get edited(): boolean {
    return this.#edited;
  }

  /** Whether the post is locked and new comments are disabled. */
  get locked(): boolean {
    return this.#locked;
  }

  /** Whether the post is marked not safe for work (NSFW). */
  get nsfw(): boolean {
    return this.#nsfw;
  }

  /** Whether the post is quarantined. */
  get quarantined(): boolean {
    return this.#quarantined;
  }

  /**
   * Whether the post's content is hidden until the user explicitly opens it.
   */
  get spoiler(): boolean {
    return this.#spoiler;
  }

  /** Whether the post is hidden from listings. */
  get hidden(): boolean {
    return this.#hidden;
  }

  /** Whether reports on the post are being ignored. */
  get ignoringReports(): boolean {
    return this.#ignoringReports;
  }

  /**
   * The post's distinction category.
   *
   * For example, a post distinguished by a moderator or employee returns
   * `"moderator"` or `"admin"`. `undefined` means no distinction is available.
   */
  get distinguishedBy(): string | undefined {
    return this.#distinguishedBy;
  }

  /**
   * A listing of the post's top-level comments. Each comment exposes its
   * replies separately.
   *
   * @example
   * ```ts
   * const comments = await post.comments.get(25);
   * ```
   */
  get comments(): Listing<Comment> {
    return Comment.getComments({
      postId: this.id,
    });
  }

  /**
   * A listing of other posts that reference the same URL.
   *
   * @example
   * ```ts
   * const duplicates = await post.getDuplicates().get(25);
   * ```
   */
  getDuplicates(opts: Omit<GetDuplicatesOptions, 'postId'> = {}): Listing<Post> {
    return Post.getDuplicates({ ...opts, postId: this.id });
  }

  /** The post flair, or `undefined` when unavailable. */
  get flair(): CommonFlair | undefined {
    return this.#flair;
  }

  /** The author's subreddit flair, or `undefined` when unavailable. */
  get authorFlair(): CommonFlair | undefined {
    return this.#authorFlair;
  }

  /**
   * Metadata for embedded or Reddit-hosted media, including oEmbed or Reddit
   * video data.
   *
   * Returns `undefined` when the post has no secure media metadata.
   */
  get secureMedia(): SecureMedia | undefined {
    return this.#secureMedia;
  }

  /** User report reasons, or an empty array when none are available. */
  get userReportReasons(): string[] {
    return this.#userReportReasons;
  }

  /** Moderator reports and authors, or an empty array when unavailable. */
  get modReports(): ModeratorReport[] {
    return this.#modReports;
  }

  /** @deprecated Use {@link modReports} to retain each report's author. */
  get modReportReasons(): string[] {
    return this.#modReportReasons;
  }

  /**
   * Get the image or GIF metadata in the post. Empty if the post doesn't have
   * any media.
   *
   * Gallery posts can contain multiple entries. For other posts, one entry from
   * the first preview image or GIF variant.
   */
  get gallery(): GalleryMedia[] {
    return this.#gallery;
  }

  /**
   * The post's poll options, vote totals, and voting end time. `undefined` if
   * the post is not a poll.
   */
  get pollData(): PollData | undefined {
    return this.#pollData;
  }

  /**
   * The original post's identifier when this post is a crosspost. `undefined`
   * if not a crosspost or parent is unavailable.
   */
  get crosspostParentId(): T3 | undefined {
    return this.#crosspostParentId;
  }

  /** JSON representation of public fields. */
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
    | 'authorFlair'
    | 'secureMedia'
    | 'userReportReasons'
    | 'modReports'
    | 'modReportReasons'
    | 'crosspostParentId'
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
      authorFlair: this.authorFlair,
      secureMedia: this.secureMedia,
      modReports: this.#modReports,
      modReportReasons: this.#modReportReasons,
      userReportReasons: this.#userReportReasons,
      crosspostParentId: this.#crosspostParentId,
    };
  }

  /** The post's approval state. */
  isApproved(): boolean {
    return this.#approved;
  }

  /** The post's spam state. */
  isSpam(): boolean {
    return this.#spam;
  }

  /** The post's stickied state. */
  isStickied(): boolean {
    return this.#stickied;
  }

  /** The post's removal state. */
  isRemoved(): boolean {
    return this.#removed;
  }

  /** The post's archived state. */
  isArchived(): boolean {
    return this.#archived;
  }

  /** The post's edited state. */
  isEdited(): boolean {
    return this.#edited;
  }

  /** The post's locked state. */
  isLocked(): boolean {
    return this.#locked;
  }

  /** The post's NSFW state. */
  isNsfw(): boolean {
    return this.#nsfw;
  }

  /** The post's quarantine state. */
  isQuarantined(): boolean {
    return this.#quarantined;
  }

  /** The post's spoiler state. */
  isSpoiler(): boolean {
    return this.#spoiler;
  }

  /** The post's hidden state. */
  isHidden(): boolean {
    return this.#hidden;
  }

  /** The post's report-ignore state. */
  isIgnoringReports(): boolean {
    return this.#ignoringReports;
  }

  /** The post's distinction category. */
  isDistinguishedBy(): string | undefined {
    return this.#distinguishedBy;
  }

  /**
   * Replaces the post body as the app account, then updates the cached body and
   * edited state from the response.
   */
  async edit(opts: Readonly<PostTextOptions>): Promise<void> {
    const newPost = await Post.edit({
      id: this.id,
      ...opts,
    });

    this.#body = newPost.body;
    this.#edited = newPost.edited;
  }

  /**
   * Sets the suggested default sort for the post's comments.
   *
   * @throws {Error} If the suggested sort is rejected.
   *
   * @example
   * ```ts
   * const post = await reddit.getPostById(context.postId);
   * await post.setSuggestedCommentSort('NEW');
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
   * Get the post data for the custom post.
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
   * Replace the post data stored on a custom post.
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
   * Shallow-merge `postData` with any existing post data.
   *
   * Existing top-level properties are preserved unless the input replaces
   * them. Nested objects are replaced rather than deeply merged.
   *
   * @throws {Error} If the post data could not be updated.
   *
   * @example
   * ```ts
   * const post = await reddit.getPostById(context.postId);
   *
   * // Existing data:
   * // { currentScore: 55, settings: { theme: 'dark', fontSize: 12 } }
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
   * Replaces the content shown when a custom post cannot be rendered. Eg, on
   * `old.reddit.com`.
   *
   * The fallback may be plain text, Markdown, or rich text. This instance's
   * body and edited state are updated from the response.
   *
   * @throws {Error} If the fallback could not be updated.
   *
   * @example
   * ```ts
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

  /** Creates a top-level comment on the post. */
  async addComment(opts: Readonly<CommentSubmissionOptions>): Promise<Comment> {
    return Comment.submit({
      id: this.id,
      ...opts,
    });
  }

  /** Deletes the post as the app account. */
  async delete(): Promise<void> {
    const appUsername = context.appName;
    if (appUsername !== this.#authorName) {
      throw new Error(
        `App '${appUsername}' is not the author of Post ${this.id}, delete not allowed.`
      );
    }
    return Post.delete(this.id);
  }

  /** Approves the post and updates this instance's moderation state. */
  async approve(): Promise<void> {
    await Post.approve(this.id);
    this.#approved = true;
    this.#removed = false;
  }

  /**
   * Filters a post. When a post is filtered, it is added to the ModQueue for review, and in addition:
   * - if @param options.keep is `false`, the post stops being in displayed the subreddit
   * - if @param options.keep is `true`, the post is still displayed in the subreddit
   *
   * @experimental
   */
  async filter(options?: FilterOptions): Promise<void> {
    await filterThing(this.id, options, context.metadata);
    this.#removed = !options?.keep;
    this.#spam = false;
    this.#approved = false;
  }

  /**
   * Removes the post and updates this instance's moderation state.
   *
   * @param isSpam - Whether to classify the removed post as spam.
   */
  async remove(isSpam: boolean = false): Promise<void> {
    await Post.remove(this.id, isSpam);
    this.#removed = true;
    this.#spam = isSpam;
    this.#approved = false;
  }

  /** Disables new comments and updates this instance's locked state. */
  async lock(): Promise<void> {
    await Post.lock(this.id);
    this.#locked = true;
  }

  /** Enables new comments and updates this instance's locked state. */
  async unlock(): Promise<void> {
    await Post.unlock(this.id);
    this.#locked = false;
  }

  /** Hides the post from the app account and updates this instance. */
  async hide(): Promise<void> {
    await Post.hide(this.id);
    this.#hidden = true;
  }

  /** Unhides the post for the app account and updates this instance. */
  async unhide(): Promise<void> {
    await Post.unhide(this.id);
    this.#hidden = false;
  }

  /** Marks the post as NSFW and updates this instance. */
  async markAsNsfw(): Promise<void> {
    await Post.markAsNsfw(this.id);
    this.#nsfw = true;
  }

  /** Removes the NSFW designation and updates this instance. */
  async unmarkAsNsfw(): Promise<void> {
    await Post.unmarkAsNsfw(this.id);
    this.#nsfw = false;
  }

  /** Marks the post as a spoiler and updates this instance. */
  async markAsSpoiler(): Promise<void> {
    await Post.markAsSpoiler(this.id);
    this.#spoiler = true;
  }

  /** Removes the spoiler designation and updates this instance. */
  async unmarkAsSpoiler(): Promise<void> {
    await Post.unmarkAsSpoiler(this.id);
    this.#spoiler = false;
  }

  /**
   * Pins the post in a sticky slot.
   *
   * @param position - The sticky slot. If omitted, the bottom-most available
   * slot is used. Use 1 or 2 for subreddit posts. 3 and 4 are reserved for
   * profile pins.
   */
  async sticky(position?: 1 | 2 | 3 | 4): Promise<void> {
    // to-do: update the cached {@link stickied} value on this instance?
    await Post.sticky(this.id, position);
  }

  /**
   * Unpins the post without updating this instance's cached {@link stickied}
   * value.
   */
  async unsticky(): Promise<void> {
    await Post.unsticky(this.id);
  }

  /** Distinguishes the post as a moderator and updates this instance. */
  async distinguish(): Promise<void> {
    const { distinguishedBy } = await Post.distinguish(this.id, false);
    this.#distinguishedBy = distinguishedBy;
  }

  /** Distinguishes the post as an administrator and updates this instance. */
  async distinguishAsAdmin(): Promise<void> {
    const { distinguishedBy } = await Post.distinguish(this.id, true);
    this.#distinguishedBy = distinguishedBy;
  }

  /** Removes the post's distinction and updates this instance. */
  async undistinguish(): Promise<void> {
    const { distinguishedBy } = await Post.undistinguish(this.id);
    this.#distinguishedBy = distinguishedBy;
  }

  /** Ignores reports and updates this instance's report-ignore state. */
  async ignoreReports(): Promise<void> {
    await Post.ignoreReports(this.id);
    this.#ignoringReports = true;
  }

  /** Stops ignoring reports and updates this instance's cached state. */
  async unignoreReports(): Promise<void> {
    await Post.unignoreReports(this.id);
    this.#ignoringReports = false;
  }

  /**
   * Snoozes subsequent reports with the same reason from the same users for
   * seven days. This only works for free-form reports.
   *
   * @param reason - The report reason to snooze.
   */
  async snoozeReports(reason: string): Promise<void> {
    await Post.snoozeReports(this.id, reason);
  }

  /**
   * Unsnoozes reports with the given reason. This only works for free-form
   * reports.
   *
   * @param reason - The report reason to unsnooze.
   */
  async unsnoozeReports(reason: string): Promise<void> {
    await Post.unsnoozeReports(this.id, reason);
  }

  /**
   * Sets which comments Crowd Control collapses on this post.
   *
   * @param level - See {@link CrowdControlLevel} for the available levels.
   */
  async updateCrowdControlLevel(level: CrowdControlLevel): Promise<void> {
    await Post.updateCrowdControlLevel(this.id, level);
  }

  /**
   * Fetches the creator's account, or `undefined` if it is unavailable.
   */
  async getAuthor(): Promise<User | undefined> {
    return User.getByUsername(this.#authorName);
  }

  /** Creates a crosspost of this post in another subreddit. */
  async crosspost(opts: Readonly<Omit<CrosspostOptions, 'postId'>>): Promise<Post> {
    return Post.crosspost({ ...opts, postId: this.id });
  }

  /**
   * Adds a moderator note explaining why the post was removed.
   */
  addRemovalNote(opts: Readonly<Omit<AddRemovalNoteOptions, 'itemIds'>>): Promise<void> {
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

  /**
   * Updates a custom post's styles.
   *
   * Unspecified properties retain their existing values. Passing `undefined`
   * removes all custom styles.
   *
   * @experimental
   */
  async setCustomPostStyles(styles: CustomPostStylesInput | undefined): Promise<void> {
    return Post.setDevvitCustomPostStyles(this.#id, styles);
  }

  /**
   * Get the custom styles for a custom post.
   * @experimental
   */
  async getCustomPostStyles(): Promise<CustomPostStyles> {
    return Post.getDevvitCustomPostStyles(this.#id);
  }

  /**
   * Get the poll option the authenticated user selected for this post.
   * Returns undefined if the post is not a poll or the user has not voted.
   *
   * This method will get the poll option for the app account by default.
   * To get the poll option for a user, please contact Reddit.
   */
  async getCurrentUserPollOption(): Promise<PollOption | undefined> {
    return Post.getUserPollOption(this.#id);
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

    // The post ID might be absent because image and video post creation can be
    // asynchronous.
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
    const entry = getEntry(config, opts.entry);

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
        // Minimal non-empty Block proto (height=tall, no children),
        // base64-encoded. devvit-plugins requires RichTextJSON and gateway
        // requires initialRender to be set to nonempty. DX-10914 DX-10915.
        richtextJson: 'GgUKAxCABA==',
        sr: opts.subredditName ?? context.subredditName,
        richtextFallback,
        flairId: opts.flairId,
        flairText: opts.flairText,
        nsfw: opts.nsfw,
        sendreplies: opts.sendreplies,
        spoiler: opts.spoiler,
        title: opts.title,
        userGeneratedContent,
        runAs: runAsType,
        postData: { developerData: opts.postData, splash: { entry: entry.name } },
        customPostStyles: opts.styles
          ? {
              backgroundColor: opts.styles.backgroundColor ?? '',
              backgroundColorDark: opts.styles.backgroundColorDark ?? '',
              height: opts.styles.height ?? EntrypointHeight.HEIGHT_UNSPECIFIED,
              shareImageUrl: opts.styles.shareImageUrl ?? '',
              heightPixels: opts.styles.heightPixels ?? 0,
              renderStyle:
                opts.styles.supportsChromeless === undefined
                  ? RenderStyle.RENDER_STYLE_UNSPECIFIED
                  : opts.styles.supportsChromeless
                    ? RenderStyle.RENDER_STYLE_CHROMELESS
                    : RenderStyle.RENDER_STYLE_DEFAULT,
            }
          : undefined,
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
  static async setDevvitCustomPostStyles(
    postId: T3,
    styles: CustomPostStylesInput | undefined
  ): Promise<void> {
    const client = getRedditApiPlugins().LinksAndComments;
    await client.SetCustomPostStyles({
      postId,
      customPostStyles: styles,
    });
  }

  /** @internal */
  static async getDevvitCustomPostStyles(postId: T3): Promise<CustomPostStyles> {
    const client = getRedditApiPlugins().LinksAndComments;
    const styles = await client.GetCustomPostStyles({ postId });
    const { renderStyle, ...publicStyles } = styles;
    return {
      ...publicStyles,
      supportsChromeless: renderStyle === RenderStyle.RENDER_STYLE_CHROMELESS,
    };
  }

  /** @internal */
  static async getUserPollOption(postId: T3): Promise<PollOption | undefined> {
    const client = getRedditApiPlugins().LinksAndComments;
    const rsp = await client.GetUserPollOption({ postId }, context.metadata);
    const opt = rsp.pollOption;
    if (!opt) return undefined;
    return {
      id: opt.id,
      text: opt.text,
      voteCount: opt.voteCount,
    };
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
    if (rsp.json?.errors?.length) {
      const errorMessages = decodeProtoErrors(rsp.json.errors);
      throw Error(`set post ${opts.postId} data failed: ${errorMessages.join(', ')}`);
    }
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

    if (rsp.json?.errors?.length) {
      const errorMessages = decodeProtoErrors(rsp.json.errors);
      throw Error(`set post ${postId} text fallback failed: ${errorMessages.join(', ')}`);
    }

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
  static async snoozeReports(id: T3, reason: string): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.SnoozeReports(
      {
        id,
        reason,
      },
      context.metadata
    );
  }

  /** @internal */
  static async unsnoozeReports(id: T3, reason: string): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.UnsnoozeReports(
      {
        id,
        reason,
      },
      context.metadata
    );
  }

  /** @internal */
  static async updateCrowdControlLevel(id: T3, level: CrowdControlLevel): Promise<void> {
    const client = getRedditApiPlugins().Moderation;

    await client.UpdateCrowdControlLevel(
      {
        id,
        level: crowdControlLevelToProto(level),
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
  static getBestPosts(opts: Readonly<GetBestPostsOptions>): Listing<Post> {
    const client = getRedditApiPlugins().Listings;

    return new Listing({
      hasMore: true,
      before: opts.before,
      after: opts.after,
      pageSize: opts.pageSize,
      limit: opts.limit,
      fetch: async (fetchOpts: ListingFetchOptions) => {
        const response = await client.Best(
          {
            show: 'all',
            ...fetchOpts,
          },
          context.metadata
        );

        return listingProtosToPosts(response);
      },
    });
  }

  /** @internal */
  static getDuplicates(opts: Readonly<GetDuplicatesOptions>): Listing<Post> {
    const article = opts.postId.slice(3);
    const client = getRedditApiPlugins().Listings;

    return new Listing({
      hasMore: true,
      before: opts.before,
      after: opts.after,
      pageSize: opts.pageSize,
      limit: opts.limit,
      fetch: async (fetchOpts: ListingFetchOptions) => {
        const response = await client.Duplicates(
          {
            article,
            sort: opts.sort,
            sr: opts.subredditName,
            crosspostsOnly: opts.crosspostsOnly,
            show: opts.show,
            ...fetchOpts,
          },
          context.metadata
        );

        // Duplicates returns two listings: the first contains the original
        // post, and the second contains its duplicates.
        const duplicatesListing = response.listings?.[1];
        if (!duplicatesListing?.data?.children) {
          throw new Error('Duplicates response is missing children');
        }
        return listingProtosToPosts(duplicatesListing);
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
  static searchPosts(opts: Readonly<SearchPostsOptions>): Listing<Post> {
    const client = getRedditApiPlugins().Listings;

    return new Listing({
      hasMore: true,
      before: opts.before,
      after: opts.after,
      pageSize: opts.pageSize,
      limit: opts.limit,
      fetch: async (fetchOpts: ListingFetchOptions) => {
        const subredditName = opts.subredditName ?? 'all';
        const response = await client.SearchPosts(
          {
            q: opts.query,
            restrictSr: subredditName.toLowerCase() !== 'all',
            show: 'all',
            sort: opts.sort ?? 'relevance',
            subreddit: subredditName,
            t: opts.timeframe ?? 'all',
            type: 'link',
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

function postFromSubmitResponse(rsp: Readonly<SubmitResponse>): Promise<Post> {
  if (!rsp.json?.data?.id || rsp.json.errors?.length) {
    const errorMessages = rsp.json?.errors ? decodeProtoErrors(rsp.json.errors) : [];
    const postIdText = rsp.json?.data?.id ? `post ${rsp.json.data.id}` : 'post';
    throw Error(`${postIdText} submission failed: ${errorMessages.join(', ')}`);
  }

  return Post.getById(`t3_${rsp.json.data.id}`);
}
