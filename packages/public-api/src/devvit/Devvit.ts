import type { UnknownMessage } from '@devvit/protos';
import * as protos from '@devvit/protos';
import type { PaymentsService } from '@devvit/protos/payments.js';
import { Actor } from '@devvit/shared-types/Actor.js';
import type { AssetMap } from '@devvit/shared-types/Assets.js';
import type { DeepPartial } from '@devvit/shared-types/BuiltinTypes.js';
import type { Config } from '@devvit/shared-types/Config.js';
import type { JSONObject, JSONValue } from '@devvit/shared-types/json.js';
import type { FormKey } from '@devvit/shared-types/useForm.js';

import { assertValidFormFields } from '../apis/ui/helpers/assertValidFormFields.js';
import type {
  BaseContext,
  Configuration,
  ContextAPIClients,
  CustomPostType,
  Form,
  FormDefinition,
  FormFunction,
  FormOnSubmitEventHandler,
  FormToFormValues,
  IconName,
  MenuItem,
  MultiTriggerDefinition,
  OnTriggerRequest,
  ScheduledJobHandler,
  ScheduledJobType,
  SettingsFormField,
  TriggerContext,
  TriggerDefinition,
  TriggerEvent,
  TriggerEventType,
  TriggerOnEventHandler,
} from '../types/index.js';
import { SettingScope } from '../types/index.js';
import { registerAppSettings } from './internals/app-settings.js';
import { registerCustomPost } from './internals/custom-post.js';
import { registerInstallationSettings } from './internals/installation-settings.js';
import { registerMenuItems } from './internals/menu-items.js';
import { pluginIsEnabled } from './internals/plugins.js';
import { registerScheduler } from './internals/scheduler.js';
import { registerTriggers } from './internals/triggers.js';
import { registerUIEventHandler } from './internals/ui-event-handler.js';
import { registerUIRequestHandlers } from './internals/ui-request-handler.js';

type UseHandler = {
  [name: string]: (args: UnknownMessage | undefined, metadata?: protos.Metadata) => void;
};

type PluginType =
  | protos.HTTP
  | protos.Logger
  | protos.Scheduler
  | protos.ContextAction
  | protos.KVStore
  | protos.SchedulerHandler
  | protos.Flair
  | protos.GraphQL
  | protos.LinksAndComments
  | protos.Listings
  | protos.Moderation
  | protos.ModNote
  | protos.Modlog
  | protos.NewModmail
  | protos.PrivateMessages
  | protos.RedisAPI
  | protos.Settings
  | protos.Subreddits
  | protos.Users
  | protos.Widgets
  | protos.Wiki
  | protos.MediaService
  | protos.Realtime
  | protos.UserActions
  | PaymentsService;

/**
 * Home for debug flags, settings, and other information. Any type removals
 * may cause type errors but not runtime errors.
 *
 * **Favor ContextDebugInfo since request-based state is preferred.**
 */
export type DevvitDebug = {
  /**
   * Should debug block rendering in console.log according to the reified JSX/XML output. Example:
   *
   *     <hstack><text>hi world</text></hstack>
   *
   */
  emitSnapshots?: boolean | undefined;

  /**
   * Should console.log the state of the app after every event.
   *
   */
  emitState?: boolean | undefined;
};

export class Devvit extends Actor {
  static debug: DevvitDebug = {};

  static #appSettings: SettingsFormField[] | undefined;
  static #assets: AssetMap = {};
  static #config: Configuration = {};
  static #customPostType: CustomPostType | undefined;
  static readonly #formDefinitions: Map<FormKey, FormDefinition> = new Map();
  static #installationSettings: SettingsFormField[] | undefined;
  static readonly #menuItems: MenuItem[] = [];
  static readonly #scheduledJobHandlers: Map<string, ScheduledJobHandler> = new Map();
  static readonly #triggerOnEventHandlers: Map<
    TriggerEvent,
    TriggerOnEventHandler<OnTriggerRequest>[]
  > = new Map();
  static #webViewAssets: AssetMap = {};

  static #additionallyProvides: protos.Definition[] = [];

