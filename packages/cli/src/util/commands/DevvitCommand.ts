import { Empty } from '@devvit/protos';
import type { T2ID } from '@devvit/shared-types/tid.js';
import { Command } from '@oclif/core';
import open from 'open';
import { NodeFSAuthenticationPlugin } from '../../lib/auth/NodeFSAuthenticationPlugin.js';
import type { StoredToken } from '../../lib/auth/StoredToken.js';
import { DOT_DEVVIT_DIR_FILENAME } from '../../lib/config.js';
import { readDevvitConfig } from '../../util/devvitConfig.js';
import { findProjectRoot } from '../../util/project-util.js';
import { AUTH_CONFIG } from '../auth.js';
import { createWaitlistClient } from '../clientGenerators.js';
import { DEVVIT_PORTAL_URL } from '../config.js';
import { readLine } from '../input-util.js';
import { fetchUserDisplayName, fetchUserT2Id } from '../r2Api/user.js';

/**
 * Note: we have to return `Promise<string>` here rather than just `string`
 * The official documentation has an error and doesn't match the TS declarations for this method
 *
 * @see https://oclif.io/docs/args/
 */
export const toLowerCaseArgParser = async (input: string): Promise<string> => input.toLowerCase();

export abstract class DevvitCommand extends Command {
  protected _authSvc: NodeFSAuthenticationPlugin | undefined;

  get isOauthSvcInitd(): boolean {
    return this._authSvc != null;
  }

  get oauthSvc(): NodeFSAuthenticationPlugin {
    if (!this._authSvc) {
      this._authSvc = new NodeFSAuthenticationPlugin({
        dotDevvitDir: DOT_DEVVIT_DIR_FILENAME,
        auth: AUTH_CONFIG,
      });
    }
    return this._authSvc;
  }

  getAccessTokenAndLoginIfNeeded = async (copyPaste?: boolean): Promise<StoredToken> => {
    if (copyPaste) return await this.oauthSvc.loginViaCopyPaste();
    return await this.oauthSvc.Authenticate();
  };

  getAccessToken = async (): Promise<StoredToken | undefined> => {
    try {
      const tokenInfo = await this.oauthSvc.authTokenStore.readFSToken();
      if (!tokenInfo || !tokenInfo.token.hasScopes(AUTH_CONFIG.scopes)) {
        return undefined;
      }
      if (tokenInfo.token.isFresh()) {
        return tokenInfo.token;
      }
      return (
        await this.oauthSvc.refreshStoredToken(
          tokenInfo.token.refreshToken,
          Boolean(tokenInfo.copyPaste)
        )
      ).token;
    } catch {
      // probably logged out
      return;
    }
  };

  protected checkDevvitTermsAndConditions = async (): Promise<void> => {
    const waitlistClient = createWaitlistClient(this);

    const { acceptedTermsVersion, currentTermsVersion } = await waitlistClient.GetCurrentUserStatus(
      Empty.fromPartial({})
    );

    const termsUrl = `${DEVVIT_PORTAL_URL}/terms`;
    if (acceptedTermsVersion < currentTermsVersion) {
      this.log('Please accept our Terms and Conditions before proceeding:');
      this.log(`${termsUrl} (press enter to open, control-c to quit)`);
      if (await readLine())
        open(termsUrl).catch((_err) =>
          this.error('An error occurred when opening Terms and Conditions')
        );
      process.exit();
    }
  };

  protected async checkIfUserLoggedIn(): Promise<void> {
    const token = await this.getAccessToken();
    if (!token) {
      this.error('Not currently logged in. Try `devvit login` first');
    }
  }

  /**
   * @description Get the user's display name from the stored token.
   */
  protected async getUserDisplayName(token: StoredToken): Promise<string> {
    const res = await fetchUserDisplayName(token);
    if (!res.ok) {
      this.error(`${res.error}. Try again or re-login with \`devvit login\`.`);
    }
    return res.value;
  }

  /**
   * @description Get the user's t2 id from the stored token.
   */
  protected async getUserT2Id(token: StoredToken): Promise<T2ID> {
    const res = await fetchUserT2Id(token);
    if (!res.ok) {
      this.error(`${res.error}. Try again or re-login with \`devvit login\`.`);
    }
    return res.value;
  }

  protected async inferAppNameFromProject(): Promise<string> {
    const projectRoot = await findProjectRoot();
    if (projectRoot == null) {
      this.error(`You must specify an app name or run this command from within a project.`);
    }
    const devvitConfig = await readDevvitConfig(projectRoot);

    return devvitConfig.name;
  }

  /**
   * @description Handle resolving the appname@version for the following cases
   *
   * Case 1: devvit <publish|install> <app-name>@<version>  - can be run anywhere
   * Case 1: devvit <publish|install> <app-name>            - can be run anywhere
   * Case 3: devvit <publish|install> <version>             - must be in project directory
   * Case 2: devvit <publish|install>                       - must be in project directory
   */
  protected async inferAppNameAndVersion(appWithVersion: string | undefined): Promise<string> {
    if (appWithVersion && !appWithVersion.startsWith('@')) {
      // assume it is the form <app-name>@<version> or <app-name>
      return appWithVersion;
    }

    const projectRoot = await findProjectRoot();
    if (projectRoot == null) {
      this.error(`You must specify an app name or run this command from within a project.`);
    }
    const devvitConfig = await readDevvitConfig(projectRoot);

    if (!appWithVersion) {
      // getInfoForSlugString is called after this which will default to latest version so we don't need to return the
      // version here
      return devvitConfig.name;
    }
    if (appWithVersion.startsWith('@')) {
      return `${devvitConfig.name}${appWithVersion}`;
    }

    return appWithVersion;
  }
}
