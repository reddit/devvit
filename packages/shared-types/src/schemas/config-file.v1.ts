/**
 * Warning: this file is not isomorphic. Do not functionally import this file
 * from client code.
 */

import { readFileSync } from 'node:fs';

import { Scope } from '@devvit/protos/json/reddit/devvit/app_permission/v1/app_permission.js';
import jsonschema, { type Schema } from 'jsonschema/lib/index.js';

import type { JsonObject, JsonValue } from '../json.js';
import type { Product } from '../payments/Product.js';
import schema from './config-file.v1.json' with { type: 'json' };
import { defaultPostEntry, UNINITIALIZED_APP_NAME } from './constants.js';
import productsSchema from './products.json' with { type: 'json' };
import { validateProductsJSON } from './productsSchemaJSONValidator.js';

/**
 * devvit.json with defaults. See config-file.v1.json schema. Schema is assumed
 * to be v1.
 */
export type AppConfig = {
  schema: 'v1';
  name: string;
  media?: { dir: string };
  permissions: AppPermissionConfig;
  post?: AppPostConfig;
  server?: AppServerConfig;
  triggers?: AppTriggersConfig;
  blocks?: AppBlocksConfig;
  dev?: AppDevConfig;
  menu?: AppMenuConfig;
  payments?: AppPaymentsConfig;
  scheduler?: AppSchedulerConfig;
  settings?: AppSettingsConfig;
  forms?: AppFormsConfig;
  marketingAssets?: AppMarketingAssetsConfig;
  /** The original config as parsed. Used for writebacks. */
  json: AppConfigJson;
};
export type AppBlocksConfig = { entry: string };
/** Describes plugin usage. */
export type AppPermissionConfig = {
  http: { enable: boolean; domains: string[] };
  media: boolean;
  menu: boolean;
  payments: boolean;
  realtime: boolean;
  redis: boolean;
  reddit: { enable: boolean; scope: AppScopeConfig; asUser: Scope[] };
  settings: boolean;
  triggers: boolean;
};
export type AppPostConfig = { dir: string; entrypoints: AppPostEntrypointsConfig };
export type AppPostEntrypointsConfig = {
  [name: string]: AppPostEntrypointConfig;
  default: AppPostEntrypointConfig;
};
export type AppPostEntrypointConfig = {
  entry: string;
  name: string;
  height: AppPostHeightConfig;
  inline?: boolean;
};
export type AppPostHeightConfig = 'regular' | 'tall';
export type AppScopeConfig = 'user' | 'moderator';
export type AppServerConfig = { dir: string; entry: string };

/**
 * Keys are assumed to have the format of `on${keyof TriggerEventType}` in
 * blocks.template.tsx. Values are empty when callback is provided by Blocks.
 */
export type AppTriggersConfig = {
  onAppInstall?: string; // to-do: {entry: string, trigger}.
  onAppUpgrade?: string;
  onAutomoderatorFilterComment?: string;
  onAutomoderatorFilterPost?: string;
  onCommentCreate?: string;
  onCommentDelete?: string;
  onCommentReport?: string;
  onCommentSubmit?: string;
  onCommentUpdate?: string;
  onModAction?: string;
  onModMail?: string;
  onPostCreate?: string;
  onPostDelete?: string;
  onPostFlairUpdate?: string;
  onPostNsfwUpdate?: string;
  onPostReport?: string;
  onPostSpoilerUpdate?: string;
  onPostSubmit?: string;
  onPostUpdate?: string;
};
export type AppMenuUserTypeConfig = 'moderator' | 'user';
export type AppMenuLocationConfig = 'comment' | 'post' | 'subreddit';
export type AppMenuPostFilterConfig = 'currentApp' | 'none';
export type AppMenuItemConfig = {
  label: string;
  description: string;
  forUserType: AppMenuUserTypeConfig;
  location: AppMenuLocationConfig[];
  endpoint: string;
  postFilter: AppMenuPostFilterConfig;
};
export type AppMenuConfig = {
  items: AppMenuItemConfig[];
};
export type AppPaymentsConfig = {
  products: Product[];
  productsFile?: string;
  endpoints: {
    fulfillOrder: string;
    refundOrder?: string;
  };
};
export type AppFormsConfig = {
  [formName: string]: string; // to-do: {entry: string, name: string}.
};
export type AppMarketingAssetsConfig = {
  icon?: string;
};
export type AppDevConfig = {
  subreddit?: string;
};
export type AppSchedulerConfig = {
  tasks: { [name: string]: AppSchedulerTaskConfig };
};
export type AppSchedulerTaskConfig = {
  endpoint: string;
  cron?: string;
  data?: JsonObject;
};
export type AppSettingsConfig = {
  global?: { [name: string]: AppSettingConfig };
  subreddit?: { [name: string]: AppSettingConfig };
};
export type AppSettingConfig =
  | AppStringSettingConfig
  | AppParagraphSettingConfig
  | AppNumberSettingConfig
  | AppBooleanSettingConfig
  | AppSelectSettingConfig
  | AppMultiSelectSettingConfig;