  /**
   * To use certain APIs and features of Devvit, you must enable them using this function.
   *
   * @param config - The configuration object.
   * @param config.http - Enables the HTTP API.
   * @param config.redditAPI - Enables the Reddit API.
   * @param config.kvStore - Enables the Key Value Storage API.
   * @example
   * ```ts
   * Devvit.configure({
   *   http: true,
   *   redditAPI: true,
   *   redis: true,
   *   media: true
   * });
   * ```
   */
  static configure(config: Configuration): void {
    this.#config = { ...this.#config, ...config };

    if (pluginIsEnabled(config.http)) {
      this.use(protos.HTTPDefinition);
    }

    // We're now defaulting this to on.
    const redisNotSpecified = config.redis === undefined;
    if (redisNotSpecified || pluginIsEnabled(config.kvStore) || pluginIsEnabled(config.redis)) {
      this.use(protos.KVStoreDefinition);
      this.use(protos.RedisAPIDefinition);
    }

    if (pluginIsEnabled(config.media)) {
      this.use(protos.MediaServiceDefinition);
    }

    if (pluginIsEnabled(config.modLog)) {
      this.use(protos.ModlogDefinition);
    }

    if (pluginIsEnabled(config.redditAPI)) {
      // Loading all Reddit API plugins for now.
      // In the future we can split this by oauth scope or section.
      this.use(protos.FlairDefinition);
      this.use(protos.GraphQLDefinition);
      this.use(protos.LinksAndCommentsDefinition);
      this.use(protos.ListingsDefinition);
      this.use(protos.ModerationDefinition);
      this.use(protos.ModNoteDefinition);
      this.use(protos.NewModmailDefinition);
      this.use(protos.PrivateMessagesDefinition);
      this.use(protos.SubredditsDefinition);
      this.use(protos.UsersDefinition);
      this.use(protos.WidgetsDefinition);
      this.use(protos.WikiDefinition);
    }

    if (pluginIsEnabled(config.realtime)) {
      this.use(protos.RealtimeDefinition);
    }

    if (pluginIsEnabled(config.userActions)) {
      this.use(protos.UserActionsDefinition);
    }
  }

  /**
   * Add a menu item to the Reddit UI.
   * @param menuItem - The menu item to add.
   * @param menuItem.label - The label of the menu item.
   * @example
   * ```ts
   * Devvit.addMenuItem({
   *   label: 'My Menu Item',
   *   location: 'subreddit',
   *   onPress: (event, context) => {
   *     const location = event.location;
   *     const targetId = event.targetId;
   *     context.ui.showToast(`You clicked on ${location} ${targetId}`);
   *   }
   * });
   * ```
   */
  static addMenuItem(menuItem: MenuItem): void {
    this.#menuItems.push(menuItem);
  }

  /**
   * Add a custom post type for your app.
   * @param customPostType - The custom post type to add.
   * @param customPostType.name - The name of the custom post type.
   * @param customPostType.description - An optional description.
   * @param customPostType.height - An optional parameter to set post height, defaults to 'regular'.
   * @param customPostType.render - A function or `Devvit.CustomPostComponent` that returns the UI for the custom post.
   * @example
   * ```ts
   * import { Devvit, useState } from '@devvit/public-api';
   *
   * Devvit.addCustomPostType({
   *   name: 'Counter',
   *   description: 'A simple click counter post.',
   *   render: (context) => {
   *     const [counter, setCounter] = useState();
   *
   *     return (
   *       <vstack>
   *         <text>{counter}</text>
   *         <button onPress={() => setCounter((counter) => counter + 1)}>Click me!</button>
   *       </vstack>
   *     );
   *   },
   * });
   * ```
   */
  static addCustomPostType(customPostType: CustomPostType): void {
    this.#customPostType = customPostType;
  }

