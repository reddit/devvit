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
const opts = {
  banner: watch
    ? {
        js: "new EventSource('/esbuild').addEventListener('change', () => location.reload());",
      }
    : {},
  bundle: true,
  define: { 'globalThis.webViewScriptsVersion': JSON.stringify(webViewScripts) },
  entryPoints: ['src/devvit.v1.ts'],
  format: 'iife',
  logLevel: 'info', // Print the port and build demarcations.
  metafile: true,
  minify,
  outfile: 'dist/scripts/devvit.v1.min.js',
  sourcemap: 'linked',
  target: 'es2020', // https://esbuild.github.io/content-types/#tsconfig-json
  write: !watch,
};

if (watch) {
  const ctx = await esbuild.context(opts);
  await Promise.all([ctx.watch(), ctx.serve({ port: 1234, servedir: '.' })]);
} else {
  const build = await esbuild.build(opts);
  fs.writeFileSync('dist/meta.json', JSON.stringify(build.metafile));
}
