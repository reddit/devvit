import type { FormFieldType, FormFieldValue } from '@devvit/protos';

import type { FormValues } from './form-types.js';

function flattenFormFieldValue(
  value: FormFieldValue
): undefined | string | string[] | number | boolean {
  switch (value.fieldType) {
    case 0 satisfies FormFieldType.STRING:
      return value.stringValue;
    case 7 satisfies FormFieldType.IMAGE:
      // the string value is the URL
      return value.stringValue;
    case 1 satisfies FormFieldType.PARAGRAPH:
      return value.stringValue;
    case 2 satisfies FormFieldType.NUMBER:
      return value.numberValue;
    case 3 satisfies FormFieldType.BOOLEAN:
      return value.boolValue;
    case 5 satisfies FormFieldType.SELECTION:
      return value.selectionValue?.values ?? [];
    default:
      return undefined;
  }
}

// This is a carbon copy of the transformFormFields function in the public-api package
// We copy it here so that @devvit/client does not need to depend on public-api
// Any changes to this function should be reflected in the public-api version
export function getFormValues(results: { [key: string]: FormFieldValue }): FormValues {
  return Object.keys(results).reduce((acc, key) => {
    const val = flattenFormFieldValue(results[key]);
    if (val !== undefined) acc[key] = val;
    return acc;
  }, {} as FormValues);
}
