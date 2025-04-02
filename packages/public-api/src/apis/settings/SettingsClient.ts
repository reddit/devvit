import { FormFieldType, type FormFieldValue, type Metadata } from '@devvit/protos';
import type { SettingsResponse } from '@devvit/protos/types/devvit/plugin/settings/v1alpha/settings.js';

import { Devvit } from '../../devvit/Devvit.js';
import type {
  SettingsClient as _SettingsClient,
  SettingsFormField,
  SettingsValues,
} from '../../types/settings.js';
import { flattenFormFieldValue } from '../ui/helpers/getFormValues.js';

export class SettingsClient implements _SettingsClient {
  readonly #metadata: Metadata;

  constructor(metadata: Metadata) {
    this.#metadata = metadata;
  }

  async get<T = string | number | boolean | string[] | undefined>(
    name: string
  ): Promise<T | undefined> {
    const settings = await this.getAll();
    return settings[name] as T;
  }

  async getAll<T extends object = SettingsValues>(): Promise<T> {
    const settingsClient = Devvit.settingsPlugin;

    const response = await settingsClient.GetSettings({}, this.#metadata);

    if (!response.installationSettings) {
      throw new Error('Could not get installation settings');
    }

    if (!response.appSettings) {
      throw new Error('Could not get app settings');
    }

    cleanAppSettings(response);

    return {
      ...getSettingsValues(response.installationSettings.settings, Devvit.installationSettings),
      ...getSettingsValues(response.appSettings.settings, Devvit.appSettings),
    } as T;
  }
}

export function cleanAppSettings(response: SettingsResponse): void {
  if (!response.appSettings) {
    throw new Error('Could not get app settings');
  }

  // FIX: appSettings don't come back typed correctly for bools or numbers.
  // Fix that. This is a workaround. We intend to make appSettings set this
  // way entirely obsolete in the future; this is just a stopgap.
  for (const [key, value] of Object.entries(response.appSettings.settings)) {
    // Find the matching setting definition, because we can't trust the types in the response.
    const settingDefinition = Devvit.appSettings?.find((s) => s.type !== 'group' && s.name === key);
    if (!settingDefinition) {
      continue;
    }

    // If the setting is a boolean or number, we need to convert it from string to the correct type.
    if (
      settingDefinition.type === 'boolean' &&
      value.fieldType === FormFieldType.STRING &&
      value.boolValue == null &&
      value.stringValue != null
    ) {
      value.fieldType = FormFieldType.BOOLEAN;
      value.boolValue = Boolean(value.stringValue);
      delete value.stringValue;
    } else if (
      settingDefinition.type === 'number' &&
      value.fieldType === FormFieldType.STRING &&
      value.numberValue == null &&
      value.stringValue != null
    ) {
      value.fieldType = FormFieldType.NUMBER;
      value.numberValue = Number(value.stringValue);
      delete value.stringValue;
    }
  }
}

export function getSettingsValues(
  results: { [key: string]: FormFieldValue },
  settingsDefinitions: SettingsFormField[] | undefined
): SettingsValues {
  const settingsValues = Object.keys(results).reduce((acc, key) => {
    acc[key] = flattenFormFieldValue(results[key]);
    return acc;
  }, {} as SettingsValues);

  if (settingsDefinitions) {
    setDefaultsIfNecessary(settingsValues, settingsDefinitions);
  }

  return settingsValues;
}

export function setDefaultsIfNecessary(
  settingsValues: SettingsValues,
  settingsDefinitions: SettingsFormField[]
): void {
  for (const definition of settingsDefinitions) {
    if (definition.type === 'group') {
      // Groups get their defaults set recursively
      setDefaultsIfNecessary(settingsValues, definition.fields);
    } else {
      // Only set the default if the value is not already set - note that this checks if the key is
      // missing from the object, not if the value is falsy. So if the user somehow manually sets a
      // setting to `undefined`, we won't use the default value here. Same goes for 'defaultValue' -
      // if the user didn't set a default value, we won't set it to anything.
      if (!(definition.name in settingsValues) && 'defaultValue' in definition) {
        settingsValues[definition.name] = definition.defaultValue;
      }
    }
  }
}
