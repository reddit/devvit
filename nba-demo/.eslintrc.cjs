/* eslint-env node */

module.exports = require('@devvit/eslint-config/base.cjs');
module.exports.parserOptions.project = './tsconfig.json';
module.exports.ignorePatterns.push('esbuild.preview.mjs');
