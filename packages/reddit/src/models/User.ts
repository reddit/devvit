import type {
  GetUserKarmaForSubredditResponse,
  UserDataByAccountIdsResponse,
  UserDataByAccountIdsResponse_UserAccountData,
} from '@devvit/protos/json/devvit/plugin/redditapi/users/users_msg.js';
import type { User as UserProto } from '@devvit/protos/json/devvit/reddit/user.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';
// eslint-disable-next-line no-restricted-imports
import type { Listing as ListingProto } from '@devvit/protos/types/devvit/plugin/redditapi/common/common_msg.js';
import { context } from '@devvit/server';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import { isT2, T2 } from '@devvit/shared-types/tid.js';

import { GraphQL } from '../graphql/GraphQL.js';
import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';
import { formatModeratorPermissions, validModPermissions } from '../helpers/permissions.js';
import { getRedditApiPlugins } from '../plugin.js';
import type { GetCommentsByUserOptions } from './Comment.js';
import { Comment } from './Comment.js';
import type { UserFlair } from './Flair.js';
import { convertUserFlairProtoToAPI, Flair } from './Flair.js';
import type { ListingFetchOptions, ListingFetchResponse } from './Listing.js';
import { Listing } from './Listing.js';
import type { GetPostsByUserOptions } from './Post.js';
import { Post } from './Post.js';

export type GetSubredditUsersByTypeOptions = ListingFetchOptions & {
  subredditName: string;
  type: 'banned' | 'muted' | 'wikibanned' | 'contributors' | 'wikicontributors' | 'moderators';
  username?: string;
};

export type RelationshipType =
  | 'moderator_invite'
  | 'contributor'
  | 'banned'
  | 'muted'
  | 'wikibanned'
  | 'wikicontributor';

export type ModeratorPermission =
  | 'all'
  | 'wiki'
  | 'posts'
  | 'access'
  | 'mail'
  | 'config'
  | 'flair'
  | 'chat_operator'
  | 'chat_config'
  | 'channels'
  | 'community_chat';

export type CreateRelationshipOptions = {
  subredditName: string;
  username: string;
  type: RelationshipType;
  /** The ID of the post or comment that caused the ban. */
  banContext?: string | undefined;
  banMessage?: string | undefined;
  banReason?: string | undefined;
  duration?: number | undefined;
  note?: string | undefined;
  permissions?: ModeratorPermission[];
};

export type RemoveRelationshipOptions = {
  subredditName: string;
  username: string;
  type: RelationshipType | 'moderator';
};

export type BanUserOptions = {
  username: string;
  subredditName: string;
  context?: string;
  message?: string;
  reason?: string;
  duration?: number;
  note?: string;
};

export type BanWikiContributorOptions = {
  username: string;
  subredditName: string;
  reason?: string;
  duration?: number;
  note?: string;
};

export type GetUserOverviewOptions = {
  username: string;
  sort?: 'hot' | 'new' | 'top' | 'controversial';
  timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  pageSize?: number;
  limit?: number;
  after?: string;
  before?: string;
};

export const enum SocialLinkType {
  Custom = 'CUSTOM',
  Reddit = 'REDDIT',
  Instagram = 'INSTAGRAM',
  Twitter = 'TWITTER',
  Tiktok = 'TIKTOK',
  Twitch = 'TWITCH',
  Facebook = 'FACEBOOK',
  Youtube = 'YOUTUBE',
  Tumblr = 'TUMBLR',
  Spotify = 'SPOTIFY',
  Soundcloud = 'SOUNDCLOUD',
  Beacons = 'BEACONS',
  Linktree = 'LINKTREE',
  Discord = 'DISCORD',
  Venmo = 'VENMO',
  CashApp = 'CASH_APP',
  Patreon = 'PATREON',
  Kofi = 'KOFI',
  Paypal = 'PAYPAL',
  Cameo = 'CAMEO',
  Onlyfans = 'ONLYFANS',
  Substack = 'SUBSTACK',
  Kickstarter = 'KICKSTARTER',
  Indiegogo = 'INDIEGOGO',
  BuyMeACoffee = 'BUY_ME_A_COFFEE',
  Shopify = 'SHOPIFY',
}

