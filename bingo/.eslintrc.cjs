/* eslint-env node */
const path = require('path');

module.exports = require('@devvit/eslint-config/base.cjs');
module.exports.parserOptions.project = path.join(__dirname, 'tsconfig.json');
module.exports.ignorePatterns.push('esbuild.preview.mjs');
