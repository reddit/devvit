import type { Metadata, ValidateFormRequest, ValidateFormResponse } from '@devvit/protos';
import { GetFieldsResponse, InstallationSettingsDefinition } from '@devvit/protos';
import type { InstallationSettings } from '@devvit/protos/types/devvit/actor/settings/v1alpha/installation_settings.js';
import type { Config } from '@devvit/shared-types/Config.js';

import { transformFormFields } from '../../apis/ui/helpers/transformForm.js';
import { Devvit } from '../Devvit.js';
import { extendDevvitPrototype } from './helpers/extendDevvitPrototype.js';
import { onValidateFormHelper } from './helpers/settingsUtils.js';

async function onGetSettingsFields(): Promise<GetFieldsResponse> {
  return GetFieldsResponse.fromJSON({
    fields: {
      fields: transformFormFields(Devvit.installationSettings ?? []),
    },
  });
}

async function onValidateForm(
  req: ValidateFormRequest,
  metadata: Metadata
): Promise<ValidateFormResponse> {
  return onValidateFormHelper(req, Devvit.installationSettings, metadata);
}

export function registerInstallationSettings(config: Config): void {
  config.provides(InstallationSettingsDefinition);
  extendDevvitPrototype<InstallationSettings>('GetSettingsFields', onGetSettingsFields);
  extendDevvitPrototype<InstallationSettings>('ValidateForm', onValidateForm);
}
