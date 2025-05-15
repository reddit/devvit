import { writeFile } from 'node:fs/promises';

import type { JSONValue } from '@devvit/shared-types/json.js';
import path from 'path';

import { isFile } from './file-util.js';
import { dumpJsonToYaml, readYamlToJson } from './files.js';
import { type DevvitPackageConfig, readPackageJSON } from './package-managers/package-util.js';

export type DevvitConfig = {
  /** Lowercase app name and Community app slug. */
  name: string;
};

export const DEVVIT_CONFIG_FILE: string = 'devvit.yaml';

export class DevvitConfigCache {
  /**
   * @arg root Project root directory.
   * @arg filename Project config filename.
   */
  static async new(root: string, filename: string): Promise<DevvitConfigCache> {
    const config = await readClassicConfig(root, filename);
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

  get config(): Readonly<DevvitConfig> {
    return this.#config;
  }

  async update(updates: Partial<Readonly<DevvitConfig>>): Promise<void> {
    if (updates.name) this.#config.name = updates.name.toLowerCase();
    writeClassicConfig(this.root, this.filename, this.#config);
  }
}

/** @internal */
export function parseClassicConfig(json: JSONValue): DevvitConfig {
  if (json == null || typeof json !== 'object' || Array.isArray(json))
    throw Error(`${DEVVIT_CONFIG_FILE} must be an object \`{"name": "foo", ...}\`.`);

  if (typeof json.name !== 'string')
    throw Error(`${DEVVIT_CONFIG_FILE} must have \`name\` property.`);

  // Include original data in case it's a superset.
  return { ...json, name: json.name.toLowerCase() };
}

async function readClassicConfig(root: string, configFilename: string): Promise<DevvitConfig> {
  const filename = path.join(root, configFilename);
  if (!(await isFile(filename))) throw new Error(`${filename} does not exist`);
  return parseClassicConfig(await readYamlToJson(filename));
}

async function writeClassicConfig(
  root: string,
  filename: string,
  config: Readonly<DevvitConfig>
): Promise<void> {
  await writeFile(path.join(root, filename), dumpJsonToYaml(config));
}
