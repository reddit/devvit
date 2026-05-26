import type { Metadata } from '@devvit/protos/lib/Types.js';
import type { AppDebug } from '@devvit/shared-types/Header.js';
import type { PostData } from '@devvit/shared-types/PostData.js';

import type { AssetsClient } from '../apis/AssetsClient/AssetsClient.js';
import type { RedditAPIClient } from '../apis/reddit/RedditAPIClient.js';
import type { CacheHelper } from '../devvit/internals/cache.js';
import type { MediaPlugin } from './media.js';
import type { RedisClient } from './redis.js';
import type { Scheduler } from './scheduler.js';
import type { SettingsClient } from './settings.js';
import type { UIClient } from './ui-client.js';

export type { Metadata };

export type ContextDebugInfo = {
  /**
   * Debug modes enabled by the case-sensitive devvitDebug CSV query parameter.
   * The parameter is split on commas and passed to devvit-debug metadata.
   * Missing values default to `'true'`. The convention is to interpret values
   * as truthy.
   *
   * See ContextDebugInfo for app side.
   *
   * Any type removals may cause type errors but not runtime errors.
   *
   * Prefix mode-specific logging like `[blocks]` or `[useForm]`. Favor
   * console.debug() and set Chromium DevTools to verbose log levels.
   */

  [key in AppDebug]?: string;
};

export type BaseContext = {
  /** The ID of the current subreddit */
  subredditId: string;
  /** The name of the current subreddit */
  subredditName?: string;
  /** The ID of the current post */
  postId?: string | undefined;
  postData: PostData | undefined;
  /** The current user's ID if this event was triggered by a logged in user */
  userId?: string | undefined;
  /**
   * The ID of the current app's account
   * @deprecated Use {@link BaseContext.appSlug} instead to get the app's username
   */
  appAccountId: string;
  /**
   * The slug of the app that is running
   * @deprecated Use {@link BaseContext.appSlug} instead.
   */
  appName: string;
  /** The slug of the app that is running */
  appSlug: string;
  /** The version of the app that is running */
  appVersion: string;
  /** The ID of the current comment */
  commentId?: string | undefined;
  /**
   * The current user's snoovtar URL if logged in
   *
   * @experimental
   */
  snoovatar?: string | undefined;
  /**
   * The current user's handle if logged in
   *
   * @experimental
   */
  username?: string | undefined;
  /**
   * LOID (logged-out ID) is a token assigned on first visit and persists across sessions, account creation, and sign-in.
   * Logged-in users retain a LOID for attribution, analytics, and cross-session tracking.
   * @experimental
   */
  loid?: string | undefined;
  /** Returns a JSON representation of the context */
  toJSON(): Omit<BaseContext, 'toJSON'>;
  /** More useful things, but probably not for the average developer */
  debug: ContextDebugInfo;
  /** Request headers. */
  metadata: Metadata;
};

export type ContextAPIClients = {
  /**
   * @experimental
   *
   * The cache helper will let you cache JSON-able objects in your devvit apps for a limited amount of time.
   *
   * Under the covers, It's just Redis, so you do need to enable the redis feature. This provides a pattern for e.g. fetching
   * remote calls without overwhelming someone's server.
   *
   * ```ts
   * Devvit.configure({
   *   redis: true, // Enable access to Redis
   * });
   *
   * /// ...
   *
   * let component = (context) => {
   *   let cached = context.cache(async () => {
   *     let rsp = await fetch("https://google.com")
   *     return rsp.body
   *   },
   *   {
   *     key: "some-fetch",
   *     ttl: 10_000 // millis
   *   }
   *   doSomethingWith(cached);
   *   return <text>yay</text>
   * }
   * ```
   */
  cache: CacheHelper;
  /** A client for the Redis API */
  redis: RedisClient;
  /** A client for the Reddit API */
  reddit: RedditAPIClient;
  /** A client for the Settings API */
  settings: SettingsClient;
  /** A client for the Scheduler API */
  scheduler: Scheduler;
  /** A client for media API */
  media: MediaPlugin;
  /** A client for resolving static assets to public URLs */
  assets: AssetsClient;
  /** A client for the User Interface API */
  ui: UIClient;
};

/** The current app context of the event or render */
export type Context = ContextAPIClients & BaseContext;
