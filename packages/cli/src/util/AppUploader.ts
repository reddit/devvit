import type { FullAppInfo } from '@devvit/protos/community.js';
import { APP_SLUG_BASE_MAX_LENGTH, makeSlug, sluggable } from '@devvit/shared-types/slug.js';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { ux } from '@oclif/core';
import inquirer from 'inquirer';
import { TwirpError, TwirpErrorCode } from 'twirp-ts';

import { MY_PORTAL_ENABLED } from '../lib/config.js';
import { getCaptcha } from './captcha.js';
import { checkAppNameAvailability } from './checkAppNameAvailability.js';
import { createAppClient } from './clientGenerators.js';
import type { DevvitCommand } from './commands/DevvitCommand.js';
import { readPackageJSON } from './package-managers/package-util.js';

export class AppUploader {
  readonly #cmd: DevvitCommand;

  readonly #appClient = createAppClient();

  constructor(cmd: DevvitCommand) {
    this.#cmd = cmd;
  }

  async createNewApp(copyPaste: boolean, justDoIt: boolean): Promise<FullAppInfo> {
    const appName = await this.#promptNameUntilNotTaken(
      sluggable(this.#cmd.project.name) ? makeSlug(this.#cmd.project.name) : undefined
    );
    const description = await this.#getAppDescription();
    const isNsfw = justDoIt ? false : await this.#promptForNSFW();

    let captcha = '';
    // Captcha not required in snoodev, but required in prod
    // TODO We should make a development only API key; once we do, we can remove this & check captchas in dev!
    if (!MY_PORTAL_ENABLED) {
      captcha = await getCaptcha({ copyPaste });
    }

    try {
      ux.action.start('Creating app');
      // let's eliminate the "slug" field and just update the "name" directly
      const newApp = await this.#appClient.Create({
        autogenerateName: false,
        name: appName,
        description: description ?? '',
        isNsfw,
        categories: [], // TODO: should prompt in the future
        captcha,
      });
      this.#cmd.project.name = newApp.slug;
      ux.action.stop('Successfully created your app in Reddit!');
      return {
        app: newApp,
        versions: [], // There's no versions, we just made it :)
        fetchDomainRequests: [],
      };
    } catch (err) {
      ux.action.stop('Error');
      if (err instanceof TwirpError) {
        if (err.code === TwirpErrorCode.AlreadyExists) {
          this.#cmd.error(
            `An app account with the name "${appName}" already exists. Please change the "name" field of devvit.yaml and try again.`
          );
        } else {
          this.#cmd.error(StringUtil.caughtToString(err, 'message'));
        }
      } else {
        this.#cmd.error(
          'Your app could not be uploaded because we encountered an issue creating your app account. This may happen because of a network issue on our end. Please try again.'
        );
      }
    }
  }

  async #promptNameUntilNotTaken(suggestedName: string | undefined): Promise<string> {
    let appName = suggestedName;
    for (;;) {
      const rsp = await inquirer.prompt([
        {
          default: appName,
          name: 'appName',
          type: 'input',
          message: 'Pick a name for your app:',
          validate: async (input: string) => {
            if (!sluggable(input)) {
              return `The name of your app must be between 3 and ${APP_SLUG_BASE_MAX_LENGTH} characters long, and contains only alphanumeric characters, spaces, and dashes.`;
            }
            return true;
          },
          filter: (input: string) => {
            return makeSlug(input.trim().toLowerCase());
          },
        },
      ]);
      appName = rsp.appName;
      if (appName) {
        const isAvailableResponse = await checkAppNameAvailability(this.#appClient, appName);
        if (!isAvailableResponse.exists) {
          // Doesn't exist, we're good
          return appName;
        }
        this.#cmd.warn(
          `The app name "${appName}" is unavailable. The app name must be a unique Reddit username.`
        );
        if (isAvailableResponse.suggestions.length > 0) {
          this.#cmd.log(
            `Here's some suggestions:\n  * ${isAvailableResponse.suggestions.join('\n  * ')}`
          );
          appName = isAvailableResponse.suggestions[0];
        }
      }
    }
  }

  async #promptForNSFW(): Promise<boolean> {
    return (
      await inquirer.prompt<{ isNSFW: boolean }>([
        {
          name: 'isNSFW',
          message: 'Is the app NSFW?',
          type: 'confirm',
          default: false,
        },
      ])
    ).isNSFW;
  }

  async #getAppDescription(): Promise<string> {
    return ((await readPackageJSON(this.#cmd.project.root)).description || '')?.substring(0, 200);
  }
}
