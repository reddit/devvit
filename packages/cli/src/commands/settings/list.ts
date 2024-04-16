import { createAppClient, createAppSettingsClient } from '../../util/clientGenerators.js';
import { ux } from '@oclif/core';
import { StringUtil } from '@devvit/shared-types/StringUtil.js';
import type { Form } from '@devvit/protos';
import { FormFieldType } from '@devvit/protos';
import { ProjectCommand } from '../../util/commands/ProjectCommand.js';
import { getAppBySlug } from '../../util/utils.js';
import { TwirpError, TwirpErrorCode } from 'twirp-ts';

export default class ListAppSettings extends ProjectCommand {
  static override description =
    'List settings for your app. These settings exist at the global app-scope and are available to all instances of your app.';
  readonly #appSettingsService = createAppSettingsClient(this);
  readonly #appService = createAppClient(this);
  override async run(): Promise<void> {
    const projectConfig = await this.getProjectConfig();
    const appName = projectConfig.slug ?? projectConfig.name;
    ux.action.start('Fetching app setting keys');
    try {
      const appInfo = await getAppBySlug(this.#appService, appName);
      if (!appInfo?.app?.id) {
        ux.action.stop(
          `❌ Your app doesn't exist yet - you'll need to run 'devvit upload' before you can list settings.`
        );
        return;
      }
      const response = await this.#appSettingsService.GetForm({
        appId: appInfo.app.id as string,
      });
      ux.action.stop();
      if (response) {
        this.#displayAppSettingsKeys(response.form);
      }
    } catch (err) {
      if (err instanceof TwirpError) {
        if (err.code === TwirpErrorCode.NotFound) {
          ux.action.stop(`❌ Please install your app before listing settings.`);
          return;
        } else if (err.message.includes('does not provide method')) {
          ux.action.stop(
            `❌ Unable to fetch settings. Please verify Devvit.addSettings was used in your app.`
          );
          return;
        }
      }
      ux.action.stop(`❌`);
      this.error(StringUtil.caughtToString(err));
    }
  }

  #displayAppSettingsKeys(forms: { [key: string]: Form }): void {
    type DataRow = { key: string; label: string; type: string; is_secret: boolean };
    /* eslint no-var: 0 */
    var settingKeys: DataRow[] = [];
    Object.entries(forms).forEach(([_, form]) => {
      if (form.fields) {
        Object.entries(form.fields).forEach(([_, field]) => {
          settingKeys.push({
            key: field.fieldId,
            label: field.label,
            type: FormFieldType[field.fieldType],
            is_secret: field.isSecret ? field.isSecret : false,
          });
        });
      }
    });
    const keyColumn = {
      header: 'Key',
      get: (entry: DataRow) => entry.key,
    };
    const labelColumn = {
      header: 'Label',
      get: (entry: DataRow) => entry.label,
    };
    const typeColumn = {
      header: 'Type',
      get: (entry: DataRow) => entry.type,
    };
    const secretColumn = {
      header: 'Is this a secret?',
      get: (entry: DataRow) => entry.is_secret,
    };
    ux.table(settingKeys, { keyColumn, labelColumn, secretColumn, typeColumn });
  }
}
