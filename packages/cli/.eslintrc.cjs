/* eslint-env node */
const path = require('path');
const base = require('@devvit/eslint-config/base.cjs');
module.exports = {
  ...base,
  env: {
    ...base.env,
    node: true,
    browser: false,
  },
  parserOptions: {
    ...base.parserOptions,
    project: [path.join(__dirname, 'tsconfig.json'), path.join(__dirname, 'bin', 'tsconfig.json')],
  },
  ignorePatterns: [...base.ignorePatterns, 'src/vendor/', 'src/templates/pen/'],
};