export type AppBaseSettingConfig = {
  name: string;
  label: string;
  helpText?: string;
  validationEndpoint?: string;
};
export type AppStringSettingConfig = AppBaseSettingConfig & {
  type: 'string';
  placeholder?: string;
  defaultValue?: string;
  isSecret?: boolean; // Only for global settings
};
export type AppParagraphSettingConfig = AppBaseSettingConfig & {
  type: 'paragraph';
  placeholder?: string;
  defaultValue?: string;
};
export type AppNumberSettingConfig = AppBaseSettingConfig & {
  type: 'number';
  defaultValue?: number;
};
export type AppBooleanSettingConfig = AppBaseSettingConfig & {
  type: 'boolean';
  defaultValue?: boolean;
};
export type AppSelectSettingConfig = AppBaseSettingConfig & {
  type: 'select';
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
};
export type AppMultiSelectSettingConfig = AppBaseSettingConfig & {
  type: 'multiSelect';
  options: Array<{ label: string; value: string }>;
  defaultValue?: string[];
};

export type AppBlocksConfigJson = {
  entry?: string;
  forms?: { enable?: boolean };
  menu?: { enable?: boolean };
  settings?: { enable?: boolean };
  triggers?: (keyof AppTriggersConfig)[];
};
/**
 * https://transform.tools/json-schema-to-typescript
 * @internal
 */
export type AppConfigJson = {
  $schema?: string;
  name: string;
  media?: { dir?: string };
  permissions?: AppPermissionConfigJson;
  post?: AppPostConfigJson;
  server?: { dir?: string; entry?: string };
  triggers?: AppTriggersConfig;
  blocks?: AppBlocksConfigJson;
  menu?: AppMenuConfigJson;
  payments?: AppPaymentsConfigJson;
  forms?: AppFormsConfigJson;
  dev?: { subreddit?: string };
  scheduler?: AppSchedulerConfigJson;
  settings?: AppSettingsConfigJson;
  marketingAssets?: {
    icon?: string;
  };
  /** User data. */
  [key: string]: JsonValue;
};

export type AppFormsConfigJson = { [formName: string]: string };
export type AppMenuConfigJson = {
  items?: {
    label: string;
    description?: string;
    forUserType: AppMenuUserTypeConfig;
    location: AppMenuLocationConfig | AppMenuLocationConfig[];
    endpoint: string;
    postFilter: AppMenuPostFilterConfig;
  }[];
};
export type AppPaymentsConfigJson = {
  endpoints: {
    fulfillOrder: string;
    refundOrder?: string;
  };
} & ({ products: Product[] } | { productsFile: string });
export type AppPermissionConfigJson = {
  http?: { enable?: boolean; domains?: string[] };
  media?: boolean;
  payments?: boolean;
  realtime?: boolean;
  redis?: boolean;
  reddit?: { enable?: boolean; scope?: AppScopeConfig; asUser?: string[] } | boolean;
};
export type AppPostConfigJson = {
  dir?: string;
  entrypoints?: { [name: string]: AppPostEntrypointConfigJson } & {
    default: Partial<AppPostEntrypointConfigJson>;
  };
};
export type AppPostEntrypointConfigJson = {
  entry: string;
  height?: AppPostHeightConfig;
  inline?: boolean;
};
export type AppSchedulerConfigJson = {
  tasks: { [name: string]: AppSchedulerTaskConfig | string };
};
export type AppSettingConfigJson =
  | Omit<AppStringSettingConfig, 'name'>
  | Omit<AppParagraphSettingConfig, 'name'>
  | Omit<AppNumberSettingConfig, 'name'>
  | Omit<AppBooleanSettingConfig, 'name'>
  | Omit<AppSelectSettingConfig, 'name'>
  | Omit<AppMultiSelectSettingConfig, 'name'>;