  /**
   * Create a form that can be opened from menu items and custom posts.
   * @param form - The form or a function that returns the form.
   * @param onSubmit - The function to call when the form is submitted.
   * @returns A unique key for the form that can used with `ui.showForm`.
   */
  static createForm<const T extends Form | FormFunction>(
    form: T,
    onSubmit: FormOnSubmitEventHandler<FormToFormValues<T>>
  ): FormKey {
    const formKey: FormKey = `form.${this.#formDefinitions.size}`;
    this.#formDefinitions.set(formKey, {
      form,
      onSubmit,
    } as FormDefinition);
    return formKey;
  }

  /**
   * Add a scheduled job type for your app. This will allow you to schedule jobs using the `scheduler` API.
   * @param job - The scheduled job type to add.
   * @param job.name - The name of the scheduled job type.
   * @param job.onRun - The function to call when the scheduled job is run.
   * @example
   * ```ts
   * Devvit.addSchedulerJob({
   *   name: 'checkNewPosts',
   *   onRun: async (event, context) => {
   *     const newPosts = await context.reddit.getNewPosts({ limit: 5 }).all();
   *     for (const post of newPosts) {
   *       if (post.title.includes('bad word')) {
   *         await post.remove();
   *       }
   *     }
   *   }
   * });
   *
   * Devvit.addMenuItem({
   *   label: 'Check for new posts',
   *   location: 'location',
   *   onPress: (event, context) => {
   *     const = await context.scheduler.runJob({
   *       name: 'checkNewPosts',
   *       when: new Date(Date.now() + 5000) // in 5 seconds
   *     });
   *   }
   * });
   * ```
   */
  static addSchedulerJob<T extends JSONObject | undefined>(job: ScheduledJobType<T>): void {
    if (!this.#pluginClients[protos.SchedulerDefinition.fullName]) {
      this.use(protos.SchedulerDefinition);
    }

    if (this.#scheduledJobHandlers.has(job.name)) {
      throw new Error(`Job ${job.name} is already defined`);
    }

    this.#scheduledJobHandlers.set(
      job.name,
      job.onRun as ScheduledJobHandler<JSONObject | undefined>
    );
  }

  /**
   * Add settings that can be configured to customize the behavior of your app.
   *
   * There are two levels of settings:
   * - App settings (scope: 'app')
   * - Installation settings (scope: 'installation' or unspecified scope).
   *
   * Installation settings are meant to be configured by the user that installs your app.
   * This is a good place to add anything that a user might want to change to personalize the app (e.g. the default city to show the weather for or a
   * specific sport team that a subreddit follows). Note that these are good for subreddit level customization but not necessarily good for things
   * that might be different for two users in a subreddit (e.g. setting the default city to show the weather for is only useful at a sub level if
   * the sub is for a specific city or region).
   * Installation settings can be viewed and configured here: https://developers.reddit.com/r/subreddit-name/apps/app-name.
   *
   * App settings can be accessed and consumed by all installations of the app. This is mainly useful for developer secrets/API keys that your
   * app needs to function. They can only be changed/viewed by you via the CLI (devvit settings set and devvit settings list). This ensures secrets
   * are persisted in an encrypted store and don't get committed in the source code.
   *
   * Warning: You should never paste your actual key into any fields passed into Devvit.addSettings - this is merely where you state what your API key's name and description are. You will be able to set the actual value of the key via CLI.
   *
   * Note: setting names must be unique across all settings.
   *
   * @param fields - Fields for the app and installation settings.
   * @example Add multiple fields
   * ```ts
   * Devvit.addSettings([
   *   {
   *     type: 'string',
   *     name: 'weather-api-key',
   *     label: 'My weather.com API key',
   *     scope: SettingScope.App,
   *     isSecret: true
   *   },
   *   {
   *     type: 'string',
   *     name: 'Default City',
   *     label: 'Default city to show the weather for by default',
   *     scope: SettingScope.Installation,
   *     onValidate: ({ value }) => {
   *       if (!isValidCity(value)) {
   *         return 'You must ender a valid city: ${validCities.join(", ")}';
   *       }
   *     }
   *   },
   *   {
   *     type: 'number',
   *     name: 'Default Forecast Window (in days)',
   *     label: 'The number of days to show for forecast for by default',
   *     scope: SettingScope.Installation,
   *     onValidate: ({ value }) => {
   *       if (value > 10 || value < 1) {
   *         return 'Forecast window must be from 1 to 10 days';
   *       }
   *     }
   *   },
   * ]);
   * ```
   *
   * @example Add a single field
   * ```ts
   * Devvit.addSettings({
   *   type: 'string',
   *   name: 'weather-api-key',
   *   label: 'My weather.com API key',
   *   scope: SettingScope.App,
   *   isSecret: true
   * });
   * ```
   */
  static addSettings(fields: SettingsFormField[] | SettingsFormField): void {
    // if the fields is a single field, convert it to an array
    const fieldsArray = Array.isArray(fields) ? fields : [fields];

    const installSettings = fieldsArray.filter(
      (field) => field.type === 'group' || !field.scope || field.scope === SettingScope.Installation
    );
    const appSettings = fieldsArray.filter(
      (field) => field.type !== 'group' && field.scope === SettingScope.App
    );

    if (installSettings.length > 0) {
      // initialize the installation settings with empty array if it is not initialized
      this.#installationSettings ??= [];
      this.#installationSettings.push(...installSettings);
    }

    if (appSettings.length > 0) {
      // initialize the app settings with empty array if it is not initialized
      this.#appSettings ??= [];
      this.#appSettings.push(...appSettings);
    }

    assertValidFormFields([...(this.#installationSettings ?? []), ...(this.#appSettings ?? [])]);

    if (!this.#pluginClients[protos.SettingsDefinition.fullName]) {
      this.use(protos.SettingsDefinition);
    }
  }

  /**
   * Add a trigger handler that will be invoked when the given event
   * occurs in a subreddit where the app is installed.
   *
   * @param triggerDefinition - The trigger definition.
   * @param triggerDefinition.event - The event to listen for.
   * @param triggerDefinition.events - The events to listen for.
   * @param triggerDefinition.onEvent - The function to call when the event happens.
   * @example
   * ```ts
   * Devvit.addTrigger({
   *   event: 'PostSubmit',
   *   async onEvent(event, context) {
   *     console.log("a new post was created!")
   *   }
   * });
   *
   * Devvit.addTrigger({
   *   events: ['PostSubmit', 'PostReport'],
   *   async onEvent(event, context){
   *     if (event.type === 'PostSubmit') {
   *       console.log("a new post was created!")
   *     } else if (event.type === 'PostReport') {
   *       console.log("a post was reported!")
   *     }
   *   }
   * });
   * ```
   */
  static addTrigger<T extends keyof TriggerEventType>(definition: {
    event: T;
    onEvent: TriggerOnEventHandler<TriggerEventType[T]>;
  }): typeof Devvit;
  static addTrigger<Event extends TriggerEvent>(
    triggerDefinition: MultiTriggerDefinition<Event>
  ): typeof Devvit;
  static addTrigger(
    triggerDefinition: TriggerDefinition | MultiTriggerDefinition<TriggerEvent>
  ): typeof Devvit {
    if ('events' in triggerDefinition) {
      for (const eventType of triggerDefinition.events) {
        this.addTrigger({
          event: eventType,
          onEvent: (event: OnTriggerRequest, context: TriggerContext) =>
            (triggerDefinition.onEvent as TriggerOnEventHandler<OnTriggerRequest>)(event, context),
        } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      return this;
    }

    if (this.#triggerOnEventHandlers.has(triggerDefinition.event)) {
      this.#triggerOnEventHandlers
        .get(triggerDefinition.event)
        ?.push(triggerDefinition.onEvent as TriggerOnEventHandler<OnTriggerRequest>);
    } else {
      this.#triggerOnEventHandlers.set(triggerDefinition.event, [
        triggerDefinition.onEvent as TriggerOnEventHandler<OnTriggerRequest>,
      ]);
    }

    return Devvit;
  }

  /**
   * @internal
   * utility static method to register additional actor types without exposing an explicit
   * registration hook such as `addTrigger` or `addMenuItem`
   */
  static provide(def: protos.Definition): void {
    this.#additionallyProvides.push(def);
  }

  /** @internal */
  static #uses: {
    [fullName: protos.Definition['fullName']]: {
      def: protos.Definition;
      options: DeepPartial<protos.PackageQuery>;
      handler: Readonly<UseHandler> | undefined;
    };
  } = {};

  /** @internal */
  static #pluginClients: {
    [fullName: protos.Definition['fullName']]: PluginType;
  } = {};

  /** @internal */
  static use<T>(d: protos.Definition, opts?: DeepPartial<protos.PackageQuery>): T {
    this.#uses[d.fullName] = {
      def: d,
      options: opts ?? {},
      handler: undefined,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrapped: any = {};
    for (const method of Object.values(d.methods)) {
      wrapped[method.name] = (args: UnknownMessage | undefined, metadata?: protos.Metadata) =>
        this.#uses[d.fullName].handler?.[method.name]?.(
          // eslint-disable-next-line no-restricted-properties
          method.requestType?.fromPartial(args ?? {}),
          metadata
        );
    }

    this.#pluginClients[d.fullName] = wrapped;

    return wrapped as T;
  }

  /** @internal */
  static get redditAPIPlugins(): {
    NewModmail: protos.NewModmail;
    Widgets: protos.Widgets;
    ModNote: protos.ModNote;
    LinksAndComments: protos.LinksAndComments;
    Moderation: protos.Moderation;
    GraphQL: protos.GraphQL;
    Listings: protos.Listings;
    Flair: protos.Flair;
    Wiki: protos.Wiki;
    Users: protos.Users;
    PrivateMessages: protos.PrivateMessages;
    Subreddits: protos.Subreddits;
  } {
    if (!pluginIsEnabled(this.#config.redditAPI)) {
      throw new Error(
        'Reddit API is not enabled. You can enable it by passing `redditAPI: true` to `Devvit.configure`.'
      );
    }

    return {
      Flair: this.#pluginClients[protos.FlairDefinition.fullName] as protos.Flair,
      GraphQL: this.#pluginClients[protos.GraphQLDefinition.fullName] as protos.GraphQL,
      LinksAndComments: this.#pluginClients[
        protos.LinksAndCommentsDefinition.fullName
      ] as protos.LinksAndComments,
      Listings: this.#pluginClients[protos.ListingsDefinition.fullName] as protos.Listings,
      Moderation: this.#pluginClients[protos.ModerationDefinition.fullName] as protos.Moderation,
      ModNote: this.#pluginClients[protos.ModNoteDefinition.fullName] as protos.ModNote,
      NewModmail: this.#pluginClients[protos.NewModmailDefinition.fullName] as protos.NewModmail,
      PrivateMessages: this.#pluginClients[
        protos.PrivateMessagesDefinition.fullName
      ] as protos.PrivateMessages,
      Subreddits: this.#pluginClients[protos.SubredditsDefinition.fullName] as protos.Subreddits,
      Users: this.#pluginClients[protos.UsersDefinition.fullName] as protos.Users,
      Widgets: this.#pluginClients[protos.WidgetsDefinition.fullName] as protos.Widgets,
      Wiki: this.#pluginClients[protos.WikiDefinition.fullName] as protos.Wiki,
    };
  }

  /** @internal */
  static get modLogPlugin(): protos.Modlog {
    const modLog = this.#pluginClients[protos.ModlogDefinition.fullName];

    if (!modLog) {
      throw new Error(
        'ModLog is not enabled. You can enable it by passing `modLog: true` to `Devvit.configure`'
      );
    }

    return modLog as protos.Modlog;
  }

  /** @internal */
  static get schedulerPlugin(): protos.Scheduler {
    const scheduler = this.#pluginClients[protos.SchedulerDefinition.fullName];

    if (!scheduler) {
      // todo: better error with more details
      throw new Error(
        'Scheduler is not enabled. You can enable it by calling `Devvit.addSchedulerJob` at the top level of your app.'
      );
    }

    return scheduler as protos.Scheduler;
  }

  /** @internal */
  static get kvStorePlugin(): protos.KVStore {
    const kvStore = this.#pluginClients[protos.KVStoreDefinition.fullName];

    if (!kvStore) {
      throw new Error(
        'Key Value Store is not enabled. You can enable it by passing `kvStore: true` to `Devvit.configure`'
      );
    }

    return kvStore as protos.KVStore;
  }

  /** @internal */
  static get redisPlugin(): protos.RedisAPI {
    const redis = this.#pluginClients[protos.RedisAPIDefinition.fullName];

    if (!redis) {
      throw new Error(
        'Redis is not enabled. You can enable it by passing `redis: true` to `Devvit.configure`'
      );
    }

    return redis as protos.RedisAPI;
  }

  /** @internal */
  static get mediaPlugin(): protos.MediaService {
    const media = this.#pluginClients[protos.MediaServiceDefinition.fullName];
    if (!media) {
      throw new Error(
        'MediaService is not enabled. You can enable it by passing `media: true` to `Devvit.configure`'
      );
    }
    return media as protos.MediaService;
  }

  /** @internal */
  static get settingsPlugin(): protos.Settings {
    const settings = this.#pluginClients[protos.SettingsDefinition.fullName];

    if (!settings) {
      throw new Error(
        'Settings must first be configured with `Devvit.addSettings()` before they can be accessed'
      );
    }

    return settings as protos.Settings;
  }

  /** @internal */
  static get realtimePlugin(): protos.Realtime {
    const realtime = this.#pluginClients[protos.RealtimeDefinition.fullName];

    if (!realtime) {
      throw new Error(
        'Realtime is not enabled. You can enable it by passing `realtime: true` to `Devvit.configure`'
      );
    }

    return realtime as protos.Realtime;
  }

  /** @internal */
  static get userActionsPlugin(): protos.UserActions {
    const userActionsAndRedditApiEnabled =
      pluginIsEnabled(this.#config.userActions) && pluginIsEnabled(this.#config.redditAPI);

    if (!userActionsAndRedditApiEnabled) {
      throw new Error(
        'UserActions is not enabled. You can enable it by passing both `userActions: true` and `redditAPI: true` to `Devvit.configure`'
      );
    }

    return this.#pluginClients[protos.UserActionsDefinition.fullName] as protos.UserActions;
  }

  /** @internal */
  static get menuItems(): MenuItem[] {
    return this.#menuItems;
  }

  /** @internal */
  static get customPostType(): CustomPostType | undefined {
    return this.#customPostType;
  }

  /** @internal */
  static get formDefinitions(): Map<FormKey, FormDefinition> {
    return this.#formDefinitions;
  }

  /** @internal */
  static get scheduledJobHandlers(): Map<string, ScheduledJobHandler> {
    return this.#scheduledJobHandlers;
  }

  /** @internal */
  static get installationSettings(): SettingsFormField[] | undefined {
    return this.#installationSettings;
  }

  /** @internal */
  static get appSettings(): SettingsFormField[] | undefined {
    return this.#appSettings;
  }

  /** @internal */
  static get triggerOnEventHandlers(): Map<
    TriggerEvent,
    TriggerOnEventHandler<OnTriggerRequest>[]
  > {
    return this.#triggerOnEventHandlers;
  }

  /** @internal */
  static get assets(): AssetMap {
    return this.#assets;
  }

  /** @internal */
  static get webViewAssets(): AssetMap {
    return this.#webViewAssets;
  }

  /** @internal */
  constructor(config: Config) {
    super(config);

    Devvit.#assets = config.assets ?? {};
    Devvit.#webViewAssets = config.webviewAssets ?? {};

    for (const fullName in Devvit.#uses) {
      const use = Devvit.#uses[fullName];
      use.handler = config.use<UseHandler>(use.def, use.options);
    }

    if (Devvit.#menuItems.length > 0) {
      registerMenuItems(config);
    }

    if (Devvit.#scheduledJobHandlers.size > 0) {
      registerScheduler(config);
    }

    if (Devvit.#customPostType) {
      registerCustomPost(config);
      /**
       * We're trying to migrate custom posts to generic ui handlers, but they'll
       * both work for now.
       */
      registerUIRequestHandlers(config);
    }

    if (Devvit.#customPostType || Devvit.#formDefinitions.size > 0) {
      registerUIEventHandler(config);
    }

    if (Devvit.#installationSettings) {
      registerInstallationSettings(config);
    }

    if (Devvit.#appSettings) {
      registerAppSettings(config);
    }

    if (Devvit.#triggerOnEventHandlers.size > 0) {
      registerTriggers(config);
    }

    for (const provides of Devvit.#additionallyProvides) {
      config.provides(provides);
    }
  }
}

