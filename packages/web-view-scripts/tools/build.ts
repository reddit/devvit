#!/usr/bin/env -S node --no-warnings=ExperimentalWarning
// bundles devvit.v1.min.js.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

import type { WebViewScriptsVersion } from '@devvit/shared-types/client/devvit-global.js';
import esbuild from 'esbuild';

import packageJSON from '../package.json' with { type: 'json' };

const minify: boolean = process.argv.includes('--minify');
const serve: boolean = process.argv.includes('--serve');
const watch: boolean = process.argv.includes('--watch') || serve;
const gitHash = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
  encoding: 'utf8',
}).stdout?.trim();

const webViewScripts: WebViewScriptsVersion = {
  hash: gitHash || 'development',
  // Imported JSON doesn't treeshake. Define as a constant.
  version: packageJSON.version,
};

const baseOpts: esbuild.BuildOptions = {
  banner: serve
    ? {
        js: "new EventSource('/esbuild').addEventListener('change', () => location.reload());",
      }
    : {},
  bundle: true,
  define: { 'globalThis.webViewScriptsVersion': JSON.stringify(webViewScripts) },
  logLevel: 'info', // Print the port and build demarcations.
  metafile: true,
  minify,
  entryNames: '[name].min',
  outdir: 'dist/scripts',
  sourcemap: 'linked',
  target: 'es2020', // https://esbuild.github.io/content-types/#tsconfig-json
  write: !serve,
};

const devvitOpts: esbuild.BuildOptions = {
  ...baseOpts,
  external: ['./screenshot.v1.min.js'],
  entryPoints: ['src/devvit.v1.ts'],
  format: 'iife',
};

const screenshotOpts: esbuild.BuildOptions = {
  ...baseOpts,
  entryPoints: ['src/screenshot.v1.ts'],
  format: 'esm',
};

if (watch) {
  const devvitCtx = await esbuild.context(devvitOpts);
  const screenshotCtx = await esbuild.context(screenshotOpts);
  await Promise.all([devvitCtx.watch(), screenshotCtx.watch()]);
  if (serve) await devvitCtx.serve({ port: 1234, servedir: '.' });
} else {
  const devvitResult = await esbuild.build(devvitOpts);
  const screenshotResult = await esbuild.build(screenshotOpts);
  fs.writeFileSync('dist/devvit.v1.meta.json', JSON.stringify(devvitResult.metafile));
  fs.writeFileSync('dist/screenshot.v1.meta.json', JSON.stringify(screenshotResult.metafile));
}
