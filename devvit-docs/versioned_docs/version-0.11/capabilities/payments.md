# Payments

Add products to your app and get paid for what you sell. The payments plugin lets you prompt users to buy premium features for your app, such as additional lives in a game or custom flair.

:::note
Payments is a beta feature that is only available to developers in our Developer Payments Pilot Program.  
:::

## Prerequisites

You can develop and playtest your payments-based app immediately, but you'll need to do a few things before you can publish your app and sell products:

- Join the [Reddit Developer Program](https://support.reddithelp.com/hc/en-us/articles/30641905617428-Developer-Program). This program:

  - guides you through the [eligibility criteria](https://support.reddithelp.com/hc/en-us/articles/30641905617428-Developer-Program#h_01J8GCHXEG24ZNR5EZZ9SPN48S)
  - provides links to Reddit’s [Earn Terms](https://redditinc.com/policies/earn-terms) and [Earn Policy](https://www.redditinc.com/policies/earn-policy) (you’ll need to agree and comply with all terms and conditions)
  - directs you to the contributors [verification process](https://support.reddithelp.com/hc/en-us/articles/17331636499604-What-is-the-Contributor-verification-process) you need to complete

- Make sure you’re on devvit@0.11.0. See the [quickstart](quickstart.mdx) to get up and running.

## How it works

You’ll set the price of the products in your app in Reddit [gold](https://support.reddithelp.com/hc/en-us/articles/17331548463764-What-is-gold-and-how-do-I-use-it). Users will make in-app purchases with gold, and that gold accumulates in your app account.

The payout rate is $0.01 per Reddit gold in your app account.

Payouts are calculated at the end of each calendar month and deposited into your Stripe account within 30 days. There may be an additional 5 - 7 day delay for non-US developers.

## Add products to your app

You can build things like in-game items, additional lives, or exclusive features into your app.

![Sample payment app screen](../assets/payments_example.png)

Products are tied to app versions. This means if you create a product in version 2.0 of your app and change the product in version 2.1, the 2.0 product will still be available in subreddits that use version 2.0 of your app.

:::note
All products will be reviewed by the Developer Platform team to ensure compliance with our content policy. Products are approved during the [app review process](../publishing.md) after you publish your app.
:::

### Install payments

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
      "sku": "extra_life",
      "displayName": "Extra Life",
      "description": "An extra life for the snake game",
      "price": 10,
      "images": {
        // not required, we can have default. Add guidelines on size
        "icon": "assets/products/extra_life_icon.png"
      },
      "metadata": {
        "category": "powerup"
      }
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
import { addPaymentHandler, type Order } from '@devvit/payments';

const MAX_LIVES = 3;
const EXTRA_LIVES_SKU = 'extra_lives';

addPaymentHandler({
  fulfillOrder: async (order: Order, ctx: Context) => {
    if (!order.products.some(({ sku }) => sku === EXTRA_LIVES_SKU)) {
      // this error will be visible to your logs but not users; the order will be rejected
      throw new Error('Unable to fulfill order: sku not found');
    }

    // redis key for storing number of lives user has left
    const livesKey = `${ctx.userId}:lives`;

    // get the current life count
    const curLives = await ctx.redis.get(livesKey);

    // reject the order if the user already has more than or equal MAX_LIVES
    if (curLives != null && Number(curLives) >= MAX_LIVES) {
      // the reason provided here will be delivered to the `usePayments` callback function
      // as `result.errorMessage` to optionally display to the end-user.
      return { success: false, reason: 'Max lives exceeded' };
    }

    // fulfill the order by incrementing the lives count for the user
    await ctx.redis.incrBy(livesKey, 1);
  },
});
```

## Implement in-app purchases

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
  const { products } = useProducts(context, {
    skus: ['extra_life', 'cosmic_sword'],
  });

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
const products = await getProducts({
  skus: ['extra_life', 'cosmic_sword'],
  metadata: {
    category: 'powerup',
  },
});
```

### Initiate orders

Provide the product sku to trigger a purchase. This automatically populates the most recently-approved product metadata for that product id.

**Example**

```tsx
import { usePayments } from '@devvit/payments';

// handles purchase results
const payments = usePayments((result: OnPurchaseResult) => { console.log('Tried to buy:', result.sku, '; result:', result.success); });

// foreach sku in products:
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

All products must be approved by the Developer Platform team to ensure compliance with our content policy.

Certain types of products are not allowed and will not be approved:

- Explicit or suggestive content
- Real money gambling
- Requests for donations
- Advertising or pay-for-promotion

There is no partial approval. If one product is not approved, the app will be rejected.

To submit your products and app:

1. Run devvit publish.
2. Select how you want your app to appear in the Apps directory:

- **Unlisted** means that the app is only visible to you in the directory, and you can install your app on larger subreddits that you moderate.
- **Public** means that your app is visible to all users in the Apps directory and can be installed by mods and admins across Reddit.

:::note
You can change your app visibility at any time. See [publishing an app](publishing.md) for details.
:::

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
    if (!order.products.some(({ sku }) => sku === EXTRA_LIVES_SKU)) {
      // this error will be visible to your logs but not users; the order will be rejected
      throw new Error('Unable to fulfill order: sku not found');
    }

    // redis key for storing number of lives user has left
    const livesKey = `${ctx.userId}:lives`;

    // get the current life count
    const curLives = await ctx.redis.get(livesKey);

    // reject the order if the user already has more than or equal MAX_LIVES
    if (curLives != null && Number(curLives) >= MAX_LIVES) {
      // the reason provided here will be delivered to the `usePayments` callback function
      // as `result.errorMessage` to optionally display to the end-user.
      return { success: false, reason: 'Max lives exceeded' };
    }

    // fulfill the order by incrementing the lives count for the user
    await ctx.redis.incrBy(livesKey, 1);
  },
  refundOrder: async (order: Order, ctx: Context) => {
    // check if the order contains an extra life
    if (order.products.some(({ sku }) => sku === EXTRA_LIVES_SKU)) {
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
