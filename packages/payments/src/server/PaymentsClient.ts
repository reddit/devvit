import { OrderStatus } from '@devvit/protos/json/devvit/payments/v1alpha/order.js';
import type {
  AcknowledgeOrderDeliveryResponse,
  GetOrdersRequest,
  GetOrdersResponse,
  GetProductsRequest,
  GetProductsResponse,
} from '@devvit/protos/json/devvit/plugin/payments/v1alpha/payments.js';
import {
  type PaymentsService,
  PaymentsServiceDefinition,
} from '@devvit/protos/types/devvit/plugin/payments/v1alpha/payments.js';
import { context } from '@devvit/server';
import type { Prettify } from '@devvit/shared-types/Prettify.js';
import { getDevvitConfig } from '@devvit/shared-types/server/get-devvit-config.js';

type RequiredGetOrderFields = 'limit';
export type GetOrdersFilters = Prettify<
  Partial<Omit<GetOrdersRequest, RequiredGetOrderFields>> &
    Pick<GetOrdersRequest, RequiredGetOrderFields>
>;

/**
 * @experimental - This is not finalized yet, may not work, and may change.
 */
export class PaymentsClient {
  /**
   * @param filters - Filters to apply to the products query.
   * @experimental - This is not finalized yet, may not work, and may change.
   */
  getProducts(filters: Readonly<Partial<GetProductsRequest>> = {}): Promise<GetProductsResponse> {
    return this.#plugin.GetProducts(
      { metadata: filters.metadata ?? {}, skus: filters.skus ?? [] },
      context.metadata
    );
  }

  /**
   * @param filters - Filters to apply to the orders query.
   * @experimental - This is not finalized yet, may not work, and may change.
   */
  async getOrders(filters: Readonly<GetOrdersFilters>): Promise<GetOrdersResponse> {
    const orders = await this.#plugin.GetOrders(
      {
        metadata: filters.metadata ?? {},
        start: filters.start ? new Date(filters.start) : undefined,
        end: filters.end ? new Date(filters.end) : undefined,
        sku: filters.sku ?? '',
        buyer: filters.buyer ?? '',
        status: filters.status ?? OrderStatus.ORDER_STATUS_UNSPECIFIED,
        cursor: filters.cursor ?? '',
        limit: filters.limit,
      },
      context.metadata
    );
    // Convert the hydrated old Protobuf to JSON. Don't use
    // Protobuf.toJSON() which would omit default values.
    return JSON.parse(JSON.stringify(orders));
  }

  /**
   * @param orderId - The ID of the order to acknowledge delivery for.
   * @experimental - This is not finalized yet, may not work, and may change.
   */
  acknowledgeOrderDelivery(orderId: string): Promise<AcknowledgeOrderDeliveryResponse> {
    return this.#plugin.AcknowledgeOrderDelivery({ orderId }, context.metadata);
  }

  get #plugin(): PaymentsService {
    return getDevvitConfig().use(PaymentsServiceDefinition);
  }
}
