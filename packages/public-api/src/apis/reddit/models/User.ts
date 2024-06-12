import type {
  Listing as ListingProto,
  Metadata,
  UserDataByAccountIdsResponse,
  UserDataByAccountIdsResponse_UserAccountData,
  User as UserProto,
} from '@devvit/protos';
import { assertNonNull } from '@devvit/shared-types/NonNull.js';
import type { T2ID } from '@devvit/shared-types/tid.js';
import { asT2ID, isT2ID } from '@devvit/shared-types/tid.js';
import { Devvit } from '../../../devvit/Devvit.js';
import { GraphQL } from '../graphql/GraphQL.js';
import { makeGettersEnumerable } from '../helpers/makeGettersEnumerable.js';
import { formatModeratorPermissions, validModPermissions } from '../helpers/permissions.js';
import type { GetCommentsByUserOptions } from './Comment.js';
import { Comment } from './Comment.js';
import type { UserFlair } from './Flair.js';
import { Flair, convertUserFlairProtoToAPI } from './Flair.js';
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
  | 'chat_community';

export type CreateRelationshipOptions = {
  subredditName: string;
  username: string;
  type: RelationshipType;
  banContext?: string;
  banMessage?: string;
  banReason?: string;
  duration?: number;
  note?: string;
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

/**
 * A class representing a user.
 */
export class User {
  #id: T2ID;
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

  #metadata: Metadata | undefined;

  /**
   * @internal
   */
  constructor(
    data: UserProto & { modPermissions?: { [subredditName: string]: string[] } },
    metadata: Metadata | undefined
  ) {
    makeGettersEnumerable(this);

    assertNonNull(data.id, 'User ID is missing or undefined');
    assertNonNull(data.name, 'Username is missing or undefined');
    assertNonNull(data.createdUtc, 'User is missing created date');

    // UserDataByAccountIds returns the ID without the t2_ prefix
    this.#id = asT2ID(isT2ID(data.id) ? data.id : `t2_${data.id}`);
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

    this.#metadata = metadata;
  }

  /**
   * The ID (starting with t2_) of the user to retrieve.
   * @example 't2_1w72'
   */
  get id(): T2ID {
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

  /**
   * Whether the user is admin.
   */
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

    const mods = await User.getSubredditUsersByType(
      {
        subredditName,
        type: 'moderators',
        username: this.username,
      },
      this.#metadata
    ).all();

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
    return Comment.getCommentsByUser(
      {
        username: this.username,
        ...options,
      },
      this.#metadata
    );
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
    return Post.getPostsByUser(
      {
        username: this.username,
        ...options,
      },
      this.#metadata
    );
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
    const userFlairs = await Flair.getUserFlairBySubreddit(
      {
        subreddit,
        name: this.#username,
      },
      this.#metadata
    );
    return userFlairs.users[0] ? convertUserFlairProtoToAPI(userFlairs.users[0]) : undefined;
  }

  getSnoovatarUrl(): Promise<string | undefined> {
    return User.getSnoovatarUrl(this.username, this.#metadata);
  }

  /** @internal */
  static async getById(id: T2ID, metadata: Metadata | undefined): Promise<User | undefined> {
    const client = Devvit.redditAPIPlugins.Users;

    const response = await client.UserDataByAccountIds({ ids: id }, metadata);

    const username = response?.users?.[id]?.name;

    return username == null ? undefined : User.getByUsername(username, metadata);
  }

  /** @internal */
  static async getByUsername(username: string, metadata: Metadata | undefined): Promise<User> {
    const client = Devvit.redditAPIPlugins.Users;

    const response = await client.UserAbout(
      {
        username,
      },
      metadata
    );

    if (!response.data?.id) {
      throw new Error('failed to get user');
    }

    return new User(response.data, metadata);
  }

  /** @internal */
  static async getFromMetadata(
    key: string,
    metadata: Metadata | undefined
  ): Promise<User | undefined> {
    assertNonNull(metadata);
    const userId = metadata?.[key]?.values[0];
    return userId ? User.getById(asT2ID(userId), metadata) : Promise.resolve(undefined);
  }

  /** @internal */
  static getSubredditUsersByType(
    options: GetSubredditUsersByTypeOptions,
    metadata: Metadata | undefined
  ): Listing<User> {
    const client = Devvit.redditAPIPlugins.Subreddits;

    return new Listing({
      hasMore: true,
      pageSize: options.pageSize,
      limit: options.limit,
      after: options.after,
      before: options.before,
      fetch: async (fetchOptions: ListingFetchOptions) => {
        const response = await client.AboutWhere(
          {
            where: options.type,
            user: options.username,
            subreddit: options.subredditName,
            show: 'all',
            ...fetchOptions,
          },
          metadata
        );

        return listingProtosToUsers(response, options.subredditName, metadata);
      },
    });
  }

  /** @internal */
  static async createRelationship(
    options: CreateRelationshipOptions,
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.Users;

    const { type, subredditName, username, permissions, ...optionalFields } = options;

    const response = await client.Friend(
      {
        type,
        subreddit: subredditName,
        name: username,
        permissions: permissions ? formatModeratorPermissions(permissions) : undefined,
        ...optionalFields,
      },
      metadata
    );

    if (response.json?.errors?.length) {
      throw new Error(response.json.errors.join('\n'));
    }
  }

  /** @internal */
  static async removeRelationship(
    options: RemoveRelationshipOptions,
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.Users;

    await client.Unfriend(
      {
        type: options.type,
        subreddit: options.subredditName,
        name: options.username,
      },
      metadata
    );
  }

  /** @internal */
  static async setModeratorPermissions(
    username: string,
    subredditName: string,
    permissions: ModeratorPermission[],
    metadata: Metadata | undefined
  ): Promise<void> {
    const client = Devvit.redditAPIPlugins.Users;

    const response = await client.SetPermissions(
      {
        subreddit: subredditName,
        name: username,
        type: 'moderator',
        permissions: formatModeratorPermissions(permissions),
      },
      metadata
    );

    if (response.json?.errors?.length) {
      throw new Error(response.json.errors.join('\n'));
    }
  }

  /** @internal */
  static async getSnoovatarUrl(
    username: string,
    metadata: Metadata | undefined
  ): Promise<string | undefined> {
    const operationName = 'GetSnoovatarUrlByName';
    const persistedQueryHash = 'c47fd42345af268616d2d8904b56856acdc05cf61d3650380f539ad7d596ac0c';
    const response = await GraphQL.query(operationName, persistedQueryHash, { username }, metadata);
    return response.data?.redditorInfoByName?.snoovatarIcon?.url;
  }

  /** @internal */
  static getOverview(
    options: GetUserOverviewOptions,
    metadata: Metadata | undefined
  ): Listing<Post | Comment> {
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
            where: 'overview',
            ...fetchOptions,
          },
          metadata
        );

        return listingProtosToPostsOrComments(response, metadata);
      },
    });
  }
}

function listingProtosToPostsOrComments(
  listingProto: ListingProto,
  metadata: Metadata | undefined
): ListingFetchResponse<Post | Comment> {
  if (!listingProto.data?.children) {
    throw new Error('Listing response is missing children');
  }

  const children = listingProto.data.children.map((child) => {
    if (child.kind === 't3') {
      return new Post(child.data!, metadata);
    } else if (child.kind === 't1') {
      return new Comment(child.data!, metadata);
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
  subredditName: string,
  metadata: Metadata | undefined
): Promise<ListingFetchResponse<User>> {
  const client = Devvit.redditAPIPlugins.Users;

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
        metadata
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

    return new User(
      {
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
      },
      metadata
    );
  });

  return {
    children,
    before: listingProto.data.before,
    after: listingProto.data.after,
  };
}
