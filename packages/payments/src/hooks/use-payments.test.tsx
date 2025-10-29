import { UIEventScope } from '@devvit/protos';
import { OrderResultStatus } from '@devvit/protos/types/devvit/ui/effect_types/v1alpha/create_order.js';
import { Devvit } from '@devvit/public-api';
import { BlocksHandler } from '@devvit/public-api/devvit/internals/blocks/handler/BlocksHandler.js';
import { captureHookRef } from '@devvit/public-api/devvit/internals/blocks/handler/refs.js';
import type { HookRef } from '@devvit/public-api/devvit/internals/blocks/handler/types.js';
import { Header } from '@devvit/shared-types/Header.js';
import { expect } from 'vitest';

import { usePayments } from './use-payments.js';

const meta = {
  [Header.AppUser]: {
    values: ['t2_appuser'],
  },
  [Header.Subreddit]: {
    values: ['t5_devvit'],
  },
  [Header.App]: {
    values: ['app'],
  },
  [Header.Installation]: {
    values: ['install'],
  },
};

const orderRef: HookRef = {};

describe('usePayments hook', () => {
  test('An empty product SKU will produce an error', async () => {
    const Component = (): JSX.Element => {
      const order = captureHookRef(
        usePayments(() => {}),
        orderRef
      );
      order.purchase('   ');
      return <vstack />;
    };
    const handler = new BlocksHandler(Component);
    await expect(handler.handle({ events: [] }, meta)).rejects.toThrow(
      'Invalid purchase; no SKU provided'
    );
  });

  test('Completing a purchase triggers the callback', async () => {
    const callback = vi.fn();
    const Component = (): JSX.Element => {
      const order = captureHookRef(usePayments(callback), orderRef);
      order.purchase('sku');
      return <vstack />;
    };
    const handler = new BlocksHandler(Component);
    await handler.handle({ events: [] }, meta);
    await handler.handle(
      {
        events: [
          {
            scope: UIEventScope.ALL,
            orderResult: {
              orderId: 'foo',
              status: OrderResultStatus.STATUS_SUCCESS,
              order: { id: orderRef.id!, skus: ['sku'], metadata: {} },
            },
            hook: orderRef.id,
          },
        ],
      },
      meta
    );

    expect(callback).toHaveBeenCalled();
  });

  test('Callback receives the SKU and metadata provided to purchase', async () => {
    const callback = vi.fn();
    const Component = (): JSX.Element => {
      const order = captureHookRef(usePayments(callback), orderRef);
      order.purchase('sku', { foo: 'bar' });
      return <vstack />;
    };
    const handler = new BlocksHandler(Component);
    await handler.handle({ events: [] }, meta);
    await handler.handle(
      {
        events: [
          {
            scope: UIEventScope.ALL,
            orderResult: {
              orderId: 'foo',
              status: OrderResultStatus.STATUS_SUCCESS,
              order: { id: orderRef.id!, skus: ['sku'], metadata: { foo: 'bar' } },
            },
            hook: orderRef.id,
          },
        ],
      },
      meta
    );

    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith({
      sku: 'sku',
      metadata: { foo: 'bar' },
      status: OrderResultStatus.STATUS_SUCCESS,
      orderId: 'foo',
    });
  });
});
