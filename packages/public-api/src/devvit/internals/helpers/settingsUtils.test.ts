import type { SettingsFormFieldGroup, ValidatedStringField } from '../../../types/index.js';
import { extractSettingsFields } from './settingsUtils.js';

describe('settings utils', () => {
  const stringField: ValidatedStringField = {
    type: 'string',
    name: 'top_level',
    label: 'top level',
    onValidate: () => {
      return 'invalid';
    },
  };

  describe('with no field groups', () => {
    it('an empty array if emtpy array is passed', () => {
      expect(extractSettingsFields([])).toEqual([]);
    });

    it('returns plain fields as is', () => {
      expect(extractSettingsFields([stringField])).toEqual([stringField]);
    });
  });

  describe('with field groups', () => {
    const nestedStringField: ValidatedStringField = {
      type: 'string',
      name: '1st_group_string',
      label: '1st group string',
      onValidate: () => {
        return 'invalid';
      },
    };
    const groupFieldOneDeep: SettingsFormFieldGroup = {
      type: 'group',
      label: '1st group',
      fields: [nestedStringField],
    };
    const groupFieldTwoDeep: SettingsFormFieldGroup = {
      type: 'group',
      label: '2nd group',
      fields: [groupFieldOneDeep],
    };
    const groupFieldThreeDeep: SettingsFormFieldGroup = {
      type: 'group',
      label: '3rd group',
      fields: [groupFieldOneDeep],
    };

    it('unwraps nestedness one level deep', () => {
      expect(extractSettingsFields([groupFieldOneDeep])).toEqual([nestedStringField]);
    });

    it('unwraps nestedness two levels deep', () => {
      expect(extractSettingsFields([groupFieldTwoDeep])).toEqual([nestedStringField]);
    });

    it('unwraps nestedness three levels deep', () => {
      expect(extractSettingsFields([groupFieldThreeDeep])).toEqual([nestedStringField]);
    });

    it('unwraps mixed fields and groups', () => {
      expect(
        extractSettingsFields([stringField, groupFieldThreeDeep, stringField, groupFieldTwoDeep])
      ).toEqual([stringField, nestedStringField, stringField, nestedStringField]);
    });
  });
});