/**
 * @field id: ID of the social link.
 *
 * @field handle: Display name of social media link.
 *
 * @field outboundUrl: Outbound url of social media link.
 *
 * @field type: Type of social media link i.e. Instagram, YouTube.
 *
 * @field title: Title or name of social media link.
 */
export type UserSocialLink = {
  id: string;
  handle?: string;
  outboundUrl: string;
  type: SocialLinkType;
  title: string;
};

/**
 * @internal
 */
type UserSocialLinkResponse = Omit<UserSocialLink, 'handle'> & { handle: string | null };

/**
 * A class representing a user.
 */
export class User {
  #id: T2;
  #username: string;
  #createdAt: Date;
  #linkKarma: number;
  #commentKarma: number;
  #nsfw: boolean;
  #isAdmin: boolean;
  #modPermissionsBySubreddit: Map<string, ModeratorPermission[]> = new Map();
  // R2 bug: user.url is a permalink path
  #url: string;
  // R2 bug: user object does not contain a permalink field
  #permalink: string;
  #hasVerifiedEmail: boolean;
  #displayName: string;
  #about: string;

  /**
   * @internal
   */
  constructor(data: UserProto & { modPermissions?: { [subredditName: string]: string[] } }) {
    makeGettersEnumerable(this);

    assertNonNull(data.id, 'User ID is missing or undefined');
    assertNonNull(data.name, 'Username is missing or undefined');
    assertNonNull(data.createdUtc, 'User is missing created date');

    // UserDataByAccountIds returns the ID without the t2_ prefix
    this.#id = T2(isT2(data.id) ? data.id : `t2_${data.id}`);
    this.#username = data.name;
    this.#nsfw = data.over18 ?? false;
    this.#isAdmin = data.isEmployee ?? false;

    const createdAt = new Date(0);
    createdAt.setUTCSeconds(data.createdUtc);
    this.#createdAt = createdAt;

    this.#linkKarma = data.linkKarma ?? 0;
    this.#commentKarma = data.commentKarma ?? 0;

    if (data.modPermissions) {
      for (const [subredditName, permissions] of Object.entries(data.modPermissions)) {
        this.#modPermissionsBySubreddit.set(subredditName, validModPermissions(permissions));
      }
    }

    this.#url = new URL(data.subreddit?.url ?? '', 'https://www.reddit.com').toString();
    this.#permalink = data.subreddit?.url ?? '';
    this.#hasVerifiedEmail = data.hasVerifiedEmail ?? false;

    this.#displayName = data.subreddit?.title ?? this.#username;
    this.#about = data.subreddit?.publicDescription ?? '';
  }

  /**
   * The ID (starting with t2_) of the user to retrieve.
   * @example 't2_1w72'
   */
  get id(): T2 {
    return this.#id;
  }

  /**
   * The username of the user omitting the u/.
   * @example 'spez'
   */
  get username(): string {
    return this.#username;
  }

  /**
   * The date the user was created.
   */
  get createdAt(): Date {
    return this.#createdAt;
  }

  /**
   * The amount of link karma the user has.
   */
  get linkKarma(): number {
    return this.#linkKarma;
  }

  /**
   * The amount of comment karma the user has.
   */
  get commentKarma(): number {
    return this.#commentKarma;
  }

  /**
   * Whether the user's profile is marked as NSFW (Not Safe For Work).
   */
  get nsfw(): boolean {
    return this.#nsfw;
  }

  /** Whether the user is a Reddit employee. */
  get isAdmin(): boolean {
    return this.#isAdmin;
  }

  /**
   * The permissions the user has on the subreddit.
   */
  get modPermissions(): Map<string, ModeratorPermission[]> {
    return this.#modPermissionsBySubreddit;
  }

  /**
   * Returns the HTTP URL for the user
   */
  get url(): string {
    return this.#url;
  }

  /**
   * Returns a permalink path relative to https://www.reddit.com
   */
  get permalink(): string {
    return this.#permalink;
  }

