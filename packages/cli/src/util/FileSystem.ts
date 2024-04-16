import { File as IFile, FileSystem as IFileSystem } from '@devvit/protos';
import { lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { type IGit } from './Git.js';

export abstract class FileSystem {
  public static async fromGitProject(git: IGit): Promise<IFileSystem> {
    const filePaths = await git.listFiles();

    const files = await Promise.all(
      filePaths.map((relativePathFromRoot) => this.#makeFile(git.rootDir, relativePathFromRoot))
    );

    return IFileSystem.fromPartial({ files });
  }

  static async #makeFile(absoluteRootPath: string, relativePathFromRoot: string): Promise<IFile> {
    const fullPath = path.join(absoluteRootPath, relativePathFromRoot);
    const stat = await lstat(fullPath);

    if (stat.isFile()) {
      return IFile.fromPartial({
        path: relativePathFromRoot,
        content: await readFile(fullPath, { encoding: 'utf8' }),
        isDirectory: false,
      });
    }
    if (stat.isDirectory()) {
      return IFile.fromPartial({
        path: relativePathFromRoot,
        isDirectory: true,
      });
    }

    throw new Error(`${fullPath} is invalid`);
  }
}

export default FileSystem;
