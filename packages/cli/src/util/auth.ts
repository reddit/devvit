import { HEADER_USER_AGENT } from '../constants/Headers.js';
import {
  NodeFSAuthenticationPlugin,
  type NodeFSAuthenticationPluginConfig,
} from '../lib/auth/NodeFSAuthenticationPlugin.js';
import type { StoredToken } from '../lib/auth/StoredToken.js';
import { DOT_DEVVIT_DIR_FILENAME, REDDIT_DOT_COM } from '../lib/config.js';
import { DEVVIT_PORTAL_URL } from './config.js';

const PORT = 65010; // Has to match exactly to our oauth app settings
const CLIENT_ID = 'Bep8X2RRjuoyuxkKsKxFuQ';
const TOKEN_DURATION = 'permanent';
const API_V1_URL = `${REDDIT_DOT_COM}/api/v1`;
const COPY_PASTE_CLIENT_ID = 'TWTsqXa53CexlrYGBWaesQ';
const COPY_PASTE_REDIRECT_URI = `${DEVVIT_PORTAL_URL}/cli-login`;

const DEVVIT_OAUTH_CLIENT_HEADERS = {
  'User-Agent': 'devvit-cli',
  Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:`).toString('base64')}`,
};
const COPY_PASTE_OAUTH_CLIENT_HEADERS = {
  'User-Agent': 'devvit-cli',
  Authorization: `Basic ${Buffer.from(`${COPY_PASTE_CLIENT_ID}:`).toString('base64')}`,
};

const getRedirectURI = (port: number): string => `http://localhost:${port}/authorize_callback`;

export const authHeaders = (token: StoredToken): Record<string, string> => {
  return {
    Authorization: `Bearer ${token.accessToken}`,
    'User-Agent': HEADER_USER_AGENT()[1],
  };
};

export const AUTH_CONFIG: NodeFSAuthenticationPluginConfig['auth'] = {
  apiV1Url: API_V1_URL,
  redirectUri: getRedirectURI(PORT),
  callbackListenerPort: PORT,
  clientId: CLIENT_ID,
  devvitOAuthClientHeaders: DEVVIT_OAUTH_CLIENT_HEADERS,
  copyPasteRedirectUri: COPY_PASTE_REDIRECT_URI,
  copyPasteClientId: COPY_PASTE_CLIENT_ID,
  copyPasteClientHeaders: COPY_PASTE_OAUTH_CLIENT_HEADERS,
  scopes: '*',
  tokenDuration: TOKEN_DURATION,
};

let _authSvc: NodeFSAuthenticationPlugin | undefined;

export function getOAuthSvc(): NodeFSAuthenticationPlugin {
  if (!_authSvc) {
    return new NodeFSAuthenticationPlugin({
      dotDevvitDir: DOT_DEVVIT_DIR_FILENAME,
      auth: AUTH_CONFIG,
    });
  }
  return _authSvc;
}

export async function getAccessToken(): Promise<StoredToken | undefined> {
  try {
    const tokenInfo = await getOAuthSvc().authTokenStore.readFSToken();
    if (!tokenInfo || !tokenInfo.token.hasScopes(AUTH_CONFIG.scopes)) {
      return undefined;
    }
    if (tokenInfo.token.isFresh()) {
      return tokenInfo.token;
    }
    return (
      await getOAuthSvc().refreshStoredToken(
        tokenInfo.token.refreshToken,
        Boolean(tokenInfo.copyPaste)
      )
    ).token;
  } catch {
    // probably logged out
    return;
  }
}

export async function getAccessTokenAndLoginIfNeeded(copyPaste?: boolean): Promise<StoredToken> {
  if (copyPaste) {
    return await getOAuthSvc().loginViaCopyPaste();
  }
  return await getOAuthSvc().Authenticate();
}
