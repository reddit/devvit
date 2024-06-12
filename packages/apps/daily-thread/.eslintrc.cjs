/* eslint-env node */
const path = require('path');
const base = require('@devvit/eslint-config/base.cjs');

module.exports = {
  ...base,
  parserOptions: {
    ...base.parserOptions,
    project: path.join(__dirname, 'tsconfig.json'),
  },
};
