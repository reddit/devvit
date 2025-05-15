import type { T2ID } from '@devvit/shared-types/tid.js';
import { Command, Flags } from '@oclif/core';
import { parse } from '@oclif/core/lib/parser/index.js';
import inquirer from 'inquirer';
import open from 'open';

import type { StoredToken } from '../../lib/auth/StoredToken.js';
import { getAccessToken } from '../auth.js';
import { createDeveloperAccountClient } from '../clientGenerators.js';
import { DEVVIT_PORTAL_URL } from '../config.js';
import { DEVVIT_CONFIG_FILE, type DevvitConfig, DevvitConfigCache } from '../devvit-config.js';
import type { DevvitPackageConfig } from '../package-managers/package-util.js';
import { findProjectRoot } from '../project-util.js';
import { fetchUserDisplayName, fetchUserT2Id } from '../r2Api/user.js';

/**
 * Note: we have to return `Promise<string>` here rather than just `string`
 * The official documentation has an error and doesn't match the TS declarations for this method
 *
 * @see https://oclif.io/docs/args/
 */
export const toLowerCaseArgParser = async (input: string): Promise<string> => input.toLowerCase();

export abstract class DevvitCommand extends Command {
  static override baseFlags = {
    config: Flags.string({ description: 'path to devvit config file' }),
  } as const;

  protected readonly developerAccountClient = createDeveloperAccountClient();
  #configCache: DevvitConfigCache | undefined;

  /** @deprecated Use the config-file.v1.json schema instead. */
  get packageConfig(): Readonly<DevvitPackageConfig> | undefined {
    return this.#configCache?.packageConfig;
  }

  /**
   * Project configuration. Warning: do not confuse `projectConfig()` for
   * oclif's `Command.config` which is part of the class hierarchy.
   */
  get projectConfig(): Readonly<DevvitConfig> {
    return this.#nonnullConfigCache.config;
  }

  get projectRoot(): string {
    return this.#nonnullConfigCache.root;
  }

  async updateProjectConfig(updates: Partial<Readonly<DevvitConfig>>): Promise<void> {
    await this.#nonnullConfigCache.update(updates);
  }

  protected override async init(): Promise<void> {
    await super.init();

    // to-do: avoid subclassing and compose instead. subclasses cause bugs
    //        because of all the inherited behavior wanted or not, require
    //        understanding the entire hierarchy top to bottom (and left to
    //        right for a base class like this), and need crazy hacks like
    //        below.
    const baseFlags = Object.keys(DevvitCommand.baseFlags).map((flag) => `--${flag}`);
    const baseArgv = this.argv.filter(
      (arg) => !arg.startsWith('--') || baseFlags.some((flag) => arg.startsWith(flag))
    );
    // call parse() instead of this.parse() which only knows of
    // DevvitCommand.baseFlags.
    const { flags } = await parse(baseArgv, {
      strict: false,
      flags: DevvitCommand.baseFlags,
    });

    const configFilename = flags.config || DEVVIT_CONFIG_FILE;
    const projectDir = await findProjectRoot(configFilename);
    if (flags.config && !projectDir) this.error(`Project config "${configFilename}" not found.`);
    if (projectDir) this.#configCache = await DevvitConfigCache.new(projectDir, configFilename);
    if (configFilename !== DEVVIT_CONFIG_FILE) {
      this.log(`Using custom config file: ${configFilename}`);
    }
  }

  protected checkDeveloperAccount = async (): Promise<void> => {
    const { acceptedTermsVersion, currentTermsVersion } =
      await this.developerAccountClient.GetUserAccountInfoIfExists({});

    const devAccountUrl = `${DEVVIT_PORTAL_URL}/create-account?cli=true`;
    if (acceptedTermsVersion < currentTermsVersion) {
      this.log('Please finish setting up your developer account before proceeding:');
      this.log(devAccountUrl);

      type ActionType = 'open' | 'tryAgain' | 'exit';
      const { action } = await inquirer.prompt<{ action: ActionType }>({
        name: 'action',
        message: 'What would you like to do?',
        type: 'list',
        choices: [
          {
            name: 'Open developer account page in browser',
            value: 'open',
          },
          {
            name: 'I have finished setting up my developer account; check again',
            value: 'tryAgain',
          },
          {
            name: 'Exit',
            value: 'exit',
          },
        ],
      });

      if (action === 'open') {
        try {
          await open(devAccountUrl);
        } catch {
          this.error(
            'An error occurred when trying to open the developer account page. Please try again.'
          );
        }
        return this.checkDeveloperAccount();
      }

      if (action === 'tryAgain') {
        return this.checkDeveloperAccount();
      }

      if (action === 'exit') {
        process.exit(1);
      }

      this.error('Invalid action; quitting');
    }
  };

  protected async checkIfUserLoggedIn(): Promise<void> {
    const token = await getAccessToken();
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

  /**
   * @description Handle resolving the appname@version for the following cases
   *
   * Case 1: devvit <publish|install> <app-name>@<version>  - can be run anywhere
   * Case 1: devvit <publish|install> <app-name>            - can be run anywhere
   * Case 3: devvit <publish|install> @<version>            - must be in project directory
   * Case 2: devvit <publish|install>                       - must be in project directory
   */
  protected async inferAppNameAndVersion(
    appWithVersion: string | undefined
  ): Promise<{ appName: string; version: string }> {
    appWithVersion = appWithVersion ?? '';

    // If the agrument has "<app-name>@<version>" format, then both appName and version can be inferred
    if (appWithVersion.includes('@') && !appWithVersion.startsWith('@')) {
      const [appName, version] = appWithVersion.split('@');

      return {
        appName,
        version,
      };
    }

    // If the agrument has "<app-name>" format, then we assume the version as "latest"
    if (appWithVersion.length > 0 && !appWithVersion.includes('@')) {
      return {
        appName: appWithVersion,
        version: 'latest',
      };
    }

    // Otherwise, we need to read appName or app version from the config
    // If the agrument has "@<version>" format
    if (appWithVersion.startsWith('@')) {
      return { appName: this.projectConfig.name, version: appWithVersion };
    }

    // Otherwise, default to the config and latest.
    return { appName: this.projectConfig.name, version: 'latest' };
  }

  get #nonnullConfigCache(): DevvitConfigCache {
    if (!this.#configCache) this.error(`No project ${DEVVIT_CONFIG_FILE} config file found.`);
    return this.#configCache;
  }
}
