import type { FormField, SettingScope } from './form-types.js';

/**
 * Make sure that the form fields have unique names.
 *
 * This is a carbon copy of the assertValidFormFields function in the public-api package
 * We copy it here so that @devvit/client does not need to depend on public-api
 * Any changes to this function should be reflected in the public-api version
 */
export function assertValidFormFields(
  fields: readonly FormField[],
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

export function assertAppSecretsOnly(fields: readonly FormField[]): void {
  for (const field of fields) {
    if (field.type === 'string' && field.isSecret && field.scope !== ('app' as SettingScope.App)) {
      throw `Invalid setting: only app settings can be secrets. Add "scope: SettingScope.App" to field "${field.name}"`;
    }
  }
}
