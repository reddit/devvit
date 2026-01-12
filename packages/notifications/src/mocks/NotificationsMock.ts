import { type Metadata } from '@devvit/protos';
import {
  type DismissGamesDrawerBadgeRequest,
  type DismissGamesDrawerBadgeResponse,
  type GetGamesDrawerBadgeStatusRequest,
  type GetGamesDrawerBadgeStatusResponse,
  type ShowGamesDrawerBadgeRequest,
  type ShowGamesDrawerBadgeResponse,
} from '@devvit/protos/types/devvit/plugin/notifications/gamesdrawerbadge_msg.js';
import type { Notifications } from '@devvit/protos/types/devvit/plugin/notifications/notifications_svc.js';
import {
  type IsOptedInRequest,
  type IsOptedInResponse,
  type ListOptedInUsersRequest,
  type ListOptedInUsersResponse,
  type OptInCurrentUserResponse,
  type OptOutCurrentUserResponse,
} from '@devvit/protos/types/devvit/plugin/notifications/optin_msg.js';
import {
  type EnqueueError,
  type EnqueueRequest,
  type EnqueueResponse,
} from '@devvit/protos/types/devvit/plugin/notifications/pushnotif_msg.js';
import { Empty } from '@devvit/protos/types/google/protobuf/empty.js';
import { Header } from '@devvit/shared-types/Header.js';
import type { PluginMock } from '@devvit/shared-types/test/index.js';
import { isT1, isT2, isT3, T2, T3 } from '@devvit/shared-types/tid.js';

type BadgeState = {
  post: T3;
  expiresAt?: Date;
};

type NotificationStore = {
  optedInUsers: Set<T2>;
  notifications: EnqueueRequest[];
  badge: BadgeState | undefined;
};

export class NotificationsPluginMock implements Notifications {
  private readonly _store: NotificationStore;

  constructor(store: NotificationStore) {
    this._store = store;
  }

  private _getUserId(metadata?: Metadata): string | undefined {
    if (!metadata) return undefined;

    const val = metadata[Header.User];
    return val?.values?.[0] ?? undefined;
  }

  async OptInCurrentUser(_request: Empty, metadata?: Metadata): Promise<OptInCurrentUserResponse> {
    const userId = this._getUserId(metadata);
    if (userId) {
      this._store.optedInUsers.add(T2(userId));
    }
    return { success: true, message: '' };
  }

  async OptOutCurrentUser(
    _request: Empty,
    metadata?: Metadata
  ): Promise<OptOutCurrentUserResponse> {
    const userId = this._getUserId(metadata);
    if (userId) {
      this._store.optedInUsers.delete(T2(userId));
    }
    return { success: true, message: '' };
  }

  async ListOptedInUsers(
    request: ListOptedInUsersRequest,
    _metadata?: Metadata
  ): Promise<ListOptedInUsersResponse> {
    const users = Array.from(this._store.optedInUsers);
    let result = users;

    if (request.after) {
      const idx = result.indexOf(T2(request.after));
      if (idx !== -1) {
        result = result.slice(idx + 1);
      } else {
        result = [];
      }
    }

    const limit = request.limit ?? 1000;
    const page = result.slice(0, limit);
    const next = result.length > limit ? page.at(-1) : undefined;

    return { userIds: page, next };
  }

  async IsOptedIn(request: IsOptedInRequest, _metadata?: Metadata): Promise<IsOptedInResponse> {
    return { optedIn: this._store.optedInUsers.has(T2(request.userId)) };
  }

