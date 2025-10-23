import type {
  AboutLocationRequest,
  Listing as ProtoListing,
  Metadata,
  SubredditAboutResponse_AboutData,
  WrappedRedditObject,
} from '@devvit/protos';
import { context } from '@devvit/server';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import type { Prettify } from '@devvit/shared-types/Prettify.js';
import { T5 } from '@devvit/shared-types/tid.js';

import { GraphQL } from '../graphql/GraphQL.js';
import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';
import { getRedditApiPlugins } from '../plugin.js';
import { Comment } from './Comment.js';
import type {
  CreateFlairTemplateOptions,
  GetUserFlairBySubredditResponse,
  UserFlairPageOptions,
} from './Flair.js';
import { convertUserFlairProtoToAPI, Flair, FlairTemplate } from './Flair.js';
import type { ListingFetchResponse } from './Listing.js';
import { Listing } from './Listing.js';
import type {
  GetModerationLogOptions as _GetModerationLogOptions,
  ModAction,
} from './ModAction.js';
import { getModerationLog } from './ModAction.js';
import type {
  CrosspostOptions,
  GetPostsOptionsWithTimeframe,
  SubmitCustomPostOptions,
  SubmitPostOptions,
} from './Post.js';
import { Post } from './Post.js';
import type {
  BanUserOptions,
  BanWikiContributorOptions,
  GetSubredditUsersByTypeOptions,
  ModeratorPermission,
} from './User.js';
import { User } from './User.js';

type GetModerationLogOptions = Omit<_GetModerationLogOptions, 'subredditName'>;
type GetUsersOptions = Omit<GetSubredditUsersByTypeOptions, 'subredditName' | 'type'>;

export type SubredditType =
  | 'public'
  | 'private'
  | 'restricted'
  | 'employees_only'
  | 'gold_only'
  | 'gold_restricted'
  | 'archived'
  | 'user';

export enum AboutLocations {
  Reports = 'reports',
  Spam = 'spam',
  Modqueue = 'modqueue',
  Unmoderated = 'unmoderated',
  Edited = 'edited',
}

export type AboutSubredditTypes = 'comment' | 'post' | 'all';

type AboutSubredditOptions<T extends AboutSubredditTypes> = Omit<
  AboutSubredditHelperOptions<T>,
  'location' | 'subreddit'
>;

export type ModLogOptions<T extends AboutSubredditTypes> = Omit<
  AboutSubredditHelperOptions<T>,
  'location'
>;

type AboutSubredditHelperOptions<T extends AboutSubredditTypes> = Prettify<
  {
    type: T;
  } & AboutLocationRequest
>;

export type CommentMediaTypes = 'giphy' | 'static' | 'animated' | 'expression';

export type FlairSettings = {
  enabled: boolean;
  usersCanAssign: boolean;
  userFlairBackgroundColor?: string | undefined;
  userFlairTextColor?: string | undefined;
};

export type GetUserFlairOptions = UserFlairPageOptions & {
  /** If provide the method will return the flairs for the provided users, if not provided
   * it will return a list of all users assigned flairs in the subreddit */
  usernames?: string[];
};

export type GetSubscribedSubredditsForCurrentUserOptions = {
  limit?: number;
  pageSize?: number;
  after?: string;
  before?: string;
};

/**
 * An individual Removal Reason object.
 */
export type RemovalReason = {
  /**
   * The ID of the removal reason.
   */
  id: string;
  /**
   * The message associated with the removal reason.
   */
  message: string;
  /**
   * The title of the removal reason.
   */
  title: string;
};

