import fsp, { readFile } from 'node:fs/promises';

import type { JsonValue } from '@devvit/shared-types/json.js';
import yaml from 'js-yaml';

export function dumpJsonToYaml(val: JsonValue): string {
  return yaml.dump(val);
}

export async function readYamlToJson(filePath: string): Promise<JsonValue> {
  const rawFileContent = await readFile(filePath, { encoding: 'utf8' });
  return (yaml.load(rawFileContent) ?? null) as JsonValue;
}

// to-do: move to file-util and rename isDir(). Rename this file to yaml-util.
export async function dirExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fsp.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}
