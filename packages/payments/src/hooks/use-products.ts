import type { GetProductsRequest } from '@devvit/protos/payments.js';
import { type Devvit, useAsync, useState } from '@devvit/public-api';
import type { Product, SKU } from '@devvit/shared-types/payments/Product.js';
import { productFromProto } from '@devvit/shared-types/payments/Product.js';

import { paymentsPlugin } from '../plugin.js';
import type { AsyncHookResult } from './hook-types.js';

type GetProductsOptions = Readonly<{
  /** start time filter */
  skus?: SKU[];
  /** metadata to filter on. these values are combined via AND */
  metadata?: { [key: string]: string };
}>;

export async function getProducts(opts: GetProductsOptions = {}): Promise<Product[]> {
  const request: GetProductsRequest = {
    skus: opts.skus || [],
    metadata: opts.metadata || {},
  };

  return (await paymentsPlugin.GetProducts(request)).products.map(productFromProto);
}

export type UseProductsResult = AsyncHookResult<{
  products: Product[];
  refetch: () => Promise<void>;
}>;

export function useProducts(
  _ctx: Devvit.Context,
  opts: GetProductsOptions = {}
): UseProductsResult {
  // internal state used to trigger refetch
  const [refetchBit, setRefetchBit] = useState(0);
  const { loading, data, error } = useAsync(async () => getProducts(opts), {
    depends: refetchBit,
  });

  const products: Product[] = data ?? [];
  const refetch = async (): Promise<void> => {
    setRefetchBit((b) => ~b); // flip bit to trigger callback execution
  };

  const base = {
    products,
    refetch,
  };

  if (loading) {
    return {
      ...base,
      loading: true,
      error: null,
    };
  }

  if (error != null) {
    return {
      ...base,
      loading: false,
      error,
    };
  }

  return {
    ...base,
    loading: false,
    error: null,
  };
}
