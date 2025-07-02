import { describe, expect, it } from 'vitest';

import { assertValidFormFields } from './assert-valid-form-fields.js';
import type { FormField, SettingScope } from './form-types.js';

describe('assertValidFormFields', () => {
  it('should not throw for valid fields', () => {
    const fields: FormField[] = [
      { type: 'string', name: 'field1', label: 'Field 1' },
      { type: 'number', name: 'field2', label: 'Field 2' },
      {
        type: 'group',
        label: 'Group 1',
        fields: [{ type: 'boolean', name: 'field3', label: 'Field 3' }],
      },
      {
        type: 'string',
        name: 'appSecret',
        label: 'App Secret',
        isSecret: true,
        scope: 'app' as SettingScope.App,
      },
    ];
    expect(() => assertValidFormFields(fields)).not.toThrow();
  });

  it('should throw for duplicate field names', () => {
    const fields: FormField[] = [
      { type: 'string', name: 'field1', label: 'Field 1' },
      { type: 'number', name: 'field1', label: 'Field 2' },
    ];
    expect(() => assertValidFormFields(fields)).toThrow('Duplicate field name: field1');
  });

  it('should throw for duplicate field names in nested groups', () => {
    const fields: FormField[] = [
      { type: 'string', name: 'field1', label: 'Field 1' },
      {
        type: 'group',
        label: 'Group 1',
        fields: [{ type: 'boolean', name: 'field1', label: 'Field 3' }],
      },
    ];
    expect(() => assertValidFormFields(fields)).toThrow('Duplicate field name: field1');
  });

  it('should throw for non-app-scoped secrets', () => {
    const fields: FormField[] = [
      {
        type: 'string',
        name: 'installSecret',
        label: 'Install Secret',
        isSecret: true,
        scope: 'installation' as SettingScope.Installation, // Invalid scope for secret
      },
    ];
    expect(() => assertValidFormFields(fields)).toThrow(
      'Invalid setting: only app settings can be secrets. Add "scope: SettingScope.App" to field "installSecret"'
    );
  });

  it('should not throw for valid app-scoped secrets', () => {
    const fields: FormField[] = [
      {
        type: 'string',
        name: 'appSecret',
        label: 'App Secret',
        isSecret: true,
        scope: 'app' as SettingScope.App,
      },
    ];
    expect(() => assertValidFormFields(fields)).not.toThrow();
  });

  it('should handle empty fields array', () => {
    const fields: FormField[] = [];
    expect(() => assertValidFormFields(fields)).not.toThrow();
  });

  it('should handle deeply nested groups', () => {
    const fields: FormField[] = [
      {
        type: 'group',
        label: 'Group 1',
        fields: [
          { type: 'string', name: 'field1', label: 'Field 1' },
          {
            type: 'group',
            label: 'Group 2',
            fields: [{ type: 'number', name: 'field2', label: 'Field 2' }],
          },
        ],
      },
    ];
    expect(() => assertValidFormFields(fields)).not.toThrow();
  });
});
