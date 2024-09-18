import fsp, { readFile } from 'node:fs/promises';

import yaml from 'js-yaml';

// TODO: remove use of any below
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dumpJsonToYaml(obj: { [key: string]: any }): string {
  return yaml.dump(obj);
}

// TODO: remove use of any below
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readYamlToJson(filePath: string): Promise<any> {
  const rawFileContent = await readFile(filePath, { encoding: 'utf8' });
  return yaml.load(rawFileContent);
}

export async function dirExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fsp.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}
