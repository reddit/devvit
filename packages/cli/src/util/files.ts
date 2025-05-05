import fsp, { readFile } from 'node:fs/promises';

import type { JSONValue } from '@devvit/public-api';
import yaml from 'js-yaml';

export function dumpJsonToYaml(val: JSONValue): string {
  return yaml.dump(val);
}

export async function readYamlToJson(filePath: string): Promise<JSONValue> {
  const rawFileContent = await readFile(filePath, { encoding: 'utf8' });
  return (yaml.load(rawFileContent) ?? null) as JSONValue;
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
