import type { Order } from '@devvit/payments';
import { Devvit } from '@devvit/public-api';

type TitledListProps = {
  title: string;
  children: JSX.Element;
};

export function TitledList({ title, children }: TitledListProps): JSX.Element {
  return (
    <vstack gap="medium" padding="medium" grow alignment="top start">
      <text style="heading" size="large">
        {title}
      </text>
      ${children}
    </vstack>
  );
}

type OrderListItemProps = {
  order: Order;
};

export function OrderListItem({ order }: OrderListItemProps): JSX.Element {
  return (
    <vstack
      width="100%"
      gap="small"
      padding="small"
      cornerRadius="small"
      borderColor="neutral-content-strong"
    >
      <text size="large">{order.id}</text>
      <text size="xsmall">
        {order.status}
        {order.createdAt ? ` - ${order.createdAt}` : ''}
      </text>
      <text>Products: {order.products.map((p) => p.sku)}</text>
    </vstack>
  );
}
