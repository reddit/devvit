import { isFile } from '@devvit/dev-server/server/io/file-util.js';
import path from 'node:path';

const devvitConfigFilename = 'devvit.yaml';

/**
 * Test if dir/devvit.yaml exists. Walk recursively upwards to file system root.
 */
export async function findProjectRoot(): Promise<string | undefined> {
  const cwd = process.cwd();
  // Something scary like `/` or `C:\`. to-do: limit to os.homedir() which is
  // scary enough.
  const { root } = path.parse(cwd);
  return await findProject(root, cwd);
}

/** Test if dir/devvit.yaml exists. Walk recursively upwards to root. */
async function findProject(root: string, dir: string): Promise<string | undefined> {
  if (await isFile(path.join(dir, devvitConfigFilename))) return dir;
  if (dir === root) return;
  return findProject(root, path.resolve(dir, '..'));
}
