import { readdir, writeFile } from 'node:fs/promises';

import { PRODUCTS_JSON_FILE } from '@devvit/shared-types/constants.js';
import { AccountingType } from '@devvit/shared-types/payments/Product.js';
import { Args, Flags, ux } from '@oclif/core';
import chalk from 'chalk';
import inquirer from 'inquirer';
import * as path from 'path';

import { ProjectCommand } from '../../util/commands/ProjectCommand.js';
import { type JSONProduct, readProducts } from '../../util/payments/paymentsConfig.js';

// TODO: Import these from the products.json schema file.
const ALLOWED_PRICES = [5, 25, 50, 100, 150, 250, 500, 1000, 2500];
type ValidAccountingType =
  | AccountingType.CONSUMABLE
  | AccountingType.DURABLE
  | AccountingType.INSTANT
  | AccountingType.VALID_FOR_1D
  | AccountingType.VALID_FOR_1Y
  | AccountingType.VALID_FOR_30D
  | AccountingType.VALID_FOR_7D;

const ACCOUNTING_TYPE_TO_LABEL: { [key in ValidAccountingType]: string } = {
  INSTANT: `Instant: ${chalk.dim('Is used immediately and disappears.')}`,
  DURABLE: `Durable: ${chalk.dim('Is permanently applied to the account and can be used any number of times.')}`,
  CONSUMABLE: `Consumable: ${chalk.dim('Can be used at a later date but is removed once it is used.')}`,
  VALID_FOR_1D: `Valid for 1 day: ${chalk.dim('Can be used for 1 day after purchase.')}`,
  VALID_FOR_7D: `Valid for 7 days: ${chalk.dim('Can be used for 7 days after purchase.')}`,
  VALID_FOR_30D: `Valid for 30 days: ${chalk.dim('Can be used for 30 days after purchase.')}`,
  VALID_FOR_1Y: `Valid for 1 year: ${chalk.dim('Can be used for 1 year after purchase.')}`,
};

const LABEL_TO_ACCOUNTING_TYPE: { [key: string]: ValidAccountingType } = Object.fromEntries(
  Object.entries(ACCOUNTING_TYPE_TO_LABEL).map(([key, value]) => [
    value,
    key as ValidAccountingType,
  ])
);

type ProductsJSON = {
  $schema: 'https://developers.reddit.com/schema/products.json';
  products: JSONProduct[];
};
export default class AddProduct extends ProjectCommand {
  static override description = 'Add a new product to your app';

  static override examples = [
    '$ devvit products add',
    '$ devvit products add my-product-sku',
    '$ devvit products add my-product-sku --name="My Product" --description="A product description" --price=100 --type=INSTANT --icon=icon.png',
  ];

  static override args = {
    sku: Args.string({ description: 'Product SKU' }),
  } as const;

  static override flags = {
    name: Flags.string({
      description: 'Product display name',
    }),
    description: Flags.string({
      description: 'Product description',
    }),
    price: Flags.integer({
      options: ALLOWED_PRICES.map((price) => price.toString()),
      description: 'Product price in Reddit Gold',
    }),
    type: Flags.string({
      options: [
        'INSTANT',
        'DURABLE',
        'CONSUMABLE',
        'VALID_FOR_1D',
        'VALID_FOR_7D',
        'VALID_FOR_30D',
        'VALID_FOR_1Y',
      ],
      description: 'Product type',
    }),
    icon: Flags.file({
      description: 'Product icon asset PNG filename.',
      defaultHelp: 'Must be a relative path within the assets directory.',
      dependsOn: ['config'],
      parse: async (input) => {
        if (!input) return '';
        if (!input.endsWith('.png')) {
          throw new Error('Icon must be a PNG file');
        }
        // Remove leading slashes and dots
        return input.replace(/^\.?\/?/, '');
      },
    }),
  } as const;

  get productsFilePath(): string {
    return path.join(this.projectRoot, 'src', PRODUCTS_JSON_FILE);
  }

