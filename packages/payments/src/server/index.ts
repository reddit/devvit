import { PaymentsClient } from './PaymentsClient.js';

export type { PaymentHandlerResponse } from '../shared/index.js';
export { type PaymentsClient };

/**
 * @experimental - This is not finalized yet, may not work, and may change.
 */
export const payments = new PaymentsClient();
