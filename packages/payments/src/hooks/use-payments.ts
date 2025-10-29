import { EffectType } from '@devvit/protos/types/devvit/ui/effects/v1alpha/effect.js';
import type { UIEvent } from '@devvit/protos/types/devvit/ui/events/v1alpha/event.js';
import { registerHook } from '@devvit/public-api/devvit/internals/blocks/handler/BlocksHandler.js';
import type { RenderContext } from '@devvit/public-api/devvit/internals/blocks/handler/RenderContext.js';
import type { Hook, HookParams } from '@devvit/public-api/devvit/internals/blocks/handler/types.js';
import { Header } from '@devvit/shared-types/Header.js';
import type { JsonValue } from '@devvit/shared-types/json.js';

import type { OnPurchaseResultHandler, OrderMetadata } from './hook-types.js';
import { orderStatusProtoToHook } from './hook-types.js';

export type UsePayments = {
  /**
   * Initiate a purchase flow for a single SKU
   *
   * @param sku The product to purchase
   * @param meta Additional metadata to attach to the order receipt
   */
  purchase(sku: string, meta?: OrderMetadata): void;
};

class UsePaymentsHook implements Hook, UsePayments {
  readonly #context: RenderContext;
  readonly #callback: OnPurchaseResultHandler;
  readonly #debug: boolean;

  readonly hookId: string;

  state: JsonValue = {};

  constructor(callback: OnPurchaseResultHandler, params: HookParams) {
    this.#debug = !!params.context._devvitContext?.debug.payments;
    this.#context = params.context;
    this.#callback = callback;

    this.hookId = params.hookId;

    this.#debugLog(`usePurchase hook created (${this.hookId})`);
  }

  async onUIEvent(event: UIEvent): Promise<void> {
    if (event.orderResult && event.hook === this.hookId) {
      this.#debugLog(
        `Received an order result: hookId: ${this.hookId}; Status: ${event.orderResult.status}; Order ID: ${event.orderResult.orderId}; Error Code: ${event.orderResult.errorCode}; Error Message: ${event.orderResult.errorMessage}`
      );
      const { status, errorCode, errorMessage, order, orderId } = event.orderResult;
      if (!order) {
        throw new Error('Invalid response: missing original order');
      }
      await this.#callback({
        status: orderStatusProtoToHook(status),
        errorCode,
        errorMessage,
        orderId,
        sku: order.skus[0],
        metadata: order.metadata,
      });
    }
  }

  purchase(sku: string, metadata: OrderMetadata = {}): void {
    if (!sku.trim()) {
      throw new Error('Invalid purchase; no SKU provided');
    }

    this.#debugLog(`Requesting a purchase for product: ${sku}`);

    // inject post id into metadata to be read by the order handler
    const devvitMetadata: OrderMetadata = {
      [Header.Post]: this.#context._devvitContext?.postId ?? '',
    };

    this.#context.emitEffect('createOrder', {
      type: EffectType.EFFECT_CREATE_ORDER,
      createOrder: {
        id: this.hookId,
        skus: [sku],
        metadata: {
          ...metadata,
          ...devvitMetadata,
        },
      },
    });
  }

  #debugLog = (msg: string): void => {
    if (this.#debug) {
      console.debug(`[payments] ${msg}`);
    }
  };
}

/**
 * Creates a reusable hook to trigger purchases in an app and handle
 * the results in a single callback
 *
 * @param callback A function to call when a purchase flow is completed
 */
export function usePayments(callback: OnPurchaseResultHandler): UsePayments {
  return registerHook({
    namespace: 'payments',
    initializer: (params) => new UsePaymentsHook(callback, params),
  });
}
