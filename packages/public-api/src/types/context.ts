import type { Metadata, UIDimensions, UIEnvironment } from '@devvit/protos';
import type { AppDebug } from '@devvit/shared-types/Header.js';
import type { JSONValue } from '@devvit/shared-types/json.js';
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
import type { KVStore } from './kvStore.js';
import type { MediaPlugin } from './media.js';
import type { ChannelOptions } from './realtime.js';
import type { RedisClient } from './redis.js';
import type { Scheduler } from './scheduler.js';
import type { SettingsClient } from './settings.js';
import type { UIClient } from './ui-client.js';

export type ContextDebugInfo = {
  effects?: EffectEmitter;
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
  /** The ID of the current post */
  postId?: string | undefined;
  /** The current user's ID if this event was triggered by a logged in user */
  userId?: string | undefined;
  /** The ID of the current app's account */
  appAccountId: string;
  /** The ID of the current comment */
  commentId?: string | undefined;
  /** Returns a JSON representation of the context */
  toJSON(): Omit<BaseContext, 'toJSON'>;
  /** More useful things, but probably not for the average developer */
  debug: ContextDebugInfo;
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
   */
  useState(initialState: boolean | (() => boolean | Promise<boolean>)): UseStateResult<boolean>;
  useState(initialState: number | (() => number | Promise<number>)): UseStateResult<number>;
  useState(initialState: string | (() => string | Promise<string>)): UseStateResult<string>;
  useState<S extends JSONValue | undefined | void>(
    initialState: S | (() => S | Promise<S>)
  ): UseStateResult<S>;
  /**
   * A hook for managing a callback that runs on an interval between Block renders.
   * This is only available within a Block Component.
   */
  useInterval: UseIntervalHook;
  /**
   * A hook for managing a form between Block renders.
   * This is only available within a Block Component.
   */
  useForm: <const T extends Form | FormFunction = Form | FormFunction>(
    form: T,
    onSubmit: (values: FormToFormValues<T>) => void | Promise<void>
  ) => FormKey;
  /**
   * A hook hor managing a realtime pubsub channel between Block renders.
   * This is only available within a Block Component.
   */
  useChannel: <Message extends JSONValue = JSONValue>(
    options: ChannelOptions<Message>
  ) => UseChannelResult<Message>;
};

/** The current app context of the event or render */
export type Context = ContextAPIClients & BaseContext;
