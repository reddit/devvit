import type { Metadata, ValidateFormRequest, ValidateFormResponse } from '@devvit/protos';
import { AppSettingsDefinition, GetFieldsResponse } from '@devvit/protos';
import type { AppSettings } from '@devvit/protos/types/devvit/actor/settings/v1alpha/app_settings.js';
import type { Config } from '@devvit/shared-types/Config.js';

import { transformFormFields } from '../../apis/ui/helpers/transformForm.js';
import { Devvit } from '../Devvit.js';
import { extendDevvitPrototype } from './helpers/extendDevvitPrototype.js';
import { onValidateFormHelper } from './helpers/settingsUtils.js';

async function onGetSettingsFields(): Promise<GetFieldsResponse> {
  if (!Devvit.appSettings) {
    throw new Error('App settings were not defined.');
  }

  return GetFieldsResponse.fromJSON({
    fields: {
      fields: transformFormFields(Devvit.appSettings),
    },
  });
}

async function onValidateForm(
  req: ValidateFormRequest,
  metadata: Metadata
): Promise<ValidateFormResponse> {
  return onValidateFormHelper(req, Devvit.appSettings, metadata);
}

export function registerAppSettings(config: Config): void {
  config.provides(AppSettingsDefinition);
  extendDevvitPrototype<AppSettings>('GetAppSettingsFields', onGetSettingsFields);
  extendDevvitPrototype<AppSettings>('ValidateAppForm', onValidateForm);
}
