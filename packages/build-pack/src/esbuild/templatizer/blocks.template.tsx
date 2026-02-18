import type { PaymentHandlerResponse } from '@devvit/payments';
import type { PaymentHandler } from '@devvit/payments';
import { addPaymentHandler, paymentHelpMenuItem } from '@devvit/payments/shared';
import type { Logger, Metadata } from '@devvit/protos';
import { LoggerDefinition, Severity } from '@devvit/protos';
import {
  type DevvitPostData,
  type SplashPostData,
} from '@devvit/protos/json/devvit/ui/effects/web_view/v1alpha/context.js';
import {
  type Context,
  Devvit,
  type FormKey,
  type MenuItem,
  SettingScope,
  type SettingsFormField,
  type SettingsFormFieldValidatorEvent,
  type TriggerEventType,
} from '@devvit/public-api';
import type { TaskRequest } from '@devvit/scheduler';
import type { SettingsValidationResponse, Toast, TriggerRequest, UiResponse } from '@devvit/shared';
import { Header } from '@devvit/shared-types/Header.js';
import type { JsonObject, JsonValue, PartialJsonObject } from '@devvit/shared-types/json.js';
import type {
  AppConfig,
  AppFormsConfig,
  AppMenuItemConfig,
  AppPaymentsConfig,
  AppPermissionConfig,
  AppPostConfig,
  AppPostEntrypointConfig,
  AppSchedulerConfig,
  AppSettingConfig,
  AppTriggersConfig,
} from '@devvit/shared-types/schemas/config-file.v1.js';
import { getDevvitConfig } from '@devvit/shared-types/server/get-devvit-config.js';
import { getServerPort } from '@devvit/shared-types/server/get-server-port.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { Splash } from '@devvit/splash/splash.js';
import { backgroundUrl } from '@devvit/splash/utils/assets.js';

declare module '@devvit/public-api' {
  // Expose privates in the `Devvit` singleton. These signatures must be
  // manually synced.
  namespace Devvit {
    function _initForms(): void;
    function _initMenu(): void;
    function _initScheduler(): void;
    function _initSettings(global: boolean, sub: boolean): void;
  }
}

declare module '@devvit/payments/shared' {
  // This is copied over from @devvit/payments/paymentHandler.ts to avoid exposing the unnecessary
  // internal-only function to Webbit users. If you change this here, change it there too.
  export const addPaymentHandler: (paymentHandler: PaymentHandler) => void;
  // This is copied over from @devvit/payments/paymentHelpMenuItem.ts to avoid exposing the unnecessary
  // internal-only object to Webbit users. If you change this here, change it there too.
  export const paymentHelpMenuItem: MenuItem;
}

// Hack: rename config2 to workaround declaration in
//       packages/runtime-lite/src/runtime/SandboxedRuntimeLite.ts.
// __devvit__ is initialized by ESBuildPack and undefined in tests only.
// @ts-expect-error no type.
const config2: AppConfig | undefined = globalThis.__devvit__?.config;

/** @internal [state] Map of devvit.json form keys to Devvit-singleton form keys. */
export const formKeyMap: { [formKey: string]: FormKey } = {};

/** @internal */
export function abbreviate(str: string): string {
  return str.length > 256 ? `${str.slice(0, 256)}…` : str;
}

function configurePermissions(permissions: Readonly<AppPermissionConfig>): void {
  // to-do: remove. This is a relic of LinkedBundle generation.
  Devvit.configure({
    http: {
      enabled: permissions.http.enable,
      domains: permissions.http.domains,
    },
    blob: permissions.blob,
    media: permissions.media,
    // to-do: payments permissions.
    realtime: permissions.realtime,
    redditAPI: permissions.reddit.enable,
    userActions:
      permissions.reddit.asUser.length > 0 ? { scopes: permissions.reddit.asUser } : false,
    redis: permissions.redis,
  });
}

