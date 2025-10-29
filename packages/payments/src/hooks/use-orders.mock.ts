import type { Order as OrderProto } from '@devvit/protos/payments.js';
import { Environment, OrderStatus as OrderStatusProto } from '@devvit/protos/payments.js';
import type { Order } from '@devvit/shared-types/payments/Order.js';
import { orderFromProto } from '@devvit/shared-types/payments/Order.js';

import { protoProducts } from './use-products.mock.js';

export const protoOrders: Readonly<OrderProto>[] = [
  {
    id: '1',
    status: OrderStatusProto.ORDER_STATUS_DELIVERED,
    createdAt: new Date('2024-03-21T12:00:00Z'),
    updatedAt: new Date('2024-03-30T12:40:50Z'),
    metadata: {
      type: 'subscription',
    },
    environment: Environment.ENVIRONMENT_SANDBOX,
    products: [protoProducts[0]],
  },
  {
    id: '2',
    status: OrderStatusProto.ORDER_STATUS_NEW,
    createdAt: new Date('2024-04-01T12:00:00Z'),
    updatedAt: new Date('2024-04-30T12:10:20Z'),
    metadata: {
      type: 'purchase',
    },
    environment: Environment.ENVIRONMENT_SANDBOX,
    products: [protoProducts[1]],
  },
];

export const orders: Readonly<Order>[] = protoOrders.map(orderFromProto);
