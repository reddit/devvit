import { FormFieldType } from '@devvit/protos/json/devvit/ui/form_builder/v1alpha/type.js';
import type { FormFieldValue } from '@devvit/protos/json/devvit/ui/form_builder/v1alpha/value.js';
import { type FormValues, type JsonObject } from '@devvit/shared';

function flattenFormFieldValue(
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

// This is a carbon copy of the transformFormFields function in the public-api package
// We copy it here so that @devvit/client does not need to depend on public-api
// Any changes to this function should be reflected in the public-api version
export function getFormValues<T extends JsonObject>(results: {
  [key: string]: FormFieldValue;
}): FormValues<T> {
  return Object.keys(results).reduce((acc, key) => {
    const val = flattenFormFieldValue(results[key]);
    if (val !== undefined) (acc as JsonObject)[key] = val;
    return acc;
  }, {} as FormValues<T>);
}
