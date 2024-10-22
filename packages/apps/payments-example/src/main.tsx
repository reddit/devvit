import './createPostMenuItem.js';

import {
  addPaymentHandler,
  type OnPurchaseResult,
  type Order,
  OrderResultStatus,
  useOrders,
  usePayments,
  useProducts,
} from '@devvit/payments';
import { Devvit } from '@devvit/public-api';

import { OrderListItem, ProductListItem, TitledList } from './Payments.js';

addPaymentHandler({
  fulfillOrder: async (order, _) => {
    console.log('Fulfilling order', order);
  },
  refundOrder: async (order, _) => {
    console.log('Refunding order', order);
  },
});

Devvit.configure({
  redditAPI: true,
});

enum Tab {
  Products = 'Products',
  Orders = 'Orders',
}

Devvit.addCustomPostType({
  name: 'Devvit Snack Bar',
  description: 'Custom post to test payments API',
  render: (context) => {
    const [selectedTab, setSelectedTab] = context.useState(Tab.Products);
    const { products } = useProducts(context);
    const { orders } = useOrders(context);

    const payments = usePayments((result: OnPurchaseResult) => {
      if (result.status === OrderResultStatus.Success) {
        context.ui.showToast({
          appearance: 'success',
          text: `💸 Purchase succeeded!\n(sku: ${result.sku}; orderId: ${result.orderId})`,
        });
      } else {
        context.ui.showToast(
          `❌ Purchase failed!\n(sku: ${result.sku}; error: ${result.errorMessage})`
        );
      }
    });
    return (
      <vstack alignment="center" height="100%" padding="medium" width="100%">
        <hstack alignment="center middle" gap="small">
          {Object.entries(Tab).map(([label, value]) => (
            <button onPress={() => setSelectedTab(value as Tab)} disabled={value === selectedTab}>
              {label}
            </button>
          ))}
        </hstack>
        {selectedTab === Tab.Products && (
          <TitledList title="Products">
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product) => (
                <ProductListItem
                  product={product}
                  onBuy={() => payments.purchase(product.sku, { timestamp: `${Date.now()}` })}
                />
              ))
            ) : (
              <text>No products found</text>
            )}
          </TitledList>
        )}
        {selectedTab === Tab.Orders && (
          <TitledList title="Orders">
            {Array.isArray(orders) && orders.length > 0 ? (
              orders.map((order) => <OrderListItem order={order as Order} />)
            ) : (
              <text>No orders found</text>
            )}
          </TitledList>
        )}
      </vstack>
    );
  },
});

export default Devvit;
