import type { Metadata } from '@devvit/protos';
import {
  type Notifications as NotificationsPlugin,
  NotificationsDefinition,
} from '@devvit/protos/types/devvit/plugin/notifications/notifications_svc.js';
import { context } from '@devvit/server';
import { getDevvitConfig } from '@devvit/shared-types/server/get-devvit-config.js';
import { isT1, isT2, isT3, T2 } from '@devvit/shared-types/tid.js';

import type {
  EnqueueOptions,
  EnqueueResponse,
  ListOptedInUsersIteratorOptions,
  ListOptedInUsersOptions,
  ListOptedInUsersResponse,
  OptInCurrentUserResponse,
  OptOutCurrentUserResponse,
  ShowGameBadgeRequest,
} from './types/notifications.js';

export class NotificationsClient {
  /**
   * Queue push notifications to a single or multiple users.
   * @param options The push notifications to queue
   * @returns Response with success/failure counts and errors
   */
  async enqueue(options: EnqueueOptions): Promise<EnqueueResponse> {
    const request = {
      title: options.title,
      body: options.body,
      recipients: options.recipients.map((recipient) => ({
        userId: recipient.userId,
        data: recipient.data,
        comment: isT1(recipient.link) ? recipient.link : undefined,
        post: isT3(recipient.link) ? recipient.link : undefined,
      })),
    };

    const response = await this.#plugin.Enqueue(request, this.#metadata);

    return {
      successCount: response.successCount ?? 0,
      failureCount: response.failureCount ?? 0,
      errors:
        response.errors?.map((error) => ({
          userId: isT2(error.userId) ? T2(error.userId) : undefined,
          message: error.message ?? '',
        })) ?? [],
    };
  }

  /**
   * Opt the current user in to receiving push notifications.
   * @returns A promise that resolves when the operation is complete
   */
  async optInCurrentUser(): Promise<OptInCurrentUserResponse> {
    return await this.#plugin.OptInCurrentUser({}, this.#metadata);
  }

  /**
   * Opt the current user out of receiving push notifications.
   * @returns A promise that resolves when the operation is complete
   */
  async optOutCurrentUser(): Promise<OptOutCurrentUserResponse> {
    return await this.#plugin.OptOutCurrentUser({}, this.#metadata);
  }

  /**
   * List users who have opted in to receive push notifications.
   * @param options Options for listing opted-in users
   * @returns Response with a list of opted-in users
   */
  async listOptedInUsers(options: ListOptedInUsersOptions): Promise<ListOptedInUsersResponse> {
    return await this.#plugin.ListOptedInUsers(options, this.#metadata);
  }

  /**
   * Checks if a specific user has opted in to receive notifications.
   * @param request Request containing user id
   * @returns Response indicating opt-in status
   */
  async isOptedIn(userId: T2): Promise<boolean> {
    return (await this.#plugin.IsOptedIn({ userId }, this.#metadata)).optedIn;
  }

  /**
   * Iterate over all user IDs who have opted in to receive notifications.
   *
   * Usage:
   *   // Iterate from the beginning
   *   for await (const userId of notifications.listOptedInUsersIterator()) {
   *     // userId is a t2_... string
   *   }
   *
   *   // Resume from a known cursor
   *   for await (const userId of notifications.listOptedInUsersIterator({ after: 'cursor' })) {
   *     // ...
   *   }
   *
   * Details:
   * - Internally pages with a default limit of 250 per request.
   * - Continues fetching while there are results and a `next` cursor.
   * - Stops automatically when there are no more results.
   */
  async *listOptedInUsersIterator(
    options?: ListOptedInUsersIteratorOptions
  ): AsyncIterableIterator<string> {
    const pageSize = 250;
    let after = options?.after;

    while (true) {
      const response = await this.#plugin.ListOptedInUsers(
        { limit: pageSize, after },
        this.#metadata
      );

      const ids = response.userIds ?? [];
      if (ids.length === 0) break;
      for (const id of ids) yield id;
      if (!response.next) break;
      after = response.next;
    }
  }

  /**
   * Request to show a badge for a given app, linking to a given post
   * @param options Request containing post id and expiration, as duration or expiration time. If no expiration time is set, default to 24 hours from now.
   * @returns Response indicating success or failure
   */
  async requestShowGameBadge(
    options: ShowGameBadgeRequest
  ): Promise<{ success: boolean; message?: string | undefined }> {
    return await this.#plugin.ShowGameBadge(options, this.#metadata);
  }

  /**
   * Dismiss all active game badges
   * @returns Response indicating success or failure
   */
  async dismissGameBadge(): Promise<{ success: boolean }> {
    return await this.#plugin.DismissGameBadge({}, this.#metadata);
  }

  /**
   * Get the status of active game badges for an app
   * @returns Response indicating the presence of an active badge and the expiration time if present
   */
  async getGameBadgeStatus(): Promise<{
    hasActiveBadge: boolean;
    expiresAt?: Date | undefined;
  }> {
    return await this.#plugin.GetGameBadgeStatus({}, this.#metadata);
  }

  get #metadata(): Metadata {
    return context.metadata;
  }

  get #plugin(): NotificationsPlugin {
    return getDevvitConfig().use(NotificationsDefinition);
  }
}
