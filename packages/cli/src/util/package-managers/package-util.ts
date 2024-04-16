import { readFile } from 'node:fs/promises';
import path from 'node:path';

type DependencyMap = { [name: string]: string };

/** An app's project.json. */
export type PackageJSON = {
  description?: string;
  name?: string;
  version?: string;
  dependencies?: DependencyMap;
  devDependencies?: DependencyMap;
};

/** Read and parse the package.json in dir. Throws if missing. */
export async function readPackageJSON(dir: string): Promise<PackageJSON> {
  const json = await readFile(path.join(dir, 'package.json'), 'utf8');
  return JSON.parse(json);
}
