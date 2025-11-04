import type { FormKey } from '@devvit/public-api';
import type { JsonObject } from '@devvit/shared';

import {
  abbreviate,
  assertSettingsValidationResponse,
  assertUiResponse,
  fetchWebbit,
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
      name: 'valid showToast as object with text',
      input: {
        showToast: {
          text: 'This is a valid toast message',
          appearance: 'neutral',
        },
      },
      expectThrows: false,
    },
    {
      name: 'valid showToast as object with text and appearance',
      input: {
        showToast: {
          text: 'This is a valid toast message',
          appearance: 'success',
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

describe('abbreviate()', () => {
  const testCases = [
    {
      name: 'returns the original string when length is 256 or less',
      input: 'a'.repeat(256),
      expected: 'a'.repeat(256),
    },
    {
      name: 'truncates and appends ellipsis when string is longer than 256 characters',
      input: 'a'.repeat(300),
      expected: 'a'.repeat(256) + '…',
      expectedLength: 257,
    },
    {
      name: 'handles empty string',
      input: '',
      expected: '',
    },
    {
      name: 'handles single character',
      input: 'x',
      expected: 'x',
    },
  ];

  for (const testCase of testCases) {
    test(testCase.name, () => {
      const actual = abbreviate(testCase.input);
      expect(actual).toBe(testCase.expected);
      if (testCase.expectedLength != null) expect(actual.length).toBe(testCase.expectedLength);
    });
  }
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

describe('fetchWebbit()', () => {
  const oldFetch: typeof globalThis.fetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = oldFetch;
  });

  const baseRsp = {
    headers: {
      get: () => null,
    } as unknown as Headers,
    ok: true,
    status: 200,
    statusText: 'OK',
  } as Readonly<Response>;

  test('handles successful response with no content', async () => {
    const mockRsp = {
      ...baseRsp,
      headers: {
        get: (name: string): string | null => {
          if (name === 'Content-Length') return '0';
          if (name === 'Content-Type') return 'application/json';
          return null;
        },
      } as Headers,
      text: () => Promise.resolve(''),
    };
    globalThis.fetch = async () => mockRsp;
    expect(await fetchWebbit('/test-endpoint', {}, {})).toBe(undefined);
  });

  test('returns parsed JSON when response has content', async () => {
    const data = { success: true, data: 'test' };
    const mockRsp = {
      ...baseRsp,
      headers: {
        get: (name: string) => {
          if (name === 'Content-Length') return 50;
          if (name === 'Content-Type') return 'application/json';
          return null;
        },
      } as Headers,
      text: () => Promise.resolve(JSON.stringify(data)),
    };
    globalThis.fetch = async () => mockRsp;

    const result = await fetchWebbit('/test-endpoint', {}, {});
    expect(result).toStrictEqual(data);
  });

  test('throws error when fetch fails', async () => {
    globalThis.fetch = () => Promise.reject(Error('Network error'));

    await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
      /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with error: Network error/
    );
  });

  test('throws error when response is not ok', async () => {
    const mockRsp = {
      ...baseRsp,
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve('Internal server failure'),
    };
    globalThis.fetch = async () => mockRsp;

    await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
      /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with HTTP status 500: Internal Server Error; body: Internal server failure/
    );
  });

  test('throws error when response is 404', async () => {
    const mockRsp = {
      ...baseRsp,
      ok: false,
      status: 404,
      statusText: 'File Not Found',
      text: () => Promise.resolve('{"status":"error","message":"missing"}'),
    };
    globalThis.fetch = async () => mockRsp;

    await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
      /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with HTTP status 404: ensure the server handles the `\/test-endpoint` endpoint; body: \{"status":"error","message":"missing"\}/
    );
  });

  test('includes response body in error message when response is 400', async () => {
    const mockRsp = {
      ...baseRsp,
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: () => Promise.resolve('{"status":"error","message":"groupId is required"}'),
    };
    globalThis.fetch = async () => mockRsp;

    await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
      /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with HTTP status 400: Bad Request; body: \{"status":"error","message":"groupId is required"\}/
    );
  });

  test('throws error when Content-Type is not application/json', async () => {
    const mockRsp = {
      ...baseRsp,
      headers: {
        get: (name: string) => {
          if (name === 'Content-Length') return '50';
          if (name === 'Content-Type') return 'text/plain';
          return null;
        },
      } as Headers,
      text: () => Promise.resolve('some content'),
    };
    globalThis.fetch = async () => mockRsp;

    await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
      /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with Content-Type header "text\/plain" but only "application\/json" is supported/
    );
  });

  test('throws error when Content-Length but no Content-Type header', async () => {
    const mockRsp = {
      ...baseRsp,
      headers: {
        get: (name: string) => {
          if (name === 'Content-Length') return '50';
          return null;
        },
      } as Headers,
      text: () => Promise.resolve('some content'),
    };
    globalThis.fetch = async () => mockRsp;

    await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
      /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with Content-Type header "null" but only "application\/json" is supported/
    );
  });

  test('throws error when response text cannot be read', async () => {
    const mockRsp = {
      ...baseRsp,
      headers: {
        get: (name: string) => {
          if (name === 'Content-Length') return 50;
          if (name === 'Content-Type') return 'application/json';
          return null;
        },
      } as Headers,
      text: () => Promise.reject(new Error('Read error')),
    };
    globalThis.fetch = async () => mockRsp;

    await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
      /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with HTTP status 200: OK; unreadable response body/
    );
  });

  test('throws error when response is not valid JSON', async () => {
    const mockRsp = {
      ...baseRsp,
      headers: {
        get: (name: string) => {
          if (name === 'Content-Length') return 50;
          if (name === 'Content-Type') return 'application/json';
          return null;
        },
      } as Headers,
      text: () => Promise.resolve('invalid json content'),
    };
    globalThis.fetch = async () => mockRsp;

    await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
      /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with an unparsable JSON body: invalid json content/
    );
  });

  test('throws error when response is not a JSON object', async () => {
    const mockRsp = {
      ...baseRsp,
      headers: {
        get: (name: string) => {
          if (name === 'Content-Length') return 50;
          if (name === 'Content-Type') return 'application/json';
          return null;
        },
      } as Headers,
      text: () => Promise.resolve('"string value"'),
    };
    globalThis.fetch = async () => mockRsp;

    await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
      /Failed to POST to Node.js server endpoint \/test-endpoint; server responded with an unrecognized JSON body instead of an object `{}`: "string value"/
    );
  });

  test('handles successful response with empty content', async () => {
    const mockRsp = {
      ...baseRsp,
      headers: {
        get: (name: string): string | null => {
          if (name === 'Content-Length') return '0';
          if (name === 'Content-Type') return 'application/json';
          return null;
        },
      } as Headers,
      text: () => Promise.resolve(''),
    };
    globalThis.fetch = async () => mockRsp;

    const result = await fetchWebbit('/test-endpoint', {}, {});
    expect(result).toStrictEqual(undefined);
  });

  test('throws on response but no Content-Length', async () => {
    const mockRsp = {
      ...baseRsp,
      headers: {
        get: (name: string): string | null => {
          if (name === 'Content-Length') return '0';
          if (name === 'Content-Type') return 'application/json';
          return null;
        },
      } as Headers,
      text: () => Promise.resolve('{"data":"content"}'),
    };
    globalThis.fetch = async () => mockRsp;
    await expect(fetchWebbit('/test-endpoint', {}, {})).rejects.toThrow(
      /Content-Length header "0" but greater than zero required/
    );
  });
});
