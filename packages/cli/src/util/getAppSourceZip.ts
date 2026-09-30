import fsp from 'node:fs/promises';
import path from 'node:path';

import ignore from 'ignore';
import JSZip from 'jszip';

import type { DevvitCommand } from './commands/DevvitCommand.js';

const ALWAYS_IGNORED_PATHS = Object.freeze(['node_modules', '.env', '.git']);

export async function getAppSourceZip(cmd: DevvitCommand): Promise<ArrayBuffer> {
  const zip = new JSZip();

  const projectRoot = await fsp.realpath(cmd.project.root);
  const sourceRoots = [projectRoot];
  for (const root of cmd.project.appConfig?.additionalSourceRoots ?? []) {
    if (path.isAbsolute(root)) {
      cmd.error(`Additional source root must be relative: ${root}`);
    }
    const sourceRoot = await fsp.realpath(path.resolve(projectRoot, root));
    if (path.dirname(sourceRoot) === sourceRoot) {
      cmd.error(`Additional source root must not resolve to a filesystem root: ${root}`);
    }
    sourceRoots.push(sourceRoot);
  }

  let archiveRoot = projectRoot;
  // Preserve relative imports without allowing parent traversal in ZIP entry names.
  for (const sourceRoot of sourceRoots) {
    let relativeRoot = path.relative(archiveRoot, sourceRoot);
    while (relativeRoot.split(path.sep)[0] === '..' || path.isAbsolute(relativeRoot)) {
      const parent = path.dirname(archiveRoot);
      if (parent === archiveRoot) {
        cmd.error('Source roots must share a filesystem root');
      }
      archiveRoot = parent;
      relativeRoot = path.relative(archiveRoot, sourceRoot);
    }
  }

  for (const sourceRoot of sourceRoots) {
    const ignoredPaths = await getIgnoredPaths(cmd, sourceRoot);
    const archivePath = path.relative(archiveRoot, sourceRoot).split(path.sep).join('/');
    const sourceZip = archivePath ? zip.folder(archivePath)! : zip;
    await addDirectoryToZip(sourceRoot, sourceZip, ignoredPaths);
  }

  return await zip.generateAsync({ type: 'arraybuffer' });
}

async function getIgnoredPaths(cmd: DevvitCommand, gitignoreDir: string): Promise<ignore.Ignore> {
  const ignoreInstance = ignore();

  // Ignore everything in .gitignore
  const gitignorePath = path.join(gitignoreDir, '.gitignore');
  try {
    const gitignoreContent = await fsp.readFile(gitignorePath, 'utf-8');
    const gitignorePaths = gitignoreContent
      .split(/\r?\n/) // System-agnostic line splitting
      .map((line) => line.trim());
    ignoreInstance.add([...gitignorePaths, ...ALWAYS_IGNORED_PATHS]);
  } catch {
    // no-op
  }

  // Ignore any additional paths specified in app config
  if (cmd.project.appConfig?.sourceIgnores) {
    ignoreInstance.add(cmd.project.appConfig.sourceIgnores);
  }

  // Finally, force ignore always-ignored paths
  return ignoreInstance.add(ALWAYS_IGNORED_PATHS);
}

async function addDirectoryToZip(
  dir: string,
  zipFolder: JSZip,
  ignoredPaths: ignore.Ignore,
  relativePath = ''
): Promise<void> {
  const entries = await fsp.readdir(dir, { withFileTypes: true });

  // Process entries in parallel
  const filePromises: Promise<void>[] = [];
  const dirCallbacks: (() => Promise<void>)[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativeEntryPath = path.join(relativePath, entry.name);

    if (ignoredPaths.ignores(relativeEntryPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      const newZipFolder = zipFolder.folder(entry.name);
      if (newZipFolder) {
        // Defer directory processing to avoid overtaxing the system
        dirCallbacks.push(() =>
          addDirectoryToZip(fullPath, newZipFolder, ignoredPaths, relativeEntryPath)
        );
      }
    } else if (entry.isFile()) {
      // Read files & add them in parallel though
      filePromises.push(
        (async () => {
          const content = await fsp.readFile(fullPath);
          zipFolder.file(entry.name, content);
        })()
      );
    }
  }

  // Wait for all file reads to complete
  await Promise.all(filePromises);

  // Then, process the directories in serial
  for (const dirCallback of dirCallbacks) {
    await dirCallback();
  }
}
