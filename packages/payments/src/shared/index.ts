import { addPaymentHandler as _addPaymentHandler } from '../paymentHandler.js';

export * from '../paymentHelpMenuItem.js';
export type { Order } from '@devvit/protos/json/devvit/payments/v1alpha/order.js';
export type { Product } from '@devvit/protos/json/devvit/payments/v1alpha/product.js';
export type { PageInfo } from '@devvit/protos/json/devvit/plugin/payments/v1alpha/payments.js';

/** @internal For `blocks.template.tsx`. */
export const addPaymentHandler = _addPaymentHandler;