  async run() {
    const { args, flags } = await this.parse(AddProduct);
    const { sku } = args;

    const { name: displayName, description, price, type, icon } = flags;
    const accountingType = type as ValidAccountingType;

    const productsJSON = await this.#getProductsConfig();
    const existingSKUs = productsJSON.products.map((product) => product.sku);

    if (sku && existingSKUs.includes(sku)) {
      this.error(`A product with SKU "${sku}" already exists. Please provide a unique SKU.`);
    }

    const availableAssets = await this.#getAvailableAssets();
    if (icon && !availableAssets.includes(icon)) {
      this.error(`File "${icon}" was not found in the assets directory.`);
    }

    // The exactOptionalPropertyTypes TS setting does not allow for partial types with undefined values
    // so we need to manually create a partial object with only the defined values.
    const prefilledProduct: Partial<JSONProduct> = {};
    if (sku) prefilledProduct.sku = sku;
    if (displayName) prefilledProduct.displayName = displayName;
    if (description) prefilledProduct.description = description;
    if (price) prefilledProduct.price = price;
    if (accountingType) prefilledProduct.accountingType = accountingType;
    if (icon) prefilledProduct.images = { icon };

    const product = await this.#prompt(prefilledProduct, { availableAssets, existingSKUs });
    productsJSON.products = [...productsJSON.products, product];

    try {
      ux.action.start('Saving product');
      await writeFile(this.productsFilePath, JSON.stringify(productsJSON, null, 2), 'utf-8');
      ux.action.stop(`Product "${product.sku}" added successfully!`);
      this.log(
        `Go to ${chalk.underline('https://developers.reddit.com/docs/payments/payments_add#complete-the-payment-flow')} to integrate the product into your app.`
      );
    } catch (error) {
      this.error(`Failed to write ${PRODUCTS_JSON_FILE}:\n${error}`);
    }
  }

  async #prompt(
    prefilledProduct: Partial<JSONProduct>,
    { existingSKUs, availableAssets }: { existingSKUs: string[]; availableAssets: string[] }
  ): Promise<JSONProduct> {
    return await inquirer.prompt<JSONProduct>(
      [
        {
          message: 'Product SKU (50 characters max, alphanumeric and dashes only):',
          type: 'input',
          name: 'sku',
          validate: (input: string) => {
            if (existingSKUs.includes(input)) {
              return `A product with SKU "${input}" already exists. Please provide a unique SKU.`;
            }
            if (input.length === 0) {
              return 'A SKU is required';
            }
            if (!/^[A-z0-9-_]+$/.test(input)) {
              return 'SKU must be alphanumeric';
            }
            if (input.length > 50) {
              return 'SKU must be 50 characters or less';
            }
            return true;
          },
        },
        {
          message: 'Product name (50 characters max):',
          type: 'input',
          name: 'displayName',
          filter: (input: string) => input.trim(),
          validate: (input: string) => {
            if (input.length === 0) {
              return 'Please provide a name.';
            }
            if (input.length > 50) {
              return 'Name must be 50 characters or less.';
            }
            return true;
          },
        },
        {
          message: 'Long description (250 characters max):',
          type: 'input',
          name: 'description',
          filter: (input: string) => input.trim(),
          validate: (input: string) => {
            if (input.length > 250) {
              return 'Description must be 250 characters or less.';
            }
            return true;
          },
        },
        {
          message: 'Price in Reddit Gold:',
          type: 'list',
          name: 'price',
          choices: ALLOWED_PRICES,
        },
        {
          message: 'Product type:',
          type: 'list',
          name: 'accountingType',
          filter: (input: string) => LABEL_TO_ACCOUNTING_TYPE[input],
          choices: Object.values(ACCOUNTING_TYPE_TO_LABEL),
        },
        {
          message: 'Product icon:',
          type: 'list',
          name: 'images',
          filter: (input: string) => (input === 'None' ? undefined : { icon: input }),
          choices: ['None', new inquirer.Separator(), ...availableAssets],
        },
      ],
      prefilledProduct
    );
  }

  async #getProductsConfig(): Promise<ProductsJSON> {
    const productsJSON: ProductsJSON = {
      $schema: 'https://developers.reddit.com/schema/products.json',
      products: [],
    };

    ux.action.start(`Reading ${PRODUCTS_JSON_FILE}`);
    const products = await readProducts(this.projectRoot);

    if (products) {
      ux.action.stop(
        `${PRODUCTS_JSON_FILE} json read successfully. Found ${products.length} products.`
      );
      productsJSON.products = products;
    } else {
      ux.action.stop(`No ${PRODUCTS_JSON_FILE} found. A new one will be created.`);
    }

    return productsJSON;
  }

  async #getAvailableAssets(): Promise<string[]> {
    return (await readdir(path.join(this.projectRoot, 'assets'), { recursive: true })).filter(
      (file) => file.endsWith('.png')
    );
  }
}
