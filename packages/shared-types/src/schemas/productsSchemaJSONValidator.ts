import jsonschema from 'jsonschema/lib/index.js';

import type { Product } from '../payments/Product.js';
import productSchema from './products.json' with { type: 'json' };

/**
 * This function validates the `products.json` file of a devvit project and returns the parsed
 * objects
 */
export function validateProductsJSON(json: unknown): Product[] {
  const validationResult = jsonschema.validate(json, productSchema);
  if (!validationResult.valid) {
    throw new Error('validation error', { cause: validationResult.errors });
  }

  return (validationResult.instance as { products: Product[] }).products ?? [];
}
