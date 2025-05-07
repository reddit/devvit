import { access, readFile } from 'node:fs/promises';

import { PaymentProcessorDefinition } from '@devvit/protos/payments.js';
import { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import type { Product } from '@devvit/shared-types/payments/Product.js';
import { AccountingType } from '@devvit/shared-types/payments/Product.js';
import path from 'path';

import {
  getPaymentsConfig,
  makePaymentsConfig,
  readProducts,
  validateProductIcon,
} from './paymentsConfig.js';

vi.mock('node:fs/promises', () => ({
  access: vi.fn().mockResolvedValue(void 0),
  readFile: vi.fn().mockResolvedValue(''),
}));

const MOCK_PRODUCTS_JSON: { products: Product[] } = {
  products: [
    {
      sku: 'product-1',
      displayName: 'Product 1',
      price: 25,
      accountingType: AccountingType.INSTANT,
      metadata: {},
    },
  ],
};

const MOCK_BUNDLE: Bundle = {
  code: '',
  dependencies: {
    hostname: '',
    provides: [
      {
        definition: {
          fullName: PaymentProcessorDefinition.fullName,
          methods: [],
          name: '',
          version: '',
        },
        partitionsBy: [],
      },
    ],
    permissions: [],
    uses: [],
  },
  assetIds: {},
  webviewAssetIds: {},
};

describe('Read product.json', () => {
  const PROJECT_ROOT = '/path/to/project';
  it('does not return any products if the files does not exist', async () => {
    vi.mocked(access).mockRejectedValueOnce(new Error('not found'));
    const products = await readProducts(PROJECT_ROOT);
    expect(products).toBeUndefined();
  });

  it('throws an error if products.json is not formatted properly', async () => {
    const products = [{ ...MOCK_PRODUCTS_JSON.products[0], price: 'not a number' }];
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(products));
    await expect(() => readProducts(PROJECT_ROOT)).rejects.toThrowError(
      'products.json validation error'
    );
  });
});

describe('Get payments config', () => {
  it('throws an error if the bundle does not provide a PaymentProcessor', () => {
    const bundle: Bundle = { assetIds: {}, code: '', webviewAssetIds: {} };
    expect(() => getPaymentsConfig(bundle, MOCK_PRODUCTS_JSON.products)).toThrowError(
      /You have a `products\.json` with products, but your app does not handle payment processing of those products./
    );
  });

  it('throws an error if the product images are not included in the assets', () => {
    const productImage = 'doesnotexist.jpg';
    const products = [{ ...MOCK_PRODUCTS_JSON.products[0], images: { icon: productImage } }];
    const bundle: Bundle = { ...MOCK_BUNDLE, assetIds: { 'exists.jpg': 'abc123' } };

    expect(() => getPaymentsConfig(bundle, products)).toThrowError(
      `Product images ${productImage} are not included in the assets`
    );
  });

  it('throws an error if no products are found ', () => {
    expect(() => getPaymentsConfig(MOCK_BUNDLE, [])).toThrowError(
      'you must specify products in the `src/products.json` config file'
    );
  });

  it('throws error if a product has metadata starting with "devvit-"', () => {
    const invalidProduct = {
      sku: 'product-1',
      displayName: 'Product 1',
      price: 25,
      accountingType: AccountingType.INSTANT,
      metadata: {
        'devvit-invalid': 'this breaks upload',
      },
    };
    expect(() => getPaymentsConfig(MOCK_BUNDLE, [invalidProduct])).toThrowError(
      'Products metadata cannot start with "devvit-". Invalid keys: devvit-invalid'
    );
  });

  it('creates payments config products.json is found and formatted properly', () => {
    expect(getPaymentsConfig(MOCK_BUNDLE, MOCK_PRODUCTS_JSON.products)).toStrictEqual(
      makePaymentsConfig(MOCK_PRODUCTS_JSON.products)
    );
  });

  it('handles products without metadata', () => {
    const productWithoutMetadata = {
      sku: 'product-1',
      displayName: 'Product 1',
      price: 25,
      accountingType: AccountingType.INSTANT,
    };

    expect(getPaymentsConfig(MOCK_BUNDLE, [productWithoutMetadata])).toStrictEqual(
      // The metadata gets added by makePaymentsConfig
      makePaymentsConfig([{ ...productWithoutMetadata, metadata: {} }])
    );
  });

  it('ignores product image asset verification if option is set to false', () => {
    const productImage = 'doesnotexist.jpg';
    const products = [{ ...MOCK_PRODUCTS_JSON.products[0], images: { icon: productImage } }];
    const bundle: Bundle = {
      ...MOCK_BUNDLE,
      assetIds: {
        'exists.jpg': 'abc123',
      },
    };
    expect(getPaymentsConfig(bundle, products, false)).toStrictEqual(makePaymentsConfig(products));
  });
});

describe('Validate product icon', () => {
  const imgPath = (filename: string): string => path.join(__dirname, 'test-images', filename);

  it('rejects non-images', () => {
    expect(() => validateProductIcon(imgPath('not-an-image.png'))).toThrowError(
      'not a valid image'
    );
  });

  it('rejects non pngs', () => {
    expect(() => validateProductIcon(imgPath('not-png.jpg'))).toThrowError('must be a PNG');
  });

  it('rejects non square', () => {
    expect(() => validateProductIcon(imgPath('not-square.png'))).toThrowError('must be square');
  });

  it('rejects small images', () => {
    expect(() => validateProductIcon(imgPath('too-small.png'))).toThrowError(
      'must be at least 256x256'
    );
  });

  it('allows valid images', () => {
    expect(() => validateProductIcon(imgPath('good.png'))).not.toThrow();
  });
});
