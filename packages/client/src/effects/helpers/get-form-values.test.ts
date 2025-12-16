import { FormFieldType } from '@devvit/protos/json/devvit/ui/form_builder/v1alpha/type.js';
import type { FormFieldValue } from '@devvit/protos/json/devvit/ui/form_builder/v1alpha/value.js';
import { type FormValues, type JsonObject } from '@devvit/shared';
import { describe, expect, it } from 'vitest';

import { getFormValues } from './get-form-values.js';

describe('getFormValues', () => {
  it('should transform results into FormValues', () => {
    const results: { [key: string]: FormFieldValue } = {
      field1: { fieldType: FormFieldType.STRING, stringValue: 'value1' },
      field2: { fieldType: FormFieldType.NUMBER, numberValue: 123 },
      field3: { fieldType: FormFieldType.BOOLEAN, boolValue: false },
      field4: {
        fieldType: FormFieldType.SELECTION,
        selectionValue: { values: ['c', 'd'] },
      },
      field5: { fieldType: FormFieldType.IMAGE, stringValue: 'img_url' },
      field6: { fieldType: FormFieldType.PARAGRAPH, stringValue: 'para text' },
    };

    const expected: FormValues<JsonObject> = {
      field1: 'value1',
      field2: 123,
      field3: false,
      field4: ['c', 'd'],
      field5: 'img_url',
      field6: 'para text',
    };

    expect(getFormValues(results)).toEqual(expected);
  });

  it('should filter out fields with undefined flattened values', () => {
    const results: { [key: string]: FormFieldValue } = {
      field1: { fieldType: FormFieldType.STRING, stringValue: 'value1' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field_unknown: { fieldType: 99 as any },
    };

    const expected: FormValues<JsonObject> = {
      field1: 'value1',
    };

    expect(getFormValues(results)).toEqual(expected);
  });

  it('should handle empty results object', () => {
    const results: { [key: string]: FormFieldValue } = {};
    const expected: FormValues<JsonObject> = {};
    expect(getFormValues(results)).toEqual(expected);
  });
});
