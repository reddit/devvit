import type { Product as ProductProto } from '@devvit/protos/payments.js';
import { AccountingType as AccountingTypeProto } from '@devvit/protos/payments.js';
import { v5 as uuidv5 } from 'uuid';

import { assertNonNull } from '../NonNull.js';
import { purgeReservedDevvitKeysFromMetadata } from '../reservedDevvitMetadataKeys.js';

/**
 * A unique identifier for a product.
 */
export type SKU = string;

export enum AccountingType {
  INSTANT = 'INSTANT',
  DURABLE = 'DURABLE',
  CONSUMABLE = 'CONSUMABLE',
  VALID_FOR_1D = 'VALID_FOR_1D',
  VALID_FOR_7D = 'VALID_FOR_7D',
  VALID_FOR_30D = 'VALID_FOR_30D',
  VALID_FOR_1Y = 'VALID_FOR_1Y',
  UNRECOGNIZED = 'UNRECOGNIZED',
}

const accountTypeToProtoMapping: { [key in AccountingType]: AccountingTypeProto } = {
  [AccountingType.INSTANT]: AccountingTypeProto.ACCOUNTING_TYPE_INSTANT,
  [AccountingType.DURABLE]: AccountingTypeProto.ACCOUNTING_TYPE_DURABLE,
  [AccountingType.CONSUMABLE]: AccountingTypeProto.ACCOUNTING_TYPE_CONSUMABLE,
  [AccountingType.VALID_FOR_1D]: AccountingTypeProto.ACCOUNTING_TYPE_VALID_FOR_1D,
  [AccountingType.VALID_FOR_7D]: AccountingTypeProto.ACCOUNTING_TYPE_VALID_FOR_7D,
  [AccountingType.VALID_FOR_30D]: AccountingTypeProto.ACCOUNTING_TYPE_VALID_FOR_30D,
  [AccountingType.VALID_FOR_1Y]: AccountingTypeProto.ACCOUNTING_TYPE_VALID_FOR_1Y,
  [AccountingType.UNRECOGNIZED]: AccountingTypeProto.UNRECOGNIZED,
};

/**
 * Maps an AccountingType enum to the corresponding protobuf enum value.
 */
export function mapAccountingTypeToProto(type: AccountingType): AccountingTypeProto {
  return accountTypeToProtoMapping[type] ?? AccountingTypeProto.UNRECOGNIZED;
}

/**
 * Maps an AccountingType protobuf enum value to the corresponding AccountingType enum.
 */
export function mapProtoToAccountingType(typeProto: AccountingTypeProto): AccountingType {
  const entry = Object.entries(accountTypeToProtoMapping).find(([_, value]) => value === typeProto);
  return entry ? (entry[0] as AccountingType) : AccountingType.UNRECOGNIZED;
}

/**
 * A product that can be sold by Devvit developers
 * and purchased by Reddit users.
 */
export type Product = {
  sku: SKU;
  price: number;
  displayName: string;
  accountingType: AccountingType;
  description?: string;
  metadata?: Readonly<Record<string, string>>;
  /**
   * The image configured for this product, or no image if one is not configured.
   * This is the filename of the file in the assets directory.
   */
  images?: {
    icon: string;
  };
};

/**
 * Converts an Product protobuf message to an Product object.
 */
export function productFromProto(data: ProductProto): Product {
  // Validate the incoming data
  assertNonNull(data.price, 'Product price is null or undefined');

  const productIcon = data.images['icon'];
  return {
    sku: data.sku,
    price: data.price.amount, // In Reddit Gold
    accountingType: mapProtoToAccountingType(data.accountingType),
    displayName: data.name,
    description: data.description,
    metadata: purgeReservedDevvitKeysFromMetadata(data.productMetadata),
    ...(productIcon ? { images: { icon: productIcon } } : {}),
  };
}

export function newProductId(appVersionId: string, productSku: string): string {
  const uuidV5Name = productSku;
  const uuidV5Namespace = appVersionId;
  return uuidv5(uuidV5Name, uuidV5Namespace);
}
