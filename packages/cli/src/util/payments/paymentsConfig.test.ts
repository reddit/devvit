import { PaymentProcessorDefinition, PaymentsServiceDefinition } from '@devvit/protos/payments.js';
import { Bundle } from '@devvit/protos/types/devvit/plugin/buildpack/buildpack_common.js';
import type { Product } from '@devvit/shared-types/payments/Product.js';
import { AccountingType } from '@devvit/shared-types/payments/Product.js';
import { access, readFile } from 'node:fs/promises';
import path from 'path';
import {
  makePaymentsConfig,
  readAndInjectBundleProducts,
  validateProductIcon,
} from './paymentsConfig.js';

vi.mock('node:fs/promises', () => ({
  access: vi.fn().mockResolvedValue(void 0),
  readFile: vi.fn().mockResolvedValue(''),
}));

const PROJECT_ROOT = '/path/to/project';
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
const MOCK_PRODUCTS_JSON_STRING = JSON.stringify(MOCK_PRODUCTS_JSON);

describe(readAndInjectBundleProducts.name, () => {
  it('does not inject products into the bundle if products.json is not found', async () => {
    const bundle = Bundle.fromPartial({});
    vi.mocked(access).mockRejectedValueOnce(new Error('not found'));
    await readAndInjectBundleProducts(PROJECT_ROOT, bundle);
    expect(bundle.paymentsConfig).toBeUndefined();
  });

  it('does not inject products into the bundle if products.json is not formatted properly', async () => {
    const bundle = Bundle.fromPartial({});
    const products = [{ ...MOCK_PRODUCTS_JSON.products[0], price: 'not a number' }];
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(products));
    await expect(() => readAndInjectBundleProducts(PROJECT_ROOT, bundle)).rejects.toThrowError(
      'products.json validation error'
    );
    expect(bundle.paymentsConfig).toBeUndefined();
  });

  it('does not inject products into the bundle if the bundle does not provide a PaymentProcessor', async () => {
    const bundle = Bundle.fromPartial({});
    vi.mocked(access).mockResolvedValueOnce();
    vi.mocked(readFile).mockResolvedValueOnce(MOCK_PRODUCTS_JSON_STRING);
    await expect(() => readAndInjectBundleProducts(PROJECT_ROOT, bundle)).rejects.toThrowError(
      'your app does not handle payment processing'
    );
    expect(bundle.paymentsConfig).toBeUndefined();
  });

  it('does not inject products into the bundle if the product images are not included in the assets', async () => {
    const productImage = 'doesnotexist.jpg';
    const products = {
      products: [{ ...MOCK_PRODUCTS_JSON.products[0], images: { icon: productImage } }],
    };
    const bundle = Bundle.fromPartial({
      dependencies: {
        provides: [
          {
            definition: {
              fullName: PaymentProcessorDefinition.fullName,
            },
          },
        ],
      },
      assetIds: {
        'exists.jpg': 'abc123',
      },
    });
    vi.mocked(access).mockResolvedValueOnce();
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(products));
    await expect(() => readAndInjectBundleProducts(PROJECT_ROOT, bundle)).rejects.toThrowError(
      `Product images ${productImage} are not included in the assets`
    );
    expect(bundle.paymentsConfig).toBeUndefined();
  });

  it('does not inject products if no products are found in products.json', async () => {
    const bundle = Bundle.fromPartial({
      dependencies: {
        uses: [
          {
            typeName: PaymentsServiceDefinition.fullName,
          },
        ],
      },
    });
    vi.mocked(access).mockResolvedValueOnce();
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify({ products: [] }));
    await expect(() => readAndInjectBundleProducts(PROJECT_ROOT, bundle)).rejects.toThrowError(
      'you must specify products in the `src/products.json` config file'
    );
    expect(bundle.paymentsConfig).toBeUndefined();
  });

  it('injects products into the bundle if products.json is found and formatted properly', async () => {
    const bundle = Bundle.fromPartial({
      dependencies: {
        provides: [
          {
            definition: {
              fullName: PaymentProcessorDefinition.fullName,
            },
          },
        ],
      },
    });
    vi.mocked(access).mockResolvedValueOnce();
    vi.mocked(readFile).mockResolvedValueOnce(MOCK_PRODUCTS_JSON_STRING);
    await readAndInjectBundleProducts(PROJECT_ROOT, bundle);
    expect(bundle.paymentsConfig).toStrictEqual(makePaymentsConfig(MOCK_PRODUCTS_JSON.products));
  });

  it('ignores product image asset verification if option is set to false', async () => {
    const productImage = 'doesnotexist.jpg';
    const products = {
      products: [{ ...MOCK_PRODUCTS_JSON.products[0], images: { icon: productImage } }],
    };
    const bundle = Bundle.fromPartial({
      dependencies: {
        provides: [
          {
            definition: {
              fullName: PaymentProcessorDefinition.fullName,
            },
          },
        ],
      },
      assetIds: {
        'exists.jpg': 'abc123',
      },
    });
    vi.mocked(access).mockResolvedValueOnce();
    vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(products));
    await readAndInjectBundleProducts(PROJECT_ROOT, bundle, false);
    expect(bundle.paymentsConfig).toStrictEqual(makePaymentsConfig(products.products));
  });
});

describe(validateProductIcon.name, () => {
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
