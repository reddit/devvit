import { exec as _exec } from 'node:child_process';
import { readdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import { promisify } from 'node:util';

import tmp from 'tmp-promise';

import type { IGit } from './Git.js';
import { Git } from './Git.js';

const exec = promisify(_exec);
tmp.setGracefulCleanup();

let tmpRootDir: tmp.DirectoryResult;
let git: IGit;

beforeEach(async () => {
  tmpRootDir = await tmp.dir({ unsafeCleanup: true });
  git = new Git(tmpRootDir.path);
  await git.init();
});

afterEach(async () => {
  await tmpRootDir.cleanup();
});

describe('Git', async () => {
  describe('init', async () => {
    it('creates .git directory', async () => {
      const files = (await readdir(tmpRootDir.path, { withFileTypes: true }))
        .filter((d) => d.isDirectory())
        .map((f) => f.name);
      expect(files).toContain('.git');
    });

    it(`uses "main" as default branch name`, async () => {
      // make tmp file to stage & commit
      await tmp.file({ dir: tmpRootDir.path });

      // stage and commit
      await exec('git add -A && git commit -m "initial commit"', {
        cwd: tmpRootDir.path,
      });

      const res = await exec('git rev-parse --abbrev-ref HEAD', { cwd: tmpRootDir.path });
      expect(res.stdout).toMatch(/main/);
    });
  });

  describe('get rootDir', async () => {
    it('returns root dir of git project', async () => {
      expect(git.rootDir).toBe(tmpRootDir.path);
    });
  });

  describe('assertIsInsideGitRepo', async () => {
    it('Throws an error if not in git repo', async () => {
      const nonGitRepoDir = await tmp.dir({ unsafeCleanup: true });
      git = new Git(nonGitRepoDir.path);
      await expect(git.assertIsInsideGitRepo()).rejects.toThrowError('not in a git repo');

      await nonGitRepoDir.cleanup();
    });

    it('Does not throw an error if inside git repo', async () => {
      await expect(git.assertIsInsideGitRepo()).resolves.toBeUndefined();
    });
  });

  describe('assertWorktreeHasCommit', async () => {
    it('Throws an error is there are no commits', async () => {
      await expect(git.assertWorktreeHasCommit()).rejects.toThrowError('at least one commit');
    });

    it("Doesn't throw an error when there is at least one commit", async () => {
      await tmp.file({ dir: tmpRootDir.path });
      await exec('git add -A && git commit -m "initial commit"', {
        cwd: tmpRootDir.path,
      });
      await expect(git.assertWorktreeHasCommit()).resolves.toBeUndefined();
    });
  });

  describe('listFiles', async () => {
    it('Should have the same output as `git ls-tree HEAD -r -t --name-only --full-tree`', async () => {
      // make some files
      await tmp.file({ dir: tmpRootDir.path, name: 'file1.txt' });
      await tmp.file({ dir: tmpRootDir.path, name: 'file2.txt' });
      await tmp.file({ dir: tmpRootDir.path, name: 'file3.txt' });

      // stage and commit
      await exec('git add -A && git commit -m "initial commit"', {
        cwd: tmpRootDir.path,
      });

      const cmdResult = (
        await exec(`git ls-tree HEAD -r -t --name-only --full-tree`, {
          cwd: tmpRootDir.path,
        })
      ).stdout
        .split(os.EOL)
        .filter((f) => f !== '');

      const result = (await git.listFiles()).filter((f) => f !== '.');

      expect(result).toEqual(expect.arrayContaining(cmdResult));
      expect(cmdResult).toEqual(expect.arrayContaining(result));
    });

    it('Should respect .gitignore', async () => {
      await tmp.file({ dir: tmpRootDir.path, name: 'file1.txt' });
      await tmp.file({ dir: tmpRootDir.path, name: 'file2.txt' });
      const ignoredFile = await tmp.file({ dir: tmpRootDir.path, name: 'file3.txt' });
      const gitignore = await tmp.file({ dir: tmpRootDir.path, name: '.gitignore' });
      await writeFile(gitignore.path, 'file3.txt');

      // stage and commit
      await exec('git add -A && git commit -m "initial commit"', {
        cwd: tmpRootDir.path,
      });

      const result = await git.listFiles();

      expect(result).not.toContain(ignoredFile.path);
    });
  });

  describe('initDotGitIgnore', async () => {
    it('Should make a .gitignore in project root', async () => {
      await git.initDotGitIgnore();

      const files = await readdir(tmpRootDir.path);
      expect(files).toContain('.gitignore');
    });
  });
});
