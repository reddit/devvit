import type { FormField } from '../../../types/form.js';
import { SettingScope } from '../../../types/form.js';

/**
 * Make sure that the form fields have unique names.
 */
export function assertValidFormFields(
  fields: FormField[],
  seenNames: Set<string> = new Set()
): void {
  for (const field of fields) {
    if (field.type === 'group') {
      assertValidFormFields(field.fields, seenNames);
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fieldName = (field as any).name as string;

    if (seenNames.has(fieldName)) {
      throw new Error(`Duplicate field name: ${fieldName}`);
    }

    seenNames.add(fieldName);
  }
  assertAppSecretsOnly(fields);
}

export function assertAppSecretsOnly(fields: FormField[]): void {
  for (const field of fields) {
    if (field.type === 'string' && field.isSecret && field.scope !== SettingScope.App) {
      throw `Invalid setting: only app settings can be secrets. Add "scope: SettingScope.App" to field "${field.name}"`;
    }
  }
}