export type SubredditSettings = {
  /**
   * Whether the subreddit accepts followers or not.
   */
  acceptFollowers: boolean;
  /**
   * Whether all content posted on the subreddit is original.
   */
  allOriginalContent: boolean;
  /**
   * Whether users are allowed to create chat posts on the subreddit.
   */
  allowChatPostCreation: boolean;
  /**
   * Whether the subreddit can be discovered through search.
   */
  allowDiscovery: boolean;
  /**
   * Whether the subreddit allows galleries.
   */
  allowGalleries: boolean;
  /**
   * Whether the subreddit allows images.
   */
  allowImages: boolean;
  /**
   * Whether the subreddit allows polls.
   */
  allowPolls: boolean;
  /**
   * Whether contributors are allowed to make predictions on the subreddit.
   */
  allowPredictionContributors: boolean;
  /**
   * Whether predictions are allowed on the subreddit.
   */
  allowPredictions: boolean;
  /**
   * Whether prediction tournaments are allowed on the subreddit.
   */
  allowPredictionsTournament: boolean;
  /**
   * Whether talks are allowed on the subreddit.
   */
  allowTalks: boolean;
  /**
   * Whether video GIFs are allowed on the subreddit.
   */
  allowVideoGifs: boolean;
  /**
   * Whether videos are allowed on the subreddit.
   */
  allowVideos: boolean;
  /**
   * Whether chat posts are enabled on the subreddit.
   */
  chatPostEnabled: boolean;
  /**
   * Whether collections are enabled on the subreddit.
   */
  collectionsEnabled: boolean;
  /**
   * Whether crossposts can be made to this subreddit.
   */
  crosspostable: boolean;
  /**
   * Whether emojis are enabled on the subreddit.
   */
  emojisEnabled: boolean;
  /**
   * Whether event posts are enabled on the subreddit.
   */
  eventPostsEnabled: boolean;
  /**
   * Whether link flairs are enabled on the subreddit.
   */
  linkFlairEnabled: boolean;
  /**
   * Whether the Original Content tag is enabled.
   */
  originalContentTagEnabled: boolean;
  /**
   * Whether commenting is restricted in the subreddit.
   */
  restrictCommenting: boolean;
  /**
   * Whether posting is restricted in the subreddit.
   */
  restrictPosting: boolean;
  /**
   * Whether posts in the subreddit should be automatically archived after 6 months.
   */
  shouldArchivePosts: boolean;
  /**
   * Whether the Spoiler tag is enabled.
   */
  spoilersEnabled: boolean;
  /**
   * Whether the wiki is enabled for the subreddit.
   */
  wikiEnabled: boolean;
  /**
   * The types of post allowed in this subreddit. Either "any", "link", or "self".
   */
  allowedPostType: 'any' | 'link' | 'self';
  /**
   * List of allowed media types in the comments made in the subreddit.
   */
  allowedMediaInComments: CommentMediaTypes[];
  /**
   * a 6-digit rgb hex color of the banner e.g. `#AABBCC`,
   */
  bannerBackgroundColor?: string | undefined;
  /**
   * The background image of the banner.
   */
  bannerBackgroundImage?: string | undefined;
  /**
   * The URL of the banner image.
   */
  bannerImage?: string | undefined;
  /**
   * The URL of the community icon.
   */
  communityIcon?: string | undefined;
  /**
   * The header title.
   */
  headerTitle?: string | undefined;
  /**
   * The 6-digit rgb hex color of the subreddit's key color, e.g. `#AABBCC`,
   */
  keyColor?: string | undefined;
  /**
   * Banner image used on mobile apps.
   */
  mobileBannerImage?: string | undefined;
  /**
   * The 6-digit rgb hex color of the subreddit's primary color, e.g. `#AABBCC`,
   */
  primaryColor?: string | undefined;
  /**
   * The user flair settings for the subreddit.
   */
  userFlairs: FlairSettings;
  /**
   * The post flair settings for the subreddit.
   */
  postFlairs: FlairSettings;
  /**
   * HTTP URL to the subreddit
   */
  url: string;
};

export type SubredditLeaderboardSummaryRow = {
  title: string;
  key: string;
  value: number;
};

export type SubredditLeaderboardSummary = {
  data: SubredditLeaderboardSummaryRow[];
};

/**
 * An individual Leaderboard object.
 */
export type SubredditLeaderboard = {
  id: string;
  summary: SubredditLeaderboardSummary;
};

export type BackgroundImagePosition = 'cover' | 'tiled' | 'centered';
export type BannerHeight = 'small' | 'medium' | 'large';
export type CommunityNameFormat = 'slashtag' | 'pretty' | 'hide';
export type CustomizationFlag = 'default' | 'custom';
export type ImagePosition = 'cover' | 'tiled';
export type MenuPosition = 'default' | 'overlay';
export type PositionedImagePosition = 'left' | 'right' | 'centered';
export type Visibility = 'show' | 'hide';

/**
 * A class representing the styles of a Subreddit.
 */
export type SubredditStyles = {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundImagePosition?: BackgroundImagePosition;
  bannerBackgroundColor?: string;
  bannerBackgroundImage?: string;
  bannerBackgroundImagePosition?: ImagePosition;
  bannerCommunityName?: string;
  bannerCommunityNameFormat?: CommunityNameFormat;
  bannerHeight?: BannerHeight;
  bannerOverlayColor?: string;
  bannerPositionedImage?: string;
  bannerPositionedImagePosition?: PositionedImagePosition;
  bannerShowCommunityIcon?: Visibility;
  highlightColor?: string;
  icon?: string;
  legacyBannerBackgroundImage?: string;
  legacyPrimaryColor?: string;
  menuBackgroundBlur?: number;
  menuBackgroundColor?: string;
  menuBackgroundImage?: string;
  menuBackgroundOpacity?: number;
  menuLinkColorActive?: string;
  menuLinkColorHover?: string;
  menuLinkColorInactive?: string;
  menuPosition?: MenuPosition;
  mobileBannerImage?: string;
  mobileKeyColor?: string;
  postBackgroundColor?: string;
  postBackgroundImage?: string;
  postBackgroundImagePosition?: ImagePosition;
  postDownvoteCountColor?: string;
  postDownvoteIconActive?: string;
  postDownvoteIconInactive?: string;
  postPlaceholderImage?: string;
  postPlaceholderImagePosition?: ImagePosition;
  postTitleColor?: string;
  postUpvoteCountColor?: string;
  postUpvoteIconActive?: string;
  postUpvoteIconInactive?: string;
  postVoteIcons?: CustomizationFlag;
  primaryColor?: string;
  secondaryBannerPositionedImage?: string;
  sidebarWidgetBackgroundColor?: string;
  sidebarWidgetHeaderColor?: string;
  submenuBackgroundColor?: string;
  submenuBackgroundStyle?: CustomizationFlag;
};

