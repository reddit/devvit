import type { GetOrdersRequest } from '@devvit/protos/payments.js';
import { type Devvit, useAsync, useState } from '@devvit/public-api';
import type { Order } from '@devvit/shared-types/payments/Order.js';
import { orderFromProto } from '@devvit/shared-types/payments/Order.js';

import { paymentsPlugin } from '../plugin.js';
import type { AsyncHookResult } from './hook-types.js';

type GetOrdersOptions = Readonly<{
  /** number of items to return */
  limit?: number;
  /** next page cursor to return */
  nextPageToken?: string;
}>;

export type GetOrdersReturn = { orders: Order[]; nextPage?: string };

export async function getOrders(opts: GetOrdersOptions = {}): Promise<Readonly<GetOrdersReturn>> {
  const request: GetOrdersRequest = {
    sku: '',
    buyer: '',
    metadata: {},
    status: 0,
    ...opts,
    limit: opts.limit || 100,
    cursor: opts.nextPageToken || '',
  };

  const ordersResponse = await paymentsPlugin.GetOrders(request);

  const ordersOut: GetOrdersReturn = {
    orders: ordersResponse.orders.map(orderFromProto),
  };

  if (ordersResponse.pageInfo?.hasNextPage) {
    ordersOut.nextPage = ordersResponse.pageInfo?.endCursor;
  }

  return ordersOut;
}

type OrderJSON = Omit<Order, 'createdAt' | 'updatedAt'> & {
  createdAt: string | null;
  updatedAt: string | null;
};

function orderToJSON(order: Order): OrderJSON {
  return {
    ...order,
    createdAt: order.createdAt?.toISOString() ?? null,
    updatedAt: order.updatedAt?.toISOString() ?? null,
  };
}

function orderFromJSON(order: OrderJSON): Order {
  return {
    ...order,
    createdAt: order.createdAt ? new Date(order.createdAt) : null,
    updatedAt: order.updatedAt ? new Date(order.updatedAt) : null,
  };
}

export type UseOrdersResult = AsyncHookResult<{
  orders: Order[];
  nextPage?: () => Promise<void>;
}>;

type OrdersPaginationState = {
  orders: OrderJSON[];
  nextPageToken: string;
};

export function useOrders(_ctx: Devvit.Context, opts: GetOrdersOptions = {}): UseOrdersResult {
  const [pageToken, setPageToken] = useState<string>(opts.nextPageToken ?? '');
  const { loading, data, error } = useAsync<OrdersPaginationState>(
    async () => {
      const fetchRes = await getOrders({ ...opts, nextPageToken: pageToken });
      return {
        orders: fetchRes.orders.map(orderToJSON),
        nextPageToken: fetchRes.nextPage || '',
      };
    },
    {
      depends: pageToken,
    }
  );

  let base = {
    orders: (data?.orders ?? []).map(orderFromJSON),
  };
  if (data?.nextPageToken) {
    base = Object.assign(base, {
      nextPage: async () => {
        setPageToken(data?.nextPageToken);
      },
    });
  }

  if (loading) {
    return {
      ...base,
      loading: true,
      error: null,
    };
  }

  if (error) {
    return {
      ...base,
      loading,
      error,
    };
  }

  return {
    ...base,
    loading,
    error: null,
  };
}
