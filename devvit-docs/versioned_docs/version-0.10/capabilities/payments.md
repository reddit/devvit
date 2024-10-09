# Payments

Add products to your app and get paid for what you sell.

:::note
Payments is a beta feature that is only available to developers in our Developer Payments Pilot Program.  
:::

The payments plugin lets you prompt users to buy premium features for your app, such as additional lives in a game or custom flair.

## Getting started

Before you can sell products in your app, you’ll need to enroll in the [Reddit Contributor Program](https://support.reddithelp.com/hc/en-us/articles/17331620007572-What-is-the-Contributor-Program-and-how-can-I-participate), and meet the [eligibility criteria](https://support.reddithelp.com/hc/en-us/articles/17331620007572-What-is-the-Contributor-Program-and-how-can-I-participate#h_01H9RRRH1X765RE40ST0049F8M). You’ll also need to accept and comply with our [Contributor Terms](https://www.redditinc.com/policies/contributor-terms), [Contributor Monetization Policy](https://www.redditinc.com/policies/contributor-monetization-policy), and Developer Platform Policies to sell products.

:::note
Karma- and gold-earning requirements are waived for developers.
:::

Install Payments in your app by running the following command:

```bash
devvit install @devvit/payments@next
```

## How it works

Users make in-app purchases with Reddit [gold](https://support.reddithelp.com/hc/en-us/articles/17331548463764-What-is-gold-and-how-do-I-use-it). When you configure your products, you’ll set the price of your product in gold. The gold you receive for your products accumulates in your app account. The payout rate for gold is $0.01 per Reddit gold spent in your app.

:::note
Payouts are calculated at the end of each calendar month, and you should receive your payout in your Stripe account within 30 days. There may be an additional 5 - 7 day delay for non-US developers.
:::

## What products can I sell?

You can build products in your app for things like in-game items or exclusive features for tools or bots.

![Sample payment app screen](../assets/payments_example.png)

All products must be approved by the Developer Platform team. Products are approved during the [app review process](../publishing.md) when you publish your app.

:::note
Some products are not allowed and will not be approved:

- Sexually explicit or suggestive content
- Real money gambling
- Requests for donations
- Advertising or pay-for-promotion
  :::

## Register products

Products are registered via a `src/products.json` file in your local app. The JSON schema for the file format is available at [https://developers.reddit.com/schema/products.json](https://developers.reddit.com/schema/products.json)

Each product in the `products` field comprises of the following attributes:

| **Attribute** | **Description**                                                                                                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sku`         | A product identifier that can be used to group orders or organize your products. Each sku must be unique for each product in your app.                                                                                                                 |
| `displayName` | The official name of the product that is displayed in purchase confirmation screens. The name must be fewer than 50 characters, including spaces.                                                                                                      |
| `description` | A text string that describes the product and is displayed in purchase confirmation screens. The description must be fewer than 150 characters, including spaces.                                                                                       |
| `price`       | An predefined integer that sets the product price in Reddit gold. See details below.                                                                                                                                                                   |
| `image.icon`  | **(optional)** The path to the icon that represents your product in your [assets](../app_image_assets) folder.                                                                                                                                         |
| `metadata`    | **(optional)** An optional object that contains additional attributes you want to use to group and filter products. Keys and values must be alphanumeric (a - Z, 0 - 9, and - ) and contain 30 characters or less. You can add up to 10 metadata keys. |

:::note
Actual payments will not be processed until your products are approved. While your app is under development, you can use sandbox payments, which only simulates payment and does not deduct real gold. More on that below.
:::

:::note
Registered products are updated every time an app is uploaded, including when you use [Devvit playtest](../playtest).
:::

### Pricing

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

### Image requirements

- Min size: 256x256
- Supported file type: .png

If you do not provide an image, the default Reddit product image will be used.

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

## Add custom handlers to complete the payment flow

You must specify a function that is called during the order flow using the `addPaymentHandler`. This will to customize how your app will fulfill product orders and provide the ability for the developer to reject an order. (refunds are in progress!).

Any error thrown within the payment handler will automatically reject the order. If you would like to provide a custom error message to the frontend of your application, you can return `{success: false, reason: <string>}` with a reason for order rejection.

For example, imagine a scenario where you would want to issue an "extra life" to a user when they purchase the "extra_life" product.

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
    await ctx.redis.incrBy(`${ctx.userId}:lives`, 1);
  },
});
```

:::note
Products are tied to app versions. This means if you create a product in version 2.0 of your app, and change it in version 2.1, the 2.0 version will still be available in subreddits that use version 2.0 of your app.
:::

## Implement purchases of in-app goods

![Order workflow diagram](../assets/payments_order_flow.jpg)

Order processing happens in coordination with the frontend and backend of your application. From the frontend, you launch the payment flow by creating a hook with `usePayments()` followed by `hook.purchase()` when you want to initiate the purchase. This triggers a native payment flow on each platform (web, iOS, Android). The native workflow works with the Reddit backend to process the order, and your app is called via the `fulfillOrder()` hook during this process. This gives your app the opportunity to acknowledge or reject the order. For example, for goods that have limited quantities, your app may not fulfill an order once the product is sold out and instead reject the order.

### Get your product details

You can fetch details about products by using the `useProducts` hook or `getProducts` function.

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

Provide the product sku to trigger a purchase. This automatically populates the most recently approved product metadata for that product id.

```tsx
import { usePayments } from '@devvit/payments';

// handles purchase results
const payments = usePayments((result: OnPurchaseResult) => { console.log('Tried to buy:', result.sku, '; result:', result.success); });

// foreach sku in products:
<button onPress{payments.purchase(sku)}>Buy a {sku}</button>
```

## Test your app

The payments sandbox environment simulates payment transactions. All apps automatically start in the payments sandbox.

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

## Check orders

Reddit keeps track of historical purchases and lets you query user purchases.

Orders are returned in reverse chronological order and can be filtered based on user, product, success state, or other attributes.

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

:::note
Once your app is in production, existing installations will need to be manually updated via the admin tool if you release a new version. Contact the Developer Platform team if you need to update your app installation versions.

Automatic updates will be supported in the future.
:::

## Submit your app for approval

When you’re satisfied with your app, it’s time to submit your app and products to the Developer Platform team for review and approval. To submit your products and app, run `devvit publish` and select how you want your app to appear in the Apps directory:

- **Unlisted** means that the app is only visible to you in the directory, and you can install your app on larger subreddits that you moderate.
- **Public** means that your app is visible to all users in the Apps directory and can be installed by mods and admins across Reddit.

You can change your app visibility at any time. See [publishing an app](publishing.md) for details.

:::note
All products will be reviewed to ensure compliance with our content policy. There is no partial approval. If one product is not approved, the app will be rejected.
:::

## Accept real payments

Once your app and products have been approved, you’re ready to use Reddit’s production payments system. Real payments will be triggered automatically when invoked from approved app versions. No code changes are required.

## Features coming soon

- Triggering refunds
- Issuing refunds
- Removing a product
- Limits and quotas
