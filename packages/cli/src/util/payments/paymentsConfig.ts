import fs from 'node:fs';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  Currency,
  Environment,
  PaymentProcessorDefinition,
  PaymentsServiceDefinition,
} from '@devvit/protos/payments.js';
import type {
  Bundle,
  PaymentsConfig,
} from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import { ACTOR_SRC_DIR, PRODUCTS_JSON_FILE } from '@devvit/shared-types/constants.js';
import type { Product } from '@devvit/shared-types/payments/Product.js';
import { mapAccountingTypeToProto } from '@devvit/shared-types/payments/Product.js';
import { filterToReservedDevvitMetadataKeys } from '@devvit/shared-types/reservedDevvitMetadataKeys.js';
import { validateProductsJSON } from '@devvit/shared-types/schemas/productsSchemaJSONValidator.js';
import { imageSize } from 'image-size';

// The JSONProduct type is a Product with the metadata field as optional
// We don't require developers to provide metadata in the products.json file
// but we require it to be present in the Product type. This is an itermidiate
// type to handle this discrepancy when generating the PaymentsConfig.
export type JSONProduct = Omit<Product, 'metadata'> & Partial<Pick<Product, 'metadata'>>;

/**
 * Reads Products from src/products.json
 * @throws if products.json is malformed
 */
export async function readProducts(projectRoot: string): Promise<JSONProduct[] | undefined> {
  const productsJSONFile = path.join(projectRoot, ACTOR_SRC_DIR, PRODUCTS_JSON_FILE);
  try {
    await access(productsJSONFile);
  } catch {
    return;
  }

  const fileJSON = await readFile(productsJSONFile, 'utf-8');
  return parseProductsFileJSON(fileJSON);
}

/**
 * Validates product config and returns a PaymentsConfig
 *
 * @throws if payment handlers are not registered if a products.json is detected
 * note: this method is intentionally called outside of `this.createVersion` because it includes
 * validation steps that should exit early should errors be thrown
 */
export function getPaymentsConfig(
  mediaDir: string | undefined,
  bundle: Readonly<Bundle>,
  products: JSONProduct[],
  verifyProductImgAssets: boolean = true
): PaymentsConfig {
  checkProductsConfig(mediaDir, products, bundle, verifyProductImgAssets);
  return makePaymentsConfig(products);
}

function checkProductsConfig(
  mediaDir: string | undefined,
  products: JSONProduct[],
  bundle: Readonly<Bundle>,
  verifyProductImgAssets: boolean = true
): void {
  const hasProducts = products.length > 0;
  const usesPaymentPlugin = !!bundle.dependencies?.uses.find(
    (uses) => uses.typeName === PaymentsServiceDefinition.fullName
  );
  const providesPaymentProcessor = !!bundle.dependencies?.provides.find(
    (prv) => prv.definition?.fullName === PaymentProcessorDefinition.fullName
  );

  if (!hasProducts) {
    if (providesPaymentProcessor || usesPaymentPlugin) {
      throw new Error(
        'To fully support the Payment capability in our app, you must specify products in the `src/products.json` config file. Please refer to https://developers.reddit.com/docs/capabilities/payments for more details.'
      );
    }

    // no products, early return;
    return;
  }

  // check that if products were detected, that we are providing the `PaymentsProcessor` actor
  if (!providesPaymentProcessor) {
    throw new Error(
      'You have a `products.json` with products, but your app does not handle payment processing of those products. Please refer to https://developers.reddit.com/docs/capabilities/payments for documentation to enable the payments feature.'
    );
  }

  for (const product of products) {
    if (product.metadata) {
      const invalidKeys = filterToReservedDevvitMetadataKeys(Object.keys(product.metadata));

      // Enforced here on the CLI and also on the server. Server processing is done too late for error
      // messages to reach the end user, so doing here prior to upload.
      if (invalidKeys.length > 0) {
        throw new Error(
          `Products metadata cannot start with "devvit-". Invalid keys: ${invalidKeys.join(', ')}`
        );
      }
    }
  }

  const missingAssets: string[] = [];
  if (verifyProductImgAssets) {
    // check that all product images are included in the assets
    const assets = Object.keys(bundle.assetIds);

    for (const product of products) {
      // check to see if there are images associated with this product
      if (!product.images) {
        continue;
      }

      // find any assets used in products that are missing from the assets in the bundle
      const missing = Object.values(product.images).filter(
        (assetPath) => !assets.includes(assetPath)
      );

      // if there are missing assets, add them to the list and check the next product
      if (missing.length > 0) {
        missingAssets.push(...missing);
        continue;
      }

      // enforce image constraints on icons
      if (mediaDir && product.images.icon) {
        validateProductIcon(path.join(mediaDir, product.images.icon));
      }
    }

    if (missingAssets.length > 0) {
      throw new Error(
        `Product images ${missingAssets.join(', ')} are not included in the assets of the bundle. Please ensure that the image is included in the /assets directory.`
      );
    }
  }
}

function parseProductsFileJSON(fileContents: string): JSONProduct[] {
  try {
    return validateProductsJSON(JSON.parse(fileContents));
  } catch (err) {
    if (err instanceof Error) {
      // jsonschema errors are not very user friendly, so we format them here
      const newLine = '\n\t- ';
      throw new Error(
        `${PRODUCTS_JSON_FILE} ${err.message}:${newLine}${(err.cause as Error[]).map((e) => e.toString().replace(/^instance\./i, '')).join(newLine)}`
      );
    }
    throw err;
  }
}

export function makePaymentsConfig(products: Readonly<JSONProduct[]>): PaymentsConfig {
  const formattedProducts: PaymentsConfig['products'] = {};
  products.forEach((product) => {
    formattedProducts[product.sku] = {
      sku: product.sku,
      name: product.displayName,
      description: product.description ?? '',
      price: {
        amount: product.price,
        currency: Currency.GOLD,
      },
      accountingType: mapAccountingTypeToProto(product.accountingType),
      images: product.images ?? {},
      environment: Environment.ENVIRONMENT_SANDBOX, // We default to sandbox for any build from the CLI
      productMetadata: product.metadata ?? {},
    };
  });
  return { products: formattedProducts };
}

export function validateProductIcon(assetPath: string): void {
  const file = fs.readFileSync(assetPath);
  let size: ReturnType<typeof imageSize>;
  try {
    size = imageSize(file);
  } catch {
    throw new Error(`Product icon ${assetPath} is not a valid image`);
  }

  const { width, height, type } = size;

  if (type !== 'png') {
    throw new Error(`Product icon ${assetPath} must be a PNG`);
  }

  if (width !== height) {
    throw new Error(
      `Product icon ${assetPath} must be square. The provided asset is ${width}x${height}px`
    );
  }

  if (!width || width < 256) {
    throw new Error(
      `Product icon ${assetPath} must be at least 256x256. The provided asset is ${width}x${height}px`
    );
  }
}
