import path from 'node:path';
import { readFile, access } from 'node:fs/promises';
import { ACTOR_SRC_DIR } from '@devvit/shared-types/constants.js';
import { ASSET_DIRNAME } from '@devvit/shared-types/Assets.js';
import { type Product } from '@devvit/shared-types/payments/Product.js';
import { validateProductsJson } from '@devvit/payments/lib/validator.js';

const PRODUCTS_JSON_FILE = 'products.json';

export async function readProducts(projectRoot: string): Promise<Product[]> {
  const file = path.join(projectRoot, ACTOR_SRC_DIR, PRODUCTS_JSON_FILE);
  const fileJson = await readFile(file, 'utf-8');

  const productsJsons = validateProductsJson(JSON.parse(fileJson));

  // check filesystem if the assets exist
  for (const productJson of productsJsons) {
    if (!productJson.images?.icon) {
      continue;
    }
    const assetFilename = path.join(projectRoot, ASSET_DIRNAME, productJson.images.icon);
    try {
      await access(assetFilename);
    } catch {
      throw new Error(`specified icon asset does not exist: ${assetFilename}`);
    }
  }

  return productsJsons;
}
