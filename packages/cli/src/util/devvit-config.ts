import { writeFile } from 'node:fs/promises';

import type { JSONValue } from '@devvit/shared-types/json.js';
import path from 'path';

import { isFile } from './file-util.js';
import { dumpJsonToYaml, readYamlToJson } from './files.js';

export const DEVVIT_CONFIG_FILE: string = 'devvit.yaml';

export type DevvitConfig = {
  /** Lowercase app name and Community app slug. */
  name: string;
};

export async function readDevvitConfig(
  projectPath: string,
  configFileName: string
): Promise<DevvitConfig> {
  const filename = path.join(projectPath, configFileName);
  if (!(await isFile(filename))) throw new Error(`${filename} does not exist`);
  return _parseConfig(await readYamlToJson(filename));
}

export async function updateDevvitConfig(
  projectPath: string,
  configFilename: string,
  updates: Partial<Readonly<DevvitConfig>>
): Promise<void> {
  const config = await readDevvitConfig(projectPath, configFilename);
  if (updates.name != null) {
    config.name = updates.name.toLowerCase();
  }

  await writeFile(path.join(projectPath, configFilename), dumpJsonToYaml(config));
}

/** @internal */
export function _parseConfig(json: JSONValue): DevvitConfig {
  if (json == null || typeof json !== 'object' || Array.isArray(json))
    throw Error(`${DEVVIT_CONFIG_FILE} must be an object \`{"name": "foo", ...}\`.`);

  if (typeof json.name !== 'string')
    throw Error(`${DEVVIT_CONFIG_FILE} must have \`name\` property.`);

  // Include original data in case it's a superset.
  return { ...json, name: json.name.toLowerCase() };
}
