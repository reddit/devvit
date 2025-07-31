import type { ContextAPIClients } from './context.js';
import type { JSONObject, JSONValue } from './json.js';

describe('useForm() typing is intuitive', () => {
  const ctx = { useForm() {} } as unknown as ContextAPIClients;

  test('no fields', () =>
    ctx.useForm({ fields: [] }, (data) => {
      data satisfies JSONObject;
    }));

  test('one field', () =>
    ctx.useForm(
      {
        fields: [{ label: 'bool label', type: 'boolean', name: 'boolVal' }],
      },
      (data) => {
        data.boolVal satisfies boolean;
      }
    ));

  test('default fields', () =>
    ctx.useForm(
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
        data.boolVal satisfies boolean;
        data.numVal satisfies number;
        data.paragraphVal satisfies string;
        data.selectVal satisfies string[];
        data.strVal satisfies string;
      }
    ));

  test('required fields', () =>
    ctx.useForm(
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
        data.imageVal satisfies string;
        data.numVal satisfies number;
        data.paragraphVal satisfies string;
        data.selectVal satisfies string[];
        data.strVal satisfies string;
      }
    ));

  test('all fields', () =>
    ctx.useForm(
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
        data.boolVal satisfies boolean;
        data.subBoolVal satisfies boolean;
        data.imageVal satisfies string | undefined;
        data.numVal satisfies number | undefined;
        data.paragraphVal satisfies string | undefined;
        data.selectVal satisfies string[];
        data.strVal satisfies string | undefined;
      }
    ));

  test('parameterless function', () =>
    ctx.useForm(
      () =>
        ({
          fields: [{ label: 'string label', type: 'string', name: 'strVal' }],
        }) as const,
      (data) => {
        data.strVal satisfies string | undefined;
      }
    ));

  test('parameter function', () =>
    ctx.useForm(
      (data) =>
        ({
          fields: [
            { label: `${data.boolVal satisfies JSONValue}`, type: 'string', name: 'strVal' },
          ],
        }) as const,
      (data) => {
        data.strVal satisfies string | undefined;
      }
    ));

  test('parameter function local', () => {
    const local = (data: JSONObject) =>
      ({
        fields: [{ label: `${data.boolVal satisfies JSONValue}`, type: 'string', name: 'strVal' }],
      }) as const;
    ctx.useForm(local, (data) => {
      data.strVal satisfies string | undefined;
    });
  });
});
