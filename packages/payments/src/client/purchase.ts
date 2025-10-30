import type { OrderResultEvent } from '@devvit/protos/json/devvit/ui/effect_types/v1alpha/create_order.js';
import { EffectType } from '@devvit/protos/json/devvit/ui/effects/v1alpha/effect.js';
import { emitEffect } from '@devvit/shared-types/client/emit-effect.js';

/**
 * Initiates a purchase for one or more products.
 *
 * @param skuOrSkus - The SKU, or an array of SKUs, to purchase
 * @param metadata - Optional, custom metadata attached to this purchase
 */
export async function purchase(
  skuOrSkus: string | string[],
  metadata?: { [key: string]: string }
): Promise<OrderResultEvent> {
  const id = crypto.randomUUID();
  const skus = typeof skuOrSkus === 'string' ? [skuOrSkus] : skuOrSkus;

  const resp = await emitEffect({
    createOrder: {
      id,
      skus,
      metadata: metadata ?? {},
    },
    type: EffectType.EFFECT_CREATE_ORDER,
  });
  if (!resp) {
    throw new Error(`Purchase didn't resolve correctly, got no response!`);
  }

  const result = resp.orderResult;
  if (!result) {
    throw new Error(`Purchase didn't resolve correctly, had no order result in the response!`);
  }

  return result;
}
