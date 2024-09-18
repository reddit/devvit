import path from 'node:path';

import { isFile } from './file-util.js';

/**
 * Test if dir/devvit.yaml exists. Walk recursively upwards to file system root.
 */
export async function findProjectRoot(configFile: string): Promise<string | undefined> {
  const cwd = process.cwd();
  // Something scary like `/` or `C:\`. to-do: limit to os.homedir() which is
  // scary enough.
  const { root } = path.parse(cwd);
  return await findProject(root, cwd, configFile);
}

/** Test if dir/devvit.yaml exists. Walk recursively upwards to root. */
async function findProject(
  root: string,
  dir: string,
  configFile: string
): Promise<string | undefined> {
  if (await isFile(path.join(dir, configFile))) return dir;
  if (dir === root) return;
  return findProject(root, path.resolve(dir, '..'), configFile);
}
