# Migrate Blocks Payments

If you already have payments set up on a Blocks app, use the following steps to migrate your payments functionality.

1. Update devvit.json

Reference your `products.json` and declare endpoints.

```tsx title="devvit.json"
{
  "permissions": { "payments": true },
  "payments": {
    "productsFile": "./products.json",
    "endpoints": {
      "fulfillOrder": "/internal/payments/fulfill",
      "refundOrder": "/internal/payments/refund"
    }
  }
}

```

2. Replace payment hooks with endpoints

- Blocks: `addPaymentHandler({ fulfillOrder, refundOrder })`
- Devvit Web: implement `/internal/payments/fulfill` and `/internal/payments/refund`

```tsx
import type { PaymentHandlerResponse } from '@devvit/web/server';

router.post('/internal/payments/fulfill', async (req, res) => {
  // migrate your old fulfillOrder logic here
  res.json({ success: true } satisfies PaymentHandlerResponse);
});
```

3. Update client purchase calls

- Blocks: `usePayments().purchase(sku)`
- Devvit Web: `purchase(sku)` from`@devvit/web/client`

4. Update products and orders APIs

- Blocks: `useProducts`, `useOrders`
- Devvit Web: server‑side `payments.getProducts()`, `payments.getOrders()`; expose via `/api/` if needed by the client