function configurePost(name: string, post: Readonly<AppPostConfig>): void {
  const renderSplash = (
    entrypoint: Readonly<AppPostEntrypointConfig>,
    splash: SplashPostData | undefined
  ) => {
    return (
      // Align to `submitCustomPost()`.
      <Splash
        appDisplayName={splash?.appDisplayName ?? name}
        appIconUri={splash?.appIconUri}
        backgroundUri={splash?.backgroundUri ?? backgroundUrl}
        buttonLabel={splash?.buttonLabel}
        description={splash?.description}
        entryUri={entrypoint.entry}
        heading={splash?.title}
        height={entrypoint.height}
      />
    );
  };

  const renderInline = (entrypoint: Readonly<AppPostEntrypointConfig>) => {
    return (
      <blocks height={entrypoint.height}>
        <webview url={entrypoint.entry} width="100%" height="100%" />
      </blocks>
    );
  };

  const defaultEntrypoint = post.entrypoints.default;
  Devvit.addCustomPostType({
    name: '',
    render: (ctx) => {
      const postDataHeader = ctx.metadata[Header.PostData]?.values[0];
      const postData: DevvitPostData = postDataHeader
        ? JSON.parse(postDataHeader)
        : ({} satisfies DevvitPostData);
      const splash = postData.splash;
      const entry = splash?.entry ? post.entrypoints[splash.entry] : defaultEntrypoint;
      return entry.inline ? renderInline(entry) : renderSplash(entry, splash);
    },
  });
}

function configureMenuItems(menuItems: Readonly<AppMenuItemConfig[]>): void {
  Devvit._initMenu();
  for (const action of menuItems) {
    const menuItem: MenuItem = {
      label: action.label,
      location: action.location,
      async onPress(ev, ctx) {
        const rsp = await fetchWebbit(action.endpoint, ev, ctx.metadata);
        if (!rsp) return;
        assertUiResponse(action.endpoint, rsp);
        handleUiResponse(ctx, rsp);
      },
    };

    // "user" type is blank in Devvit classic. So if it's present in
    // devvit.json, we add an extra menu item without forUserType set.
    // "moderator" maps across as expected.
    // "loggedOut" type (Devvit classic) we no longer support
    if (action.forUserType === 'moderator') menuItem.forUserType = 'moderator';
    if (action.postFilter === 'currentApp') menuItem.postFilter = action.postFilter;
    if (action.description) menuItem.description = action.description;

    Devvit.addMenuItem(menuItem);
  }
}

function configurePayments(menuItems: Readonly<AppPaymentsConfig>): void {
  const paymentHandler: PaymentHandler = {
    fulfillOrder: async (order, ctx) => {
      const jsonableOrder = {
        ...order,
        createdAt: order.createdAt ? order.createdAt.toISOString() : null,
        updatedAt: order.updatedAt ? order.updatedAt.toISOString() : null,
      };
      const rsp = await fetchWebbit(menuItems.endpoints.fulfillOrder, jsonableOrder, ctx.metadata);
      return rsp as PaymentHandlerResponse;
    },
  };

  const refundEndpoint = menuItems.endpoints.refundOrder;
  if (refundEndpoint) {
    paymentHandler.refundOrder = async (order, ctx) => {
      const jsonableOrder = {
        ...order,
        createdAt: order.createdAt ? order.createdAt.toISOString() : null,
        updatedAt: order.updatedAt ? order.updatedAt.toISOString() : null,
      };
      await fetchWebbit(refundEndpoint, jsonableOrder, ctx.metadata);
    };
  }

  addPaymentHandler(paymentHandler);
  Devvit._initMenu();
  Devvit.addMenuItem(paymentHelpMenuItem);
}

function configureForms(forms: Readonly<AppFormsConfig>): void {
  Devvit._initForms();
  for (const [name, endpoint] of Object.entries(forms)) {
    formKeyMap[name] = Devvit.createForm({ fields: [] }, async (ev, ctx) => {
      const rsp = await fetchWebbit(endpoint, ev.values, ctx.metadata);
      if (!rsp) return;
      assertUiResponse(endpoint, rsp);
      handleUiResponse(ctx, rsp);
    });
  }
}

