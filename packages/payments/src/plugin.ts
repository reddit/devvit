// eslint-disable-next-line no-restricted-imports
import {
  type PaymentsService,
  PaymentsServiceDefinition,
} from '@devvit/protos/types/devvit/plugin/payments/v1alpha/payments.js';
// eslint-disable-next-line no-restricted-imports
import { Devvit } from '@devvit/public-api';

import { paymentHelpMenuItem } from './paymentHelpMenuItem.js';

/** @internal */
export const paymentsPlugin: PaymentsService = Devvit.use(PaymentsServiceDefinition);

Devvit.addMenuItem(paymentHelpMenuItem);
