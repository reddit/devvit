import git, { Errors as GitErrors, TREE } from 'isomorphic-git';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(path.join(import.meta.url, '..'));

export type IGit = {
  rootDir: string;
  init(): Promise<void>;
  assertIsInsideGitRepo(): Promise<void>;
  assertWorktreeHasCommit(): Promise<void>;
  listFiles(): Promise<string[]>;
  initDotGitIgnore(): Promise<void>;
};

// implementation using isomorphic-git
export class Git implements IGit {
  #baseDir: string;

  constructor(baseDir: string) {
    this.#baseDir = baseDir;
  }

  async init(): Promise<void> {
    await git.init({
      fs,
      dir: this.#baseDir,
      defaultBranch: 'main',
    });
  }

  get rootDir(): string {
    return this.#baseDir;
  }

  async assertIsInsideGitRepo(): Promise<void> {
    try {
      await git.findRoot({ fs, filepath: this.#baseDir });
    } catch (error) {
      if (error instanceof GitErrors.NotFoundError) {
        throw new Error(
          `Your current working directory is not in a git repo. Try running \`git init\` in the project root, or see https://git-scm.com/docs/git-init for instructions on initializing a git repo`
        );
      }
      throw error;
    }
  }

  async assertWorktreeHasCommit(): Promise<void> {
    try {
      await git.log({ fs, dir: this.#baseDir });
    } catch (error) {
      if (error instanceof GitErrors.NotFoundError) {
        throw new Error(
          'Devvit uses HEAD for publishing. Make sure that there is at least one commit in the project before publishing'
        );
      }
      throw error;
    }
  }

  async listFiles(): Promise<string[]> {
    return git.walk({
      fs,
      dir: this.#baseDir,
      trees: [TREE({ ref: 'HEAD' })],
      map: async (filepath, _) => filepath, // some isomorphic-git magic here. See https://isomorphic-git.org/docs/en/walk#mapstring-array-walkerentry-null-promise-any
    });
  }

  async initDotGitIgnore(): Promise<void> {
    const src = path.join(__dirname, './templates/gitignore');
    const dest = path.join(this.rootDir, '.gitignore');
    await fsp.copyFile(src, dest);
  }
}
