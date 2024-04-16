import { describe, expect, test } from 'vitest';
import { getSettingsValues, setDefaultsIfNecessary } from './SettingsClient.js';
import type { SettingsValues } from '../../types/index.js';
import type { FormFieldValue } from '@devvit/protos';
import { FormFieldType } from '@devvit/protos';

describe('SettingsClient', () => {
  describe('setDefaultsIfNecessary', () => {
    test('should use setting defaults', async () => {
      const settings: SettingsValues = {};
      setDefaultsIfNecessary(settings, [
        {
          name: 'color',
          label: 'Color',
          type: 'string',
          defaultValue: 'blue',
        },
      ]);
      expect('color' in settings).toBe(true);
      expect(settings.color).toBe('blue');
    });
  });

  test('should be fine with undefined defaults', async () => {
    const settings: SettingsValues = {};
    setDefaultsIfNecessary(settings, [
      {
        name: 'color',
        label: 'Color',
        type: 'string',
        defaultValue: undefined,
      },
    ]);
    expect('color' in settings).toBe(true);
    expect(settings.color).toBeUndefined();
  });

  test('does not overwrite settings that were intentionally set to undefined', async () => {
    const settings: SettingsValues = { color: undefined };
    setDefaultsIfNecessary(settings, [
      {
        name: 'color',
        label: 'Color',
        type: 'string',
        defaultValue: 'blue',
      },
    ]);
    expect('color' in settings).toBe(true);
    expect(settings.color).toBeUndefined();
  });

  test('should not set the default if defaultValue is not set', async () => {
    const settings: SettingsValues = {};
    setDefaultsIfNecessary(settings, [
      {
        name: 'color',
        label: 'Color',
        type: 'string',
      },
    ]);
    expect('color' in settings).toBe(false);
  });

  describe('getSettingsValues', () => {
    test('should return app settings values', async () => {
      const settings: { [key: string]: FormFieldValue } = {
        field1: {
          fieldType: FormFieldType.STRING,
          stringValue: 'value1',
        } as FormFieldValue,
      };
      const settingsValues = getSettingsValues(settings, [
        {
          name: 'field1',
          label: 'Field 1',
          defaultValue: 'default1',
          type: 'string',
        },
        {
          name: 'field2',
          label: 'Field 2',
          defaultValue: 'default2',
          type: 'string',
        },
      ]);
      expect(settingsValues).toEqual({
        field1: 'value1',
        field2: 'default2',
      });
    });
  });
});
