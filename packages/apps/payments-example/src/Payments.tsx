import type { Order, Product } from '@devvit/payments';
import { Devvit } from '@devvit/public-api';

type TitledListProps = {
  title: string;
  children: JSX.Element;
};

export function TitledList({ title, children }: TitledListProps): JSX.Element {
  return (
    <vstack gap="medium" padding="medium" grow>
      <text style="heading" size="large">
        {title}
      </text>
      ${children}
    </vstack>
  );
}

type ProductListItemProps = {
  product: Product;
  onBuy: () => void;
};

export function ProductListItem({ product, onBuy }: ProductListItemProps): JSX.Element {
  return (
    <hstack
      alignment="start middle"
      gap="medium"
      padding="small"
      cornerRadius="small"
      borderColor="neutral-content-strong"
    >
      <text grow>
        {product.images?.icon ? (
          <>
            <image url={product.images.icon} imageWidth={20} imageHeight={20}></image>{' '}
          </>
        ) : (
          ''
        )}
        {product.displayName}
      </text>
      <icon name="gold-fill" />
      <text>{product.price} gold</text>
      <button onPress={onBuy} size="small">
        Buy
      </button>
    </hstack>
  );
}

type OrderListItemProps = {
  order: Order;
};

export function OrderListItem({ order }: OrderListItemProps): JSX.Element {
  return (
    <vstack gap="small" padding="small" cornerRadius="small" borderColor="neutral-content-strong">
      <text size="large">{order.id}</text>
      <text size="xsmall">
        {order.status}
        {order.createdAt ? ` - ${order.createdAt}` : ''}
      </text>
      <text>Products: {order.products.map((p) => p.sku)}</text>
    </vstack>
  );
}
