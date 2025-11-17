import { OrderStatus } from '@devvit/protos/json/devvit/payments/v1alpha/order.js';
import {
  type AcknowledgeOrderDeliveryResponse,
  type GetOrdersRequest,
  type GetOrdersResponse,
  type GetProductsRequest,
  type GetProductsResponse,
  type PaymentsService,
  PaymentsServiceDefinition,
} from '@devvit/protos/types/devvit/plugin/payments/v1alpha/payments.js';
import { context } from '@devvit/server';
import { getDevvitConfig } from '@devvit/shared-types/server/get-devvit-config.js';

type RequiredGetOrderFields = 'limit';
export type GetOrdersFilters = Partial<Omit<GetOrdersRequest, RequiredGetOrderFields>> &
  Pick<GetOrdersRequest, RequiredGetOrderFields>;

/**
 * @experimental - This is not finalized yet, may not work, and may change.
 */
export class PaymentsClient {
  #pluginCache?: PaymentsService;

  /**
   * @param filters - Filters to apply to the products query.
   * @experimental - This is not finalized yet, may not work, and may change.
   */
  getProducts(filters: Partial<GetProductsRequest> = {}): Promise<GetProductsResponse> {
    return this.#plugin.GetProducts(
      {
        // Defaults
        skus: [],
        metadata: {},
        // User provided second, overwrites above
        ...filters,
      },
      context.metadata
    );
  }

  /**
   * @param filters - Filters to apply to the orders query.
   * @experimental - This is not finalized yet, may not work, and may change.
   */
  getOrders(filters: GetOrdersFilters): Promise<GetOrdersResponse> {
    return this.#plugin.GetOrders(
      {
        // Defaults
        sku: '',
        buyer: '',
        status: OrderStatus.ORDER_STATUS_UNSPECIFIED,
        metadata: {},
        cursor: '',
        // User provided second, overwrites above
        ...filters,
      },
      context.metadata
    );
  }

  /**
   * @param orderId - The ID of the order to acknowledge delivery for.
   * @experimental - This is not finalized yet, may not work, and may change.
   */
  acknowledgeOrderDelivery(orderId: string): Promise<AcknowledgeOrderDeliveryResponse> {
    return this.#plugin.AcknowledgeOrderDelivery({ orderId }, context.metadata);
  }

  get #plugin(): PaymentsService {
    return (this.#pluginCache ??= getDevvitConfig().use(PaymentsServiceDefinition));
  }
}

/**
 * @experimental - This is not finalized yet, may not work, and may change.
 */
export const payments = new PaymentsClient();
