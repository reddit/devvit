import type { Metadata, ValidateFormRequest, ValidateFormResponse } from '@devvit/protos';
import { GetFieldsResponse, InstallationSettingsDefinition } from '@devvit/protos';
import type { Config } from '@devvit/runtimes/api/Config.js';
import { transformFormFields } from '../../apis/ui/helpers/transformForm.js';
import { Devvit } from '../Devvit.js';
import { extendDevvitPrototype } from './helpers/extendDevvitPrototype.js';
import { onValidateFormHelper } from './helpers/settingsUtils.js';

async function onGetSettingsFields(): Promise<GetFieldsResponse> {
  if (!Devvit.installationSettings) {
    throw new Error('Installation settings were not defined.');
  }

  return GetFieldsResponse.fromPartial({
    fields: {
      fields: transformFormFields(Devvit.installationSettings),
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
  extendDevvitPrototype('GetSettingsFields', onGetSettingsFields);
  extendDevvitPrototype('ValidateForm', onValidateForm);
}