  async Enqueue(request: EnqueueRequest, _metadata?: Metadata): Promise<EnqueueResponse> {
    if ((request.recipients?.length ?? 0) === 0) {
      throw new Error('recipients list cannot be empty');
    }
    if (!request.title) {
      throw new Error('title is required');
    }
    if (!request.body) {
      throw new Error('body is required');
    }
    if (request.title.length > 60) {
      throw new Error('title exceeds maximum length of 60 characters');
    }
    if (request.body.length > 100) {
      throw new Error('body exceeds maximum length of 100 characters');
    }

    const errors: EnqueueError[] = [];
    const successfulRecipients: typeof request.recipients = [];

    for (const recipient of request.recipients) {
      const recipientUserId = recipient.userId ?? '';
      if (!recipientUserId) {
        errors.push({ userId: recipientUserId, message: 'recipient_id is required' });
        continue;
      }

      const hasComment = !!recipient.comment;
      const hasPost = !!recipient.post;
      if (!hasComment && !hasPost) {
        errors.push({ userId: recipientUserId, message: 'thing must be provided for recipient' });
        continue;
      }
      if (hasComment && !isT1(recipient.comment!)) {
        errors.push({
          userId: recipientUserId,
          message: "comment must be provided and start with 't1_'",
        });
        continue;
      }
      if (hasPost && !isT3(recipient.post!)) {
        errors.push({
          userId: recipientUserId,
          message: "post must be provided and start with 't3_'",
        });
        continue;
      }
      if (hasComment && hasPost) {
        errors.push({
          userId: recipientUserId,
          message: 'either comment or post must be provided',
        });
        continue;
      }

      // Mirror backend behavior: per-recipient opt-in is required.
      // The mock stores opted-in users as `t2_...` IDs, so only enforce for valid account IDs.
      if (!isT2(recipientUserId) || !this._store.optedInUsers.has(T2(recipientUserId))) {
        errors.push({
          userId: recipientUserId,
          message: 'user has not opted in to receive push notifications',
        });
        continue;
      }

      successfulRecipients.push(recipient);
    }

    if (successfulRecipients.length > 0) {
      this._store.notifications.push({
        ...request,
        recipients: successfulRecipients,
      });
    }

    return {
      successCount: successfulRecipients.length,
      failureCount: errors.length,
      errors,
      timestamp: Date.now(),
    };
  }

  async ShowGamesDrawerBadge(
    request: ShowGamesDrawerBadgeRequest,
    _metadata?: Metadata
  ): Promise<ShowGamesDrawerBadgeResponse> {
    this._store.badge = {
      post: T3(request.post),
    };
    return { success: true };
  }

  async DismissGamesDrawerBadge(
    _request: DismissGamesDrawerBadgeRequest,
    _metadata?: Metadata
  ): Promise<DismissGamesDrawerBadgeResponse> {
    this._store.badge = undefined;
    return { success: true };
  }

  async GetGamesDrawerBadgeStatus(
    _request: GetGamesDrawerBadgeStatusRequest,
    _metadata?: Metadata
  ): Promise<GetGamesDrawerBadgeStatusResponse> {
    const badge = this._store.badge;
    if (badge) {
      return {
        hasActiveBadge: true,
        // expiresAt: badge.expiresAt // TODO: Handle expiration
      };
    }
    return { hasActiveBadge: false };
  }
}

export class NotificationsMock implements PluginMock<Notifications> {
  readonly plugin: NotificationsPluginMock;
  private readonly _store: NotificationStore;

  constructor() {
    this._store = {
      optedInUsers: new Set(),
      notifications: [],
      badge: undefined,
    };
    this.plugin = new NotificationsPluginMock(this._store);
  }

  /**
   * Returns the list of notifications that have been sent.
   */
  getSentNotifications(): EnqueueRequest[] {
    return this._store.notifications;
  }

  /**
   * Returns the set of users who have opted in.
   */
  getOptedInUsers(): T2[] {
    return Array.from(this._store.optedInUsers).map(T2);
  }

  optInUser(userId: T2): void {
    this._store.optedInUsers.add(userId);
  }

  optOutUser(userId: T2): void {
    this._store.optedInUsers.delete(userId);
  }

  /**
   * Returns the current active badge state, if any.
   */
  getActiveBadge(): BadgeState | undefined {
    return this._store.badge;
  }

  /**
   * Resets the mock state, clearing all opted-in users, notifications, and badges.
   */
  reset(): void {
    this._store.optedInUsers.clear();
    this._store.notifications.length = 0;
    this._store.badge = undefined;
  }
}
