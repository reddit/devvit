import fs from 'node:fs/promises';

/** Returns true if a plain file exists at path. Never throws. */
export async function isFile(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path);
    return stat.isFile();
  } catch {
    return false;
  }
}