  /**
   * Indicates whether or not the user has verified their email address.
   */
  get hasVerifiedEmail(): boolean {
    return this.#hasVerifiedEmail;
  }

  /**
   * The display name of the user. May be different from their username.
   */
  get displayName(): string {
    return this.#displayName;
  }

  /**
   * The user's public description about themselves. May be empty.
   */
  get about(): string {
    return this.#about;
  }

  toJSON(): Pick<User, 'id' | 'username' | 'createdAt' | 'linkKarma' | 'commentKarma' | 'nsfw'> & {
    modPermissionsBySubreddit: Record<string, ModeratorPermission[]>;
  } {
    return {
      id: this.id,
      username: this.username,
      createdAt: this.createdAt,
      linkKarma: this.linkKarma,
      commentKarma: this.commentKarma,
      nsfw: this.nsfw,
      modPermissionsBySubreddit: Object.fromEntries(this.modPermissions),
    };
  }

  /**
   * Get the mod permissions the user has on the subreddit if they are a moderator.
   *
   * @param subredditName - name of the subreddit
   * @returns the moderator permissions the user has on the subreddit
   */
  async getModPermissionsForSubreddit(subredditName: string): Promise<ModeratorPermission[]> {
    if (this.#modPermissionsBySubreddit.has(subredditName)) {
      return this.#modPermissionsBySubreddit.get(subredditName)!;
    }

    const mods = await User.getSubredditUsersByType({
      subredditName,
      type: 'moderators',
      username: this.username,
    }).all();

    if (mods.length === 0) {
      return [];
    }

    const permissions = mods[0].modPermissions.get(subredditName) ?? [];

    if (permissions.length > 0) {
      this.#modPermissionsBySubreddit.set(subredditName, permissions);
    }

    return permissions;
  }

  /**
   * Get the user's comments.
   *
   * @param options - Options for the request
   * @param options.sort - The sort order of the comments. e.g. 'new'
   * @param options.timeframe - The timeframe of the comments. e.g. 'all'
   * @param options.limit - The maximum number of comments to return. e.g. 1000
   * @param options.pageSize - The number of comments to return per request. e.g. 100
   * @returns A Listing of Comment objects.
   */
  getComments(options: Omit<GetCommentsByUserOptions, 'username'>): Listing<Comment> {
    return Comment.getCommentsByUser({
      username: this.username,
      ...options,
    });
  }

  /**
   * Get the user's posts.
   *
   * @param options - Options for the request
   * @param options.sort - The sort order of the posts. e.g. 'new'
   * @param options.timeframe - The timeframe of the posts. e.g. 'all'
   * @param options.limit - The maximum number of posts to return. e.g. 1000
   * @param options.pageSize - The number of posts to return per request. e.g. 100
   * @returns A Listing of Post objects.
   */
  getPosts(options: Omit<GetPostsByUserOptions, 'username'>): Listing<Post> {
    return Post.getPostsByUser({
      username: this.username,
      ...options,
    });
  }

  /**
   * Retrieve the user's flair for the subreddit.
   *
   * @param subreddit - The name of the subreddit associated with the user's flair.
   *
   * @example
   * ```ts
   * const username = "badapple"
   * const subredditName = "mysubreddit"
   * const user = await reddit.getUserByUsername(username);
   * const userFlair = await user.getUserFlairBySubreddit(subredditName);
   * ```
   */
  async getUserFlairBySubreddit(subreddit: string): Promise<UserFlair | undefined> {
    const userFlairs = await Flair.getUserFlairBySubreddit({
      subreddit,
      name: this.#username,
    });
    return userFlairs.users[0] ? convertUserFlairProtoToAPI(userFlairs.users[0]) : undefined;
  }

  getSnoovatarUrl(): Promise<string | undefined> {
    return User.getSnoovatarUrl(this.username);
  }

