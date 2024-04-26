/* eslint-env node */
const path = require('path');

const base = require('@devvit/eslint-config/base.cjs');

const config = {
  ...base,
  ignorePatterns: [...base.ignorePatterns, '*.template.ts'],
  parserOptions: {
    ...base.parserOptions,
    project: path.join(__dirname, 'tsconfig.json'),
  },
};

module.exports = config;
