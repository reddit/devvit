module.exports = {
  '!(packages/protos/src/types/**/*).{cjs,js,jsx,mjs,cts,mts,ts,tsx}': [
    `npx yarn exec redlint --fix`,
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