  /**
   * Gets social links of the user
   *
   * @returns A Promise that resolves an Array of UserSocialLink objects
   * @example
   * ```ts
   * const socialLinks = await user.getSocialLinks();
   * ```
   */
  async getSocialLinks(): Promise<UserSocialLink[]> {
    const operationName = 'GetUserSocialLinks';
    const persistedQueryHash = '2aca18ef5f4fc75fb91cdaace3e9aeeae2cb3843b5c26ad511e6f01b8521593a';
    // Legacy GQL query. Do not copy this pattern.
    // eslint-disable-next-line no-restricted-properties
    const response = await GraphQL.query(operationName, persistedQueryHash, {
      name: this.username,
    });

    if (!response.data?.user?.profile?.socialLinks) {
      return [];
    }

    return response.data.user.profile.socialLinks.map((link: UserSocialLinkResponse) => ({
      ...link,
      handle: link.handle ?? undefined,
    }));
  }

  /**
   * Returns the karma for this User in the current subreddit.
   *
   * @returns The GetUserKarmaForSubredditResponse, containing the user's karma for comments and posts in the subreddit.
   */
  async getUserKarmaFromCurrentSubreddit(): Promise<GetUserKarmaForSubredditResponse> {
    return await getRedditApiPlugins().Users.GetUserKarmaForSubreddit({
      username: this.username,
      subredditId: context.subredditId,
    });
  }

  /** @internal */
  static async getById(id: T2): Promise<User | undefined> {
    const username = await getUsernameById(id);

    return username == null ? undefined : User.getByUsername(username);
  }

  /** @internal */
  static async getByUsername(username: string): Promise<User | undefined> {
    const client = getRedditApiPlugins().Users;
    try {
      const response = await client.UserAbout({ username }, this.#metadata);
      // suspended accounts 404.
      if (response.data?.id) return new User(response.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404 Not Found')) {
        return undefined;
      }
      throw error;
    }
  }

  /** @internal */
  static getSubredditUsersByType(options: GetSubredditUsersByTypeOptions): Listing<User> {
    const client = getRedditApiPlugins().Subreddits;

    return new Listing({
      hasMore: true,
      pageSize: options.pageSize,
      limit: options.limit,
      after: options.after,
      before: options.before,
      fetch: async (fetchOptions: ListingFetchOptions) => {
        const response = await client.AboutWhere({
          where: options.type,
          user: options.username,
          subreddit: options.subredditName,
          show: 'all',
          ...fetchOptions,
        });

        return listingProtosToUsers(response, options.subredditName);
      },
    });
  }

  /** @internal */
  static async createRelationship(options: CreateRelationshipOptions): Promise<void> {
    const client = getRedditApiPlugins().Users;

    const { type, subredditName, username, permissions, ...optionalFields } = options;

    const response = await client.Friend(
      {
        type,
        subreddit: subredditName,
        name: username,
        permissions: permissions ? formatModeratorPermissions(permissions) : undefined,
        ...optionalFields,
      },
      this.#metadata
    );

    if (response.json?.errors?.length) {
      throw new Error(response.json.errors.join('\n'));
    }
  }

  /** @internal */
  static async removeRelationship(options: RemoveRelationshipOptions): Promise<void> {
    const client = getRedditApiPlugins().Users;

    await client.Unfriend(
      {
        type: options.type,
        subreddit: options.subredditName,
        name: options.username,
      },
      this.#metadata
    );
  }

  /** @internal */
  static async setModeratorPermissions(
    username: string,
    subredditName: string,
    permissions: ModeratorPermission[]
  ): Promise<void> {
    const client = getRedditApiPlugins().Users;

    const response = await client.SetPermissions(
      {
        subreddit: subredditName,
        name: username,
        type: 'moderator',
        permissions: formatModeratorPermissions(permissions),
      },
      this.#metadata
    );

    if (response.json?.errors?.length) {
      throw new Error(response.json.errors.join('\n'));
    }
  }

  /** @internal */
  static async getSnoovatarUrl(username: string): Promise<string | undefined> {
    // Check if snoovatar for current user is available in the context
    const currentUsername = context.username;
    if (currentUsername && username === currentUsername) {
      const snoovatarUrl = context.snoovatar;
      if (snoovatarUrl) {
        return snoovatarUrl;
      }
    }

    // If not, query the API for the snoovatar URL
    const operationName = 'GetSnoovatarUrlByName';
    const persistedQueryHash = 'c47fd42345af268616d2d8904b56856acdc05cf61d3650380f539ad7d596ac0c';
    // Legacy GQL query. Do not copy this pattern.
    // eslint-disable-next-line no-restricted-properties
    const response = await GraphQL.query(operationName, persistedQueryHash, { username });
    return response.data?.redditorInfoByName?.snoovatarIcon?.url;
  }

  /** @internal */
  static getOverview(options: GetUserOverviewOptions): Listing<Post | Comment> {
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
            where: 'overview',
            ...fetchOptions,
          },
          this.#metadata
        );

