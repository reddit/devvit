#!/usr/bin/env -S node --no-warnings=ExperimentalWarning
// bundles devvit.v1.min.js.

/** @import {WebViewScriptsVersion} from '@devvit/shared-types/client/devvit-global.js' */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

import esbuild from 'esbuild';

import packageJSON from '../package.json' with { type: 'json' };

/** @type {boolean} */ const minify = process.argv.includes('--minify');
/** @type {boolean} */ const watch = process.argv.includes('--watch');

/** @type {WebViewScriptsVersion} */ const webViewScripts = {
  hash: execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(),
  // Imported JSON doesn't treeshake. Define as a constant.
  version: packageJSON.version,
};

/** @type {esbuild.BuildOptions} */
const baseOpts = {
  banner: watch
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
  write: !watch,
};

/** @type {esbuild.BuildOptions} */
const devvitOpts = {
  ...baseOpts,
  external: ['./screenshot.v1.min.js'],
  entryPoints: ['src/devvit.v1.ts'],
  format: 'iife',
};

/** @type {esbuild.BuildOptions} */
const screenshotOpts = {
  ...baseOpts,
  entryPoints: ['src/screenshot.v1.ts'],
  format: 'esm',
};

if (watch) {
  const devvitCtx = await esbuild.context(devvitOpts);
  const screenshotCtx = await esbuild.context(screenshotOpts);
  await Promise.all([
    devvitCtx.watch(),
    screenshotCtx.watch(),
    devvitCtx.serve({ port: 1234, servedir: '.' }),
  ]);
} else {
  const devvitResult = await esbuild.build(devvitOpts);
  const screenshotResult = await esbuild.build(screenshotOpts);
  fs.writeFileSync('dist/devvit.v1.meta.json', JSON.stringify(devvitResult.metafile));
  fs.writeFileSync('dist/screenshot.v1.meta.json', JSON.stringify(screenshotResult.metafile));
}
