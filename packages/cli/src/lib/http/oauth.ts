import { isObject } from '@devvit/shared-types/isObject.js';
import type { JSONValue } from '@devvit/shared-types/json.js';
import fetch, { FormData } from 'node-fetch';

/** Reddit API (r2) OAuth 2 config. */
export type R2OAuthConfig = {
  /** No trailing slash. */
  readonly apiV1Url: string;
  readonly redirectUri: string;
  readonly callbackListenerPort: number;
  readonly clientId: string;
  readonly devvitOAuthClientHeaders: Record<string, string>;
  readonly copyPasteClientId: string;
  readonly copyPasteRedirectUri: string;
  readonly copyPasteClientHeaders: Record<string, string>;
  readonly scopes: string;
  readonly tokenDuration: string;
};

/**
 * Permanent access response.
 *
 * @see https://github.com/reddit-archive/reddit/wiki/OAuth2
 */
export type R2OAuthGrant = {
  /**
   * OAuth2 access token. All access tokens expire and may be revoked. An access
   * token may be renewed at any time, even before expiry, with a refresh token.
   * The access token changes whenever refreshed.
   */
  access_token: string;
  /**
   * Seconds until the access token expires. Eg, 86400 (24 hours). Expired
   * tokens may be renewed with a refresh token. The refresh token never
   * expires.
   */
  expires_in: number;
  /** Used to refresh the access token. A refresh token never changes. */
  refresh_token: string;
  /**
   * Access permissions. Eg, `*` or `read devplatform:read identity`.
   *
   * @see https://github.com/reddit-archive/reddit/wiki/OAuth2#authorization-implicit-grant-flow
   */
  scope: string;
  token_type: 'bearer';
};

/**
 * Request permanent access.
 *
 * @arg authCode Authorization code given on user consent callback.
 * @arg redirectURI Where to redirect the user on successful grant; this is
 *                  often used to indicate workflow completion to the user.
 */
export async function fetchR2OAuthGrant(
  authCode: string,
  config: R2OAuthConfig,
  copyPaste: boolean
): Promise<R2OAuthGrant> {
  const redirectUri = copyPaste ? config.copyPasteRedirectUri : config.redirectUri;
  const headers = copyPaste ? config.copyPasteClientHeaders : config.devvitOAuthClientHeaders;
  const data = new FormData();
  data.append('grant_type', 'authorization_code');
  data.append('code', authCode);
  data.append('redirect_uri', redirectUri);
  const rsp = await fetch(`${config.apiV1Url}/access_token`, {
    method: 'POST',
    headers,
    body: data,
  });
  if (!rsp.ok) throw Error(`HTTP error ${rsp.status}: ${rsp.statusText}`);

  const grant = (await rsp.json()) as JSONValue;
  assertR2OAuthGrant(grant);
  return grant;
}

export async function fetchR2OAuthRefresh(
  config: R2OAuthConfig,
  copyPaste: boolean,
  refreshToken: string
): Promise<R2OAuthGrant> {
  const headers = copyPaste ? config.copyPasteClientHeaders : config.devvitOAuthClientHeaders;
  const data = new FormData();
  data.append('grant_type', 'refresh_token');
  data.append('refresh_token', refreshToken);
  const rsp = await fetch(`${config.apiV1Url}/access_token`, {
    method: 'POST',
    headers,
    body: data,
  });
  if (!rsp.ok) throw Error(`HTTP error ${rsp.status}: ${rsp.statusText}`);

  const refresh = (await rsp.json()) as JSONValue;
  assertR2OAuthGrant(refresh);
  return refresh;
}

function assertR2OAuthGrant(json: JSONValue): asserts json is R2OAuthGrant {
  if (
    !isObject(json) ||
    typeof json.access_token !== 'string' ||
    typeof json.expires_in !== 'number' ||
    typeof json.refresh_token !== 'string' ||
    typeof json.scope !== 'string' ||
    json.token_type !== 'bearer'
  )
    throw Error('malformed Reddit API OAuth grant');
}
