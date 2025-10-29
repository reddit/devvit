import './index.js';

import { paymentsPlugin } from './plugin.js';

test('paymentsPlugin is available when imported', () => {
  expect(paymentsPlugin).toBeDefined();
});