export type AppSettingsConfigJson = {
  global?: { [name: string]: AppSettingConfigJson };
  subreddit?: { [name: string]: AppSettingConfigJson };
};

export function parseAppConfig(str: string, allowUninitializedConfig: boolean): AppConfig {
  if (!str) throw Error('config is empty');

  let json;
  try {
    json = JSON.parse(str);
  } catch (err) {
    throw Error(`cannot parse config JSON`, { cause: err });
  }

  return parseAppConfigJson(json, allowUninitializedConfig);
}

export function parseAppConfigJson(json: JsonValue, allowUninitializedConfig: boolean): AppConfig {
  const uninitializedSchema = {
    ...schema,
    properties: {
      ...schema.properties,
      name: {
        ...schema.properties.name,
        pattern: `${schema.properties.name.pattern}|^${UNINITIALIZED_APP_NAME}$`,
      },
    },
  };

  const devvitSchema = (allowUninitializedConfig
    ? uninitializedSchema
    : schema) as unknown as Schema;

  const validator = new jsonschema.Validator();
  validator.addSchema(devvitSchema, schema.$id!);
  validator.addSchema(productsSchema, productsSchema.$id!);
  const ret = validator.validate(json, devvitSchema);
  if (!ret.valid)
    throw new Error(
      ret.errors
        .map((err) => {
          if (!err.path.length && err.name === 'anyOf' && /\[subschema \d]/.test(err.stack))
            return 'config requires property "post", "server", or "blocks".';
          if (err.stack.includes('name does not match pattern'))
            return err.stack
              .replaceAll('instance.', '')
              .concat('. Try running `npx devvit init` to fix your app name.');
          return err.stack.replaceAll('instance.', '').replaceAll('instance', 'config');
        })
        .join('; ')
    );

  const instance: AppConfigJson = ret.instance;

  if (instance.$schema != null && instance.$schema !== schema.$id)
    console.warn(`Unknown schema "${instance.$schema}".`);

  return AppConfig(instance);
}

// jsonschema only supports rewrite hooks but it's easier to update defaults
// after validation when the entire config is known. Eg,
// `config.permissions.http` has a different default if `config.server` is set.
//
// Ajv supports some default application but it seems like some features are
// still missing (https://github.com/ajv-validator/ajv/issues/1158). Even if the
// feature is added, we need the defaults in the properties for documentation
// and the same dynamic default adjustments as above are required.
//
// If there's an explicit permission, use it. If the permission is inferred, add
// a Blocks permission config that defaults to true to avoid having to evaluate
// user Blocks code. Model hydration should consider Blocks permissions.
//
// The current pattern is to avoid being smart about item / entry lengths. If a
// user defines a config, hydrate it regardless of whether any members are
// provided. This is so that Blocks apps can use the same hydrated models.

function AppConfig(json: Readonly<AppConfigJson>): AppConfig {
  const partial: Omit<AppConfig, 'permissions'> = {
    schema: 'v1', // Always assume v1 since that's all that's supported.
    name: json.name,
    json,
  };

  if (json.media)
    partial.media = {
      dir: json.media.dir ?? schema.properties.media.properties.dir.default,
    };
  if (json.post) partial.post = AppPostConfig(json.post);
  if (json.server)
    partial.server = {
      dir: json.server.dir ?? schema.properties.server.properties.dir.default,
      entry: json.server.entry ?? schema.properties.server.properties.entry.default,
    };
  const blocksTriggers = json.blocks
    ? (json.blocks.triggers ?? schema.properties.blocks.properties.triggers.default)
    : undefined;
  if (json.triggers || blocksTriggers)
    partial.triggers = AppTriggersConfig(blocksTriggers, json.triggers);
  if (json.blocks) partial.blocks = AppBlocksConfig(json.blocks);
  const blocksMenu = json.blocks
    ? (json.blocks.menu?.enable ??
      schema.properties.blocks.properties.menu.properties.enable.default)
    : false;
  if (json.menu || blocksMenu) partial.menu = AppMenuConfig(json.menu);
  if (json.payments) partial.payments = AppPaymentsConfig(json.payments);
  if (json.scheduler) partial.scheduler = AppSchedulerConfig(json.scheduler);
  const blocksSettings = json.blocks
    ? (json.blocks.settings?.enable ??
      schema.properties.blocks.properties.settings.properties.enable.default)
    : false;
  if (json.settings || blocksSettings)
    partial.settings = AppSettingsConfig(blocksSettings, json.settings);
  const blocksForms = json.blocks
    ? (json.blocks.forms?.enable ??
      schema.properties.blocks.properties.forms.properties.enable.default)
    : false;
  if (json.forms || blocksForms) partial.forms = json.forms ?? {};
  if (json.marketingAssets) partial.marketingAssets = json.marketingAssets;
  if (json.dev) {
    partial.dev = {};
    if (json.dev.subreddit) partial.dev.subreddit = json.dev.subreddit;
  }

  const config = { ...partial, permissions: AppPermissionConfig(json.permissions, partial) };

  validate(config);

  // Deep copy so schema is not mutated.
  return structuredClone(config);
}

