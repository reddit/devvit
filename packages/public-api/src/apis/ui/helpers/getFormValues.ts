import type { FormFieldValue } from '@devvit/protos';
import { FormFieldType } from '@devvit/protos';
import type { FormValues } from '../../../types/form.js';
import type { Data } from '../../../types/index.js';

export function flattenFormFieldValue(
  value: FormFieldValue
): undefined | string | string[] | number | boolean {
  switch (value.fieldType) {
    case FormFieldType.STRING:
      return value.stringValue;
    case FormFieldType.IMAGE:
      // the string value is the URL
      return value.stringValue;
    case FormFieldType.PARAGRAPH:
      return value.stringValue;
    case FormFieldType.NUMBER:
      return value.numberValue;
    case FormFieldType.BOOLEAN:
      return value.boolValue;
    case FormFieldType.SELECTION:
      return value.selectionValue?.values ?? [];
    default:
      return undefined;
  }
}

export function getFormValues(results: { [key: string]: FormFieldValue }): Data {
  return Object.keys(results).reduce((acc, key) => {
    acc[key] = flattenFormFieldValue(results[key]);
    return acc;
  }, {} as FormValues);
}