export class SubredditDescription {
  markdown?: string;
}

export class SubredditWikiSettings {
  wikiEditMode?: WikiEditMode;
}

export type WikiEditMode = 'disabled' | 'modonly' | 'anyone';

export type PostType =
  | 'link'
  | 'image'
  | 'video'
  | 'text'
  | 'spoiler'
  | 'poll'
  | 'gallery'
  | 'talk'
  | 'prediction'
  | 'videogif'
  | 'streaming'
  | 'crosspost';

export type PostCapabilities = 'ama';

export class AuthorFlairSettings {
  isEnabled?: boolean;
  isSelfAssignabled?: boolean;
}

export class PostFlairSettings {
  isEnabled?: boolean;
  isSelfAssignabled?: boolean;
}

/**
 * A class representing information about a Subreddit.
 */
export type SubredditInfo = {
  id?: T5;
  name?: string;
  createdAt?: Date;
  type?: SubredditType;
  title?: string;
  description?: SubredditDescription;
  detectedLanguage?: string;
  subscribersCount?: number;
  activeCount?: number;
  isNsfw?: boolean;
  isQuarantined?: boolean;
  isDiscoveryAllowed?: boolean;
  isPredictionContributorsAllowed?: boolean;
  isPredictionAllowed?: boolean;
  isPredictionsTournamentAllowed?: boolean;
  isChatPostCreationAllowed?: boolean;
  isChatPostFeatureEnabled?: boolean;
  isCrosspostingAllowed?: boolean;
  isEmojisEnabled?: boolean;
  isCommentingRestricted?: boolean;
  isPostingRestricted?: boolean;
  isArchivePostsEnabled?: boolean;
  isSpoilerAvailable?: boolean;
  allAllowedPostTypes?: PostType[];
  allowedPostCapabilities?: PostCapabilities[];
  allowedMediaInComments?: CommentMediaTypes[];
  authorFlairSettings?: AuthorFlairSettings;
  postFlairSettings?: PostFlairSettings;
  wikiSettings?: SubredditWikiSettings;
};

/**
 * A class representing a subreddit.
 */
export class Subreddit {
  #id: T5;
  #name: string;
  #createdAt: Date;
  #type: SubredditType;
  #title: string | undefined;
  #description: string | undefined;
  #language: string;
  #numberOfSubscribers: number;
  #numberOfActiveUsers: number;
  #nsfw: boolean;
  #settings: SubredditSettings;
  // R2 bug: subreddit does not contain a permalink field, but uses the url field instead
  #permalink: string;

  /**
   * @internal
   */
  constructor(data: Partial<SubredditAboutResponse_AboutData>) {
    makeGettersEnumerable(this);

    assertNonNull(data.id, 'Subreddit id is missing or undefined');
    assertNonNull(data.displayName, 'Subreddit name is missing or undefined');

    this.#id = T5(`t5_${data.id}`);
    this.#name = data.displayName;

    assertNonNull(data.createdUtc, 'Subreddit is missing created date');
    const createdAt = new Date(0);
    createdAt.setUTCSeconds(data.createdUtc);
    this.#createdAt = createdAt;

    this.#type = asSubredditType(data.subredditType);
    this.#title = data.title;
    this.#description = data.description;

    this.#language = data.lang ?? '';

    this.#numberOfSubscribers = data.subscribers ?? 0;
    this.#numberOfActiveUsers = data.activeUserCount ?? 0;

    this.#nsfw = data.over18 ?? false;

    this.#permalink = data.url ?? '';

    this.#settings = {
      acceptFollowers: data.acceptFollowers ?? false,
      allOriginalContent: data.allOriginalContent ?? false,
      allowChatPostCreation: data.allowChatPostCreation ?? false,
      allowDiscovery: data.allowDiscovery ?? false,
      allowGalleries: data.allowGalleries ?? false,
      allowImages: data.allowImages ?? false,
      allowPolls: data.allowPolls ?? false,
      allowPredictionContributors: data.allowPredictionContributors ?? false,
      allowPredictions: data.allowPredictions ?? false,
      allowPredictionsTournament: data.allowPredictionsTournament ?? false,
      allowTalks: data.allowTalks ?? false,
      allowVideoGifs: data.allowVideogifs ?? false,
      allowVideos: data.allowVideos ?? false,
      chatPostEnabled: data.isChatPostFeatureEnabled ?? false,
      collectionsEnabled: data.collectionsEnabled ?? false,
      crosspostable: data.isCrosspostableSubreddit ?? false,
      emojisEnabled: data.emojisEnabled ?? false,
      eventPostsEnabled: data.eventPostsEnabled ?? false,
      linkFlairEnabled: data.linkFlairEnabled ?? false,
      originalContentTagEnabled: data.originalContentTagEnabled ?? false,
      restrictCommenting: data.restrictCommenting ?? false,
      restrictPosting: data.restrictPosting ?? false,
      shouldArchivePosts: data.shouldArchivePosts ?? false,
      spoilersEnabled: data.spoilersEnabled ?? false,
      wikiEnabled: data.wikiEnabled ?? false,
      allowedPostType: asAllowedPostType(data.submissionType),
      allowedMediaInComments: (data.allowedMediaInComments ?? []).map(asCommentMediaTypes),
      bannerBackgroundColor: data.bannerBackgroundColor,
      bannerBackgroundImage: data.bannerBackgroundImage,
      bannerImage: data.bannerImg,
      communityIcon: data.communityIcon,
      headerTitle: data.headerTitle,
      keyColor: data.keyColor,
      mobileBannerImage: data.mobileBannerImage,
      primaryColor: data.primaryColor,
      userFlairs: {
        enabled: data.userFlairEnabledInSr ?? false,
        usersCanAssign: data.canAssignUserFlair ?? false,
        userFlairBackgroundColor: data.userFlairBackgroundColor,
        userFlairTextColor: data.userFlairTextColor,
      },
      postFlairs: {
        enabled: data.linkFlairEnabled ?? false,
        usersCanAssign: data.canAssignLinkFlair ?? false,
      },
      // R2 bug: url is a permalink
      url: new URL(this.#permalink, 'https://www.reddit.com').toString(),
    };
  }

