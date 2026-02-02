/* eslint-disable implicitDependencies/no-implicit */
import fs from 'node:fs';
import path from 'node:path';

import type { AppConfig } from '@devvit/shared-types/schemas/config-file.v1.js';
import chalk from 'chalk';
import type { RollupLog } from 'rollup';

export const shouldSuppressWarning = (warning: RollupLog): boolean => {
  return warning.code === 'EVAL' && (warning.id ?? '').includes('node_modules/@protobufjs/inquire');
};

export const shouldCheckClientForServerImports = (environmentName: string | undefined): boolean => {
  // When Vite's Environment API is unavailable (or the hook is invoked without environment context),
  // treat the build as "client" for safety. This prevents accidental bundling of server code into
  // the browser output.
  return environmentName === undefined || environmentName === 'client';
};

/**
 * Reads and parses the devvit.json configuration file.
 */
export function readDevvitConfig(repoRoot: string): AppConfig {
  const configPath = path.resolve(repoRoot, 'devvit.json');
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    throw new Error(
      `${chalk.red('✖')} ${chalk.bold('devvit plugin error')}\n\n` +
        `Could not read ${chalk.cyan(
          'devvit.json'
        )}. Ensure it exists in the project root and contains valid JSON.\n`
    );
  }
}

/**
 * Extracts client entry points from devvit.json config.
 */
export function resolveRepoRoot(configRoot?: string): string {
  return configRoot ?? process.cwd();
}

export function resolveClientRoot(repoRoot: string): string {
  const candidate = path.resolve(repoRoot, 'src/client');
  return fs.existsSync(candidate) ? candidate : repoRoot;
}

/**
 * We allow the publicDir to be in the repo root or the client root. The client
 * root is to support all legacy devvit web apps out there (or just personal)
 * preference.
 */
export function resolvePublicDir(repoRoot: string, clientRoot: string): string | undefined {
  const repoPublicDir = path.resolve(repoRoot, 'public');
  const clientPublicDir = path.resolve(clientRoot, 'public');

  if (repoPublicDir === clientPublicDir) {
    return fs.existsSync(repoPublicDir) ? repoPublicDir : undefined;
  }

  const repoPublicExists = fs.existsSync(repoPublicDir);
  const clientPublicExists = fs.existsSync(clientPublicDir);

  if (repoPublicExists && clientPublicExists) {
    throw new Error(
      `${chalk.red('✖')} ${chalk.bold('devvit plugin error')}\n\n` +
        `Found both ${chalk.cyan(path.relative(repoRoot, repoPublicDir))} and ${chalk.cyan(
          path.relative(repoRoot, clientPublicDir)
        )}.\n` +
        `Choose a single public directory and remove the other.\n`
    );
  }

  if (repoPublicExists) return repoPublicDir;
  if (clientPublicExists) return clientPublicDir;
  return undefined;
}

export function getClientInputs(
  config: AppConfig,
  repoRoot: string,
  clientRoot: string
): Record<string, string> | undefined {
  const entrypointEntries = Object.entries(config?.post?.entrypoints ?? {});
  if (entrypointEntries.length === 0) {
    return undefined;
  }

  const normalizedInputs: Record<string, string> = {};

  for (const [entryName, entryConfig] of entrypointEntries) {
    const entryPath = entryConfig.entry;
    let entryAbsolutePath = path.isAbsolute(entryPath)
      ? entryPath
      : path.resolve(repoRoot, entryPath);

    if (!fs.existsSync(entryAbsolutePath)) {
      const clientEntryPath = path.resolve(clientRoot, entryPath);
      if (fs.existsSync(clientEntryPath)) {
        entryAbsolutePath = clientEntryPath;
      }
    }

    if (fs.existsSync(entryAbsolutePath)) {
      const relativePath = path.relative(clientRoot, entryAbsolutePath);
      if (relativePath.startsWith('..')) {
        throw new Error(`Devvit client entry "${entryPath}" must be inside ${clientRoot}`);
      }

      normalizedInputs[entryName] = entryAbsolutePath;
    } else {
      normalizedInputs[entryName] = entryPath;
    }
  }

  return Object.keys(normalizedInputs).length > 0 ? normalizedInputs : undefined;
}

/**
 * Resolves the server entry point.
 *
 * Checks for src/api/index.ts first, then falls back to src/server/index.ts
 * for backwards compatibility.
 */
export function getServerEntry(repoRoot: string): string {
  const apiEntry = path.resolve(repoRoot, 'src/api/index.ts');
  if (fs.existsSync(apiEntry)) {
    return apiEntry;
  }

  const serverEntry = path.resolve(repoRoot, 'src/server/index.ts');
  if (fs.existsSync(serverEntry)) {
    return serverEntry;
  }

  const srcEntry = path.resolve(repoRoot, 'src/index.ts');
  if (fs.existsSync(srcEntry)) {
    return srcEntry;
  }

  throw new Error(
    `${chalk.red('✖')} ${chalk.bold('devvit plugin error')}\n\n` +
      `Could not find server entry point.\n` +
      `Expected ${chalk.cyan('src/api/index.ts')}, ${chalk.cyan('src/server/index.ts')}, or ${chalk.cyan('src/index.ts')}.\n`
  );
}
