import os from 'node:os';
import path from 'node:path';

/** @type {boolean} See envvar.md. */
export const MY_PORTAL_ENABLED = !!process.env.MY_PORTAL && process.env.MY_PORTAL !== '0';
/** @type {boolean} See envvar.md. */
export const DEVVIT_DEBUG = process.env.DEVVIT_DEBUG;

export const STAGE_USER_NAME =
  // Not every username is `first.last`, if `MY_PORTAL` looks like a username use that directly
  MY_PORTAL_ENABLED && process.env.MY_PORTAL?.includes('-')
    ? process.env.MY_PORTAL.toLowerCase()
    : os.userInfo().username.replace(/\./g, '-');

const DIR_SUFFIX = MY_PORTAL_ENABLED ? `-${STAGE_USER_NAME}` : '';

/** @type {string} Relative Devvit CLI configuration directory filename. */
const DEVVIT_DIR_NAME = `${process.env.DEVVIT_DIR_NAME || '.devvit'}${DIR_SUFFIX}`;

/**
 * @type {string} Absolute filename of the Devvit CLI configuration directory.
 */
export const DOT_DEVVIT_DIR_FILENAME = process.env.DEVVIT_ROOT_DIR
  ? path.join(process.env.DEVVIT_ROOT_DIR, DEVVIT_DIR_NAME)
  : path.join(os.homedir(), DEVVIT_DIR_NAME);

/** @type {string} */
export const REDDIT_DOT_COM = (() => {
  if (MY_PORTAL_ENABLED) {
    return `https://reddit.${STAGE_USER_NAME}.snoo.dev`;
  }

  return 'https://www.reddit.com';
})();

/** @type {string} */
export const REDDIT_DESKTOP = (() => {
  if (MY_PORTAL_ENABLED) {
    return `https://reddit-service-shreddit.${STAGE_USER_NAME}.snoo.dev`;
  }

  return 'https://www.reddit.com';
})();