  /**
   * The ID (starting with t5_) of the subreddit to retrieve. e.g. t5_2qjpg
   */
  get id(): T5 {
    return this.#id;
  }

  /**
   * The name of a subreddit omitting the r/.
   */
  get name(): string {
    return this.#name;
  }

  /**
   * The creation date of the subreddit.
   */
  get createdAt(): Date {
    return this.#createdAt;
  }

  /**
   * The type of subreddit (public, private, etc.).
   */
  get type(): SubredditType {
    return this.#type;
  }

  /**
   * The title of the subreddit.
   */
  get title(): string | undefined {
    return this.#title;
  }

  /**
   * The description of the subreddit.
   */
  get description(): string | undefined {
    return this.#description;
  }

  /**
   * The language of the subreddit.
   */
  get language(): string {
    return this.#language;
  }

  /**
   * The number of subscribers of the subreddit.
   */
  get numberOfSubscribers(): number {
    return this.#numberOfSubscribers;
  }

  /**
   * The number of active users of the subreddit.
   */
  get numberOfActiveUsers(): number {
    return this.#numberOfActiveUsers;
  }

  /**
   * Whether the subreddit is marked as NSFW (Not Safe For Work).
   */
  get nsfw(): boolean {
    return this.#nsfw;
  }

  /**
   * The settings of the subreddit.
   */
  get settings(): SubredditSettings {
    return this.#settings;
  }

  /**
   * Whether the user flairs are enabled for this subreddit.
   */
  get userFlairsEnabled(): boolean {
    return this.settings.userFlairs.enabled;
  }

  /**
   * Whether the post flairs are enabled for this subreddit.
   */
  get postFlairsEnabled(): boolean {
    return this.settings.postFlairs.enabled;
  }

  /**
   * Whether the user can assign user flairs.
   * This is only true if the user flairs are enabled.
   */
  get usersCanAssignUserFlairs(): boolean {
    return this.settings.userFlairs.usersCanAssign;
  }

  /**
   * Whether the user can assign post flairs.
   * This is only true if the post flairs are enabled.
   */
  get usersCanAssignPostFlairs(): boolean {
    return this.settings.postFlairs.usersCanAssign;
  }

  /**
   * Returns the HTTP URL for the subreddit.
   * (R2 bug: subreddit.url is a permalink path and does not return a fully qualified URL in subreddit.url)
   */
  get url(): string {
    return this.settings.url;
  }

  /**
   * Returns a permalink path
   * (R2 bug: subreddit.url is a permalink, and does not have a subreddit.permalink field)
   */
  get permalink(): string {
    return this.#permalink;
  }