        return listingProtosToPostsOrComments(response);
      },
    });
  }

  /** @internal */
  static async getUserKarmaFromCurrentSubreddit(
    username: string
  ): Promise<GetUserKarmaForSubredditResponse> {
    return await getRedditApiPlugins().Users.GetUserKarmaForSubreddit({
      username: username,
      subredditId: context.subredditId,
    });
  }

  static get #metadata(): Metadata {
    return context.metadata;
  }
}

function listingProtosToPostsOrComments(
  listingProto: ListingProto
): ListingFetchResponse<Post | Comment> {
  if (!listingProto.data?.children) {
    throw new Error('Listing response is missing children');
  }

  const children = listingProto.data.children.map((child) => {
    if (child.kind === 't3') {
      return new Post(child.data!);
    } else if (child.kind === 't1') {
      return new Comment(child.data!);
    }

    throw new Error(`Type ${child.kind} is not supported`);
  });

  return {
    children: children,
    before: listingProto.data.before,
    after: listingProto.data.after,
  };
}

async function listingProtosToUsers(
  listingProto: ListingProto,
  subredditName: string
): Promise<ListingFetchResponse<User>> {
  const client = getRedditApiPlugins().Users;

  if (!listingProto.data?.children) {
    throw new Error('Listing response is missing children');
  }

  const userIds = listingProto.data.children.map((child) => {
    assertNonNull(child.data?.id, 'User id is still from listing data');
    return child.data.id;
  });

  // break the ids into chunks since they're passed over a query parameter
  const chunkSize = 100;
  const userIdChunks = [];
  for (let i = 0; i < userIds.length; i += chunkSize) {
    userIdChunks.push(userIds.slice(i, i + chunkSize));
  }

  // perform the requests
  const usersMapResponses: UserDataByAccountIdsResponse[] = await Promise.all(
    userIdChunks.map((userIds) =>
      client.UserDataByAccountIds(
        {
          ids: userIds.join(','),
        },
        context.metadata
      )
    )
  );

  // join the responses back into a single map of user data
  const userDataById: { [key: string]: UserDataByAccountIdsResponse_UserAccountData } =
    usersMapResponses.reduce((allUsers, response) => ({ ...allUsers, ...response.users }), {});

  const children = listingProto.data.children.map((child) => {
    const id = child.data?.id;
    assertNonNull(id, 'User id is missing from listing');

    const userData = userDataById[id];

    // Casting to unknown because Typescript assumes that userData is always defined
    // because of how we defined the UserDataByAccountIdsResponse_UserAccountData protobuf.
    assertNonNull(userData as unknown, 'User data is missing from response');

    return new User({
      id,
      name: userData.name,
      linkKarma: userData.linkKarma,
      commentKarma: userData.commentKarma,
      createdUtc: userData.createdUtc,
      over18: userData.profileOver18,
      snoovatarSize: [],
      modPermissions: {
        [subredditName]: child.data?.modPermissions ?? [],
      },
    });
  });

  return {
    children,
    before: listingProto.data.before,
    after: listingProto.data.after,
  };
}

/** @internal */
async function getUsernameById(id: T2): Promise<string | undefined> {
  // Check if username for current user is available in the context
  if (context.username && context.userId === id) {
    return context.username;
  }

  // If not, query the API for the username
  const client = getRedditApiPlugins().Users;

  const response = await client.UserDataByAccountIds({ ids: id }, context.metadata);

  return response?.users?.[id]?.name;
}