// TODO: expand this to include Form definitions.
/** @internal */
export function assertUiResponse(
  endpoint: string,
  rsp: Readonly<PartialJsonObject>
): asserts rsp is UiResponse {
  const preamble = `Node.js server endpoint ${endpoint} returned the wrong UiResponse;`;

  const keyset: { [k in keyof Required<UiResponse>]: undefined } = {
    navigateTo: undefined,
    showToast: undefined,
    showForm: undefined,
  };
  for (const k in rsp)
    if (!(k in keyset))
      throw Error(`${preamble} unknown key "${k}": ${abbreviate(JSON.stringify(rsp))}`);

  if ('navigateTo' in rsp) {
    if (
      rsp.navigateTo == null ||
      Array.isArray(rsp.navigateTo) ||
      (typeof rsp.navigateTo !== 'string' && typeof rsp.navigateTo !== 'object') ||
      (typeof rsp.navigateTo === 'object' && typeof rsp.navigateTo.url !== 'string')
    )
      throw Error(
        `${preamble} navigateTo must be a string or \`{"url": string}\`: ${abbreviate(JSON.stringify(rsp.navigateTo))}`
      );

    // navigateTo must be a valid URL or a Post object. (this is validated
    // client-side, so we don't need to validate it here).
  }

  if ('showToast' in rsp) {
    if (
      rsp.showToast == null ||
      Array.isArray(rsp.showToast) ||
      (typeof rsp.showToast !== 'string' && typeof rsp.showToast !== 'object') ||
      (typeof rsp.showToast === 'object' && !isValidToastObject(rsp.showToast))
    )
      throw Error(
        `${preamble} showToast must be a string or \`{"text": string}\`: ${abbreviate(JSON.stringify(rsp.showToast))}`
      );
  }

  if ('showForm' in rsp) {
    if (
      rsp.showForm == null ||
      Array.isArray(rsp.showForm) ||
      typeof rsp.showForm !== 'object' ||
      typeof rsp.showForm.name !== 'string' ||
      typeof rsp.showForm.form !== 'object' ||
      ('data' in rsp.showForm && typeof rsp.showForm.data !== 'object')
    )
      throw Error(
        `${preamble} showForm must be a ShowForm: ${abbreviate(JSON.stringify(rsp.showForm))}`
      );

    if (!formKeyMap[rsp.showForm.name]) {
      throw new Error(
        `${preamble} form with name "${rsp.showForm.name}" not found in devvit.json. Consider adding:\n\n    "forms": {"${rsp.showForm.name}":"/internal/your/endpoint"}\n\n`
      );
    }
  }

  // navigateTo and showForm are mutually exclusive.
  if (rsp.navigateTo && rsp.showForm) {
    throw new Error('navigateTo and showForm cannot be used together in UiResponse');
  }
}

function isValidToastObject(showToast: Readonly<PartialJsonObject>): showToast is Toast {
  // Check text
  if (typeof showToast.text !== 'string') {
    return false;
  }
  // Check appearance is either not set, or one of the valid values
  if (
    showToast.appearance !== 'neutral' &&
    showToast.appearance !== 'success' &&
    showToast.appearance != null
  ) {
    return false;
  }
  // Check that no other properties exist
  return Object.keys(showToast).every((key) => ['text', 'appearance'].includes(key));
}

/** @internal */
export function assertSettingsValidationResponse(
  rsp: Readonly<JsonObject>
): asserts rsp is SettingsValidationResponse {
  if (!('success' in rsp) || typeof rsp.success !== 'boolean') {
    throw new Error('SettingsValidationResponse must have a boolean "success" field');
  }
  if ('error' in rsp && typeof rsp.error !== 'string') {
    throw new Error('"error" field in SettingsValidationResponse must be a string');
  }
}

function configureTriggers(triggers: Readonly<AppTriggersConfig>): void {
  for (const [name, endpoint] of Object.entries(triggers)) {
    const ev = name.replace(/^on/, '') as keyof TriggerEventType;
    Devvit.addTrigger({
      event: ev,
      async onEvent(ev, ctx) {
        if (!endpoint) return; // Implementation provided by Blocks.
        // Convert the hydrated old Protobuf to JSON. Don't use
        // Protobuf.toJSON() which would omit default values.
        const body: TriggerRequest = JSON.parse(JSON.stringify(ev));
        await fetchWebbit(endpoint, body, ctx.metadata);
        // Don't care about response.
      },
    });
  }
}

