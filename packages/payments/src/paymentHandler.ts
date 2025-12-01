import type { Metadata } from '@devvit/protos/lib/Types.js';
import type {
  FulfillOrderRequest,
  FulfillOrderResponse,
  Order as ProtoOrder,
  PaymentProcessor,
  RefundOrderRequest,
  RefundOrderResponse,
} from '@devvit/protos/payments.js';
import { PaymentProcessorDefinition } from '@devvit/protos/payments.js';
import { Devvit, type TriggerContext } from '@devvit/public-api';
import { makeAPIClients } from '@devvit/public-api/apis/makeAPIClients.js';
import { getContextFromMetadata } from '@devvit/public-api/devvit/internals/context.js';
import { Header } from '@devvit/shared-types/Header.js';
import { type Order, orderFromProto } from '@devvit/shared-types/payments/Order.js';

export type PaymentHandlerResponse = void | { success: true } | { success: false; reason?: string };

export type PaymentHandler = {
  fulfillOrder(
    order: Order,
    ctx: TriggerContext
  ): PaymentHandlerResponse | Promise<PaymentHandlerResponse>;
  refundOrder?(order: Order, ctx: TriggerContext): void | Promise<void>;
};

// The typed for this are copied over into `packages/build-pack/src/esbuild/templatizer/blocks.template.tsx`
// to avoid exposing the unnecessary internal-only function to Webbit users. If you change this here,
// change it there too.
export function addPaymentHandler(paymentHandler: PaymentHandler): void {
  Devvit.provide(PaymentProcessorDefinition);
  Object.assign(Devvit.prototype, makeWrappedHandler(paymentHandler));
}

export function makeWrappedHandler(userDefinedHandler: PaymentHandler): PaymentProcessor {
  return {
    async FulfillOrder(req: FulfillOrderRequest, md: Metadata): Promise<FulfillOrderResponse> {
      if (req.order == null || req.order.products.length === 0) {
        return {};
      }

      const context = Object.assign(
        makeAPIClients({ metadata: md }),
        getContextFromMetadata(md, req.order.metadata[Header.Post])
      );

      const order = mapOrder(req.order);
      const response = await userDefinedHandler.fulfillOrder(order, context);

      if (!response || response.success) {
        return { acknowledged: true };
      } else {
        return { rejectionReason: response.reason };
      }
    },
    async RefundOrder(req: RefundOrderRequest, md: Metadata): Promise<RefundOrderResponse> {
      if (req.order == null || !userDefinedHandler.refundOrder) {
        return {};
      }

      const context = Object.assign(makeAPIClients({ metadata: md }), getContextFromMetadata(md));
      const order = mapOrder(req.order);
      await userDefinedHandler.refundOrder(order, context);
      return {};
    },
  };
}

// A utility mapper function that maps between the Order protobuf message and the Order type
// it also does some basic order validation (e.g. ensuring there is exactly one product)
function mapOrder(order: ProtoOrder): Order {
  const outOrder = orderFromProto(order);
  if (outOrder.products.length > 1) {
    throw new Error('Multi-product orders not supported');
  }
  if (outOrder.products.length === 0) {
    throw new Error('No products in order');
  }

  return outOrder;
}
