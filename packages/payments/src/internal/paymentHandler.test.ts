import { Environment } from '@devvit/protos/json/devvit/payments/v1alpha/common.js';
import { OrderStatus as OrderStatusProto } from '@devvit/protos/json/devvit/payments/v1alpha/order.js';
import {
  AccountingType as AccountingTypeProto,
  type Product as ProductProto,
} from '@devvit/protos/json/devvit/payments/v1alpha/product.js';
// eslint-disable-next-line no-restricted-imports
import { type Order as OrderProto } from '@devvit/protos/types/devvit/payments/v1alpha/order.js';
import { Header } from '@devvit/shared-types/Header.js';
import { describe, it } from 'vitest';

import { makeWrappedHandler, type PaymentHandler } from './paymentHandler.js';

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

const protoOrders: Readonly<OrderProto>[] = [
  {
    id: '1',
    status: OrderStatusProto.ORDER_STATUS_DELIVERED,
    createdAt: new Date('2024-03-21T12:00:00Z'),
    updatedAt: new Date('2024-03-30T12:40:50Z'),
    metadata: {
      type: 'subscription',
    },
    environment: Environment.ENVIRONMENT_SANDBOX,
    products: [FOX],
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
    products: [MOUSE],
  },
];

describe('makeWrappedHandler', () => {
  vi.mock('@devvit/public-api/apis/makeAPIClients.js', () => {
    return {
      makeAPIClients: () => ({}),
    };
  });

  vi.mock('@devvit/public-api/devvit/internals/context.js', async () => {
    return {
      getContextFromMetadata: (_: unknown, postId: string) => ({
        appAccountId: 'app-account-id',
        subredditId: 'subreddit-id',
        userId: 'user-id',
        postId,
        commentId: 'comment-id',
      }),
    };
  });

  it('wrapped handler actually invokes user implemented handlers', async () => {
    // mock makeAPIClients and getContextFromMetadata

    // mock user defined handler, and make sure that they are called
    const userDefinedHandler: PaymentHandler = {
      fulfillOrder: vi.fn(() => {
        return { success: true };
      }),
      refundOrder: vi.fn(() => {}),
    };

    const wrapped = makeWrappedHandler(userDefinedHandler);

    const result = await wrapped.FulfillOrder({ order: protoOrders[0] }, {});
    expect(userDefinedHandler.fulfillOrder).toBeCalled();
    expect(result).toStrictEqual({
      acknowledged: true,
    });

    await wrapped.RefundOrder({ order: protoOrders[0] }, {});
    expect(userDefinedHandler.refundOrder).toBeCalled();
  });

  it('wrapped handler returns rejection reason', async () => {
    // mock user defined handler, and make sure that error reasons are propagated
    const userDefinedHandler: PaymentHandler = {
      fulfillOrder: () => {
        return { success: false, reason: 'No more swords left to sell' };
      },
    };

    const wrapped = makeWrappedHandler(userDefinedHandler);
    const result = await wrapped.FulfillOrder({ order: protoOrders[0] }, {});

    expect(result).toStrictEqual({
      rejectionReason: 'No more swords left to sell',
    });
  });

  it('wrapped handler will bubble up non-OrderRejectionError exceptions', async () => {
    const expectedError = new Error('Something went wrong');
    // mock user defined handler, and make sure errors are bubbled up
    const userDefinedHandler: PaymentHandler = {
      fulfillOrder: () => {
        throw expectedError;
      },
      refundOrder: () => {
        throw expectedError;
      },
    };

    const wrapped = makeWrappedHandler(userDefinedHandler);

    await expect(wrapped.FulfillOrder({ order: protoOrders[0] }, {})).rejects.toEqual(
      expectedError
    );

    await expect(wrapped.RefundOrder({ order: protoOrders[0] })).rejects.toEqual(expectedError);
  });

  it('only developer provided metadata is passed in the order', async () => {
    const ctxPostId = 't3_post-id';
    const devDefinedMetadata = { 'my-metadata': 'my-metadata-value' };
    const mockFulfillOrder = vi.fn();
    const mockRefundOrder = vi.fn();

    const wrapped = makeWrappedHandler({
      fulfillOrder: mockFulfillOrder,
      refundOrder: mockRefundOrder,
    });
    const order = {
      ...protoOrders[0],
      metadata: {
        ...devDefinedMetadata,
        [Header.Post]: ctxPostId,
      },
    };

    await wrapped.FulfillOrder({ order }, {});

    expect(mockFulfillOrder).toBeCalledWith(
      expect.objectContaining({ metadata: devDefinedMetadata }), // only developer-defined metadata
      expect.objectContaining({ postId: ctxPostId }) // context built from non-developer-defined metadata
    );

    await wrapped.RefundOrder({ order }, {});
    expect(mockRefundOrder).toBeCalledWith(
      expect.objectContaining({ metadata: devDefinedMetadata }), // only developer-defined metadata
      expect.anything() // context does not contain postId because the refunds are processed outside of a post
    );
  });
});
