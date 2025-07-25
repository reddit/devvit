# Manage payments

Once your app and products have been approved, you’re ready to use Reddit’s production payments system. Real payments will be triggered automatically when invoked from approved app versions. No code changes are required.

## Check orders

Reddit keeps track of historical purchases and lets you query user purchases.

Orders are returned in reverse chronological order and can be filtered based on user, product, success state, or other attributes.

**Example**

```tsx
import { useOrders, OrderStatus } from '@devvit/payments';

export function CosmicSwordShop(context: Devvit.Context): JSX.Element {
  const { orders } = useOrders(context, {
    sku: 'cosmic_sword',
  });

  // if the user hasn’t already bought the cosmic sword
  // then show them the purchase button
  if (orders.length > 0) {
    return <text>Purchased!</text>;
  } else {
    return <button onPress={/* Trigger purchase */}>Buy Cosmic Sword</button>;
  }
}
```

## Update products

Once your app is in production, existing installations will need to be manually updated via the admin tool if you release a new version. Contact the Developer Platform team if you need to update your app installation versions.

Automatic updates will be supported in a future release.

## Issue a refund

Reddit may reverse transactions under certain circumstances, such as card disputes, policy violations, or technical issues. If there’s a problem with a digital good, a user can submit a request for a refund via [Reddit Help](https://support.reddithelp.com/hc/en-us/requests/new?ticket_form_id=29770197409428).

When a transaction is reversed for any reason, you may optionally revoke product functionality from the user by adding a `refundOrder` handler.

**Example**

```tsx
addPaymentHandler({
  fulfillOrder: async (order: Order, ctx: Context) => {
    // Snip order fulfillment
  },
  refundOrder: async (order: Order, ctx: Context) => {
    // check if the order contains an extra life
    if (order.products.some(({ sku }) => sku === GOD_MODE_SKU)) {
      // redis key for storing number of lives user has left
      const livesKey = `${ctx.userId}:lives`;

      // if so, decrement the number of lives
      await ctx.redis.incrBy(livesKey, -1);
    }
  },
});
```

## Payments help

When you enable payments, a **Get Payments Help** menu item is automatically added to the three dot menu in your app. This connects the user to [Reddit Help](https://support.reddithelp.com/hc/en-us/requests/new?ticket_form_id=29770197409428) for assistance.
