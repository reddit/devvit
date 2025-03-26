import {
  addPaymentHandler,
  getOrders,
  type OnPurchaseResult,
  OrderResultStatus,
  usePayments,
  useProducts,
} from '@devvit/payments';
import { ProductButton } from '@devvit/payments/helpers/ProductButton';
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
  refundOrder: async (order, ctx) => {
    if (order.products.some(({ sku }) => sku === GOD_MODE_SKU)) {
      await ctx.redis.set(godModeRedisKey(ctx.postId, ctx.userId), 'false');
    }
  },
});

const App: Devvit.CustomPostComponent = (context) => {
  // Updates current state in redis.
  const [godModeEnabled, setGodMode] = useState(async () => {
    const state = await context.redis.get(godModeRedisKey(context.postId, context.userId));
    return JSON.parse(state || 'false');
  });

  const [orderCount, setOrderCount] = useState(async () => {
    const orders = await getOrders();
    return orders.orders.length;
  });

  // Only grab products with the category "powerup".
  const { products } = useProducts(context, {
    metadata: {
      category: 'powerup',
    },
  });

  // Client side code invoked after a purchase is made. This should be used to update
  // app state based on orders.
  const payments = usePayments((result: OnPurchaseResult) => {
    if (result.status === OrderResultStatus.Success) {
      setGodMode(true);
      setOrderCount((count: number) => count + 1);
    }
  });

  const clearGodModeFn = async () => {
    await context.redis.set(godModeRedisKey(context.userId), false.toString());
    setGodMode(false);
  };

  return (
    <vstack alignment="center middle" height={100} gap="medium" padding="large">
      <text size="large">Has god mode been enabled: {godModeEnabled}</text>
      {godModeEnabled && (
        <button width={75} onPress={() => clearGodModeFn()}>
          I tire of being a god - return me to the mortal coil.
        </button>
      )}

      <text size="large">
        There have been {orderCount} orders placed across all users of this app in this subreddit.
      </text>
      <vstack>
        Products:
        {products.map((product) => (
          <ProductButton
            product={product}
            appearance="detailed"
            onPurchase={(p) => {
              payments.purchase(p.sku);
            }}
          />
        ))}
      </vstack>
    </vstack>
  );
};

Devvit.addCustomPostType({
  name: 'Example of offering items for sale.',
  render: App,
});

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Create a post to show off how purchasing works.',
  onPress: async (_, context) => {
    const { reddit, ui } = context;
    ui.showToast("Submitting your post - upon completion you'll navigate there.");

    const currentSubreddit = context.subredditName;
    if (currentSubreddit !== undefined) {
      const newPost = await reddit.submitPost({
        title: 'Example Purchase Post',
        subredditName: currentSubreddit,
        preview: (
          <vstack padding="medium" cornerRadius="medium">
            <text style="heading" size="medium">
              Loading a hand-crafted custom app…
            </text>
          </vstack>
        ),
      });
      ui.navigateTo(newPost);
    } else {
      ui.showToast('Failed to create post - subreddit not defined.');
    }
  },
});

function godModeRedisKey(postId: string | undefined, userId?: string | undefined): string {
  return `god_mode:${postId}:${userId}`;
}

export default Devvit;
