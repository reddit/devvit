import type { FormFieldType, FormFieldValue } from '@devvit/protos';
import { describe, expect, it } from 'vitest';

import type { FormValues } from './form-types.js';
import { getFormValues } from './get-form-values.js';

describe('getFormValues', () => {
  it('should transform results into FormValues', () => {
    const results: { [key: string]: FormFieldValue } = {
      field1: { fieldType: 0 satisfies FormFieldType.STRING, stringValue: 'value1' },
      field2: { fieldType: 2 satisfies FormFieldType.NUMBER, numberValue: 123 },
      field3: { fieldType: 3 satisfies FormFieldType.BOOLEAN, boolValue: false },
      field4: {
        fieldType: 5 satisfies FormFieldType.SELECTION,
        selectionValue: { values: ['c', 'd'] },
      },
      field5: { fieldType: 7 satisfies FormFieldType.IMAGE, stringValue: 'img_url' },
      field6: { fieldType: 1 satisfies FormFieldType.PARAGRAPH, stringValue: 'para text' },
    };

    const expected: FormValues = {
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
      field1: { fieldType: 0 satisfies FormFieldType.STRING, stringValue: 'value1' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      field_unknown: { fieldType: 99 as any },
    };

    const expected: FormValues = {
      field1: 'value1',
    };

    expect(getFormValues(results)).toEqual(expected);
  });

  it('should handle empty results object', () => {
    const results: { [key: string]: FormFieldValue } = {};
    const expected: FormValues = {};
    expect(getFormValues(results)).toEqual(expected);
  });
});
