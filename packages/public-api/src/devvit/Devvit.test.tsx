/** @jsx Devvit.createElement */
/** @jsxFrag Devvit.Fragment */

import type { JSONObject, JSONValue } from '@devvit/shared-types/json.js';

import { Devvit } from './Devvit.js';

const Box: Devvit.BlockComponent = ({ children }) => {
  return (
    <hstack>
      <button onPress={() => console.log('hi')}>hi</button>
      {children ?? null}
    </hstack>
  );
};
const Boxed: Devvit.BlockComponent = () => {
  return (
    <Box>
      <vstack>
        <text>hi world!</text>
      </vstack>
    </Box>
  );
};

describe('configure', () => {
  test('should throw error if no config is provided', () => {
    expect(() => Devvit.realtimePlugin).toThrowError(/realtime is not enabled/i);
  });

  test('should configure plugins', () => {
    Devvit.configure({
      realtime: true,
    });

    expect(() => Devvit.realtimePlugin).toBeDefined();
  });
});

describe('components type system', () => {
  test('should not bork out', async () => {
    <Boxed />;
  });
});

describe('createForm() typing is intuitive', () => {
  const D = { createForm(): void {} } as unknown as typeof Devvit;

  test('no fields', () =>
    D.createForm({ fields: [] }, (data) => {
      data satisfies JSONObject;
    }));

  test('one field', () =>
    D.createForm(
      {
        fields: [{ label: 'bool label', type: 'boolean', name: 'boolVal' }],
      },
      (data) => {
        data.values.boolVal satisfies boolean;
      }
    ));

  test('default fields', () =>
    D.createForm(
      {
        fields: [
          { label: 'bool label', type: 'boolean', name: 'boolVal', defaultValue: true },
          { label: 'number label', type: 'number', name: 'numVal', defaultValue: 1 },
          {
            label: 'paragraph label',
            type: 'paragraph',
            name: 'paragraphVal',
            defaultValue: 'abc',
          },
          {
            label: 'select label',
            type: 'select',
            name: 'selectVal',
            options: [{ label: 'option a', value: 'optionA' }],
            defaultValue: ['optionA'], // to-do: type this.
          },
          { label: 'string label', type: 'string', name: 'strVal', defaultValue: 'abc' },
        ],
      },
      (data) => {
        data.values.boolVal satisfies boolean;
        data.values.numVal satisfies number;
        data.values.paragraphVal satisfies string;
        data.values.selectVal satisfies string[];
        data.values.strVal satisfies string;
      }
    ));

  test('required fields', () =>
    D.createForm(
      {
        fields: [
          { label: 'image label', type: 'image', name: 'imageVal', required: true },
          { label: 'number label', type: 'number', name: 'numVal', required: true },
          { label: 'paragraph label', type: 'paragraph', name: 'paragraphVal', required: true },
          {
            label: 'select label',
            type: 'select',
            name: 'selectVal',
            options: [{ label: 'option a', value: 'optionA' }],
            required: true,
          },
          { label: 'string label', type: 'string', name: 'strVal', required: true },
        ],
      },
      (data) => {
        data.values.imageVal satisfies string;
        data.values.numVal satisfies number;
        data.values.paragraphVal satisfies string;
        data.values.selectVal satisfies string[];
        data.values.strVal satisfies string;
      }
    ));

  test('all fields', () =>
    D.createForm(
      {
        fields: [
          { label: 'bool label', type: 'boolean', name: 'boolVal' },
          { label: 'image label', type: 'image', name: 'imageVal' },
          {
            label: 'group label',
            type: 'group',
            fields: [{ label: 'sub-bool label', type: 'boolean', name: 'subBoolVal' }],
          },
          { label: 'number label', type: 'number', name: 'numVal' },
          { label: 'paragraph label', type: 'paragraph', name: 'paragraphVal' },
          {
            label: 'select label',
            type: 'select',
            name: 'selectVal',
            options: [{ label: 'option a', value: 'optionA' }],
          },
          { label: 'string label', type: 'string', name: 'strVal' },
        ],
      },
      (data) => {
        data.values.boolVal satisfies boolean;
        data.values.subBoolVal satisfies boolean;
        data.values.imageVal satisfies string | undefined;
        data.values.numVal satisfies number | undefined;
        data.values.paragraphVal satisfies string | undefined;
        data.values.selectVal satisfies string[];
        data.values.strVal satisfies string | undefined;
      }
    ));

  test('parameterless function', () =>
    D.createForm(
      () =>
        ({
          fields: [{ label: 'string label', type: 'string', name: 'strVal' }],
        }) as const,
      (data) => {
        data.values.strVal satisfies string | undefined;
      }
    ));

  test('parameter function', () =>
    D.createForm(
      (data) =>
        ({
          fields: [
            { label: `${data.boolVal satisfies JSONValue}`, type: 'string', name: 'strVal' },
          ],
        }) as const,
      (data) => {
        data.values.strVal satisfies string | undefined;
      }
    ));

  test('parameter function local', () => {
    const local = (data: JSONObject) =>
      ({
        fields: [{ label: `${data.boolVal satisfies JSONValue}`, type: 'string', name: 'strVal' }],
      }) as const;
    D.createForm(local, (data) => {
      data.values.strVal satisfies string | undefined;
    });
  });
});