  toJSON(): Pick<
    Subreddit,
    | 'id'
    | 'name'
    | 'createdAt'
    | 'type'
    | 'title'
    | 'description'
    | 'language'
    | 'nsfw'
    | 'numberOfSubscribers'
    | 'numberOfActiveUsers'
    | 'settings'
  > {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      type: this.type,
      title: this.title,
      description: this.description,
      language: this.language,
      nsfw: this.nsfw,
      numberOfSubscribers: this.numberOfSubscribers,
      numberOfActiveUsers: this.numberOfActiveUsers,
      settings: this.settings,
    };
  }

  async submitPost(opts: Readonly<SubmitPostOptions>): Promise<Post> {
    return Post.submit({ ...opts, subredditName: this.#name });
  }

  async submitCustomPost(opts: Readonly<SubmitCustomPostOptions>): Promise<Post> {
    return Post.submitCustomPost({ ...opts, subredditName: this.#name });
  }

  async crosspost(opts: Readonly<CrosspostOptions>): Promise<Post> {
    return Post.crosspost({ ...opts, subredditName: this.#name });
  }

  getControversialPosts(
    options: Omit<GetPostsOptionsWithTimeframe, 'subredditName'> = {}
  ): Listing<Post> {
    if (!this.#name) {
      throw new Error('subreddit missing displayName - it might not have been fetched');
    }

    return Post.getControversialPosts({
      ...options,
      subredditName: this.#name,
    });
  }

  getTopPosts(options: Omit<GetPostsOptionsWithTimeframe, 'subredditName'> = {}): Listing<Post> {
    if (!this.#name) {
      throw new Error('subreddit missing displayName - it might not have been fetched');
    }

    return Post.getTopPosts({
      ...options,
      subredditName: this.#name,
    });
  }

  getApprovedUsers(options: GetUsersOptions = {}): Listing<User> {
    return User.getSubredditUsersByType({
      type: 'contributors',
      subredditName: this.#name,
      ...options,
    });
  }

  approveUser(username: string): Promise<void> {
    return User.createRelationship({
      username,
      subredditName: this.#name,
      type: 'contributor',
    });
  }

  removeUser(username: string): Promise<void> {
    return User.removeRelationship({
      username,
      subredditName: this.#name,
      type: 'contributor',
    });
  }

  getWikiContributors(options: GetUsersOptions = {}): Listing<User> {
    return User.getSubredditUsersByType({
      type: 'wikicontributors',
      subredditName: this.#name,
      ...options,
    });
  }

  addWikiContributor(username: string): Promise<void> {
    return User.createRelationship({
      username,
      subredditName: this.#name,
      type: 'wikicontributor',
    });
  }

  removeWikiContributor(username: string): Promise<void> {
    return User.removeRelationship({
      username,
      subredditName: this.#name,
      type: 'wikicontributor',
    });
  }

  getBannedUsers(options: GetUsersOptions = {}): Listing<User> {
    return User.getSubredditUsersByType({
      type: 'banned',
      subredditName: this.#name,
      ...options,
    });
  }

  banUser(options: Omit<BanUserOptions, 'subredditName'>): Promise<void> {
    return User.createRelationship({
      username: options.username,
      subredditName: this.#name,
      type: 'banned',
      banReason: options.reason,
      banMessage: options.message,
      note: options.note,
      duration: options.duration,
      banContext: options.context,
    });
  }

  unbanUser(username: string): Promise<void> {
    return User.removeRelationship({
      username,
      subredditName: this.#name,
      type: 'banned',
    });
  }

  getBannedWikiContributors(options: GetUsersOptions = {}): Listing<User> {
    return User.getSubredditUsersByType({
      type: 'wikibanned',
      subredditName: this.#name,
      ...options,
    });
  }

  banWikiContributor(options: Omit<BanWikiContributorOptions, 'subredditName'>): Promise<void> {
    return User.createRelationship({
      username: options.username,
      subredditName: this.#name,
      type: 'wikibanned',
      banReason: options.reason,
      note: options.note,
      duration: options.duration,
    });
  }

  unbanWikiContributor(username: string): Promise<void> {
    return User.removeRelationship({
      username,
      subredditName: this.#name,
      type: 'wikibanned',
    });
  }

  getModerators(options: GetUsersOptions = {}): Listing<User> {
    return User.getSubredditUsersByType({
      type: 'moderators',
      subredditName: this.#name,
      ...options,
    });
  }

  inviteModerator(username: string, permissions?: ModeratorPermission[]): Promise<void> {
    return User.createRelationship({
      type: 'moderator_invite',
      subredditName: this.#name,
      username,
      permissions: permissions ?? [],
    });
  }

  revokeModeratorInvite(username: string): Promise<void> {
    return User.removeRelationship({
      username,
      subredditName: this.#name,
      type: 'moderator_invite',
    });
  }

  removeModerator(username: string): Promise<void> {
    return User.removeRelationship({
      type: 'moderator',
      subredditName: this.#name,
      username,
    });
  }

  setModeratorPermissions(username: string, permissions: ModeratorPermission[]): Promise<void> {
    return User.setModeratorPermissions(username, this.#name, permissions);
  }

  getMutedUsers(options: GetUsersOptions = {}): Listing<User> {
    return User.getSubredditUsersByType({
      type: 'muted',
      subredditName: this.#name,
      ...options,
    });
  }

  muteUser(username: string, note?: string): Promise<void> {
    return User.createRelationship({
      username,
      subredditName: this.#name,
      type: 'muted',
      note,
    });
  }

  unmuteUser(username: string): Promise<void> {
    return User.removeRelationship({
      username,
      subredditName: this.#name,
      type: 'muted',
    });
  }

  getModerationLog(options: GetModerationLogOptions): Listing<ModAction> {
    return getModerationLog({
      subredditName: this.#name,
      ...options,
    });
  }

  getUserFlairTemplates(): Promise<FlairTemplate[]> {
    return FlairTemplate.getUserFlairTemplates(this.#name);
  }

  getPostFlairTemplates(): Promise<FlairTemplate[]> {
    return FlairTemplate.getPostFlairTemplates(this.#name);
  }

  createPostFlairTemplate(
    options: Omit<CreateFlairTemplateOptions, 'subredditName'>
  ): Promise<FlairTemplate> {
    return FlairTemplate.createPostFlairTemplate({
      subredditName: this.#name,
      ...options,
    });
  }

  createUserFlairTemplate(
    options: Omit<CreateFlairTemplateOptions, 'subredditName'>
  ): Promise<FlairTemplate> {
    return FlairTemplate.createUserFlairTemplate({
      subredditName: this.#name,
      ...options,
    });
  }

  /**
   * Get the user flair for the given subreddit. If `usernames` is provided then it will return only the
   * flair for the specified users. If retrieving the list of flair for a given subreddit and the list is long
   * then this method will return a `next` field which can be passed into the `after` field on the next call to
   * retrieve the next slice of data. To retrieve the previous slice of data pass the `prev` field into the `before` field
   * during the subsequent call.
   *
   * @param options See interface
   *
   * @example
   * ```ts
   * const subredditName = "mysubreddit"
   * const subreddit = await reddit.getSubredditByName(subredditName)
   * const response = await subreddit.getUserFlair();
   * const userFlairList = response.users
   * ```
   * @example
   * ```ts
   * const response = await subreddit.getUserFlair({ after: "t2_awefae"});
   * const userFlairList = response.users
   * ```
   *
   * @example
   * ```ts
   * const response = await subreddit.getUserFlair({ usernames: ['toxictoad', 'badapple']});
   * const userFlairList = response.users
   * ```
   */
  async getUserFlair(options?: GetUserFlairOptions): Promise<GetUserFlairBySubredditResponse> {
    if (options?.usernames !== undefined) {
      const users = await Promise.all(
        options.usernames.map(async (name) => {
          const response = await Flair.getUserFlairBySubreddit({
            subreddit: this.#name,
            name,
          });
          return convertUserFlairProtoToAPI(response.users[0]);
        })
      );

      return { users };
    } else {
      const response = await Flair.getUserFlairBySubreddit({
        ...options,
        subreddit: this.#name,
      });
      return {
        next: response.next,
        prev: response.prev,
        users: response.users.map((userFlair) => convertUserFlairProtoToAPI(userFlair)),
      };
    }
  }

  static getSubscribedSubredditsForCurrentUser(
    options: GetSubscribedSubredditsForCurrentUserOptions = {}
  ): Listing<Subreddit> {
    const client = getRedditApiPlugins().Subreddits;
    return new Listing<Subreddit>({
      hasMore: true,
      before: options.before,
      after: options.after,
      pageSize: options.pageSize,
      limit: options.limit,
      fetch: async (fetchOptions) => {
        const response = await client.SubredditsMineWhere(
          {
            where: 'subscriber',
            show: 'all',
            ...fetchOptions,
          },
          this.#metadata
        );

        assertNonNull(response.data, 'Failed to get subscribed subreddits for user');
        console.log(JSON.stringify(response));

        const children = response.data.children?.map((child) => new Subreddit(child.data!)) || [];

        return {
          children,
          before: response.data.before,
          after: response.data.after,
        };
      },
    });
  }

  /**
   * Return a listing of things requiring moderator review, such as reported things and items.
   *
   * @param options
   *
   * @example
   * ```ts
   * const subreddit = await reddit.getSubredditByName("mysubreddit")
   * let listing = await subreddit.getModQueue();
   * console.log("Posts and Comments: ",  await listing.all())
   * listing = await subreddit.getModQueue({ type: "post"});
   * console.log("Posts: ", await listing.all())
   * ```
   */
  getModQueue(options: AboutSubredditOptions<'comment'>): Listing<Comment>;
  getModQueue(options: AboutSubredditOptions<'post'>): Listing<Post>;
  getModQueue(options?: AboutSubredditOptions<'all'>): Listing<Post | Comment>;
  getModQueue(
    options: AboutSubredditOptions<AboutSubredditTypes> = { type: 'all' }
  ): Listing<Post | Comment> {
    return Subreddit.aboutLocation({
      ...options,
      location: AboutLocations.Modqueue,
      subreddit: this.#name,
    });
  }

  /**
   * Return a listing of things that have been reported.
   *
   * @param options
   *
   * @example
   * ```ts
   * const subreddit = await reddit.getSubredditByName("mysubreddit")
   * let listing = await subreddit.getReports();
   * console.log("Posts and Comments: ", await listing.all())
   * listing = await subreddit.getReports({ type: "post"});
   * console.log("Posts: ", await listing.all())
   * ```
   */
  getReports(options: AboutSubredditOptions<'comment'>): Listing<Comment>;
  getReports(options: AboutSubredditOptions<'post'>): Listing<Post>;
  getReports(options?: AboutSubredditOptions<'all'>): Listing<Post | Comment>;
  getReports(
    options: AboutSubredditOptions<AboutSubredditTypes> = { type: 'all' }
  ): Listing<Post | Comment> {
    return Subreddit.aboutLocation({
      ...options,
      location: AboutLocations.Reports,
      subreddit: this.#name,
    });
  }

  /**
   * Return a listing of things that have been marked as spam or otherwise removed.
   *
   * @param options
   *
   * @example
   * ```ts
   * const subreddit = await reddit.getSubredditByName("mysubreddit")
   * let listing = await subreddit.getSpam();
   * console.log("Posts and Comments: ", await listing.all())
   * listing = await subreddit.getSpam({ type: "post"});
   * console.log("Posts: ", await listing.all())
   * ```
   */
  getSpam(options: AboutSubredditOptions<'comment'>): Listing<Comment>;
  getSpam(options: AboutSubredditOptions<'post'>): Listing<Post>;
  getSpam(options?: AboutSubredditOptions<'all'>): Listing<Post | Comment>;
  getSpam(
    options: AboutSubredditOptions<AboutSubredditTypes> = { type: 'all' }
  ): Listing<Post | Comment> {
    return Subreddit.aboutLocation({
      ...options,
      location: AboutLocations.Spam,
      subreddit: this.#name,
    });
  }

  /**
   * Return a listing of things that have yet to be approved/removed by a mod.
   *
   * @param options
   *
   * @example
   * ```ts
   * const subreddit = await reddit.getSubredditByName("mysubreddit")
   * let listing = await subreddit.getUnmoderated();
   * console.log("Posts and Comments: ", await listing.all())
   * listing = await subreddit.getUnmoderated({ type: "post"});
   * console.log("Posts: ", await listing.all())
   * ```
   */
  getUnmoderated(options: AboutSubredditOptions<'comment'>): Listing<Comment>;
  getUnmoderated(options: AboutSubredditOptions<'post'>): Listing<Post>;
  getUnmoderated(options?: AboutSubredditOptions<'all'>): Listing<Post | Comment>;
  getUnmoderated(
    options: AboutSubredditOptions<AboutSubredditTypes> = { type: 'all' }
  ): Listing<Post | Comment> {
    return Subreddit.aboutLocation({
      ...options,
      location: AboutLocations.Unmoderated,
      subreddit: this.#name,
    });
  }

  /**
   * Return a listing of things that have been edited recently.
   *
   * @param options
   *
   * @example
   * ```ts
   * const subreddit = await reddit.getSubredditByName("mysubreddit")
   * let listing = await subreddit.getEdited();
   * console.log("Posts and Comments: ", await listing.all())
   * listing = await subreddit.getEdited({ type: "post"});
   * console.log("Posts: ", await listing.all())
   * ```
   */
  getEdited(options: AboutSubredditOptions<'comment'>): Listing<Comment>;
  getEdited(options: AboutSubredditOptions<'post'>): Listing<Post>;
  getEdited(options?: AboutSubredditOptions<'all'>): Listing<Post | Comment>;
  getEdited(
    options: AboutSubredditOptions<AboutSubredditTypes> = { type: 'all' }
  ): Listing<Post | Comment> {
    return Subreddit.aboutLocation({
      ...options,
      location: AboutLocations.Edited,
      subreddit: this.#name,
    });
  }

  /** @internal */
  static aboutLocation(
    options: AboutSubredditHelperOptions<AboutSubredditTypes>
  ): Listing<Post | Comment> {
    const client = getRedditApiPlugins().Moderation;
    let only: string | undefined;
    switch (options.type) {
      case 'post':
        only = 'links';
        break;
      case 'comment':
        only = 'comments';
        break;
      default:
        only = undefined;
    }

    return new Listing({
      ...options,
      fetch: async (fetchOptions) => {
        const listing = await client.AboutLocation(
          {
            ...fetchOptions,
            ...options,
            only,
          },
          this.#metadata
        );

        return parseListing(listing);
      },
    });
  }

  /**
   * Return a listing of things specified by their fullnames.
   *
   * @param ids Array of thing full ids (e.g. t3_abc123)
   * @example
   * ```ts
   * const subreddit = await reddit.getSubredditByName('askReddit');
   * const listing = subreddit.getCommentsAndPostsByIds(['t3_abc123', 't1_xyz123']);
   * const items = await listing.all();
   * console.log(items) // [Post, Comment]
   * ```
   */
  getCommentsAndPostsByIds(ids: string[]): Listing<Post | Comment> {
    const client = getRedditApiPlugins().LinksAndComments;

    return new Listing({
      fetch: async () => {
        const listing = await client.Info(
          { thingIds: ids, subreddits: [this.#id] },
          context.metadata
        );

        return parseListing(listing);
      },
    });
  }

  /** @internal */
  static async addRemovalReason(
    subredditName: string,
    title: string,
    message: string
  ): Promise<string> {
    const client = getRedditApiPlugins().Subreddits;

    const response = await client.SubredditAddRemovalReason(
      {
        title,
        message,
        subreddit: subredditName,
      },
      this.#metadata
    );

    return response.id;
  }

  /** @internal */
  static async getRemovalReasons(subredditName: string): Promise<RemovalReason[]> {
    const client = getRedditApiPlugins().Subreddits;

    const result = await client.SubredditGetRemovalReasons(
      {
        subreddit: subredditName,
      },
      this.#metadata
    );

    return result.order.map((id) => ({ ...result.data[id] }));
  }

  /** @internal */
  static async getFromMetadata(): Promise<Subreddit | undefined> {
    const subredditName = context.subredditName;
    if (subredditName) {
      return Subreddit.getByName(subredditName);
    }

    const subredditId = context.subredditId;
    assertNonNull<string | undefined>(subredditId);
    return Subreddit.getById(T5(subredditId));
  }

  /** @internal */
  static async getById(id: T5): Promise<Subreddit | undefined> {
    const subredditName = await getSubredditNameById(id);
    if (!subredditName) {
      return;
    }

    return Subreddit.getByName(subredditName);
  }

  /** @internal */
  static async getByName(subredditName: string): Promise<Subreddit> {
    const client = getRedditApiPlugins().Subreddits;

    const response = await client.SubredditAbout(
      {
        subreddit: subredditName,
      },
      this.#metadata
    );

    if (!response?.data) {
      throw new Error('not found');
    }

    return new Subreddit(response.data);
  }

  static get #metadata(): Metadata {
    return context.metadata;
  }
}

/**
 * Gets a {@link SubredditInfo} object by ID
 *
 * @param {string} subredditId - The ID (starting with t5_) of the subreddit to retrieve. e.g. t5_2qjpg
 * @returns {Promise<SubredditInfo>} A Promise that resolves a SubredditInfo object.
 */
export async function getSubredditInfoById(subredditId: T5): Promise<SubredditInfo> {
  const operationName = 'GetSubredditInfoById';
  const persistedQueryHash = '315a9b75c22a017d526afdf2d274616946156451aacfd56dfb91e7ad3f7a2fde';
  const response = await GraphQL.query(operationName, persistedQueryHash, { id: subredditId });

  const subredditInfo = response.data?.subredditInfoById;

  if (!subredditInfo) throw new Error('subreddit info not found');

  return subredditInfo;
}

/**
 * Gets a {@link SubredditInfo} object by name
 *
 * @param {string} subredditName The name of a subreddit omitting the r/. This is case-insensitive.
 * @returns {Promise<SubredditInfo>} A Promise that resolves a SubredditInfo object.
 */
export async function getSubredditInfoByName(subredditName: string): Promise<SubredditInfo> {
  const operationName = 'GetSubredditInfoByName';
  const persistedQueryHash = '4aa69726c7e3f5d33ab2bee22b3d74fce645824fddd5ea3ec6dfe30bdb4295cb';
  const response = await GraphQL.query(operationName, persistedQueryHash, { name: subredditName });

  const subredditInfo = response.data?.subredditInfoByName;

  if (!subredditInfo) throw new Error('subreddit info not found');

  return subredditInfo;
}

export async function getSubredditLeaderboard(subredditId: T5): Promise<SubredditLeaderboard> {
  const operationName = 'GetSubredditLeaderboard';
  const persistedQueryHash = '18ead70c46b6446d45ecd8b679b16d9a929a933d6ef25d8262a459cb18b72848';
  const response = await GraphQL.query(operationName, persistedQueryHash, { id: subredditId });

  const leaderboard = response.data?.subredditInfoById?.leaderboard;

  if (!leaderboard) throw new Error('subreddit leaderboard not found');
  if (!leaderboard.summary) throw new Error('subreddit leaderboard summary not found');

  return {
    id: leaderboard.id,
    summary: leaderboard.summary,
  };
}

export async function getSubredditStyles(subredditId: T5): Promise<SubredditStyles> {
  const operationName = 'GetSubredditStyles';
  const persistedQueryHash = 'd491d17ea8858f563ea578b26b9595d64adecf4bf34557d567c7e53c470f5f22';
  const response = await GraphQL.query(operationName, persistedQueryHash, { id: subredditId });

  const styles = response.data?.subredditInfoById?.styles;

  if (!styles) throw new Error('subreddit styles not found');

  return styles;
}

function asSubredditType(type?: string): SubredditType {
  if (
    type === 'public' ||
    type === 'private' ||
    type === 'restricted' ||
    type === 'employees_only' ||
    type === 'gold_only' ||
    type === 'gold_restricted' ||
    type === 'archived' ||
    type === 'user'
  ) {
    return type;
  }

  throw new Error(`invalid subreddit type: ${type}`);
}

function asAllowedPostType(type?: string): 'any' | 'link' | 'self' {
  if (type === 'any' || type === 'link' || type === 'self') {
    return type;
  }

  // Default to 'any' if no type is specified
  if (!type) {
    return 'any';
  }

  throw new Error(`invalid allowed post type: ${type}`);
}

function asCommentMediaTypes(type: string): CommentMediaTypes {
  if (type === 'animated' || type === 'giphy' || type === 'static' || type === 'expression') {
    return type;
  }

  throw new Error(`invalid comment media type: ${type}`);
}

function parseListing(listing: ProtoListing): ListingFetchResponse<Post | Comment> {
  const children = listing.data?.children ?? [];
  const postsAndComments: (Post | Comment)[] = children
    .map((child) => {
      const post = tryParseAsPost(child);
      if (post != null) {
        return post;
      }
      const comment = tryParseAsComment(child);
      if (comment != null) {
        return comment;
      }

      return null;
    })
    .filter(Boolean) as (Post | Comment)[];

  return {
    after: listing.data?.after,
    before: listing.data?.before,
    children: postsAndComments,
  };

  function tryParseAsPost(obj: WrappedRedditObject): Post | null {
    try {
      return new Post(obj.data!);
    } catch {
      return null;
    }
  }

  function tryParseAsComment(obj: WrappedRedditObject): Comment | null {
    try {
      return new Comment(obj.data!);
    } catch {
      return null;
    }
  }
}

/** @internal */
export async function getSubredditNameById(id: T5): Promise<string | undefined> {
  const client = getRedditApiPlugins().LinksAndComments;

  const response = await client.Info({ thingIds: [id], subreddits: [] }, context.metadata);
  return response.data?.children[0]?.data?.displayName;
}
