import type { PaymentHandlerRequest, PaymentHandlerResponse } from '@devvit/payments/shared';
import { Environment } from '@devvit/protos/json/devvit/payments/v1alpha/common.js';
import { OrderStatus as OrderStatusProto } from '@devvit/protos/json/devvit/payments/v1alpha/order.js';
import {
  AccountingType as AccountingTypeProto,
  type Product as ProductProto,
} from '@devvit/protos/json/devvit/payments/v1alpha/product.js';
// eslint-disable-next-line no-restricted-imports
import {
  type PaymentProcessor,
  PaymentProcessorDefinition,
} from '@devvit/protos/types/devvit/actor/payments/v1alpha/payments.js';
// eslint-disable-next-line no-restricted-imports
import type { Order as OrderProto } from '@devvit/protos/types/devvit/payments/v1alpha/order.js';
// eslint-disable-next-line no-restricted-imports
import { Devvit } from '@devvit/public-api';
import { context } from '@devvit/server';
import type { JsonObject } from '@devvit/shared';
import type { Config } from '@devvit/shared-types/Config.js';
import { Header } from '@devvit/shared-types/Header.js';
import { describe, it } from 'vitest';

import { configurePayments, newPaymentsProcessor } from './payments.js';

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

const paymentHandlerRequests: Readonly<PaymentHandlerRequest>[] = [
  {
    id: '1',
    status: 'DELIVERED',
    createdAt: '2024-03-21T12:00:00.000Z',
    updatedAt: '2024-03-30T12:40:50.000Z',
    metadata: { type: 'subscription' },
    products: [
      {
        sku: 'fox',
        price: 10,
        displayName: 'Fox',
        description: 'A fox',
        accountingType: 'CONSUMABLE',
        metadata: { color: 'red' },
      },
    ],
  },
  {
    id: '2',
    status: 'NEW',
    createdAt: '2024-04-01T12:00:00.000Z',
    updatedAt: '2024-04-30T12:10:20.000Z',
    metadata: { type: 'purchase' },
    products: [
      {
        sku: 'mouse',
        price: 50,
        displayName: 'Mouse',
        description: 'A mouse',
        accountingType: 'CONSUMABLE',
        metadata: { color: 'gray' },
      },
    ],
  },
];