function AppSchedulerConfig(scheduler: Readonly<AppSchedulerConfigJson>): AppSchedulerConfig {
  const config: AppSchedulerConfig = { tasks: {} };
  for (const [name, taskSpec] of Object.entries(scheduler.tasks)) {
    if (typeof taskSpec === 'string') {
      // If the task is a string, it is an endpoint.
      config.tasks[name] = { endpoint: taskSpec };
    } else {
      // Otherwise, it is an object with an endpoint and optionally a cron.
      config.tasks[name] = {
        endpoint: taskSpec.endpoint,
        ...(taskSpec.cron
          ? { cron: taskSpec.cron, ...(taskSpec.data ? { data: taskSpec.data } : {}) }
          : {}),
      };
    }
  }
  return config;
}

function AppPermissionConfig(
  permissions: Readonly<AppPermissionConfigJson> | undefined,
  partial: Readonly<Omit<AppConfig, 'permissions'>>
): AppPermissionConfig {
  const redditPermissions =
    typeof permissions?.reddit === 'boolean' ? { enable: permissions.reddit } : permissions?.reddit;
  return {
    http: {
      enable:
        permissions?.http?.enable ??
        (permissions?.http
          ? schema.properties.permissions.properties.http.properties.enable.default
          : false),
      domains:
        permissions?.http?.domains ??
        schema.properties.permissions.properties.http.properties.domains.default,
    },
    media: permissions?.media ?? schema.properties.permissions.properties.media.default,
    menu: !!partial.menu,
    payments:
      !!partial.payments ||
      (permissions?.payments ?? schema.properties.permissions.properties.payments.default),
    realtime: permissions?.realtime ?? schema.properties.permissions.properties.realtime.default,
    redis:
      permissions?.redis ??
      // Menu items call addCSRFTokenToContext() which uses Redis.
      (partial.menu
        ? true
        : partial.post
          ? true
          : schema.properties.permissions.properties.redis.default),
    reddit: {
      enable:
        redditPermissions?.enable ??
        (partial.post
          ? true
          : redditPermissions
            ? schema.properties.permissions.properties.reddit.oneOf[0].properties!.enable.default
            : false),
      scope:
        redditPermissions?.scope ??
        (schema.properties.permissions.properties.reddit.oneOf[0].properties!.scope
          .default as AppScopeConfig),
      asUser:
        redditPermissions?.asUser?.map((x) => scopeFromJSON(x)) ??
        schema.properties.permissions.properties.reddit.oneOf[0].properties!.asUser.default,
    },
    settings: !!partial.settings,
    triggers: !!partial.triggers,
  };
}

function AppPostConfig(post: Readonly<AppPostConfigJson>): AppPostConfig {
  const dir = post.dir ?? schema.properties.post.properties.dir.default;
  const defaultHeight = schema.$defs.Entrypoint.properties.height.default as AppPostHeightConfig;
  const entrypoints: AppPostEntrypointsConfig = {
    [defaultPostEntry]: {
      name: defaultPostEntry,
      entry:
        post.entrypoints?.default.entry ??
        schema.properties.post.properties.entrypoints.properties.default.properties.entry.default,
      height: post.entrypoints?.default.height ?? defaultHeight,
      inline: post.entrypoints?.default.inline ?? false,
    },
  };

  for (const [name, pt] of Object.entries(post.entrypoints ?? {})) {
    if (name !== defaultPostEntry)
      entrypoints[name] = {
        name,
        entry: pt.entry!,
        height: pt.height ?? defaultHeight,
        inline: pt.inline ?? false,
      };
  }
  return { dir, entrypoints };
}

function AppBlocksConfig(blocks: Readonly<AppBlocksConfigJson>): AppBlocksConfig {
  return {
    entry: blocks.entry ?? schema.properties.blocks.properties.entry.default,
  };
}

