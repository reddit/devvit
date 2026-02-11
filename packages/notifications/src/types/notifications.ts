import { type T1, type T2, type T3 } from '@devvit/shared-types/tid.js';

/** Allows you to queue push notifications to a single or multiple users */
export type EnqueueOptions = {
  /** The title of the push notification. This accepts mustache templating*/
  title: string;
  /** The body text of the push notification. This accepts mustache templating*/
  body: string;
  /** List of recipients to send the notification to.
   Max number of recipients is 1000 */
  recipients: {
    /** The Reddit user ID to send the notification to */
    userId: T2;
    /** The post or comment id the notification clicks through to */
    link: T1 | T3;
    /** If the title or body have mustache templating, this is the data to fill it in with */
    data: { [key: string]: string };
  }[];
};

export type EnqueueResponse = {
  /** Number of notifications successfully queued */
  successCount: number;
  /** Number of notifications that failed */
  failureCount: number;
  /** Array of errors for failed notifications */
  errors: {
    /** User ID that failed */
    userId: T2 | undefined;
    /** Error message */
    message: string;
  }[];
};

/** Allows you to list users who have opted in to receive push notifications */
/**  Users are ordered from earliest to latest opt-in time. */
export type ListOptedInUsersOptions = {
  /** The maximum number of users to return per page. Default and maximum is 1000. */
  limit?: number;
  /** The cursor to use as the 'after' parameter to get the next page of results.
   *  Returns the next set of users who have opted in, starting after the specified cursor.
   *  If the cursor is not found, results will start from the beginning.
   */
  after?: string | undefined;
};

export type ListOptedInUsersResponse = {
  /** List of user IDs who have opted in */
  userIds: string[];
  /** Next page cursor to pass back as 'after' */
  next?: string | undefined;
};

export type ShowGameBadgeRequest = {
  /** The fullname of a post (e.g., "t3_abc123") */
  post: T3;
  /** The expiration time of the badge */
  expiresAt?: Date | undefined;
};

export type ListOptedInUsersIteratorOptions = Pick<ListOptedInUsersOptions, 'after'>;

export type OptInCurrentUserResponse = {
  /** Whether the user successfully opted in */
  success: boolean;
  /** Optional message providing additional context about the operation */
  message?: string;
};

export type OptOutCurrentUserResponse = {
  /** Whether the user successfully opted out */
  success: boolean;
  /** Optional message providing additional context about the operation */
  message?: string;
};