/**
 * Handle a UiResponse from a Webbit handler (menu action or form handler).
 * This is used to create client-side UI effects in Reddit clients as responses
 * to user actions in cases where the Devvit app is not in the direct code path.
 *
 * If multiple effects are present in the UiResponse, they will all be applied.
 */
function handleUiResponse(ctx: Context, uiResponse: UiResponse): void {
  if (uiResponse.showToast) {
    ctx.ui.showToast(uiResponse.showToast);
  }

  if (uiResponse.navigateTo) {
    ctx.ui.navigateTo(uiResponse.navigateTo);
  }

  if (uiResponse.showForm) {
    ctx.ui.showFormInternal(
      formKeyMap[uiResponse.showForm.name],
      uiResponse.showForm.data,
      uiResponse.showForm.form
    );
  }
}

/**
 * Post to endpoint and return user Node.js server response. All responses are
 * expected to be empty or a JSON _object_.
 *
 * @throws Throws on `!Response.ok`.
 * @throws Response body is nonempty and content-type is not JSON.
 * @throws Response body is nonempty and unparsable.
 * @throws Response body is nonempty and not a JSON object.
 * @internal
 */
export async function fetchWebbit(
  endpoint: string,
  body: Readonly<PartialJsonObject>,
  meta: Readonly<Metadata>
): Promise<JsonObject | undefined> {
  const url = new URL(endpoint, `http://webbit.local:${getServerPort()}/`);

  const headers: { [k: string]: string } = {};
  for (const [k, v] of Object.entries(meta)) headers[k] = v.values.join();
  headers['Content-Type'] = 'application/json';
  headers['Accept'] = 'application/json';

  const preamble = `Failed to POST to Node.js server endpoint ${endpoint}; server responded with`;

  let rsp;
  try {
    rsp = await fetch(url, {
      body: JSON.stringify(body),
      headers,
      method: 'POST',
      // to-do: redirect: 'manual'?
    });
  } catch (err) {
    throw `${preamble} error: ${err instanceof Error ? err.message : err}`;
  }

  let text: string;
  try {
    text = await rsp.text();
  } catch {
    throw Error(
      `${preamble} HTTP status ${rsp.status}: ${rsp.statusText}; unreadable response body`
    );
  }

  const bodySuffix = text ? `; body: ${abbreviate(text)}` : '';

  if (rsp.status === 404)
    throw Error(
      `${preamble} HTTP status ${rsp.status}: ensure the server handles the \`${endpoint}\` endpoint${bodySuffix}`
    );

  if (!rsp.ok) throw Error(`${preamble} HTTP status ${rsp.status}: ${rsp.statusText}${bodySuffix}`);

  if (!text) return;

  const contentLen = rsp.headers.get('Content-Length');
  if (!Number(contentLen))
    throw Error(
      `${preamble} Content-Length header "${contentLen}" but greater than zero required for nonempty response`
    );

  const contentType = rsp.headers.get('Content-Type');
  if (!contentType || !contentType.includes('application/json')) {
    throw Error(
      `${preamble} Content-Type header "${contentType}" but only "application/json" is supported`
    );
  }

  let json: JsonValue;
  try {
    json = JSON.parse(text);
  } catch {
    throw Error(`${preamble} an unparsable JSON body: ${abbreviate(text)}`);
  }

  if (!json || typeof json !== 'object' || Array.isArray(json))
    throw Error(
      `${preamble} an unrecognized JSON body instead of an object \`{}\`: ${abbreviate(text)}`
    );

  return json;
}

