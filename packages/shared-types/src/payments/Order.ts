import { Order as OrderProto } from '@devvit/protos/payments.js';
import { OrderStatus as OrderStatusProto } from '@devvit/protos/payments.js';

import { purgeReservedDevvitKeysFromMetadata } from '../reservedDevvitMetadataKeys.js';
import type { Product } from './Product.js';
import { productFromProto } from './Product.js';

/**
 * The status of an order.
 */
export const enum OrderStatus {
  NEW = 'NEW',
  CREATED = 'CREATED',
  PAID = 'PAID',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
  REVERTED = 'REVERTED',
  UNRECOGNIZED = 'UNRECOGNIZED',
}

/**
 * Maps an OrderStatus enum to the corresponding protobuf enum value.
 */
export function mapOrderStatusToProto(status: OrderStatus): OrderStatusProto {
  switch (status) {
    case OrderStatus.NEW:
      return OrderStatusProto.ORDER_STATUS_NEW;
    case OrderStatus.CREATED:
      return OrderStatusProto.ORDER_STATUS_CREATED;
    case OrderStatus.PAID:
      return OrderStatusProto.ORDER_STATUS_PAID;
    case OrderStatus.DELIVERED:
      return OrderStatusProto.ORDER_STATUS_DELIVERED;
    case OrderStatus.CANCELED:
      return OrderStatusProto.ORDER_STATUS_CANCELED;
    case OrderStatus.REVERTED:
      return OrderStatusProto.ORDER_STATUS_REVERTED;
    case OrderStatus.UNRECOGNIZED:
      return OrderStatusProto.UNRECOGNIZED;
  }
}

/**
 * Maps an OrderStatus protobuf enum value to the corresponding OrderStatus enum.
 */
function mapProtoToOrderStatus(status: OrderStatusProto): OrderStatus {
  switch (status) {
    case OrderStatusProto.ORDER_STATUS_NEW:
      return OrderStatus.NEW;
    case OrderStatusProto.ORDER_STATUS_CREATED:
      return OrderStatus.CREATED;
    case OrderStatusProto.ORDER_STATUS_PAID:
      return OrderStatus.PAID;
    case OrderStatusProto.ORDER_STATUS_DELIVERED:
      return OrderStatus.DELIVERED;
    case OrderStatusProto.ORDER_STATUS_CANCELED:
      return OrderStatus.CANCELED;
    case OrderStatusProto.ORDER_STATUS_REVERTED:
      return OrderStatus.REVERTED;
    case OrderStatusProto.ORDER_STATUS_UNSPECIFIED:
    case OrderStatusProto.UNRECOGNIZED:
      return OrderStatus.UNRECOGNIZED;
  }
}

/**
 * An order for products purchased through Devvit by a Reddit user.
 */
export type Order = {
  /** Unique identifer for the order */
  id: string;
  /** Where the order is in its lifecycle */
  status: OrderStatus;
  /** When the order was created */
  createdAt: Date | null;
  /** When the order was last updated */
  updatedAt: Date | null;
  /** The products that were ordered */
  products: Product[];
  /** Metadata associated with the order. Excludes metadata keys that start with `devvit-`. */
  metadata: Readonly<Record<string, string>>;
};

/**
 * Converts an Order protobuf message to an Order object.
 */
export function orderFromProto(data: OrderProto): Order {
  return {
    id: data.id,
    status: mapProtoToOrderStatus(data.status),
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
    products: data.products.map(productFromProto),
    metadata: purgeReservedDevvitKeysFromMetadata(data.metadata),
  };
}
