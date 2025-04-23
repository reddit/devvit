import './createPostMenuItem.js';

import {
  addPaymentHandler,
  type OnPurchaseResult,
  OrderResultStatus,
  useOrders,
  usePayments,
  useProducts,
} from '@devvit/payments';
import { ProductButton, ProductButtonProps } from '@devvit/payments/helpers/ProductButton';
import { Devvit, useState } from '@devvit/public-api';

import { OrderListItem, TitledList } from './Payments.js';

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

const ORDERS_PAGE_SIZE = 3;

const productButtonAppearances: ProductButtonProps['appearance'][] = [
  'compact',
  'detailed',
  'tile',
];

Devvit.addCustomPostType({
  name: 'Devvit Snack Bar',
  description: 'Custom post to test payments API',
  height: 'tall',
  render: (context) => {
    const [selectedTab, setSelectedTab] = useState(Tab.Products);
    const { products } = useProducts(context);
    const { orders, nextPage: nextPageOrders } = useOrders(context, { limit: ORDERS_PAGE_SIZE });

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
      <vstack alignment="center" padding="medium" width="100%">
        <hstack alignment="center middle" gap="small">
          {Object.entries(Tab).map(([label, value]) => (
            <button onPress={() => setSelectedTab(value as Tab)} disabled={value === selectedTab}>
              {label}
            </button>
          ))}
        </hstack>
        {selectedTab === Tab.Products && (
          <TitledList title="ProductButtons">
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product, idx) => {
                const appearance = productButtonAppearances[idx % productButtonAppearances.length];
                return (
                  <hstack gap="medium" alignment="middle start">
                    <text weight="bold" width="90px">{`${appearance}:`}</text>
                    <ProductButton
                      product={product}
                      onPress={(p) => payments.purchase(p.sku, { timestamp: `${Date.now()}` })}
                      showIcon
                      appearance={appearance}
                    />
                  </hstack>
                );
              })
            ) : (
              <text>No products found</text>
            )}
          </TitledList>
        )}
        {selectedTab === Tab.Orders && (
          <TitledList title="Orders">
            {Array.isArray(orders) && orders.length > 0 ? (
              orders.map((order) => <OrderListItem order={order} />)
            ) : (
              <text>No orders found</text>
            )}
            {nextPageOrders ? <button onPress={nextPageOrders}>Next Page</button> : <></>}
          </TitledList>
        )}
      </vstack>
    );
  },
});

export default Devvit;
