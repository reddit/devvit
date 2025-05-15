import fs from 'node:fs/promises';
import path from 'node:path';

/** Test if filename exists in dir. Search recursively upwards to root. */
export async function findUpDirContaining(filename: string): Promise<string | undefined> {
  const cwd = process.cwd();
  // Something scary like `/` or `C:\`. to-do: limit to os.homedir() which is
  // scary enough.
  const { root } = path.parse(cwd);
  return await _findUpDirContaining(root, cwd, filename);
}

/** Returns true if a plain file exists at path. Never throws. */
export async function isFile(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function _findUpDirContaining(
  root: string,
  dir: string,
  filename: string
): Promise<string | undefined> {
  if (await isFile(path.join(dir, filename))) return dir;
  if (dir === root) return;
  return _findUpDirContaining(root, path.resolve(dir, '..'), filename);
}
