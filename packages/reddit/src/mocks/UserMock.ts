import type { Empty, JsonStatus, Listing, Metadata, Users } from '@devvit/protos';
import type { BoolValue } from '@devvit/protos/community.js';
import type {
  BlockUserRequest,
  BlockUserResponse,
  FriendRequest,
  GeneralFriendResponse,
  GenericUsersRequest,
  GetUserKarmaForSubredditRequest,
  GetUserKarmaForSubredditResponse,
  ReportUserRequest,
  SetPermissionsRequest,
  UnfriendRequest,
  UpdateFriendRelationshipRequest,
  UserAboutRequest,
  UserAboutResponse,
  UserDataByAccountIdsRequest,
  UserDataByAccountIdsResponse,
  UserDataByAccountIdsResponse_UserAccountData,
  UsernameAvailableRequest,
  UserTrophiesResponse,
  UserWhereRequest,
} from '@devvit/protos/types/devvit/plugin/redditapi/users/users_msg.js';
import type { User } from '@devvit/protos/types/devvit/reddit/user.js';
import type { PluginMock } from '@devvit/shared-types/test/index.js';
import { isT2, T2 } from '@devvit/shared-types/tid.js';

type Username = string;

type UserStore = {
  users: Map<Username, User>;
};

export class UserPluginMock implements Users {
  private readonly _store: UserStore;

  constructor(store: UserStore) {
    this._store = store;
  }

  async UserAbout(request: UserAboutRequest, _metadata?: Metadata): Promise<UserAboutResponse> {
    const user = this._store.users.get(request.username);
    if (!user) {
      // Simulate 404
      throw new Error('HTTP 404 Not Found');
    }
    return { data: user };
  }

  async UserDataByAccountIds(
    request: UserDataByAccountIdsRequest,
    _metadata?: Metadata
  ): Promise<UserDataByAccountIdsResponse> {
    const ids = request.ids.split(',');
    const responseUsers: { [key: string]: UserDataByAccountIdsResponse_UserAccountData } = {};

    for (const id of ids) {
      const targetId = T2(isT2(id) ? id : `t2_${id}`);
      const user = Array.from(this._store.users.values()).find((u) => {
        if (!u.id) {
          return false;
        }
        const uId = T2(isT2(u.id) ? u.id : `t2_${u.id}`);
        return uId === targetId;
      });

      if (user) {
        // The protobuf expects a specific structure for UserAccountData
        responseUsers[id] = {
          name: user.name,
          createdUtc: user.createdUtc,
          linkKarma: user.linkKarma,
          commentKarma: user.commentKarma,
          profileOver18: user.over18,
        };
      }
    }

    return { users: responseUsers };
  }

  async BlockUser(_request: BlockUserRequest, _metadata?: Metadata): Promise<BlockUserResponse> {
    throw new Error(
      `Reddit API method Users.BlockUser is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Friend(_request: FriendRequest, _metadata?: Metadata): Promise<JsonStatus> {
    throw new Error(
      `Reddit API method Users.Friend is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async GetFriendInformation(
    _request: GenericUsersRequest,
    _metadata?: Metadata
  ): Promise<GeneralFriendResponse> {
    throw new Error(
      `Reddit API method Users.GetFriendInformation is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async GetUserKarmaForSubreddit(
    _request: GetUserKarmaForSubredditRequest,
    _metadata?: Metadata
  ): Promise<GetUserKarmaForSubredditResponse> {
    throw new Error(
      `Reddit API method Users.GetUserKarmaForSubreddit is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async ReportUser(_request: ReportUserRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method Users.ReportUser is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async SetPermissions(_request: SetPermissionsRequest, _metadata?: Metadata): Promise<JsonStatus> {
    throw new Error(
      `Reddit API method Users.SetPermissions is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async Unfriend(_request: UnfriendRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method Users.Unfriend is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async UnfriendUser(_request: GenericUsersRequest, _metadata?: Metadata): Promise<Empty> {
    throw new Error(
      `Reddit API method Users.UnfriendUser is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async UpdateFriendRelationship(
    _request: UpdateFriendRelationshipRequest,
    _metadata?: Metadata
  ): Promise<GeneralFriendResponse> {
    throw new Error(
      `Reddit API method Users.UpdateFriendRelationship is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async UserTrophies(
    _request: GenericUsersRequest,
    _metadata?: Metadata
  ): Promise<UserTrophiesResponse> {
    throw new Error(
      `Reddit API method Users.UserTrophies is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async UserWhere(_request: UserWhereRequest, _metadata?: Metadata): Promise<Listing> {
    throw new Error(
      `Reddit API method Users.UserWhere is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }

  async UsernameAvailable(
    _request: UsernameAvailableRequest,
    _metadata?: Metadata
  ): Promise<BoolValue> {
    throw new Error(
      `Reddit API method Users.UsernameAvailable is not implemented in the test harness.\n` +
        `For more information, visit https://developers.reddit.com/docs/guides/tools/devvit_test`
    );
  }
}

export class UserMock implements PluginMock<Users> {
  readonly plugin: UserPluginMock;
  private readonly _store: UserStore;

  constructor() {
    this._store = {
      users: new Map(),
    };
    this.plugin = new UserPluginMock(this._store);
  }

  /**
   * Seeds the mock database with a User.
   * This allows tests to set up state before calling `reddit.getUserByUsername`.
   */
  addUser(data: Omit<Partial<User>, 'id'> & { name: string; id: T2 }): User {
    const user: User = {
      createdUtc: data.createdUtc ?? Math.floor(Date.now() / 1000),
      linkKarma: data.linkKarma ?? 0,
      commentKarma: data.commentKarma ?? 0,
      hasVerifiedEmail: data.hasVerifiedEmail ?? false,
      isEmployee: data.isEmployee ?? false,
      isMod: data.isMod ?? false,
      isGold: data.isGold ?? false,
      isSuspended: data.isSuspended ?? false,
      over18: data.over18 ?? false,
      iconImg: data.iconImg ?? '',
      subreddit: data.subreddit,
      snoovatarImg: data.snoovatarImg ?? '',
      awardeeKarma: data.awardeeKarma ?? 0,
      awarderKarma: data.awarderKarma ?? 0,
      totalKarma: data.totalKarma ?? 0,
      acceptFollowers: data.acceptFollowers ?? true,
      prefShowSnoovatar: data.prefShowSnoovatar ?? true,
      snoovatarSize: data.snoovatarSize ?? [],
      ...data,
      id: data.id.replace(/^t2_/, ''),
    };

    this._store.users.set(data.name, user);

    return user;
  }
}
