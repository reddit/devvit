// eslint-disable-next-line no-restricted-imports
import type { FormKey } from '@devvit/public-api';
import type { JsonObject } from '@devvit/shared';

import {
  assertSettingsValidationResponse,
  assertUiResponse,
  formKeyMap,
} from './blocks.template.js';

const mockFormKeyMap: Record<string, FormKey> = { 'valid-form': 'some-form-key' as FormKey };

beforeEach(() => {
  Object.keys(formKeyMap).forEach((key) => delete formKeyMap[key]);
  Object.entries(mockFormKeyMap).forEach(([key, value]) => {
    formKeyMap[key] = value;
  });
});

type TestCase = {
  name: string;
  input: JsonObject;
  expectThrows: string | RegExp | false;
};

describe('assertUiResponse()', () => {
  const testCases: TestCase[] = [
    // Valid cases
    {
      name: 'valid showToast as string',
      input: {
        showToast: 'This is a valid toast message',
      },
      expectThrows: false,
    },
    {
      name: 'valid showToast as object with text and neutral appearance',
      input: {
        showToast: {
          text: 'This is a valid toast message',
          appearance: 'neutral',
        },
      },
      expectThrows: false,
    },
    {
      name: 'valid showToast as object with text and success appearance',
      input: {
        showToast: {
          text: 'This is a valid toast message',
          appearance: 'success',
        },
      },
      expectThrows: false,
    },
    {
      name: 'valid showToast as object with text, no appearance',
      input: {
        showToast: {
          text: 'This is a valid toast message',
        },
      },
      expectThrows: false,
    },
    {
      name: 'valid navigateTo',
      input: {
        navigateTo: 'https://example.com',
      },
      expectThrows: false,
    },
    {
      name: 'valid showForm',
      input: {
        showForm: {
          name: 'valid-form',
          form: {
            fields: [
              {
                name: 'testField',
                label: 'Test Field',
                type: 'string',
              },
            ],
          },
          data: { someData: 'value' },
        },
      },
      expectThrows: false,
    },
    {
      name: 'multiple valid fields - showToast with navigateTo',
      input: {
        showToast: 'Success',
        navigateTo: 'https://example.com',
      },
      expectThrows: false,
    },
    {
      name: 'multiple valid fields - showToast with showForm',
      input: {
        showToast: 'Success',
        showForm: {
          name: 'valid-form',
          form: {
            fields: [
              {
                name: 'testField',
                label: 'Test Field',
                type: 'string',
              },
            ],
          },
          data: { someData: 'value' },
        },
      },
      expectThrows: false,
    },
    {
      name: 'invalid combination - navigateTo with showForm',
      input: {
        navigateTo: 'https://example.com',
        showForm: {
          name: 'valid-form',
          form: {
            fields: [
              {
                name: 'testField',
                label: 'Test Field',
                type: 'string',
              },
            ],
          },
          data: { someData: 'value' },
        },
      },
      expectThrows: 'navigateTo and showForm cannot be used together in UiResponse',
    },

    // Invalid inputs
    {
      name: 'unknown fields in UiResponse',
      input: {
        showToast: 'Valid toast',
        unknownField: 'This should not be here',
      },
      expectThrows: /unknown key "unknownField"/,
    },
    {
      name: 'missing name in showForm',
      input: {
        showForm: {
          form: {
            fields: [],
          },
          data: { someData: 'value' },
        },
      },
      expectThrows: /showForm must be a ShowForm/,
    },
    {
      name: 'non-existent form name',
      input: {
        showForm: {
          name: 'non-existent-form',
          form: {
            fields: [],
          },
          data: { someData: 'value' },
        },
      },
      expectThrows: /form with name "non-existent-form" not found in devvit.json/,
    },
    {
      name: 'invalid showToast type',
      input: {
        showToast: 123,
      },
      expectThrows: /showToast must be a string or `{"text": string}`/,
    },
    {
      name: 'showToast object with invalid fields',
      input: {
        showToast: {
          text: 'Valid text',
          invalidField: 'This should not be here',
        },
      },
      expectThrows: /showToast must be a string or `{"text": string}`/,
    },
    {
      name: 'showToast object missing text field',
      input: {
        showToast: {
          appearance: 'success',
        },
      },
      expectThrows: /showToast must be a string or `{"text": string}`/,
    },
    {
      name: 'showToast object with non-string text field',
      input: {
        showToast: {
          text: 123, // should be a string
        },
      },
      expectThrows: /showToast must be a string or `{"text": string}`/,
    },
  ] as const;

  testCases.forEach(({ name, input, expectThrows }) => {
    test(name, () => {
      if (expectThrows === false) {
        expect(() => assertUiResponse('endpoint', input)).not.toThrow();
      } else {
        expect(() => assertUiResponse('endpoint', input)).toThrow(expectThrows);
      }
    });
  });
});

describe('assertSettingsValidationResponse()', () => {
  const testCases: Array<{
    name: string;
    input: JsonObject;
    expectThrows: false | RegExp;
  }> = [
    {
      name: 'does not throw for valid SettingsValidationResponse with success true',
      input: { success: true },
      expectThrows: false,
    },
    {
      name: 'does not throw for valid SettingsValidationResponse with success and error',
      input: {
        success: false,
        error: 'Validation failed',
      },
      expectThrows: false,
    },
    {
      name: 'throws when success field is missing',
      input: { error: 'Some error' },
      expectThrows: /SettingsValidationResponse must have a boolean "success" field/,
    },
    {
      name: 'throws when success field is not boolean',
      input: { success: 'true' },
      expectThrows: /SettingsValidationResponse must have a boolean "success" field/,
    },
    {
      name: 'throws when error field is not string',
      input: { success: false, error: 123 },
      expectThrows: /"error" field in SettingsValidationResponse must be a string/,
    },
  ];

  for (const testCase of testCases) {
    test(testCase.name, () => {
      if (testCase.expectThrows === false)
        expect(() => assertSettingsValidationResponse(testCase.input)).not.toThrow();
      else
        expect(() => assertSettingsValidationResponse(testCase.input)).toThrow(
          testCase.expectThrows
        );
    });
  }
});
