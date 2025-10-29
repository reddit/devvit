import type { Product as ProductProto } from '@devvit/protos/payments.js';
import { AccountingType as AccountingTypeProto } from '@devvit/protos/payments.js';
import { Environment } from '@devvit/protos/payments.js';
import { type Product, productFromProto } from '@devvit/shared-types/payments/Product.js';

const FOX: Readonly<ProductProto> = {
  sku: 'fox',
  name: 'Fox',
  description: 'A fox',
  price: {
    amount: 10,
    currency: 200,
  },
  accountingType: AccountingTypeProto.ACCOUNTING_TYPE_CONSUMABLE,
  productMetadata: {
    color: 'red',
  },
  images: {},
  environment: Environment.ENVIRONMENT_SANDBOX,
};

const MOUSE: Readonly<ProductProto> = {
  sku: 'mouse',
  name: 'Mouse',
  description: 'A mouse',
  price: {
    amount: 50,
    currency: 200,
  },
  accountingType: AccountingTypeProto.ACCOUNTING_TYPE_CONSUMABLE,
  productMetadata: {
    color: 'gray',
  },
  images: {},
  environment: Environment.ENVIRONMENT_SANDBOX,
};

export const protoProducts = [FOX, MOUSE];

export const products: Readonly<Product>[] = protoProducts.map(productFromProto);