export namespace Devvit {
  export type Fragment = JSX.Fragment;
  export type ElementChildren = JSX.Element | JSX.Children | undefined;
  export type StringChild = Fragment | string | number;
  export type StringChildren = StringChild | (StringChild | StringChild[])[] | undefined;
  type ComponentFunctionValue = BlockElement | Fragment | undefined;

  // Generic createElement to handle Blocks, custom elements, etc...
  export function createElement(
    type: Blocks.IntrinsicElementsType,
    props: { [key: string]: unknown } | undefined,
    ...children: JSX.Children[]
  ): BlockElement;
  export function createElement(
    type: JSX.ComponentFunction | string | undefined,
    props: { [key: string]: unknown } | undefined,
    ...children: JSX.Children[]
  ): ComponentFunctionValue | Promise<ComponentFunctionValue> {
    const blockElement: BlockElement = {
      type,
      props,
      children,
    };

    return blockElement;
  }

  // Workaround for typing: aliasing global Context as Devvit.Context bundles
  // incorrectly as `type Context = Context`.
  /** The current app context of the event or render. */
  export type Context = ContextAPIClients & BaseContext;

  export type BlockComponentProps<P = { [key: string]: unknown }> = P & { children?: JSX.Children };
  export type BlockComponent<P = { [key: string]: unknown }> = (
    props: BlockComponentProps<P>,
    context: Context
  ) => JSX.Element;
  export type CustomPostComponent = (context: Context) => JSX.Element;