function configureScheduler(schedulerConfig: Readonly<AppSchedulerConfig>): void {
  Devvit._initScheduler();
  const cronTasks: AppSchedulerConfig['tasks'] = {};
  for (const [name, task] of Object.entries(schedulerConfig.tasks)) {
    Devvit.addSchedulerJob({
      name: name,
      onRun: async (event, context) => {
        await fetchWebbit(
          task.endpoint,
          { name: event.name, data: event.data } satisfies TaskRequest,
          context.metadata
        );
        // Don't care about response.
      },
    });

    // Tasks with cron specified require a bit more work further down
    if (task.cron) {
      cronTasks[name] = task;
    }
  }

  // If provided, schedule any cron tasks the user asked for on install/upgrade, being careful to
  // un-schedule any previously scheduled instances of these tasks
  if (Object.keys(cronTasks).length > 0) {
    Devvit.addTrigger({
      events: ['AppInstall', 'AppUpgrade'],
      onEvent: async (_event, context) => {
        // Get all jobs
        const existingJobs = await context.scheduler.listJobs();
        // Filter down to just cron jobs
        const jobsToCancel = existingJobs.filter((job) => {
          // Only cancel cron jobs
          return 'cron' in job;
        });

        // Cancel everything we need to
        await Promise.all(jobsToCancel.map((job) => context.scheduler.cancelJob(job.id)));
        // Schedule all the cron tasks we were given in the config
        await Promise.all(
          Object.entries(cronTasks).map(async ([name, task]) => {
            const logger = getDevvitConfig().use<Logger>(LoggerDefinition);

            try {
              await context.scheduler.runJob({
                name: name,
                cron: task.cron!,
                ...(task.data ? { data: task.data } : {}),
              });
            } catch (error) {
              await logger.Log(
                {
                  message: `Failed to schedule ${name}: ${StringUtil.caughtToString(error, 'message')}`,
                  severity: Severity.ERROR,
                  tags: [],
                },
                context.metadata
              );
              throw error;
            }
            await logger.Log(
              { message: `Cron task '${name}' scheduled.`, severity: Severity.VERBOSE, tags: [] },
              context.metadata
            );
          })
        );
      },
    });
  }
}

function configureSettings(settings: Readonly<AppConfig['settings']>): void {
  const classicSettings: SettingsFormField[] = [];
  Devvit._initSettings(!!settings?.global, !!settings?.subreddit);
  for (const config of Object.values(settings?.global || {})) {
    classicSettings.push(coerceSettingForClassic(config, SettingScope.App));
  }

  for (const config of Object.values(settings?.subreddit || {})) {
    classicSettings.push(coerceSettingForClassic(config, SettingScope.Installation));
  }

  Devvit.addSettings(classicSettings);
}

function coerceSettingForClassic(
  setting: Readonly<AppSettingConfig>,
  scope: SettingScope
): SettingsFormField {
  let classicSetting: SettingsFormField;
  if (setting.type === 'select') {
    const { defaultValue, ...settingWithoutDefault } = setting;
    classicSetting = {
      ...settingWithoutDefault,
      scope,
    };
    if (defaultValue) {
      classicSetting.defaultValue = [defaultValue];
    }
  } else if (setting.type === 'multiSelect') {
    classicSetting = {
      ...setting,
      type: 'select',
      multiSelect: true,
      scope,
    };
  } else {
    classicSetting = {
      ...setting,
      scope,
    };
  }

  if (setting.validationEndpoint) {
    classicSetting.onValidate = async function validateSettingsField(
      event: SettingsFormFieldValidatorEvent<string | boolean | number | string[]>,
      context: Devvit.Context
    ): Promise<string | undefined> {
      const rsp = await fetchWebbit(
        setting.validationEndpoint!,
        { value: event.value, isEditing: event.isEditing },
        context.metadata
      );
      if (!rsp) return; // Assume success.
      assertSettingsValidationResponse(rsp);
      if (rsp.success) {
        return;
      }
      return rsp.error;
    };
  }

  return classicSetting;
}

if (config2) {
  configurePermissions(config2.permissions);
  if (config2.post) configurePost(config2.name, config2.post);
  if (config2.menu) configureMenuItems(config2.menu.items);
  if (config2.scheduler) configureScheduler(config2.scheduler);
  if (config2.forms) configureForms(config2.forms);
  if (config2.triggers) configureTriggers(config2.triggers);
  if (config2.settings) configureSettings(config2.settings);
  if (config2.payments) configurePayments(config2.payments);
}

export default Devvit;
