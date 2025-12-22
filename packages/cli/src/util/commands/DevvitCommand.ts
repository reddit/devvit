import type { T2 } from '@devvit/shared-types/tid.js';
import { Command, Flags } from '@oclif/core';
import { parse } from '@oclif/core/lib/parser/index.js';
import inquirer from 'inquirer';
import open from 'open';

import type { StoredToken } from '../../lib/auth/StoredToken.js';
import { getAccessToken } from '../auth.js';
import { createDeveloperAccountClient } from '../clientGenerators.js';
import { DEVVIT_PORTAL_URL } from '../config.js';
import {
  type BuildMode,
  devvitClassicConfigFilename,
  devvitV1ConfigFilename,
  newProject,
  type Project,
} from '../project.js';
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
  #project: Project | undefined;

  /** Project configuration. */
  get project(): Project {
    if (!this.#project) this.error(`No project ${devvitClassicConfigFilename} config file found.`);
    return this.#project;
  }

  /**
   * Warning: mutating project state is not well supported. State copies are not
   * invalidated.
   */
  set project(project: Project) {
    this.#project = project;
  }

  isRunningInAppDirectory(): boolean {
    return this.#project !== undefined;
  }

  protected override async init(mode?: BuildMode | 'None'): Promise<void> {
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

    // If we're in 'None' mode, we don't need to initialize a project, and in fact shouldn't try.
    if (mode !== 'None') {
      this.#project = await newProject(flags.config, mode ?? 'Static');
      if (flags.config && !this.#project) this.error(`Project config "${flags.config}" not found.`);
      if (
        flags.config &&
        flags.config !== devvitClassicConfigFilename &&
        flags.config !== devvitV1ConfigFilename
      ) {
        this.log(`Using custom config file: ${flags.config}`);
      }
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
  protected async getUserT2Id(token: StoredToken): Promise<T2> {
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
      return { appName: this.project.name, version: appWithVersion.slice(1) };
    }

    // Otherwise, default to the config and latest.
    return { appName: this.project.name, version: 'latest' };
  }
}
