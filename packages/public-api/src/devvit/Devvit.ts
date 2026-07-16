import { Scope } from '@devvit/protos/json/reddit/devvit/app_permission/v1/app_permission.js';
import type { Definition, Metadata } from '@devvit/protos/lib/Types.js';
// eslint-disable-next-line no-restricted-imports
import type { ContextAction } from '@devvit/protos/types/devvit/actor/reddit/context_action.js';
// eslint-disable-next-line no-restricted-imports
import type { SchedulerHandler } from '@devvit/protos/types/devvit/actor/scheduler/handler.js';
// eslint-disable-next-line no-restricted-imports
import type { HTTP } from '@devvit/protos/types/devvit/plugin/http/http.js';
// eslint-disable-next-line no-restricted-imports
import { HTTPDefinition } from '@devvit/protos/types/devvit/plugin/http/http.js';
// eslint-disable-next-line no-restricted-imports
import type { Logger } from '@devvit/protos/types/devvit/plugin/logger/logger.js';
// eslint-disable-next-line no-restricted-imports
import type { MediaService } from '@devvit/protos/types/devvit/plugin/media/media.js';
// eslint-disable-next-line no-restricted-imports
import { MediaServiceDefinition } from '@devvit/protos/types/devvit/plugin/media/media.js';
// eslint-disable-next-line no-restricted-imports
import type { Flair } from '@devvit/protos/types/devvit/plugin/redditapi/flair/flair_svc.js';
// eslint-disable-next-line no-restricted-imports
import { FlairDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/flair/flair_svc.js';
// eslint-disable-next-line no-restricted-imports
import type { GraphQL } from '@devvit/protos/types/devvit/plugin/redditapi/graphql/graphql_svc.js';
// eslint-disable-next-line no-restricted-imports
import { GraphQLDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/graphql/graphql_svc.js';
// eslint-disable-next-line no-restricted-imports
import type { LinksAndComments } from '@devvit/protos/types/devvit/plugin/redditapi/linksandcomments/linksandcomments_svc.js';
// eslint-disable-next-line no-restricted-imports
import { LinksAndCommentsDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/linksandcomments/linksandcomments_svc.js';
// eslint-disable-next-line no-restricted-imports
import type { Listings } from '@devvit/protos/types/devvit/plugin/redditapi/listings/listings_svc.js';
// eslint-disable-next-line no-restricted-imports
import { ListingsDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/listings/listings_svc.js';
// eslint-disable-next-line no-restricted-imports
import type { Moderation } from '@devvit/protos/types/devvit/plugin/redditapi/moderation/moderation_svc.js';
// eslint-disable-next-line no-restricted-imports
import { ModerationDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/moderation/moderation_svc.js';
// eslint-disable-next-line no-restricted-imports
import type { ModNote } from '@devvit/protos/types/devvit/plugin/redditapi/modnote/modnote_svc.js';
// eslint-disable-next-line no-restricted-imports
import { ModNoteDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/modnote/modnote_svc.js';
// eslint-disable-next-line no-restricted-imports
import type { NewModmail } from '@devvit/protos/types/devvit/plugin/redditapi/newmodmail/newmodmail_svc.js';
// eslint-disable-next-line no-restricted-imports
import { NewModmailDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/newmodmail/newmodmail_svc.js';
// eslint-disable-next-line no-restricted-imports
import type { PrivateMessages } from '@devvit/protos/types/devvit/plugin/redditapi/privatemessages/privatemessages_svc.js';
// eslint-disable-next-line no-restricted-imports
import { PrivateMessagesDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/privatemessages/privatemessages_svc.js';
// eslint-disable-next-line no-restricted-imports
import type { Subreddits } from '@devvit/protos/types/devvit/plugin/redditapi/subreddits/subreddits_svc.js';
// eslint-disable-next-line no-restricted-imports
import { SubredditsDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/subreddits/subreddits_svc.js';
// eslint-disable-next-line no-restricted-imports
import type { Users } from '@devvit/protos/types/devvit/plugin/redditapi/users/users_svc.js';
// eslint-disable-next-line no-restricted-imports
import { UsersDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/users/users_svc.js';
// eslint-disable-next-line no-restricted-imports
import type { Widgets } from '@devvit/protos/types/devvit/plugin/redditapi/widgets/widgets_svc.js';
// eslint-disable-next-line no-restricted-imports
import { WidgetsDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/widgets/widgets_svc.js';
// eslint-disable-next-line no-restricted-imports
import type { Wiki } from '@devvit/protos/types/devvit/plugin/redditapi/wiki/wiki_svc.js';
// eslint-disable-next-line no-restricted-imports
import { WikiDefinition } from '@devvit/protos/types/devvit/plugin/redditapi/wiki/wiki_svc.js';
// eslint-disable-next-line no-restricted-imports
import type { RedisAPI } from '@devvit/protos/types/devvit/plugin/redis/redisapi.js';
// eslint-disable-next-line no-restricted-imports
import { RedisAPIDefinition } from '@devvit/protos/types/devvit/plugin/redis/redisapi.js';
// eslint-disable-next-line no-restricted-imports
import type { Scheduler } from '@devvit/protos/types/devvit/plugin/scheduler/scheduler.js';
// eslint-disable-next-line no-restricted-imports
import { SchedulerDefinition } from '@devvit/protos/types/devvit/plugin/scheduler/scheduler.js';
// eslint-disable-next-line no-restricted-imports
import type { Settings } from '@devvit/protos/types/devvit/plugin/settings/v1alpha/settings.js';
// eslint-disable-next-line no-restricted-imports
import { SettingsDefinition } from '@devvit/protos/types/devvit/plugin/settings/v1alpha/settings.js';
// eslint-disable-next-line no-restricted-imports
import type { UserActions } from '@devvit/protos/types/devvit/plugin/useractions/useractions.js';
// eslint-disable-next-line no-restricted-imports
import { UserActionsDefinition } from '@devvit/protos/types/devvit/plugin/useractions/useractions.js';
// eslint-disable-next-line no-restricted-imports
import type { UnknownMessage } from '@devvit/protos/types/typeRegistry.js';
import { Actor } from '@devvit/shared-types/Actor.js';
import type { AssetMap } from '@devvit/shared-types/Assets.js';
import type { Config } from '@devvit/shared-types/Config.js';
import {
  assertRequestedFetchDomainsLimit,
  normalizeDomains,
} from '@devvit/shared-types/fetch-domains.js';
import type {} from '@devvit/shared-types/shared/devvit-worker-global.js';
import type { FormKey } from '@devvit/shared-types/useForm.js';

import { assertValidFormFields } from '../apis/ui/helpers/assertValidFormFields.js';
import type {
  BaseContext,
  Configuration,
  ContextAPIClients,
  Form,
  FormDefinition,
  FormFunction,
  FormOnSubmitEventHandler,
  FormToFormValues,
  MenuItem,
  MultiTriggerDefinition,
  OnTriggerRequest,
  PluginSettings,
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
import type { JSONObject } from '../types/json.js';
import { registerAppSettings } from './internals/app-settings.js';
import { registerInstallationSettings } from './internals/installation-settings.js';
import { registerMenuItems } from './internals/menu-items.js';
import { pluginIsEnabled } from './internals/plugins.js';
import { registerScheduler } from './internals/scheduler.js';
import { registerTriggers } from './internals/triggers.js';
import { registerUIEventHandler } from './internals/ui-event-handler.js';

type UseHandler = {
  [name: string]: (args: UnknownMessage | undefined, metadata?: Metadata) => void;
};

type PluginType =
  | HTTP
  | Logger
  | Scheduler
  | ContextAction
  | SchedulerHandler
  | Flair
  | GraphQL
  | LinksAndComments
  | Listings
  | Moderation
  | ModNote
  | NewModmail
  | PrivateMessages
  | RedisAPI
  | Settings
  | Subreddits
  | Users
  | Widgets
  | Wiki
  | MediaService
  | UserActions;

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
  static #config: Configuration = {};
  static #formDefinitions: Map<FormKey, FormDefinition> | undefined;
  static #installationSettings: SettingsFormField[] | undefined;
  static #menuItems: MenuItem[] | undefined;
  static #scheduledJobHandlers: Map<string, ScheduledJobHandler> | undefined;
  static readonly #triggerOnEventHandlers: Map<
    TriggerEvent,
    TriggerOnEventHandler<OnTriggerRequest>[]
  > = new Map();
  static #domains: string[] = [];
  static #scopes: Scope[] = [];

  static #additionallyProvides: Definition[] = [];

  /**
   * To use certain APIs and features of Devvit, you must enable them using this function.
   *
   * @param config - The configuration object.
   * @param config.http - Enables the HTTP API.
   * @param config.redditAPI - Enables the Reddit API.
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

    const httpConfig = config.http;
    const hasRequestedDomains = typeof httpConfig === 'object' && 'domains' in httpConfig;
    const pluginSettings: PluginSettings | boolean | undefined = hasRequestedDomains
      ? { enabled: true }
      : httpConfig;
    if (pluginIsEnabled(pluginSettings)) {
      if (hasRequestedDomains) {
        assertRequestedFetchDomainsLimit(httpConfig.domains);
        this.#domains = normalizeDomains(httpConfig.domains);
      }
      this.use(HTTPDefinition);
    }

    // We're now defaulting this to on.
    const redisNotSpecified = config.redis === undefined;
    if (redisNotSpecified || pluginIsEnabled(config.redis)) {
      this.use(RedisAPIDefinition);
    }

    if (pluginIsEnabled(config.media)) {
      this.use(MediaServiceDefinition);
    }

    if (pluginIsEnabled(config.redditAPI)) {
      // Loading all Reddit API plugins for now.
      // In the future we can split this by oauth scope or section.
      this.use(FlairDefinition);
      this.use(GraphQLDefinition);
      this.use(LinksAndCommentsDefinition);
      this.use(ListingsDefinition);
      this.use(ModerationDefinition);
      this.use(ModNoteDefinition);
      this.use(NewModmailDefinition);
      this.use(PrivateMessagesDefinition);
      this.use(SubredditsDefinition);
      this.use(UsersDefinition);
      this.use(WidgetsDefinition);
      this.use(WikiDefinition);
    }

    const userActionsConfig = config.userActions;
    const hasScopes = typeof userActionsConfig === 'object' && 'scopes' in userActionsConfig;
    const pluginEnabled: PluginSettings | boolean | undefined = hasScopes
      ? { enabled: true }
      : userActionsConfig;

    if (pluginIsEnabled(pluginEnabled)) {
      this.use(UserActionsDefinition);
      this.#scopes = this.#getUserScopesFromConfig(config);
    }
  }

  /**
   * Add a menu item to the Reddit UI.
   * @param item - The menu item to add.
   * @param item.label - The label of the menu item.
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
  static addMenuItem(item: MenuItem): void {
    this._initMenu();
    this.#menuItems!.push(item);
  }

  /**
   * Create a form that can be opened from menu items.
   * @param form - The form or a function that returns the form.
   * @param onSubmit - The function to call when the form is submitted.
   * @returns A unique key for the form that can used with `ui.showForm`.
   */
  static createForm<const T extends Form | FormFunction>(
    form: T,
    onSubmit: FormOnSubmitEventHandler<FormToFormValues<T>>
  ): FormKey {
    this._initForms();
    const formKey: FormKey = `form.${this.#formDefinitions!.size}`;
    this.#formDefinitions!.set(formKey, {
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
    this._initScheduler();

    if (this.#scheduledJobHandlers!.has(job.name)) {
      throw new Error(`Job ${job.name} is already defined`);
    }

    this.#scheduledJobHandlers!.set(
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

    this._initSettings(appSettings.length > 0, installSettings.length > 0);

    if (installSettings.length > 0) {
      // initialize the installation settings with empty array if it is not initialized
      this.#installationSettings!.push(...installSettings);
    }

    if (appSettings.length > 0) {
      // initialize the app settings with empty array if it is not initialized
      this.#appSettings!.push(...appSettings);
    }

    assertValidFormFields([...(this.#installationSettings ?? []), ...(this.#appSettings ?? [])]);

    if (!this.#pluginClients[SettingsDefinition.fullName]) {
      this.use(SettingsDefinition);
    }

    // Save the settings to the global devvit object so that they can be accessed by the settings
    // plugin.
    // TODO: This should be set in the devvit.json config, saved on the bundle by the CLI,
    //  and loaded into the globalThis.devvit.settings object by the bootstrap code.
    globalThis.devvit ??= {};
    globalThis.devvit.settings ??= {};
    globalThis.devvit.settings.app = this.#appSettings;
    globalThis.devvit.settings.installation = this.#installationSettings;
  }

  /**
   * Add a trigger handler that will be invoked when the given event
   * occurs in a subreddit where the app is installed.
   *
   * @param definition - The trigger definition.
   * @param definition.event - The event to listen for.
   * @param definition.events - The events to listen for.
   * @param definition.onEvent - The function to call when the event happens.
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
  static provide(def: Definition): void {
    this.#additionallyProvides.push(def);
  }

  /** @internal */
  static #uses: {
    [fullName: Definition['fullName']]: {
      def: Definition;
      handler: Readonly<UseHandler> | undefined;
    };
  } = {};

  /** @internal */
  static #pluginClients: {
    [fullName: Definition['fullName']]: PluginType;
  } = {};

  /** @internal */
  static use<T>(d: Definition): T {
    this.#uses[d.fullName] = { def: d, handler: undefined };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrapped: any = {};
    for (const method of Object.values(d.methods)) {
      wrapped[method.name] = (args: UnknownMessage | undefined, metadata?: Metadata) =>
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
    NewModmail: NewModmail;
    Widgets: Widgets;
    ModNote: ModNote;
    LinksAndComments: LinksAndComments;
    Moderation: Moderation;
    GraphQL: GraphQL;
    Listings: Listings;
    Flair: Flair;
    Wiki: Wiki;
    Users: Users;
    PrivateMessages: PrivateMessages;
    Subreddits: Subreddits;
  } {
    if (!pluginIsEnabled(this.#config.redditAPI)) {
      throw new Error(
        'Reddit API is not enabled. You can enable it by passing `redditAPI: true` to `Devvit.configure`.'
      );
    }

    return {
      Flair: this.#pluginClients[FlairDefinition.fullName] as Flair,
      GraphQL: this.#pluginClients[GraphQLDefinition.fullName] as GraphQL,
      LinksAndComments: this.#pluginClients[
        LinksAndCommentsDefinition.fullName
      ] as LinksAndComments,
      Listings: this.#pluginClients[ListingsDefinition.fullName] as Listings,
      Moderation: this.#pluginClients[ModerationDefinition.fullName] as Moderation,
      ModNote: this.#pluginClients[ModNoteDefinition.fullName] as ModNote,
      NewModmail: this.#pluginClients[NewModmailDefinition.fullName] as NewModmail,
      PrivateMessages: this.#pluginClients[PrivateMessagesDefinition.fullName] as PrivateMessages,
      Subreddits: this.#pluginClients[SubredditsDefinition.fullName] as Subreddits,
      Users: this.#pluginClients[UsersDefinition.fullName] as Users,
      Widgets: this.#pluginClients[WidgetsDefinition.fullName] as Widgets,
      Wiki: this.#pluginClients[WikiDefinition.fullName] as Wiki,
    };
  }

  /** @internal */
  static get schedulerPlugin(): Scheduler {
    const scheduler = this.#pluginClients[SchedulerDefinition.fullName];

    if (!scheduler) {
      // todo: better error with more details
      throw new Error(
        'Scheduler is not enabled. You can enable it by calling `Devvit.addSchedulerJob` at the top level of your app.'
      );
    }

    return scheduler as Scheduler;
  }

  /** @internal */
  static get redisPlugin(): RedisAPI {
    const redis = this.#pluginClients[RedisAPIDefinition.fullName];

    if (!redis) {
      throw new Error(
        'Redis is not enabled. You can enable it by passing `redis: true` to `Devvit.configure`'
      );
    }

    return redis as RedisAPI;
  }

  /** @internal */
  static get mediaPlugin(): MediaService {
    const media = this.#pluginClients[MediaServiceDefinition.fullName];
    if (!media) {
      throw new Error(
        'MediaService is not enabled. You can enable it by passing `media: true` to `Devvit.configure`'
      );
    }
    return media as MediaService;
  }

  /** @internal */
  static get settingsPlugin(): Settings {
    const settings = this.#pluginClients[SettingsDefinition.fullName];

    if (!settings) {
      throw new Error(
        'Settings must first be configured with `Devvit.addSettings()` before they can be accessed'
      );
    }

    return settings as Settings;
  }

  /** @internal */
  static get userActionsPlugin(): UserActions {
    const userActionsAndRedditApiEnabled =
      this.#scopes.length > 0 && pluginIsEnabled(this.#config.redditAPI);

    if (!userActionsAndRedditApiEnabled) {
      throw new Error(
        'UserActions is not enabled. You can enable it by passing scopes in `userActions: { scopes: [...scopes] }` and `redditAPI: true` to `Devvit.configure`'
      );
    }

    return this.#pluginClients[UserActionsDefinition.fullName] as UserActions;
  }

  /** @internal */
  static get scopes(): Scope[] {
    return this.#scopes;
  }

  /** @internal */
  static get menuItems(): MenuItem[] {
    return this.#menuItems ?? [];
  }

  /** @internal */
  static get formDefinitions(): ReadonlyMap<FormKey, FormDefinition> | undefined {
    return this.#formDefinitions;
  }

  /** @internal */
  static get scheduledJobHandlers(): ReadonlyMap<string, ScheduledJobHandler> | undefined {
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
  static get triggerOnEventHandlers(): ReadonlyMap<
    TriggerEvent,
    TriggerOnEventHandler<OnTriggerRequest>[]
  > {
    return this.#triggerOnEventHandlers;
  }

  /** Do not cache. @internal */
  static get assets(): Readonly<AssetMap> {
    return globalThis.devvit?.assets ?? {};
  }

  /**
   * Force service implementation. Keep in sync with `blocks.template.tsx`.
   * @internal
   */
  private static _initForms(): void {
    this.#formDefinitions ??= new Map();
  }

  /**
   * Force service implementation. Keep in sync with `blocks.template.tsx`.
   * @internal
   */
  private static _initMenu(): void {
    this.#menuItems ??= [];
  }

  /**
   * Force service implementation. Keep in sync with `blocks.template.tsx`.
   * @internal
   */
  private static _initScheduler(): void {
    if (!this.#pluginClients[SchedulerDefinition.fullName]) {
      this.use(SchedulerDefinition);
    }
    this.#scheduledJobHandlers ??= new Map();
  }

  /**
   * Force service implementation. Keep in sync with `blocks.template.tsx`.
   * @internal
   */
  private static _initSettings(global: boolean, sub: boolean): void {
    if (global) this.#appSettings ??= [];
    if (sub) this.#installationSettings ??= [];
  }

  /** @internal */
  constructor(config: Config) {
    super(config);

    globalThis.devvit ??= {};
    globalThis.devvit.config = config;
    globalThis.devvit.assets ??= config.assets;
    // __devvit__ is initialized by ESBuildPack for Webbit apps only.
    // @ts-expect-error no type.
    globalThis.devvit.appConfig ??= globalThis.__devvit__?.config;

    for (const fullName in Devvit.#uses) {
      const use = Devvit.#uses[fullName];
      use.handler = config.use<UseHandler>(use.def);
    }

    // Check for nonnullish provides, not length, since `devvit.json` may
    // declare a service is provided but not actually populate it with any
    // items. Any `LinkedBundle`  provides must have a server implementation.

    if (Devvit.#menuItems) {
      registerMenuItems(config);
    }

    if (Devvit.#scheduledJobHandlers) {
      registerScheduler(config);
    }

    if (Devvit.#formDefinitions) {
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

    if (Devvit.#domains.length > 0 || Devvit.#scopes.length > 0) {
      config.addPermissions?.({
        requestedFetchDomains: Devvit.#domains,
        asUserScopes: Devvit.#scopes,
      });
    }
  }

  // For Blocks apps that enable UserActions but do not specify any scopes, they are implicitly granted SUBMIT_POST and SUBMIT_COMMENT.
  // This is to maintain backwards compatibility with existing Blocks apps and allow them to omit scopes.
  static #getUserScopesFromConfig(config: Configuration): Scope[] {
    const configUserActions = config.userActions;
    if (!configUserActions) return [];

    // Case: Devvit.configure({ userActions: true })
    if (typeof configUserActions === 'boolean' && configUserActions)
      return [Scope.SUBMIT_POST, Scope.SUBMIT_COMMENT];

    // Case: Devvit.configure({ userActions: { enabled: true } })
    if (
      typeof configUserActions === 'object' &&
      'enabled' in configUserActions &&
      configUserActions.enabled
    ) {
      return 'scopes' in configUserActions
        ? (configUserActions.scopes as Scope[])
        : [Scope.SUBMIT_POST, Scope.SUBMIT_COMMENT];
    }

    // Case: Devvit.configure({ userActions: { scopes: [...scopes] } })
    if (typeof configUserActions === 'object' && 'scopes' in configUserActions)
      return configUserActions.scopes;

    // If none of the above cases are true, return no scopes.
    return [];
  }

  /**
   * Throws an error if the specified scope is not present in the Devvit.scopes configuration.
   * @internal
   * @param scope - The scope to check for.
   */
  static assertUserScope(scope: Scope): void {
    const scopeName = Scope[scope];
    if (!Devvit.scopes.includes(scope)) {
      throw Error(
        `To call this API with 'runAs: "USER"', set 'userActions: { scopes: [ Scope.${scopeName} ] }' in your Devvit.configure().`
      );
    }
  }
}

export namespace Devvit {
  // Workaround for typing: aliasing global Context as Devvit.Context bundles
  // incorrectly as `type Context = Context`.
  /**
   *  The current app context of the event or render.
   *  @deprecated - Please switch to the `Context` type exported by public-api.
   */
  export type Context = ContextAPIClients & BaseContext;
}
