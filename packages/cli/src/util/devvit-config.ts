/**
 * `ClassicAppConfig` is the old config being phased out for "Webbit".
 * "v1" / `AppConfig` is the new config backed by config-file.v1.json.
 * `DevvitConfig` is either of these.
 *
 * to-do: delete this comment when ClassicAppConfig is deleted.
 */

import { readFileSync, writeFileSync } from 'node:fs';

import type { JSONValue } from '@devvit/shared-types/json.js';
import {
  type AppConfig,
  type AppConfigJSON,
  parseAppConfig,
} from '@devvit/shared-types/schemas/config-file.v1.js';
import path from 'path';

import { findUpDirContaining, isFile } from './file-util.js';
import { dumpJsonToYaml, readYamlToJson } from './files.js';
import { type DevvitPackageConfig, readPackageJSON } from './package-managers/package-util.js';

/** Basename of default classic config. */
export const devvitClassicConfigFilename: string = 'devvit.yaml';
/** Basename of default schema v1 config. */
export const devvitV1ConfigFilename: string = 'devvit.json';

export type DevvitConfig = ClassicAppConfig | AppConfig;

/** @deprecated Use AppConfig. */
export type ClassicAppConfig = {
  /** Lowercase app name and Community app slug. */
  name: string;
};

export class DevvitConfigCache {
  /**
   * @arg root Project root directory.
   * @arg filename Project config filename.
   */
  static async new(root: string, filename: string): Promise<DevvitConfigCache> {
    const config = await readConfig(root, filename);
    let packageJSON;
    try {
      packageJSON = await readPackageJSON(root);
    } catch {
      // Failure is fine, it just means we don't have a config file (yet)
    }
    return new DevvitConfigCache(root, filename, config, packageJSON?.devvit);
  }

  /** @deprecated Use the config-file.v1.json schema instead. */
  readonly packageConfig: Readonly<DevvitPackageConfig> | undefined;
  readonly root: string;
  readonly filename: string;
  readonly #config: DevvitConfig;

  constructor(
    root: string,
    filename: string,
    config: DevvitConfig,
    packageConfig: Readonly<DevvitPackageConfig> | undefined
  ) {
    this.root = root;
    this.filename = filename;
    this.#config = config;
    this.packageConfig = packageConfig;
  }

  /** @deprecated Use the config-file.v1.json schema instead. */
  get config(): Readonly<DevvitConfig> {
    return this.#config;
  }

  async update(
    updates: Partial<Readonly<ClassicAppConfig | Pick<AppConfigJSON, 'name'>>>
  ): Promise<void> {
    if (updates.name) this.#config.name = updates.name.toLowerCase();
    if (isAppConfig(this.#config)) this.#config.json.name = this.#config.name;
    writeConfig(this.root, this.filename, this.#config);
  }

  get v1Config(): Readonly<AppConfig> | undefined {
    return isAppConfig(this.#config) ? this.#config : undefined;
  }
}

/**
 * Searches for dir containing the config filename. If found, returns a cached
 * config.
 *
 * @arg filename Optional config filename override (usually CLI flag).
 */
export async function newDevvitConfigCache(
  filename: string | undefined
): Promise<DevvitConfigCache | undefined> {
  filename ||= (await findUpDirContaining(devvitV1ConfigFilename))
    ? devvitV1ConfigFilename
    : devvitClassicConfigFilename;

  const root = await findUpDirContaining(filename);
  if (root) return await DevvitConfigCache.new(root, filename);
}

/** @internal */
export function isAppConfig(config: Readonly<DevvitConfig>): config is AppConfig {
  return 'schema' in config && !!config.schema;
}

/** @internal */
export function parseClassicConfig(json: JSONValue): DevvitConfig {
  if (json == null || typeof json !== 'object' || Array.isArray(json))
    throw Error(`${devvitClassicConfigFilename} must be an object \`{"name": "foo", ...}\`.`);

  if (typeof json.name !== 'string')
    throw Error(`${devvitClassicConfigFilename} must have \`name\` property.`);

  // Include original data in case it's a superset.
  return { ...json, name: json.name.toLowerCase() };
}

async function readConfig(root: string, filename: string): Promise<DevvitConfig> {
  const configFilename = path.join(root, filename);
  if (!(await isFile(configFilename))) throw new Error(`${configFilename} does not exist`);

  if (configFilename.endsWith('.json')) {
    let str;
    try {
      str = readFileSync(configFilename, 'utf8');
    } catch (err) {
      throw Error(`cannot read config ${configFilename}`, { cause: err });
    }

    return parseAppConfig(str);
  }

  return parseClassicConfig(await readYamlToJson(configFilename));
}

function writeConfig(
  projectPath: string,
  configFile: string,
  config: Readonly<DevvitConfig>
): void {
  writeFileSync(
    path.join(projectPath, configFile),
    isAppConfig(config) ? JSON.stringify(config.json, undefined, 2) : dumpJsonToYaml(config)
  );
}
