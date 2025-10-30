/**
 * @file This file is used by ESBuildPack's `onResolve` callback as the entrypoint to register an app's products.json
 * as a watched file. This pattern works because the @devvit/payments package only exports `dist/index.js`,
 * so we can assume that usage of this package will always go through this index.ts code path.
 * @see @devvit/payments/package.json's exports configuration.
 * @see @devvit/build-pack/src/esbuild/ESBuildPack.ts
 */

// Types
export type { Order, OrderStatus } from '@devvit/shared-types/payments/Order.js';
export type { Product } from '@devvit/shared-types/payments/Product.js';

// API
export {
  type OnPurchaseResult,
  type OnPurchaseResultHandler,
  OrderResultStatus,
} from './hooks/hook-types.js';
export { getOrders, useOrders } from './hooks/use-orders.js';
export { usePayments } from './hooks/use-payments.js';
export { getProducts, useProducts } from './hooks/use-products.js';
export {
  addPaymentHandler,
  type PaymentHandler,
  type PaymentHandlerResponse,
} from './paymentHandler.js';

// Initialize plugin
// This import has the side effect of configuring Devvit and setting up
// the plugin for use in the app.
import './plugin.js';
