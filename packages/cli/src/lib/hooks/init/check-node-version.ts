import { createRequire } from 'node:module';

import type { Hook } from '@oclif/core';

const hook: Hook<'init'> = async function () {
  // TODO: remove this check after stackblitz ships node20 support
  if (isWebcontainer()) {
    return;
  }
  // Verify that the user is using a supported version of Node.js, based on the engines property in package.json
  const require = createRequire(import.meta.url);
  const { engines } = require('../../../../package.json');

  const currentVersion = process.version.substring(1); // remove the 'v' from the front
  const requiredVersion = engines.node;
  if (!requiredVersion.startsWith('>=')) {
    this.error(
      "Required version doesn't start with '>=', please check the package.json file and/or update the check-node-version hook."
    );
  }

  const curVersion = currentVersion.split('.').map(Number);
  const reqVersion = requiredVersion.substring(2).split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (curVersion[i] < reqVersion[i]) {
      this.error(
        `Node.js ${requiredVersion} is required, but you are using Node.js ${currentVersion}. Check` +
        `out our docs for notes on how to install the latest version of Node:\n` +
        `https://developers.reddit.com/docs/get-started/environment#install-nodejs`
      );
    }
  }
};

const isWebcontainer = () =>
  process.env.SHELL === "/bin/jsh" &&
  process.versions.webcontainer

export default hook;
