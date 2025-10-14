import type { Metadata, UIDimensions, UIEnvironment } from '@devvit/protos';
import type { AppDebug } from '@devvit/shared-types/Header.js';
import type { PostData } from '@devvit/shared-types/PostData.js';

import type { AssetsClient } from '../apis/AssetsClient/AssetsClient.js';
import type { ModLogClient } from '../apis/modLog/ModLogClient.js';
import type { RealtimeClient } from '../apis/realtime/RealtimeClient.js';
import type { RedditAPIClient } from '../apis/reddit/RedditAPIClient.js';
import type { EffectEmitter } from '../devvit/internals/blocks/EffectEmitter.js';
import type { CacheHelper } from '../devvit/internals/cache.js';
import type { Form, FormFunction, FormKey } from './form.js';
import type {
  FormToFormValues,
  UseChannelResult,
  UseIntervalHook,
  UseStateResult,
} from './hooks.js';
import type { JSONValue } from './json.js';
import type { KVStore } from './kvStore.js';
import type { MediaPlugin } from './media.js';
import type { ChannelOptions } from './realtime.js';
import type { RedisClient } from './redis.js';
import type { Scheduler } from './scheduler.js';
import type { SettingsClient } from './settings.js';
import type { UIClient } from './ui-client.js';

export type { Metadata };

export type ContextDebugInfo = {
  effects?: EffectEmitter;
  /** @deprecated Use Context.metadata. */
  metadata: Metadata;
} & {
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
   * Prefix mode-specific logging like `[blocks]` or `[useChannel]`. Favor
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
   * @deprecated Use {@link BaseContext.appName} instead to get the app's username
   */
  appAccountId: string;
  /** The slug of the app that is running */
  appName: string;
  /** The version of the app that is running */
  appVersion: string;
  /** The ID of the current comment */
  commentId?: string | undefined;
  /** Returns a JSON representation of the context */
  toJSON(): Omit<BaseContext, 'toJSON'>;
  /** More useful things, but probably not for the average developer */
  debug: ContextDebugInfo;
  /** Request headers. */
  metadata: Metadata;
};

export type ContextAPIClients = {
  /** A client for the ModLog API */
  modLog: ModLogClient;
  /** A client for the Key Value Store */
  kvStore: KVStore;
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
  /** A client for Realtime API */
  realtime: RealtimeClient;

  /**
   * @experimental
   *
   * Information about about a custom post's layout. Will be undefined
   * for non custom post surface areas such as menu items and task schedulers.
   */
  dimensions?: UIDimensions;
  /**
   * @experimental
   *
   * Additional information about client environment.
   * Will be undefined for non-ui contexts such as task schedulers or triggers.
   */
  uiEnvironment?: UIEnvironment;
  /** A client for the User Interface API */
  ui: UIClient;
  /**
   * A hook for managing a state between Block renders. This is only available
   * within a Block Component. Returns a tuple containing the current state and
   * a function to update it.
   *
   * ```ts
   * const [counter, setCounter] = useState(0);
   * setCounter(1); // counter = 1
   * setCounter((count) => count + 1) // counter = 2
   * ```
   *
   * @deprecated Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.
   * ```ts
   * // Old:
   * const [counter, setCounter] = context.useState(0);
   *
   * // New:
   * import { useState } from '@devvit/public-api'
   *
   * const [counter, setCounter] = useState(0);
   * ```
   */
  useState(initialState: boolean | (() => boolean | Promise<boolean>)): UseStateResult<boolean>;
  /**
   * A hook for managing a state between Block renders. This is only available
   * within a Block Component. Returns a tuple containing the current state and
   * a function to update it.
   *
   * ```ts
   * const [counter, setCounter] = useState(0);
   * setCounter(1); // counter = 1
   * setCounter((count) => count + 1) // counter = 2
   * ```
   *
   * @deprecated Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.
   * ```ts
   * // Old:
   * const [counter, setCounter] = context.useState(0);
   *
   * // New:
   * import { useState } from '@devvit/public-api'
   *
   * const [counter, setCounter] = useState(0);
   * ```
   */
  useState(initialState: number | (() => number | Promise<number>)): UseStateResult<number>;
  /**
   * A hook for managing a state between Block renders. This is only available
   * within a Block Component. Returns a tuple containing the current state and
   * a function to update it.
   *
   * ```ts
   * const [counter, setCounter] = useState(0);
   * setCounter(1); // counter = 1
   * setCounter((count) => count + 1) // counter = 2
   * ```
   *
   * @deprecated Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.
   * ```ts
   * // Old:
   * const [counter, setCounter] = context.useState(0);
   *
   * // New:
   * import { useState } from '@devvit/public-api'
   *
   * const [counter, setCounter] = useState(0);
   * ```
   */
  useState(initialState: string | (() => string | Promise<string>)): UseStateResult<string>;
  /**
   * A hook for managing a state between Block renders. This is only available
   * within a Block Component. Returns a tuple containing the current state and
   * a function to update it.
   *
   * ```ts
   * const [counter, setCounter] = useState(0);
   * setCounter(1); // counter = 1
   * setCounter((count) => count + 1) // counter = 2
   * ```
   *
   * @deprecated Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.
   * ```ts
   * // Old:
   * const [counter, setCounter] = context.useState(0);
   *
   * // New:
   * import { useState } from '@devvit/public-api'
   *
   * const [counter, setCounter] = useState(0);
   * ```
   */
  useState<S extends JSONValue | undefined | void>(
    /**
     * A hook for managing a state between Block renders. This is only available
     * within a Block Component. Returns a tuple containing the current state and
     * a function to update it.
     *
     * ```ts
     * const [counter, setCounter] = useState(0);
     * setCounter(1); // counter = 1
     * setCounter((count) => count + 1) // counter = 2
     * ```
     *
     * @deprecated Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.
     * ```ts
     * // Old:
     * const [counter, setCounter] = context.useState(0);
     *
     * // New:
     * import { useState } from '@devvit/public-api'
     *
     * const [counter, setCounter] = useState(0);
     * ```
     */
    initialState: S | (() => S | Promise<S>)
  ): UseStateResult<S>;
  /**
   * A hook for managing a callback that runs on an interval between Block renders.
   * This is only available within a Block Component.
   *
   * @deprecated Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.
   * ```ts
   * // Old:
   * const interval = context.useInterval(() => {}, 1000);
   *
   * // New:
   * import { useInterval } from '@devvit/public-api'
   *
   * const interval = useInterval(() => {}, 1000);
   * ```
   */
  useInterval: UseIntervalHook;
  /**
   * A hook for managing a form between Block renders.
   * This is only available within a Block Component.
   *
   * @deprecated Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.
   * ```ts
   * // Old:
   * const myForm = context.useForm(...);
   *
   * // New:
   * import { useForm } from '@devvit/public-api'
   *
   * const myForm = useForm(...);
   * ```
   */
  useForm: <const T extends Form | FormFunction = Form | FormFunction>(
    form: T,
    onSubmit: (values: FormToFormValues<T>) => void | Promise<void>
  ) => FormKey;
  /**
   * A hook for managing a realtime pubsub channel between Block renders.
   * This is only available within a Block Component.
   *
   * @deprecated Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.
   * ```ts
   * // Old:
   * const channel = context.useChannel(...);
   *
   * // New:
   * import { useChannel } from '@devvit/public-api'
   *
   * const channel = useChannel(...);
   * ```
   */
  useChannel: <Message extends JSONValue = JSONValue>(
    options: ChannelOptions<Message>
  ) => UseChannelResult<Message>;
};

/** The current app context of the event or render */
export type Context = ContextAPIClients & BaseContext;
