import { type PaymentsService, PaymentsServiceDefinition } from '@devvit/protos/payments.js';
import { Devvit } from '@devvit/public-api';

import { paymentHelpMenuItem } from './paymentHelpMenuItem.js';

/** @internal */
export const paymentsPlugin: PaymentsService = Devvit.use(PaymentsServiceDefinition);

Devvit.addMenuItem(paymentHelpMenuItem);