function AppMenuConfig(menu: Readonly<AppMenuConfigJson> | undefined): AppMenuConfig {
  const items: AppMenuItemConfig[] = [];
  for (const item of menu?.items ?? []) {
    items.push({
      label: item.label,
      description: item.description ?? '',
      forUserType: item.forUserType ?? 'moderator',
      postFilter: item.postFilter ?? 'none',
      location: Array.isArray(item.location) ? item.location : [item.location],
      endpoint: item.endpoint,
    });
  }
  return { items };
}

function AppPaymentsConfig(payments: Readonly<AppPaymentsConfigJson>): AppPaymentsConfig {
  if (!payments) {
    throw Error(`Invalid false-y payments config`);
  }
  if (!payments.endpoints?.fulfillOrder) {
    throw Error(`Order fulfillment endpoint is required`);
  }

  const rawProducts: Product[] = 'products' in payments ? [...payments.products] : [];
  if ('productsFile' in payments) {
    const fileContents = readFileSync(payments.productsFile).toString();
    rawProducts.push(...validateProductsJSON(JSON.parse(fileContents)));
  }
  console.log(`Loaded ${rawProducts.length} products from payments config.`);

  const products: Product[] = [];
  for (const rawProduct of rawProducts) {
    const product: Product = {
      accountingType: rawProduct.accountingType,
      displayName: rawProduct.displayName,
      price: rawProduct.price,
      sku: rawProduct.sku,
    };
    if (rawProduct.metadata) {
      // Shallow copy to make sure any further mutations don't affect the config.
      product.metadata = {
        ...rawProduct.metadata,
      };
    }
    if (rawProduct.images) {
      product.images = rawProduct.images;
    }
    if (rawProduct.description) {
      product.description = rawProduct.description;
    }
    products.push(product);
  }
  return {
    endpoints: payments.endpoints,
    products,
    ...('productsFile' in payments ? { productsFile: payments.productsFile } : {}),
  };
}

function AppSettingsConfig(
  blocksSettings: boolean,
  settings: Readonly<AppSettingsConfigJson> | undefined
): AppSettingsConfig {
  const config: AppSettingsConfig = {};

  if (settings?.global || blocksSettings) {
    config.global = {};
    for (const [name, setting] of Object.entries(settings?.global ?? {})) {
      config.global[name] = { ...setting, name: name };
    }
  }

  if (settings?.subreddit || blocksSettings) {
    config.subreddit = {};
    for (const [name, setting] of Object.entries(settings?.subreddit ?? {})) {
      config.subreddit[name] = { ...setting, name: name };
    }
  }

  return config;
}

function AppTriggersConfig(
  blocksTriggers: (keyof AppTriggersConfig)[] | undefined,
  triggers: Readonly<AppTriggersConfig> | undefined
): AppTriggersConfig {
  const config: AppTriggersConfig = {};
  for (const trigger of blocksTriggers ?? []) config[trigger] = '';
  return { ...config, ...triggers };
}

/** @internal */
export function validate(config: Readonly<AppConfig>): void {
  const errs = [];

  if (config.menu?.items?.length && !config.permissions.redis)
    errs.push('`config.menu.items` requires `config.permissions.redis` to be enabled');

  // If there are any select settings, their default values must be in the options,
  // and if it's not a multi-select, the default value must be a single string.
  const settingValues = [
    ...Object.values(config.settings?.global ?? {}),
    ...Object.values(config.settings?.subreddit ?? {}),
  ];
  for (const setting of settingValues) {
    if (setting.type === 'select' && setting.defaultValue) {
      if (!setting.options.some((option) => option.value === setting.defaultValue))
        errs.push(
          `Setting "${setting.name}" default value "${setting.defaultValue}" is not in
          options "${setting.options.map((option) => option.value).join(', ')}"`
        );
    }
    if (setting.type === 'multiSelect' && setting.defaultValue) {
      if (
        !setting.defaultValue.every((value) =>
          setting.options.some((option) => option.value === value)
        )
      )
        errs.push(
          `Setting "${setting.name}" default values "${setting.defaultValue.join(', ')}" are not in options "${setting.options.map((option) => option.value).join(', ')}"`
        );
    }
  }

  if (errs.length) throw Error(`${errs.join('; ')}.`);
}

function scopeFromJSON(scope: string): Scope {
  return scope in Scope ? Scope[scope as keyof typeof Scope] : Scope.UNRECOGNIZED;
}
