import { FormFieldType } from '@devvit/protos';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import { Args, ux } from '@oclif/core';
import inquirer from 'inquirer';
import { TwirpError, TwirpErrorCode } from 'twirp-ts';

import { createAppClient, createAppSettingsClient } from '../../util/clientGenerators.js';
import { DevvitCommand } from '../../util/commands/DevvitCommand.js';
import { getAppBySlug } from '../../util/getAppBySlug.js';

export default class SetAppSettings extends DevvitCommand {
  static override description =
    'Create and update settings for your app. These settings will be added at the global app-scope.';
  readonly #appSettingsService = createAppSettingsClient();
  readonly #appService = createAppClient();

  static override args = {
    settingsKey: Args.string({
      description: 'Settings key to add',
      required: true,
    }),
  } as const;

  async #promptSettingValue(settingsKey: string): Promise<string> {
    const promptMessage = `Enter the value you would like to assign to the variable ${settingsKey}:`;
    const res = await inquirer.prompt<{ settingValue: string }>([
      {
        name: 'settingValue',
        message: promptMessage,
        type: 'input',
      },
    ]);
    return res.settingValue;
  }

  override async run(): Promise<void> {
    const { args } = await this.parse(SetAppSettings);
    const settingsKey = args.settingsKey;
    const settingsValue = await this.#promptSettingValue(settingsKey);

    ux.action.start('Updating app settings');
    try {
      const appInfo = await getAppBySlug(this.#appService, {
        slug: this.projectConfig.name,
        hidePrereleaseVersions: true,
        limit: 0,
      });
      const appId = appInfo?.app?.id;
      if (!appId) {
        ux.action.stop(
          "Error: Your app doesn't exist yet - you'll need to run 'devvit upload' before you can set settings."
        );
        return;
      }
      const response = await this.#appSettingsService.UpdateSettings({
        appId,
        settings: {
          settings: {
            [settingsKey]: {
              fieldType: FormFieldType.STRING,
              stringValue: settingsValue,
            },
          },
          version: '',
        },
      });
      if (!response.success) {
        this.error(`${JSON.stringify(response.errors)}`);
      }
      ux.action.stop(`Successfully added app settings for ${settingsKey}!`);
    } catch (err) {
      if (err instanceof TwirpError) {
        if (err.code === TwirpErrorCode.NotFound) {
          const msg = err.message.includes('addSettings')
            ? `Error: Unable to lookup the setting key: ${settingsKey}, please verify Devvit.addSettings was used in your app and the setting's scope is set to SettingScope.App.`
            : 'Error: Please install your app before listing settings.';
          ux.action.stop(msg);
          return;
        } else {
          ux.action.stop('Error');
        }
      } else {
        ux.action.stop('Error');
      }
      this.error(StringUtil.caughtToString(err, 'message'));
    }
  }
}