describe('newPaymentsProcessor', () => {
  const oldFetch = globalThis.fetch;
  const paymentsConfig = {
    products: [],
    endpoints: {
      fulfillOrder: '/internal/payments/fulfill-order',
      refundOrder: '/internal/payments/refund-order',
    },
  };

  afterEach(() => {
    globalThis.fetch = oldFetch;
  });

  it('wrapped handler actually invokes user implemented handlers', async () => {
    const userDefinedHandler: PaymentHandler = {
      fulfillOrder: vi.fn(() => {
        return { success: true };
      }),
      refundOrder: vi.fn(() => {}),
    };
    mockPaymentEndpoints(userDefinedHandler);

    const wrapped = newPaymentsProcessor(paymentsConfig);

    const result = await wrapped.FulfillOrder({ order: protoOrders[0] }, {});
    expect(userDefinedHandler.fulfillOrder).toBeCalled();
    expect(result).toStrictEqual({
      acknowledged: true,
    });

    await wrapped.RefundOrder({ order: protoOrders[0] }, {});
    expect(userDefinedHandler.refundOrder).toBeCalled();
  });

  it('wrapped handler returns rejection reason', async () => {
    const userDefinedHandler: PaymentHandler = {
      fulfillOrder: () => {
        return { success: false, reason: 'No more swords left to sell' };
      },
    };
    mockPaymentEndpoints(userDefinedHandler);

    const wrapped = newPaymentsProcessor(paymentsConfig);
    const result = await wrapped.FulfillOrder({ order: protoOrders[0] }, {});

    expect(result).toStrictEqual({
      rejectionReason: 'No more swords left to sell',
    });
  });

  it('wrapped handler will bubble up non-OrderRejectionError exceptions', async () => {
    const expectedError = new Error('Something went wrong');
    const userDefinedHandler: PaymentHandler = {
      fulfillOrder: () => {
        throw expectedError;
      },
      refundOrder: () => {
        throw expectedError;
      },
    };
    mockPaymentEndpoints(userDefinedHandler);

    const wrapped = newPaymentsProcessor(paymentsConfig);

    await expect(wrapped.FulfillOrder({ order: protoOrders[0] }, {})).rejects.toEqual(
      expect.stringContaining(expectedError.message)
    );

    await expect(wrapped.RefundOrder({ order: protoOrders[0] })).rejects.toEqual(
      expect.stringContaining(expectedError.message)
    );
  });

  it('only developer provided metadata is passed in the order', async () => {
    const ctxPostId = 't3_post-id';
    const devDefinedMetadata = { 'my-metadata': 'my-metadata-value' };
    const mockFulfillOrder = vi.fn(() => ({ success: true }) as const);
    const mockRefundOrder = vi.fn();

    mockPaymentEndpoints({
      fulfillOrder: mockFulfillOrder,
      refundOrder: mockRefundOrder,
    });
    const wrapped = newPaymentsProcessor(paymentsConfig);
    const order = {
      ...protoOrders[0],
      metadata: {
        ...devDefinedMetadata,
        [Header.Post]: ctxPostId,
      },
    };

    await wrapped.FulfillOrder({ order }, {});
    expect(mockFulfillOrder).toBeCalledWith(
      expect.objectContaining({ metadata: devDefinedMetadata }) // only developer-defined metadata
    );

    await wrapped.RefundOrder({ order }, {});
    expect(mockRefundOrder).toBeCalledWith(
      expect.objectContaining({ metadata: devDefinedMetadata }) // only developer-defined metadata
    );
  });

  it.each([
    ['FOX', protoOrders[0], paymentHandlerRequests[0]],
    ['MOUSE', protoOrders[1], paymentHandlerRequests[1]],
  ])('maps the %s order to the Webbit handler contract', async (_, order, request) => {
    const metadata = { [Header.Subreddit]: { values: ['t5_subreddit-id'] } };
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      jsonResponse({ success: true })
    );
    globalThis.fetch = fetchMock;

    await newPaymentsProcessor(paymentsConfig).FulfillOrder({ order }, metadata);

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.headers).toMatchObject({ [Header.Subreddit]: 't5_subreddit-id' });
    expect(JSON.parse(init?.body as string)).toStrictEqual(request);
  });
});

describe('configurePayments()', () => {
  const oldDevvit = globalThis.devvit;
  const oldFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.devvit = oldDevvit;
    globalThis.fetch = oldFetch;
  });

  it('registers payment RPCs with @devvit/server context', async () => {
    const provides = vi.fn();
    globalThis.devvit = { config: { provides } as unknown as Config };
    const subredditIds: (string | undefined)[] = [];
    globalThis.fetch = async () => {
      subredditIds.push(context.subredditId);
      return jsonResponse({ success: true });
    };

    configurePayments({
      products: [],
      endpoints: {
        fulfillOrder: '/internal/payments/fulfill-order',
        refundOrder: '/internal/payments/refund-order',
      },
    });

    const processor = Devvit.prototype as unknown as PaymentProcessor;
    const metadata = { [Header.Subreddit]: { values: ['t5_subreddit-id'] } };
    await processor.FulfillOrder({ order: protoOrders[0] }, metadata);
    await processor.RefundOrder({ order: protoOrders[0] }, metadata);

    expect(provides).toHaveBeenCalledWith(PaymentProcessorDefinition);
    expect(subredditIds).toStrictEqual(['t5_subreddit-id', 't5_subreddit-id']);
  });
});

type PaymentHandler = {
  fulfillOrder(
    order: PaymentHandlerRequest
  ): PaymentHandlerResponse | Promise<PaymentHandlerResponse>;
  refundOrder?(
    order: PaymentHandlerRequest
  ): PaymentHandlerResponse | Promise<PaymentHandlerResponse>;
};

function mockPaymentEndpoints(paymentHandler: PaymentHandler): void {
  globalThis.fetch = async (input, init) => {
    const order = JSON.parse(init?.body as string) as PaymentHandlerRequest;
    const response = input.toString().includes('/refund-order')
      ? await paymentHandler.refundOrder?.(order)
      : await paymentHandler.fulfillOrder(order);

    return response == null ? new Response(null) : jsonResponse(response);
  };
}

function jsonResponse(body: JsonObject): Response {
  const text = JSON.stringify(body);
  return new Response(text, {
    headers: {
      'Content-Length': `${text.length}`,
      'Content-Type': 'application/json',
    },
  });
}
