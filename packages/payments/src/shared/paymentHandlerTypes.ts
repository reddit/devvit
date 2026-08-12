/** The lifecycle status included in a payment handler request. */
export type PaymentHandlerOrderStatus =
  /** The order is new. */
  | 'NEW'
  /** The order has been created. */
  | 'CREATED'
  /** Payment for the order has completed. */
  | 'PAID'
  /** The purchased product has been delivered. */
  | 'DELIVERED'
  /** The order has been canceled. */
  | 'CANCELED'
  /** The delivered order has been reverted or refunded. */
  | 'REVERTED'
  /** The platform supplied an unknown or unspecified status. */
  | 'UNRECOGNIZED';

/** The product accounting type included in a payment handler request. */
export type PaymentHandlerAccountingType =
  /** The product is used immediately when purchased. */
  | 'INSTANT'
  /** The product grants access indefinitely. */
  | 'DURABLE'
  /** The product can be used later and is removed after it is consumed. */
  | 'CONSUMABLE'
  /** The product remains valid for one day after purchase. */
  | 'VALID_FOR_1D'
  /** The product remains valid for seven days after purchase. */
  | 'VALID_FOR_7D'
  /** The product remains valid for thirty days after purchase. */
  | 'VALID_FOR_30D'
  /** The product remains valid for one year after purchase. */
  | 'VALID_FOR_1Y'
  /** The platform supplied an unknown or unspecified accounting type. */
  | 'UNRECOGNIZED';

/** A product included in a payment handler request. */
export type PaymentHandlerProduct = {
  /** The developer-defined stock keeping unit that uniquely identifies the product. */
  sku: string;
  /** The product price in Reddit Gold. */
  price: number;
  /** The human-readable product name. */
  displayName: string;
  /** How the product is consumed or how long it remains valid. */
  accountingType: PaymentHandlerAccountingType;
  /** The human-readable product description. */
  description?: string;
  /** Developer-defined product metadata. */
  metadata?: Readonly<Record<string, string>>;
  /** Images configured for the product. */
  images?: {
    /** The product icon's filename relative to the app's assets directory. */
    icon: string;
  };
};

/** The JSON body sent to a payment fulfillment or refund handler endpoint. */
export type PaymentHandlerRequest = {
  /** Unique identifier for the order. */
  id: string;
  /** Where the order is in its lifecycle. */
  status: PaymentHandlerOrderStatus;
  /** When the order was created, as an ISO 8601 timestamp. */
  createdAt: string | null;
  /** When the order was last updated, as an ISO 8601 timestamp. */
  updatedAt: string | null;
  /** The products that were ordered. */
  products: PaymentHandlerProduct[];
  /** Developer-defined order metadata. */
  metadata: Readonly<Record<string, string>>;
};

/**
 * The JSON body returned by a payment fulfillment or refund handler endpoint.
 * Refund response contents are ignored. An empty response remains supported for
 * compatibility.
 */
export type PaymentHandlerResponse = void | { success: true } | { success: false; reason?: string };
