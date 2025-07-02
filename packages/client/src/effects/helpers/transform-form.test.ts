import type { FormField as FormFieldProto, FormFieldType } from '@devvit/protos';
import { describe, expect, it } from 'vitest';

import type {
  BooleanField,
  FormField,
  FormFieldGroup,
  ImageField,
  NumberField,
  ParagraphField,
  SelectField,
  StringField,
} from './form-types.js';
import { transformFormFields } from './transform-form.js';

describe('transformFormFields', () => {
  it('should transform string field', () => {
    const field: StringField = {
      type: 'string',
      name: 'testString',
      label: 'Test String',
      defaultValue: 'default',
      placeholder: 'Enter text',
      helpText: 'Some help',
      required: true,
      disabled: false,
      isSecret: true,
    };
    const expected: FormFieldProto = {
      defaultValue: {
        fieldType: 0 satisfies FormFieldType.STRING,
        stringValue: 'default',
      },
      disabled: false,
      fieldConfig: {
        stringConfig: {
          placeholder: 'Enter text',
        },
      },
      fieldId: 'testString',
      fieldType: 0 satisfies FormFieldType.STRING,
      helpText: 'Some help',
      label: 'Test String',
      required: true,
      isSecret: true,
    };
    expect(transformFormFields([field])).toEqual([expected]);
  });

  it('should transform image field', () => {
    const field: ImageField = {
      type: 'image',
      name: 'testImage',
      label: 'Test Image',
      helpText: 'Upload an image',
      required: false,
      disabled: true,
    };
    const expected: FormFieldProto = {
      disabled: true,
      fieldId: 'testImage',
      fieldType: 7 satisfies FormFieldType.IMAGE,
      helpText: 'Upload an image',
      label: 'Test Image',
      required: false,
      // defaultValue, fieldConfig, isSecret are not applicable/defined for ImageField
    };
    expect(transformFormFields([field])).toEqual([expected]);
  });

  it('should transform paragraph field', () => {
    const field: ParagraphField = {
      type: 'paragraph',
      name: 'testParagraph',
      label: 'Test Paragraph',
      defaultValue: 'Default text',
      placeholder: 'Enter paragraph',
      helpText: 'Some help',
      required: true,
      disabled: false,
      lineHeight: 1.5,
    };
    const expected: FormFieldProto = {
      defaultValue: {
        fieldType: 1 satisfies FormFieldType.PARAGRAPH,
        stringValue: 'Default text',
      },
      disabled: false,
      fieldConfig: {
        paragraphConfig: {
          lineHeight: 1.5,
          placeholder: 'Enter paragraph',
        },
      },
      fieldId: 'testParagraph',
      fieldType: 1 satisfies FormFieldType.PARAGRAPH,
      helpText: 'Some help',
      label: 'Test Paragraph',
      required: true,
      // isSecret is not applicable/defined for ParagraphField
    };
    expect(transformFormFields([field])).toEqual([expected]);
  });

  it('should transform number field', () => {
    const field: NumberField = {
      type: 'number',
      name: 'testNumber',
      label: 'Test Number',
      defaultValue: 10,
      helpText: 'Enter a number',
      required: false,
      disabled: true,
    };
    const expected: FormFieldProto = {
      defaultValue: {
        fieldType: 2 satisfies FormFieldType.NUMBER,
        numberValue: 10,
      },
      disabled: true,
      fieldConfig: {
        numberConfig: {},
      },
      fieldId: 'testNumber',
      fieldType: 2 satisfies FormFieldType.NUMBER,
      helpText: 'Enter a number',
      label: 'Test Number',
      required: false,
      // isSecret is not applicable/defined for NumberField
    };
    expect(transformFormFields([field])).toEqual([expected]);
  });

  it('should transform select field', () => {
    const field: SelectField = {
      type: 'select',
      name: 'testSelect',
      label: 'Test Select',
      options: [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
      ],
      defaultValue: ['1'],
      multiSelect: true,
      helpText: 'Select options',
      required: true,
      disabled: false,
    };
    const expected: FormFieldProto = {
      defaultValue: {
        fieldType: 5 satisfies FormFieldType.SELECTION,
        selectionValue: {
          values: ['1'],
        },
      },
      disabled: false,
      fieldConfig: {
        selectionConfig: {
          choices: [
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' },
          ],
          multiSelect: true,
        },
      },
      fieldId: 'testSelect',
      fieldType: 5 satisfies FormFieldType.SELECTION,
      helpText: 'Select options',
      label: 'Test Select',
      required: true,
      // isSecret is not applicable/defined for SelectField
    };
    expect(transformFormFields([field])).toEqual([expected]);
  });

  it('should transform select field with empty default value', () => {
    const field: SelectField = {
      type: 'select',
      name: 'testSelectEmptyDefault',
      label: 'Test Select',
      options: [{ label: 'Opt', value: 'opt' }],
      multiSelect: false,
      // defaultValue is undefined
    };
    const expected: FormFieldProto = {
      defaultValue: {
        fieldType: 5 satisfies FormFieldType.SELECTION,
        selectionValue: {
          values: [], // Expect empty array for undefined default
        },
      },
      disabled: undefined, // Optional properties default to undefined proto fields
      fieldConfig: {
        selectionConfig: {
          choices: [{ label: 'Opt', value: 'opt' }],
          multiSelect: false,
        },
      },
      fieldId: 'testSelectEmptyDefault',
      fieldType: 5 satisfies FormFieldType.SELECTION,
      helpText: undefined,
      label: 'Test Select',
      required: undefined,
    };
    expect(transformFormFields([field])).toEqual([expected]);
  });

  it('should transform boolean field', () => {
    const field: BooleanField = {
      type: 'boolean',
      name: 'testBoolean',
      label: 'Test Boolean',
      defaultValue: true,
      helpText: 'Toggle option',
      disabled: false,
    };
    const expected: FormFieldProto = {
      defaultValue: {
        fieldType: 3 satisfies FormFieldType.BOOLEAN,
        boolValue: true,
      },
      disabled: false,
      fieldId: 'testBoolean',
      fieldType: 3 satisfies FormFieldType.BOOLEAN,
      helpText: 'Toggle option',
      label: 'Test Boolean',
      // required, fieldConfig, isSecret are not applicable/defined for BooleanField
    };
    expect(transformFormFields([field])).toEqual([expected]);
  });

  it('should transform group field', () => {
    const groupField: FormFieldGroup = {
      type: 'group',
      label: 'Test Group',
      helpText: 'Group help',
      fields: [
        { type: 'string', name: 'groupedString', label: 'Grouped String' },
        { type: 'number', name: 'groupedNumber', label: 'Grouped Number' },
      ],
    };
    const expectedGroupedString: FormFieldProto = {
      fieldId: 'groupedString',
      fieldType: 0 satisfies FormFieldType.STRING,
      label: 'Grouped String',
      // Defaults for optional fields
      defaultValue: { fieldType: 0 satisfies FormFieldType.STRING, stringValue: undefined },
      disabled: undefined,
      fieldConfig: { stringConfig: { placeholder: undefined } },
      helpText: undefined,
      required: undefined,
      isSecret: undefined,
    };
    const expectedGroupedNumber: FormFieldProto = {
      fieldId: 'groupedNumber',
      fieldType: 2 satisfies FormFieldType.NUMBER,
      label: 'Grouped Number',
      // Defaults for optional fields
      defaultValue: { fieldType: 2 satisfies FormFieldType.NUMBER, numberValue: undefined },
      disabled: undefined,
      fieldConfig: { numberConfig: {} },
      helpText: undefined,
      required: undefined,
    };
    const expected: FormFieldProto = {
      fieldId: '', // Group fieldId is empty
      fieldType: 6 satisfies FormFieldType.GROUP,
      fieldConfig: {
        groupConfig: {
          fields: [expectedGroupedString, expectedGroupedNumber],
        },
      },
      label: 'Test Group',
      helpText: 'Group help',
      // defaultValue, disabled, required, isSecret are not applicable/defined for GroupField
    };
    expect(transformFormFields([groupField])).toEqual([expected]);
  });

  it('should handle empty fields array', () => {
    const fields: FormField[] = [];
    expect(transformFormFields(fields)).toEqual([]);
  });

  it('should handle nested groups', () => {
    const fields: FormField[] = [
      {
        type: 'group',
        label: 'Outer Group',
        fields: [
          { type: 'string', name: 'outerString', label: 'Outer String' },
          {
            type: 'group',
            label: 'Inner Group',
            fields: [{ type: 'boolean', name: 'innerBool', label: 'Inner Bool' }],
          },
        ],
      },
    ];
    const transformed = transformFormFields(fields);
    expect(transformed).toHaveLength(1);
    expect(transformed[0].fieldType).toBe(6 satisfies FormFieldType.GROUP);
    expect(transformed[0].label).toBe('Outer Group');
    expect(transformed[0].fieldConfig?.groupConfig?.fields).toHaveLength(2);

    const innerFields = transformed[0].fieldConfig?.groupConfig?.fields ?? [];
    expect(innerFields[0].fieldType).toBe(0 satisfies FormFieldType.STRING);
    expect(innerFields[0].fieldId).toBe('outerString');

    expect(innerFields[1].fieldType).toBe(6 satisfies FormFieldType.GROUP);
    expect(innerFields[1].label).toBe('Inner Group');
    expect(innerFields[1].fieldConfig?.groupConfig?.fields).toHaveLength(1);

    const deepestFields = innerFields[1].fieldConfig?.groupConfig?.fields ?? [];
    expect(deepestFields[0].fieldType).toBe(3 satisfies FormFieldType.BOOLEAN);
    expect(deepestFields[0].fieldId).toBe('innerBool');
  });

  it('should throw error for unknown field type', () => {
    const fields = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { type: 'unknown' as any, name: 'test', label: 'Test' },
    ];
    expect(() => transformFormFields(fields)).toThrow('Unknown field type.');
  });
});
