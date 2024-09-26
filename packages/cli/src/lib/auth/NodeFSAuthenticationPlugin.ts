import crypto from 'node:crypto';
import querystring from 'node:querystring';

import type { Empty } from '@devvit/protos/types/google/protobuf/empty.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import inquirer from 'inquirer';
import open from 'open';
import type { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs';

import { readLine } from '../../util/input-util.js';
import type { R2OAuthConfig } from '../http/oauth.js';
import { fetchR2OAuthGrant, fetchR2OAuthRefresh } from '../http/oauth.js';
import type { TokenInfo } from './AuthTokenStore.js';
import { AuthTokenStore } from './AuthTokenStore.js';
import { localCodeServer } from './local-code-server.js';
import { handleAccessDenied } from './login-view.js';
import { StoredToken } from './StoredToken.js';

export type NodeFSAuthenticationPluginConfig = {
  /** Directory of devvit's default config directory */
  dotDevvitDir: string;
  auth: R2OAuthConfig;
};

/**
 * @description server side Node FS implementation of an authentication plugin
 */
export class NodeFSAuthenticationPlugin {
  readonly #authCfg: NodeFSAuthenticationPluginConfig['auth'];

  readonly authTokenStore: AuthTokenStore;

  autoRefreshTokenTimeout: ReturnType<typeof setTimeout> | undefined;

  #authTokenStoreUpdatesSubscription: Subscription | undefined;

  constructor(cfg: NodeFSAuthenticationPluginConfig) {
    this.#authCfg = cfg.auth;
    this.authTokenStore = new AuthTokenStore(cfg.dotDevvitDir);
  }

  get #revokeTokenUrl(): string {
    return `${this.#authCfg.apiV1Url}/revoke_token`;
  }

  get #authenticationUrl(): string {
    return `${this.#authCfg.apiV1Url}/authorize`;
  }

  /** Remember to call .dispose() if you subscribed to auth changes through
   * NotifyAuthenticationUpdates to clear the timeouts!
   */
  async dispose(): Promise<void> {
    await this.authTokenStore.dispose();
    this.#authTokenStoreUpdatesSubscription?.unsubscribe();
    if (this.autoRefreshTokenTimeout != null) {
      clearTimeout(this.autoRefreshTokenTimeout);
    }
  }

  async refreshStoredToken(refreshToken: string, copyPaste: boolean): Promise<TokenInfo> {
    const refresh = await fetchR2OAuthRefresh(this.#authCfg, copyPaste, refreshToken);
    const token = StoredToken.fromGrant(refresh);
    await this.authTokenStore.writeFSToken(token, copyPaste);
    return { token: token, copyPaste };
  }

  async Authenticate(): Promise<StoredToken> {
    const validation = await this.Validate();
    if (validation) {
      return validation;
    }
    const newToken = await this.#login();
    await this.authTokenStore.writeFSToken(newToken);
    return newToken;
  }

  async Validate(): Promise<StoredToken | undefined> {
    try {
      const token = await this.#getCurrentTokenRefreshedIfNeeded();
      if (token) {
        return token;
      }
    } catch (err) {
      console.error(`Validation error: ${StringUtil.caughtToString(err)}`);
    }
  }

  /**
   * @description this implementation pushed updates in 2 cases:
   * 1. When this.#authTokenStore file watcher notifies that changes have been
   *    made to the auth store. (e.g. devvit login in a different session)
   * 2. Before the current auth token is about to expire, the auth store will be
   *    requested to refresh.
   */
  NotifyAuthenticationUpdates(_request: Empty): Observable<TokenInfo | undefined> {
    // subscribe to token changes on FS and set up auto refresh token
    if (!this.#authTokenStoreUpdatesSubscription) {
      this.#authTokenStoreUpdatesSubscription = this.authTokenStore.updates.subscribe(
        this.#resetAutoRefreshTokenTimeout.bind(this)
      );
    }

    return this.authTokenStore.updates.pipe(
      map((v) => (v.token.hasScopes(this.#authCfg.scopes) ? v : undefined))
    );
  }

  async Logout(_request: Empty): Promise<Empty> {
    const tokenInfo = await this.authTokenStore.readFSToken();
    if (tokenInfo) {
      await this.#revokeToken(tokenInfo.token);
    }
    await this.authTokenStore.clearToken();

    return {};
  }

  async loginViaCopyPaste(): Promise<StoredToken> {
    const state = crypto.randomBytes(16).toString('hex');
    const authenticationUrl = `${this.#authenticationUrl}?${querystring.stringify({
      client_id: this.#authCfg.copyPasteClientId,
      duration: this.#authCfg.tokenDuration,
      redirect_uri: this.#authCfg.copyPasteRedirectUri,
      response_type: 'code',
      scope: this.#authCfg.scopes,
      devvit_cli: 'true',
      state,
    })}`;

    console.log('Please open this page:');
    console.log();
    console.log(authenticationUrl.replace('*', '%2A'));
    console.log();

    const { code } = await inquirer.prompt([
      {
        name: 'code',
        message: 'Paste the code you got here and press Enter:',
        type: 'input',
      },
    ]);
    const token = await this.#fetchAccessToken(code, true);
    await this.authTokenStore.writeFSToken(token);
    return token;
  }

  #resetAutoRefreshTokenTimeout(curStoredToken: TokenInfo): void {
    if (this.autoRefreshTokenTimeout != null) {
      clearTimeout(this.autoRefreshTokenTimeout);
    }

    // refresh 10 minutes before actual expiry
    const refreshIn = curStoredToken.token.expiresAt.getTime() - Date.now() - 10 * 60 * 1000;
    if (refreshIn <= 0) {
      // to-do: why isn't this awaited?
      this.Authenticate()
        .then()
        .catch((err) => console.error(StringUtil.caughtToString(err)));
      return;
    }

    this.autoRefreshTokenTimeout = setTimeout(() => {
      // to-do: why isn't this awaited?
      this.refreshStoredToken(curStoredToken.token.refreshToken, !!curStoredToken.copyPaste)
        .then()
        .catch(() => {});
    }, refreshIn);
  }

  async #revokeToken(token: StoredToken, copyPaste?: boolean): Promise<void> {
    const formData = new FormData();
    formData.append('refresh_token', encodeURIComponent(token.refreshToken));
    formData.append('token_type_hint', 'refresh_token');
    const headers = copyPaste
      ? this.#authCfg.copyPasteClientHeaders
      : this.#authCfg.devvitOAuthClientHeaders;

    const response = await fetch(this.#revokeTokenUrl, {
      method: 'POST',
      headers,
      body: formData,
    });
    await response.text();
  }

  /**
   * @returns undefined if no token on disk can be found. Otherwise, returns a
   * valid StoredToken instance
   */
  async #getCurrentTokenRefreshedIfNeeded(): Promise<StoredToken | undefined> {
    let tokenInfo = await this.authTokenStore.readFSToken();
    if (!tokenInfo || !tokenInfo.token.hasScopes(this.#authCfg.scopes)) {
      return undefined;
    }
    if (tokenInfo.token.isFresh()) {
      return tokenInfo.token;
    }
    tokenInfo = await this.refreshStoredToken(tokenInfo.token.refreshToken, !!tokenInfo.copyPaste);
    return tokenInfo.token;
  }

  async #login(): Promise<StoredToken> {
    const state = crypto.randomBytes(16).toString('hex');
    const authenticationUrl = `${this.#authenticationUrl}?${querystring.stringify({
      client_id: this.#authCfg.clientId,
      duration: this.#authCfg.tokenDuration,
      redirect_uri: this.#authCfg.redirectUri,
      response_type: 'code',
      scope: this.#authCfg.scopes,
      devvit_cli: 'true',
      state,
    })}`;

    console.log(`
Press enter to open Reddit to complete authentication:

${authenticationUrl}
`); // extra line for spacing on terminal output

    // Don't await. Start the server immediately so we don't miss a callback.
    const line = readLine();
    line.then(() => open(authenticationUrl)).catch(() => {});

    try {
      return await this.#listenForAuthCallback(state, authenticationUrl);
    } catch (err) {
      console.error('Failed to login to reddit');
      throw err;
    } finally {
      // Regardless of the outcome, we're done.
      line.reject();
    }
  }

  async #fetchAccessToken(authCode: string, copyPaste: boolean): Promise<StoredToken> {
    const grant = await fetchR2OAuthGrant(authCode, this.#authCfg, copyPaste);
    return StoredToken.fromGrant(grant);
  }

  #listenForAuthCallback(state: string, authenticationUrl: string): Promise<StoredToken> {
    return localCodeServer({
      port: this.#authCfg.callbackListenerPort,
      state,
      requestHandler: async (queryParams, resp) => {
        if (queryParams.code) {
          // If there's an auth code, attempt using it to get an access token
          const { code: queryCode } = queryParams;
          const code = typeof queryCode === 'string' ? queryCode : queryCode[0];
          return await this.#fetchAccessToken(code, false);
        }
        if (queryParams.error === 'access_denied') {
          // If access was denied, print a message asking them to try again and approve access
          handleAccessDenied(resp, authenticationUrl);
        }
        return false;
      },
    });
  }
}
