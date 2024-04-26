import {
  DOT_DEVVIT_DIR_FILENAME,
  MY_PORTAL_ENABLED,
  REDDIT_DOT_COM,
  STAGE_USER_NAME,
} from '../lib/config.js';

/** Relative build products directory filename. Used for Bundle JSON. */
export const distDirFilename: string = 'dist';

export const REDDIT_OAUTH_API: string = (() => {
  if (MY_PORTAL_ENABLED) {
    return REDDIT_DOT_COM;
  }
  return 'https://oauth.reddit.com';
})();

export const DEVVIT_PORTAL_URL: string = (() => {
  if (MY_PORTAL_ENABLED) {
    return `https://reddit-service-devvit-dev-portal.${STAGE_USER_NAME}.snoo.dev`;
  }

  return 'https://developers.reddit.com';
})();

export const DEVVIT_PORTAL_API = `${DEVVIT_PORTAL_URL}/api`;

export const DEVVIT_GATEWAY_URL: string = (() => {
  if (MY_PORTAL_ENABLED) {
    return `https://reddit-service-devvit-gateway.${STAGE_USER_NAME}.snoo.dev`;
  }

  return 'https://devvit-gateway.reddit.com';
})();

export const DEVVIT_DISABLE_EXTERN_DEVVIT_PROTOS: boolean =
  process.env.DEVVIT_DISABLE_EXTERN_DEVVIT_PROTOS === '1';

export const GQL_QUERY_URL: string = (() => {
  if (MY_PORTAL_ENABLED) {
    return `https://reddit-service-graphql.${STAGE_USER_NAME}.snoo.dev`;
  }

  return 'https://gql-fed.reddit.com';
})();

if (MY_PORTAL_ENABLED) {
  console.debug(
    'Using a staging environment. To do so, toggling node TLS protections off. Please note this will result in node warnings.'
  );

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  console.debug('Using development tokens located in: ', DOT_DEVVIT_DIR_FILENAME);
}
