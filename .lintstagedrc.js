const path = require('path');
const eslintConfigDir = path.join(__dirname, './packages/eslint-config/');

module.exports = {
  // This will match unwanted files like .lintstagedrc.js'*.{cjs,js,jsx,mjs,cts,mts,ts,tsx}'
  '!((.lintstagedrc)|(.yarn/**/*)|(packages/cli/src/templates/pen/src/main)|packages/eslint-config/base|packages/runtime-lite/polyfills/define-global-intl|packages/runtime-lite/src/workers/MobileEntrypoint).{cjs,js,jsx,mjs,cts,mts,ts,tsx}':
    [
      // Since this passes every file along to the linters, and redlint ignores some
      // of our files, it'll throw a warning and refuse to let us commit. Thus, we
      // need to manually ignore the files here too.
      `npx yarn exec redlint --fix --resolve-plugins-relative-to ${eslintConfigDir}`,
      'prettier --write',
    ],
  // Note the md for running prettier markdown files!
  // https://prettier.io/blog/2017/11/07/1.8.0.html
  '*devvit-docs/**/*.{md,cjs,js,jsx,mjs,cts,mts,ts,tsx}': ['prettier --write'],
  '*devvit-dev-portal/**/*.graphql': ['prettier --write', 'make gql-types'],
  '*.proto': ['npx yarn workspace @devvit/protos format'],
  'package.json': ['prettier-package-json --write'],

  // The following errors out trying to fetch when run during a commit; it runs fine from CLI manually, but not here
  // '*.proto': [
  //   "sh -c '[ ${SKIP_PROTO_LINTING-0} -ne 0 ] || npx yarn workspace @devvit/protos lint:breaking'",
  // ],

  'yarn.lock': ['lockfile-lint'],
};