  export namespace Blocks {
    export interface IntrinsicElements {
      blocks: Devvit.Blocks.RootProps;
      hstack: Devvit.Blocks.StackProps;
      vstack: Devvit.Blocks.StackProps;
      zstack: Devvit.Blocks.StackProps;
      text: Devvit.Blocks.TextProps;
      button: Devvit.Blocks.ButtonProps;
      image: Devvit.Blocks.ImageProps;
      spacer: Devvit.Blocks.SpacerProps;
      icon: Devvit.Blocks.IconProps;
      avatar: Devvit.Blocks.AvatarProps;
      webview: Devvit.Blocks.WebViewProps;
    }

    export type IntrinsicElementsType = keyof IntrinsicElements;

    //region Attribute Values
    export type SizePixels = `${number}px`;
    export type SizePercent = `${number}%`;
    export type SizeString = SizePixels | SizePercent | number;
    export type Alignment =
      | `${VerticalAlignment}`
      | `${HorizontalAlignment}`
      | `${VerticalAlignment} ${HorizontalAlignment}`
      | `${HorizontalAlignment} ${VerticalAlignment}`;
    export type AvatarBackground = 'light' | 'dark';
    export type AvatarFacing = 'left' | 'right';
    export type AvatarSize =
      | 'xxsmall'
      | 'xsmall'
      | 'small'
      | 'medium'
      | 'large'
      | 'xlarge'
      | 'xxlarge'
      | 'xxxlarge';
    export type ButtonAppearance =
      | 'secondary'
      | 'primary'
      | 'plain'
      | 'bordered'
      | 'media'
      | 'destructive'
      | 'caution'
      | 'success';
    /**
     * Affects the button height.
     * small = 32px;
     * medium = 40px;
     * large = 48px;
     */
    export type ButtonSize = 'small' | 'medium' | 'large';
    export type ColorString = string;
    /**
     * thin = 1px;
     * thick = 2px;
     */
    export type ContainerBorderWidth = Thickness;
    /**
     * small = 8px;
     * medium = 16px;
     * large = 24px;
     */
    export type ContainerCornerRadius = 'none' | 'small' | 'medium' | 'large' | 'full';
    /**
     * small = 8px;
     * medium = 16px;
     * large = 32px;
     */
    export type ContainerGap = 'none' | 'small' | 'medium' | 'large';
    /**
     * xsmall = 4px;
     * small = 8px;
     * medium = 16px;
     * large = 32px;
     */
    export type ContainerPadding = 'none' | 'xsmall' | 'small' | 'medium' | 'large';
    export type HorizontalAlignment = 'start' | 'center' | 'end';
    /**
     * xsmall = 12px;
     * small = 16px;
     * medium = 20px;
     * large = 24px;
     */
    export type IconSize = 'xsmall' | 'small' | 'medium' | 'large';
    export type ImageResizeMode = 'none' | 'fit' | 'fill' | 'cover' | 'scale-down';
    /**
     * xsmall = 4px;
     * small = 8px;
     * medium = 16px;
     * large = 32px;
     */
    export type SpacerSize = 'xsmall' | 'small' | 'medium' | 'large';
    export type SpacerShape = 'invisible' | 'thin' | 'square';
    /**
     * thin = 1px;
     * thick = 2px;
     */
    export type TextOutline = Thickness;
    /**
     * xsmall = 10px;
     * small = 12px;
     * medium = 14px;
     * large = 16px;
     * xlarge = 18px;
     * xxlarge = 24px;
     */
    export type TextSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
    export type TextStyle = 'body' | 'metadata' | 'heading';
    export type TextWeight = 'regular' | 'bold';
    export type TextOverflow = 'clip' | 'ellipsis';
    export type Thickness = 'none' | 'thin' | 'thick';
    export type VerticalAlignment = 'top' | 'middle' | 'bottom';
    export type RootHeight = 'regular' | 'tall';
    //endregion

