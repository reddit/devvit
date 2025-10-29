import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { ACTOR_SRC_DIR } from '@devvit/shared-types/constants.js';
import type { AppConfig } from '@devvit/shared-types/schemas/config-file.v1.js';

import type { CompileLog } from '../esbuild/ESBuildPack.js';

/** Project root directory (eg, . or src for single file projects). */
export type ProjectRootDir = string;

export function formatLogs(logs: readonly Readonly<CompileLog>[]): string {
  return logs.map(formatLog).join('\n');
}

export function formatLog(log: Readonly<CompileLog>): string {
  if (log.detail == null) return log.text;
  return [
    `${log.text}; line ${log.detail.line}, column ${log.detail.column} in file ${log.detail.filename}:`,
    log.detail.text,
    log.detail.suggestion,
  ].join('\n');
}

/** Warning: may generate randomized filenames. */
export function getModuleEntrypoint(
  config: Readonly<AppConfig> | undefined,
  root: ProjectRootDir
): string {
  if (config)
    return path.join(
      os.tmpdir(),
      `blocks-shim-${new Date().toISOString().replaceAll(':', '-')}-${crypto.randomBytes(6).toString('hex')}.tsx`
    );
  return getClassicModuleEntrypoint(root);
}

/** Returns path to source input. Eg, src/main.tsx or main.ts. */
export function getClassicModuleEntrypoint(root: ProjectRootDir): string {
  const srcDir = path.join(root, ACTOR_SRC_DIR);
  const srcDevvitDir = path.join(srcDir, 'devvit');

  const entrypointBase = 'main.ts';
  const entrypointBaseNoExt = entrypointBase.replace(/\.(ts|js)$/, ''); // e.g., 'main'
  const tsxEntrypoint = `${entrypointBaseNoExt}.tsx`;
  const tsEntrypoint = `${entrypointBaseNoExt}.ts`;

  const potentialPaths: string[] = [];

  // Priority 1: src/devvit directory if it exists
  if (fs.existsSync(srcDevvitDir)) {
    potentialPaths.push(path.join(srcDevvitDir, tsxEntrypoint));
    potentialPaths.push(path.join(srcDevvitDir, tsEntrypoint));
  }

  // Priority 2: src directory if it exists
  if (fs.existsSync(srcDir)) {
    potentialPaths.push(path.join(srcDir, tsxEntrypoint));
    potentialPaths.push(path.join(srcDir, tsEntrypoint));
  }

  // Priority 3: root directory
  potentialPaths.push(path.join(root, tsxEntrypoint));
  potentialPaths.push(path.join(root, tsEntrypoint)); // Default fallback

  // Find the first existing path in the priority order
  for (const p of potentialPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // Fallback to the root main.ts path if nothing else exists.
  // This line should technically be unreachable if root always exists,
  // but provides a safety net.
  return path.join(root, tsEntrypoint);
}
