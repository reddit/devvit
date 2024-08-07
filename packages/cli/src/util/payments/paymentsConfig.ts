import path from 'node:path';
import { readFile, access } from 'node:fs/promises';
import { ACTOR_SRC_DIR, PRODUCTS_JSON_FILE } from '@devvit/shared-types/constants.js';
import { type Product } from '@devvit/shared-types/payments/Product.js';
import type { Bundle, PaymentsConfig } from '@devvit/protos';
import {
  Environment,
  Currency,
  PaymentsServiceDefinition,
  PaymentProcessorDefinition,
} from '@devvit/protos/payments.js';
import { validateProductsJSON } from '@devvit/shared-types/payments/productSchemaJSONValidator.js';

/**
 * reads src/products.json and injects products into bundle. Will throw an error if
 * 1. products.json is malformed
 * 2. payment handlers are not registered if a products.json is detected
 * note: this method is intentionally called outside of `this.createVersion` because it includes
 * validation steps that should exit early should errors be thrown
 */
export async function readAndInjectBundleProducts(
  projectRoot: string,
  bundle: Bundle,
  verifyProductImgAssets: boolean = true
): Promise<void> {
  const productsJSONFile = path.join(projectRoot, ACTOR_SRC_DIR, PRODUCTS_JSON_FILE);
  try {
    await access(productsJSONFile);
  } catch {
    return;
  }

  const fileJSON = await readFile(productsJSONFile, 'utf-8');
  const products = parseProductsFileJSON(fileJSON);
  checkProductsConfig(products, bundle, verifyProductImgAssets);
  bundle.paymentsConfig = makePaymentsConfig(products);
}

function checkProductsConfig(
  products: Product[],
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

  // check that if products were detected, that we are providing the `PaymentsProcessor` actor
  if (hasProducts) {
    if (!providesPaymentProcessor) {
      throw new Error(
        'You have a `products.json` with products, but your app does not handle payment processing of those products. Please refer to https://developers.reddit.com/docs/capabilities/payments for documentation to enable the payments feature.'
      );
    }

    if (verifyProductImgAssets) {
      // check that all product images are included in the assets
      const productImages = products.map((product) => Object.values(product.images || {})).flat();
      const assets = Object.keys(bundle.assetIds);
      productImages.forEach((image) => {
        if (!assets.includes(image)) {
          throw new Error(
            `Product image ${image} is not included in the assets of the bundle. Please ensure that the image is included in the /assets directory.`
          );
        }
      });
    }
  }

  if ((providesPaymentProcessor || usesPaymentPlugin) && !hasProducts) {
    throw new Error(
      'To fully support the Payment capability in our app, you must specify products in the `src/products.json` config file. Please refer to https://developers.reddit.com/docs/capabilities/payments for more details.'
    );
  }
}

function parseProductsFileJSON(fileContents: string): Product[] {
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

export function makePaymentsConfig(products: Readonly<Product[]>): PaymentsConfig {
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
      images: product.images ?? {},
      environment: Environment.ENVIRONMENT_SANDBOX, // We default to sandbox for any build from the CLI
      productMetadata: product.metadata ?? {},
    };
  });
  return { products: formattedProducts };
}