    //region Element Attributes
    export type BaseProps = {
      width?: SizeString;
      height?: SizeString;
      minWidth?: SizeString;
      minHeight?: SizeString;
      maxWidth?: SizeString;
      maxHeight?: SizeString;
      grow?: boolean;

      /**
       * This optional field provides some efficiencies around re-ordering elements in a list.  Rather
       * Than re-rendering the entire list, the client can use the key to determine if the element has
       * changed.  In the example below, if a and b were swapped, the client would know to reuse the
       * existing elements from b, rather than re-creating an expensive tree of elements.
       *
       * Unlike id, key is local to the parent element.  This means that the same key can be used in different
       * parts of the tree without conflict.
       *
       *     <hstack>
       *         <text key="a">hi world</text>
       *         <hstack key="b">...deeply nested content...</hstack>
       *     </hstack>
       */
      key?: string;

      /**
       * This optional field provides a unique identifier for the element.  This is useful for ensuring
       * re-use of elements across renders.  See the `key` field for more information.  Unlike key, id
       * is global.  You cannot have two elements with the same id in the same tree.
       */
      id?: string;
    };

    export type OnPressEventHandler = (data: JSONObject) => void | Promise<void>;

    export type OnWebViewEventHandler = <T extends JSONValue>(message: T) => void | Promise<void>;

