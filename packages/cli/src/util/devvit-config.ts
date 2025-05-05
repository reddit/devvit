import { writeFile } from 'node:fs/promises';

import type { JSONObject } from '@devvit/shared-types/json.js';
import path from 'path';

import { validateConfig } from '../vendor/@reddit/json-config/0.4.2/index.js';
import * as v from '../vendor/@reddit/json-config/0.4.2/validators.js';
import { isFile } from './file-util.js';
import { dumpJsonToYaml, readYamlToJson } from './files.js';

export const DEVVIT_CONFIG_FILE = 'devvit.yaml';

function getConfigFilepath(projectPath: string, configFile: string): string {
  return path.join(projectPath, configFile);
}

export type DevvitConfig = {
  // name of the project
  name: string;
  // unique identifier of the project
  slug?: string;
  // DevvitVersion
  version: string;
};

export const DEVVIT_CONFIG_SCHEMA = {
  name: v.string,
  slug: v.optional(v.string, undefined),
  version: v.string,
};

export async function readDevvitConfig(
  projectPath: string,
  configFileName: string
): Promise<DevvitConfig> {
  const configFilePath = getConfigFilepath(projectPath, configFileName);
  if (!(await isFile(configFilePath))) {
    throw new Error(`Devvit.yaml does not exist`);
  }
  const configJSON = await readYamlToJson(configFilePath);

  try {
    const validatedConfig = validateConfig(configJSON, DEVVIT_CONFIG_SCHEMA);

    return {
      ...validatedConfig,
      slug: validatedConfig.slug?.toLowerCase(),
      name: validatedConfig.name.toLowerCase(),
    };
  } catch (err) {
    throw new Error(`Invalid Devvit.yaml config format. ${err}`);
  }
}

export async function updateDevvitConfig(
  projectPath: string,
  configFileName: string,
  updates: Partial<DevvitConfig>
): Promise<void> {
  const config = await readDevvitConfig(projectPath, configFileName);
  if (updates.name != null) {
    config.name = updates.name.toLowerCase();
  }

  if (updates.version != null) {
    config.version = updates.version;
  }

  if (updates.slug != null) {
    config.slug = updates.slug.toLowerCase();
  }

  validateConfig(config as unknown as JSONObject, DEVVIT_CONFIG_SCHEMA);

  const newConfigYaml = dumpJsonToYaml(config);
  await writeFile(getConfigFilepath(projectPath, configFileName), newConfigYaml);
}

export async function generateDevvitConfig(
  projectPath: string,
  configFile: string,
  config: DevvitConfig
): Promise<void> {
  const configFilePath = getConfigFilepath(projectPath, configFile);

  const oldConfigExists = await isFile(configFilePath);
  const oldConfig: DevvitConfig = oldConfigExists ? await readYamlToJson(configFilePath) : {};

  const newConfigJSON = merge(oldConfig, config) as unknown as JSONObject;
  validateConfig(newConfigJSON, DEVVIT_CONFIG_SCHEMA);

  const newConfigYaml = dumpJsonToYaml(newConfigJSON);

  await writeFile(configFilePath, newConfigYaml);
}

/**
 * @description utility function that shallow merges two objects. rhs will overwrite lhs obj whenever keys clash upon shallow comparison
 */
function merge<L, R>(lhsObj: Readonly<L>, rhsObj: Readonly<R>): L & R {
  return {
    ...lhsObj,
    ...rhsObj,
  };
}
