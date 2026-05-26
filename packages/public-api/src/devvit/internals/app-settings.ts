import type {
  ValidateFormRequest,
  ValidateFormResponse,
} from '@devvit/protos/json/devvit/actor/settings/v1alpha/shared.js';
import type { Metadata } from '@devvit/protos/lib/Types.js';
// eslint-disable-next-line no-restricted-imports
import type { AppSettings } from '@devvit/protos/types/devvit/actor/settings/v1alpha/app_settings.js';
// eslint-disable-next-line no-restricted-imports
import { AppSettingsDefinition } from '@devvit/protos/types/devvit/actor/settings/v1alpha/app_settings.js';
// eslint-disable-next-line no-restricted-imports
import { GetFieldsResponse } from '@devvit/protos/types/devvit/actor/settings/v1alpha/shared.js';
import type { Config } from '@devvit/shared-types/Config.js';

import { transformFormFields } from '../../apis/ui/helpers/transformForm.js';
import { Devvit } from '../Devvit.js';
import { extendDevvitPrototype } from './helpers/extendDevvitPrototype.js';
import { onValidateFormHelper } from './helpers/settingsUtils.js';

async function onGetSettingsFields(): Promise<GetFieldsResponse> {
  return GetFieldsResponse.fromJSON({
    fields: {
      fields: transformFormFields(Devvit.appSettings ?? []),
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
