import { Header } from '@devvit/shared-types/Header.js';
import { describe, it } from 'vitest';

import { protoOrders } from './hooks/use-orders.mock.js';
import { makeWrappedHandler, type PaymentHandler } from './paymentHandler.js';

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
