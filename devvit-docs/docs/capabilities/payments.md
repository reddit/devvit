# Payments

Add products to your app and get paid for what you sell. The payments plugin lets you prompt users to buy premium features for your app, such as additional lives in a game or custom flair.

:::note
Payments is a beta feature that is only available to developers in our Developer Payments Pilot Program.  
:::

## Prerequisites

Before you can develop and playtest your payments-based app, you will need to provide a few details in our [enrollment form](https://forms.gle/TuTV5jbUwFKTcerUA).

In addition, you'll need to do a few things before you can publish your app and sell products:

- Verify you meet the [eligibility criteria](https://support.reddithelp.com/hc/en-us/articles/30641905617428-Developer-Program#h_01J8GCHXEG24ZNR5EZZ9SPN48S).
- Complete the [verification process](https://www.reddit.com/contributor-program).
- Ensure you’re on devvit@0.11.3. See the [quickstart](https://developers.reddit.com/docs/next/quickstart) to get up and running.
- Accept and comply with our [Earn Terms](https://redditinc.com/policies/earn-terms) and [Earn Policy](https://www.redditinc.com/policies/earn-policy).

## How it works

### Add products

You can build things like in-game items, additional lives, or exclusive features into your app.

![Sample payment app screen](../assets/payments_example.png)

Products are tied to app versions. This means if you create a product in version 2.0 of your app and change the product in version 2.1, the 2.0 product will still be available in subreddits that use version 2.0 of your app.

:::note
All products will be reviewed by the Developer Platform team to ensure compliance with our content policy. Products are approved during the [app review process](../publishing.md) after you publish your app.
:::

### Set the price

You’ll set the price of the products in your app in Reddit [gold](https://support.reddithelp.com/hc/en-us/articles/17331548463764-What-is-gold-and-how-do-I-use-it). Users will use gold to acquire the items, and an equivalent amount of gold will accumulate in your app account.

Information about payouts is located [here](https://support.reddithelp.com/hc/en-us/articles/30641905617428-Developer-Program#h_01J8GCHXEG24ZNR5EZZ9SPN48S).

## Add payments to your app

You can build your app with a template by running:

```bash
devvit new --template=payments
```

Run the following command to add payments to your app.

```bash
npm install @devvit/payments@next
```

### Register products

Register products in the src/products.json file in your local app. The JSON schema for the file format is available at https://developers.reddit.com/schema/products.json.

Each product in the products field has the following attributes:
| **Attribute** | **Description** |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sku` | A product identifier that can be used to group orders or organize your products. Each sku must be unique for each product in your app. |
| `displayName` | The official name of the product that is displayed in purchase confirmation screens. The name must be fewer than 50 characters, including spaces. |
| `description` | A text string that describes the product and is displayed in purchase confirmation screens. The description must be fewer than 150 characters, including spaces. |
| `price` | An predefined integer that sets the product price in Reddit gold. See details below. |
| `image.icon` | **(optional)** The path to the icon that represents your product in your [assets](../app_image_assets) folder. |
| `metadata` | **(optional)** An optional object that contains additional attributes you want to use to group and filter products. Keys and values must be alphanumeric (a - Z, 0 - 9, and - ) and contain 30 characters or less. You can add up to 10 metadata keys. |
| `accountingType` | Categories for how buyers consume your products. Possible values are:

- “INSTANT” for purchased items that are used immediately and disappear.
- “DURABLE” for purchased items that are permanently applied to the account and can be used any number of times
- “CONSUMABLE” for items that are used over a period of time. Use a “VALID*FOR*" value to indicate the length of time the item is available. |

Registered products are updated every time an app is uploaded, including when you use [Devvit playtest](../playtest).

:::note
Actual payments will not be processed until your products are approved. While your app is under development, you can use sandbox payments to [simulate purchases](#simulate-purchases).
:::

### Price products

Product prices are predefined and must be one of the following gold values:

- 5 gold ($0.10)
- 25 gold ($0.50)
- 50 gold ($1)
- 100 gold ($2)
- 150 gold ($3)
- 250 gold ($5)
- 500 gold ($10)
- 1000 gold ($20)
- 2500 gold ($50)

### Add an image

Product images need to meet the following requirements:

- Minimum size: 256x256
- Supported file type: .png

If you don’t provide an image, the default Reddit product image is used.

![default image](../assets/default_product_image.png)

**Example**

```json
{
  "$schema": "https://developers.reddit.com/schema/products.json",
  "products": [
    {
      "sku": "god_mode",
      "displayName": "God mode",
      "description": "God mode gives you superpowers (in theory)",
      "price": 25,
      "images": {
        "icon": "assets/products/extra_life_icon.png"
      },
      "metadata": {
        "category": "powerup"
      },
      "accountingType": "CONSUMABLE"
    }
  ]
}
```

### Complete the payment flow

Use `addPaymentHandler` to specify the function that is called during the order flow. This customizes how your app fulfills product orders and provides the ability for you to reject an order.

Errors thrown within the payment handler automatically reject the order. To provide a custom error message to the frontend of your application, you can return {success: false, reason: <string>} with a reason for the order rejection.

This example shows how to issue an "extra life" to a user when they purchase the "extra_life" product.

```ts
import { type Context } from '@devvit/public-api';
import { addPaymentHandler } from '@devvit/payments';
import { Devvit, useState } from '@devvit/public-api';

Devvit.configure({
  redis: true,
  redditAPI: true,
});

const GOD_MODE_SKU = 'god_mode';

addPaymentHandler({
  fulfillOrder: async (order, ctx) => {
    if (!order.products.some(({ sku }) => sku === GOD_MODE_SKU)) {
      throw new Error('Unable to fulfill order: sku not found');
    }
    if (order.status !== 'PAID') {
      throw new Error('Becoming a god has a cost (in Reddit Gold)');
    }

    const redisKey = godModeRedisKey(ctx.postId, ctx.userId);
    await ctx.redis.set(redisKey, 'true');
  },
});
```

## Implement payments

The frontend and backend of your app coordinate order processing.

![Order workflow diagram](../assets/payments_order_flow_diagram.png)

To launch the payment flow, create a hook with `usePayments()` followed by `hook.purchase()` to initiate the purchase from the frontend.

This triggers a native payment flow on all platforms (web, iOS, Android) that works with the Reddit backend to process the order. The `fulfillOrder()` hook calls your app during this process.

Your app can acknowledge or reject the order. For example, for goods with limited quantities, your app may reject an order once the product is sold out.

### Get your product details

Use the `useProducts` hook or `getProducts` function to fetch details about products.

```tsx
import { useProducts } from '@devvit/payments';

export function ProductsList(context: Devvit.Context): JSX.Element {
  const { products } = useProducts(context, {});

  return (
    <vstack>
      {products.map((product) => (
        <hstack>
          <text>{product.name}</text>
          <text>{product.price}</text>
        </hstack>
      ))}
    </vstack>
  );
}
```

You can also fetch all products using custom-defined metadata or by an array of skus. Only one is required; if you provide both then they will be AND’d.

```tsx
import { getProducts } from '@devvit/payments';
const products = await getProducts({,
});
```

### Initiate orders

Provide the product sku to trigger a purchase. This automatically populates the most recently-approved product metadata for that product id.

**Example**

```tsx
import { usePayments } from '@devvit/payments';

// handles purchase results
const payments = usePayments((result: OnPurchaseResult) => { console.log('Tried to buy:', result.sku, '; result:', result.success); });

// for each sku in products:
<button onPress{payments.purchase(sku)}>Buy a {sku}</button>
```

## Test your app

Use the payments sandbox environment to simulate payment transactions. All apps automatically start in the payments sandbox.

### Start a playtest

To test your app:

1. Run `devvit upload` to upload your app to the Apps directory.
2. Run `devvit playtest` <test-subreddit-name> .

Once you start a playtest session, a new pre-release version of your app is automatically created and installed on your test subreddit. The pre-release version has a fourth decimal place, so if your current app is 0.0.1, the first pre-release version will be 0.0.1.1.

The pre-release version is updated and uploaded to your test subreddit every time you save your app code. You’ll need to refresh your subreddit to see the updated app. This may take a couple of seconds, so be patient.

### Simulate purchases

In your test subreddit, you can make simulated purchases to test your app. No gold deducted in this state.

![Sample payment simulation](../assets/payment_simulation.png)

To end your playtest, press CTRL + C in the terminal session where you started it.

## Submit your app for approval

The Developer Platform team reviews and approves apps and their products before products can be sold.

To submit your app:

1. Run `devvit publish`.
2. Select how you want your app to appear in the Apps directory:

- **Unlisted** means that the app is only visible to you in the directory, and you can install your app on larger subreddits that you moderate.
- **Public** means that your app is visible to all users in the Apps directory and can be installed by mods and admins across Reddit.

:::note
You can change your app visibility at any time. See [publishing an app](publishing.md) for details.
:::

### Ineligible products

Any apps or products for which you wish to enable payments must comply with our [Earn Policy](http://redditinc.com/policies/earn-policy) and [Devvit Guidelines](https://developers.reddit.com/docs/guidelines).

## Accept real payments

Once your app and products have been approved, you’re ready to use Reddit’s production payments system. Real payments will be triggered automatically when invoked from approved app versions. No code changes are required.

### Check orders

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

### Update products

Once your app is in production, existing installations will need to be manually updated via the admin tool if you release a new version. Contact the Developer Platform team if you need to update your app installation versions.

Automatic updates will be supported in a future release.

### Payments help

When you enable payments, a **Get Payments Help** menu item is automatically added to the three dot menu in your app. This connects the user to [Reddit Help](https://support.reddithelp.com/hc/en-us/requests/new?ticket_form_id=29770197409428) for assistance.

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

## Features coming soon

- Removing a product
- Limits and quotas
