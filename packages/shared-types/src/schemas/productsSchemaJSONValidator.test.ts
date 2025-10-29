import { describe, it } from 'vitest';

import { validateProductsJSON } from './productsSchemaJSONValidator.js';

describe('validateProductsJson', () => {
  it.each([
    {
      name: 'invalid json',
      product: { what: 'is this' },
      expectedError: 'requires property',
    },
    {
      name: 'missing required field',
      product: {
        sku: 'sku',
        displayName: 'displayName',
        images: { icon: 'icon' },
      },
      expectedError: 'requires property "price"',
    },
    {
      name: 'invalid price amount',
      product: {
        sku: 'sku',
        displayName: 'product',
        price: 42,
        images: { icon: 'icon' },
      },
      expectedError: 'price is not one of enum values',
    },
    {
      name: 'invalid sku with whitespace',
      product: {
        sku: 'sku   number one',
        displayName: 'product',
        price: 5,
        images: { icon: 'icon' },
      },
      expectedError: 'sku does not match pattern',
    },
    {
      name: 'invalid display name too long',
      product: {
        sku: 'sku',
        displayName: 'a'.repeat(51),
        price: 5,
        images: { icon: 'icon' },
      },
      expectedError: 'displayName does not meet maximum length of 50',
    },
    {
      name: 'invalid description too long',
      product: {
        sku: 'sku',
        displayName: 'displayName',
        description: 'a'.repeat(251),
        price: 1000,
        images: { icon: 'icon' },
      },
      expectedError: 'description does not meet maximum length of 250',
    },
    {
      name: 'invalid data type',
      product: {
        sku: 'sku',
        displayName: 12,
        price: 1000,
        images: { icon: 'icon' },
      },
      expectedError: 'displayName is not of a type(s) string',
    },
    {
      name: 'invalid metadata data type',
      product: {
        sku: 'sku',
        displayName: 'displayName',
        price: 1000,
        images: { icon: 'icon' },
        metadata: { mydata: 12 },
      },
      expectedError: 'metadata.mydata is not of a type(s) string',
    },
    {
      name: 'too many metadata keys',
      product: {
        sku: 'sku',
        displayName: 'displayName',
        price: 1000,
        metadata: Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`key${i}`, 'value'])),
      },
      expectedError: 'metadata does not meet maximum property length of 10',
    },
    {
      name: 'invalid images object',
      product: {
        sku: 'sku',
        displayName: 'displayName',
        price: 5,
        images: {},
      },
      expectedError: 'images requires property "icon"',
    },
    {
      name: 'invalid product, no accountingType',
      product: {
        sku: 'sku',
        displayName: '🗡️ sword',
        price: 5,
        images: { icon: 'icon' },
      },
      expectedError: 'requires property "accountingType"',
    },
    {
      name: 'valid product',
      product: {
        sku: 'sku',
        displayName: '🗡️ sword',
        price: 5,
        images: { icon: 'icon' },
        metadata: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`key${i}`, 'value'])),
        accountingType: 'INSTANT',
      },
    },
  ])('$name', ({ product, expectedError }) => {
    if (!expectedError) {
      expect(validateProductsJSON({ products: [product] })).toEqual([product]);
    } else {
      let err: Error;
      try {
        validateProductsJSON({ products: [product] });
      } catch (e) {
        err = e as Error;
      }

      expect(err!.cause).toContainEqual(
        expect.objectContaining({ stack: expect.stringContaining(expectedError) })
      );
    }
  });
});
