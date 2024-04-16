import type { FormFieldValue, Metadata } from '@devvit/protos';
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

    return {
      ...getSettingsValues(response.installationSettings.settings, Devvit.installationSettings),
      ...getSettingsValues(response.appSettings.settings, Devvit.appSettings),
    } as T;
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
