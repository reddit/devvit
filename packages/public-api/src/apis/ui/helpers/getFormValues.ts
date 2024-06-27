import type { FormFieldValue } from '@devvit/protos';
import { FormFieldType } from '@devvit/protos';
import type { FormValues } from '../../../types/form.js';

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

export function getFormValues(results: { [key: string]: FormFieldValue }): FormValues {
  return Object.keys(results).reduce((acc, key) => {
    const val = flattenFormFieldValue(results[key]);
    if (val !== undefined) acc[key] = val;
    return acc;
  }, {} as FormValues);
}