    export type Actionable = {
      onPress?: OnPressEventHandler | undefined;
    };

    export type WebViewActionable = {
      onMessage?: OnWebViewEventHandler | undefined;
    };

    export type ActionHandlers = keyof (Actionable & WebViewActionable);

    export type HasElementChildren = {
      children?: Devvit.ElementChildren;
    };

    export type HasStringChildren = {
      children?: Devvit.StringChildren;
    };

    export type RootProps = HasElementChildren & {
      height?: Devvit.Blocks.RootHeight | undefined;
    };

    export type StackProps = BaseProps &
      HasElementChildren &
      Actionable & {
        reverse?: boolean | undefined;
        alignment?: Alignment;
        padding?: ContainerPadding | undefined;
        gap?: ContainerGap | undefined;
        border?: ContainerBorderWidth | undefined;
        borderColor?: ColorString | undefined;
        lightBorderColor?: ColorString | undefined;
        darkBorderColor?: ColorString | undefined;
        cornerRadius?: ContainerCornerRadius | undefined;
        backgroundColor?: ColorString | undefined;
        lightBackgroundColor?: ColorString | undefined;
        darkBackgroundColor?: ColorString | undefined;
      };

    export type TextProps = BaseProps &
      HasStringChildren &
      Actionable & {
        size?: TextSize | undefined;
        weight?: TextWeight | undefined;
        color?: ColorString | undefined;
        lightColor?: ColorString | undefined;
        darkColor?: ColorString | undefined;
        alignment?: Alignment | undefined;
        outline?: TextOutline | undefined;
        style?: TextStyle | undefined;
        selectable?: boolean | undefined;
        wrap?: boolean | undefined;
        overflow?: TextOverflow | undefined;
      };

