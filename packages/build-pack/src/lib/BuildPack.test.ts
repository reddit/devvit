import path from 'node:path';

import { ACTOR_SRC_DIR } from '@devvit/shared-types/constants.js';
import fs from 'fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getClassicModuleEntrypoint } from './BuildPack.js';

describe('getModuleEntrypoint', () => {
  const projectRoot = '/User/foo/project';
  const srcDir = path.join(projectRoot, ACTOR_SRC_DIR);
  const srcDevvitDir = path.join(srcDir, 'devvit');

  const rootTs = path.join(projectRoot, 'main.ts');
  const rootTsx = path.join(projectRoot, 'main.tsx');
  const srcTs = path.join(srcDir, 'main.ts');
  const srcTsx = path.join(srcDir, 'main.tsx');
  const srcDevvitTs = path.join(srcDevvitDir, 'main.ts');
  const srcDevvitTsx = path.join(srcDevvitDir, 'main.tsx');

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return root main.ts when no specific files or directories exist', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p) => p === projectRoot);
    expect(getClassicModuleEntrypoint(projectRoot)).toEqual(rootTs);
  });

  it('should prefer root main.tsx over root main.ts', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation(
      (p) => p === projectRoot || p === rootTsx || p === rootTs
    );
    expect(getClassicModuleEntrypoint(projectRoot)).toEqual(rootTsx);
  });

  it('should prefer src/main.ts over root files', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation(
      (p) => p === projectRoot || p === srcDir || p === srcTs || p === rootTsx
    );
    expect(getClassicModuleEntrypoint(projectRoot)).toEqual(srcTs);
  });

  it('should prefer src/main.tsx over src/main.ts', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation(
      (p) => p === projectRoot || p === srcDir || p === srcTs || p === srcTsx
    );
    expect(getClassicModuleEntrypoint(projectRoot)).toEqual(srcTsx);
  });

  it('should prefer src/devvit/main.ts over src files', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation(
      (p) =>
        p === projectRoot || p === srcDir || p === srcDevvitDir || p === srcDevvitTs || p === srcTsx
    );
    expect(getClassicModuleEntrypoint(projectRoot)).toEqual(srcDevvitTs);
  });

  it('should prefer src/devvit/main.tsx over src/devvit/main.ts', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation(
      (p) =>
        p === projectRoot ||
        p === srcDir ||
        p === srcDevvitDir ||
        p === srcDevvitTs ||
        p === srcDevvitTsx
    );
    expect(getClassicModuleEntrypoint(projectRoot)).toEqual(srcDevvitTsx);
  });

  it('should use src/main.tsx if src/devvit exists but contains no entrypoint', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation(
      (p) => p === projectRoot || p === srcDir || p === srcDevvitDir || p === srcTsx
    );
    expect(getClassicModuleEntrypoint(projectRoot)).toEqual(srcTsx);
  });

  it('should use src/main.ts if src/devvit exists but contains no entrypoint and src/main.tsx does not', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation(
      (p) => p === projectRoot || p === srcDir || p === srcDevvitDir || p === srcTs
    );
    expect(getClassicModuleEntrypoint(projectRoot)).toEqual(srcTs);
  });

  it('should use root main.tsx if src and src/devvit dirs exist but contain no entrypoints', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation(
      (p) => p === projectRoot || p === srcDir || p === srcDevvitDir || p === rootTsx
    );
    expect(getClassicModuleEntrypoint(projectRoot)).toEqual(rootTsx);
  });
});