    export type ButtonProps = BaseProps &
      HasStringChildren &
      Actionable & {
        icon?: IconName | undefined;
        size?: ButtonSize | undefined;
        appearance?: ButtonAppearance | undefined;
        textColor?: ColorString | undefined;
        lightTextColor?: ColorString | undefined;
        darkTextColor?: ColorString | undefined;
        // not available in all platforms yet
        // backgroundColor?: ColorString | undefined;
        disabled?: boolean | undefined;
      };

    export type ImageProps = BaseProps &
      Actionable & {
        url: string;
        imageWidth: SizePixels | number;
        imageHeight: SizePixels | number;
        description?: string | undefined;
        resizeMode?: ImageResizeMode | undefined;
      };

    export type SpacerProps = BaseProps & {
      size?: SpacerSize | undefined;
      shape?: SpacerShape | undefined;
    };

    export type IconProps = BaseProps &
      HasStringChildren &
      Actionable & {
        name: IconName;
        color?: ColorString | undefined;
        lightColor?: ColorString | undefined;
        darkColor?: ColorString | undefined;
        size?: IconSize | undefined;
      };

    export type AvatarProps = BaseProps &
      Actionable & {
        thingId: string;
        facing?: AvatarFacing | undefined;
        size?: AvatarSize | undefined;
        background?: AvatarBackground | undefined;
      };

    export type WebViewProps = BaseProps &
      WebViewActionable & {
        url: string;
      };
  }
}

export type BlockElement = {
  type: JSX.ComponentFunction | string | undefined;

  props: { [key: string]: unknown } | undefined;
  children: JSX.Element[];
};

// Workaround api-extractor https://github.com/microsoft/rushstack/issues/1709
// type augmentations bug. Everything starting at declare is concatenated onto
// public-api.d.ts.
declare global {
  namespace JSX {
    interface IntrinsicElements extends Devvit.Blocks.IntrinsicElements {}

    type Fragment = Iterable<JSX.Element>;
    type SyncElement = BlockElement | JSX.Fragment | string | number | boolean | null;
    type Element = SyncElement | Promise<SyncElement>;
    type ElementChildrenAttribute = { children: {} };
    type Children = JSX.Element | JSX.Element[];
    type Props<T extends {} = {}> = T & { children?: Devvit.ElementChildren };

    type ComponentFunction = (props: JSX.Props, context: Devvit.Context) => JSX.Element;
  }
}
