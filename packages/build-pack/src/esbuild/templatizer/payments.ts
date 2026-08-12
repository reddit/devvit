import type {
  PaymentHandlerAccountingType,
  PaymentHandlerOrderStatus,
  PaymentHandlerProduct,
  PaymentHandlerRequest,
  PaymentHandlerResponse,
} from '@devvit/payments/shared';
// eslint-disable-next-line no-restricted-imports
import {
  type PaymentProcessor,
  PaymentProcessorDefinition,
} from '@devvit/protos/types/devvit/actor/payments/v1alpha/payments.js';
// eslint-disable-next-line no-restricted-imports
import {
  type Order as ProtoOrder,
  OrderStatus as ProtoOrderStatus,
} from '@devvit/protos/types/devvit/payments/v1alpha/order.js';
// eslint-disable-next-line no-restricted-imports
import {
  AccountingType as ProtoAccountingType,
  type Product as ProtoProduct,
} from '@devvit/protos/types/devvit/payments/v1alpha/product.js';
// eslint-disable-next-line no-restricted-imports
import { Devvit, type MenuItem } from '@devvit/public-api';
import * as publicApiPrototypeHelpers from '@devvit/public-api/devvit/internals/helpers/extendDevvitPrototype.js';
import type { ExtendDevvitPrototype } from '@devvit/shared-types/devvit-rpc.js';
import { purgeReservedDevvitKeysFromMetadata } from '@devvit/shared-types/reservedDevvitMetadataKeys.js';
import type { AppPaymentsConfig } from '@devvit/shared-types/schemas/config-file.v1.js';
import { getDevvitConfig } from '@devvit/shared-types/server/get-devvit-config.js';

import { fetchWebbit } from './fetch-webbit.js';

// The runtime export exists, but @internal strips it from public-api's declarations.
const extendDevvitPrototype = (
  publicApiPrototypeHelpers as unknown as {
    extendDevvitPrototype: ExtendDevvitPrototype;
  }
).extendDevvitPrototype;

const paymentHelpMenuItem: Readonly<MenuItem> = {
  location: 'post',
  label: 'Get Payments Help',
  postFilter: 'currentApp',
  onPress: async (_, context) => {
    const url = new URL(
      'https://support.reddithelp.com/hc/en-us/requests/new?ticket_form_id=29770197409428&tf_29764567374740=devvit_product_not_working'
    );
    const username = await context.reddit.getCurrentUsername();
    if (username) url.searchParams.append('tf_360026362751', username);

    const postId = context.postId;
    if (postId) {
      const postWithoutPrefix = postId.replace('t3_', '');
      if (postWithoutPrefix) {
        const postUrl = `https://www.reddit.com/r/${context.subredditName}/comments/${postWithoutPrefix}`;
        url.searchParams.append('tf_29770117862932', postUrl);
      }
    }

    url.searchParams.append(
      'tf_subject',
      `[${context.appName} v${context.appVersion}] Payments Help`
    );
    context.ui.navigateTo(url.toString());
  },
};

/** @internal */
export function configurePayments(payments: Readonly<AppPaymentsConfig>): void {
  // Payment flow:
  // compute PerRequestStore ALS -> PaymentProcessor RPC -> public-api wrapper ->
  // @devvit/server ALS -> this template adapter -> fetchWebbit() -> HTTP ->
  // createServer() @devvit/server ALS -> Webbit handler.
  const processor = newPaymentsProcessor(payments);
  getDevvitConfig().provides(PaymentProcessorDefinition);
  extendDevvitPrototype<PaymentProcessor>('FulfillOrder', processor.FulfillOrder);
  extendDevvitPrototype<PaymentProcessor>('RefundOrder', processor.RefundOrder);
  Devvit._initMenu();
  Devvit.addMenuItem(paymentHelpMenuItem);
}

/** @internal */
export function newPaymentsProcessor(payments: Readonly<AppPaymentsConfig>): PaymentProcessor {
  return {
    async FulfillOrder(req, meta) {
      if (req.order == null || req.order.products.length === 0) return {};

      const rsp = (await fetchWebbit(
        payments.endpoints.fulfillOrder,
        mapOrder(req.order),
        meta ?? {}
      )) as PaymentHandlerResponse;

      return !rsp || rsp.success ? { acknowledged: true } : { rejectionReason: rsp.reason };
    },
    async RefundOrder(req, meta) {
      const refundEndpoint = payments.endpoints.refundOrder;
      if (req.order == null || !refundEndpoint) return {};

      const rsp = (await fetchWebbit(
        refundEndpoint,
        mapOrder(req.order),
        meta ?? {}
      )) as PaymentHandlerResponse;
      return rsp ?? {};
    },
  };
}

function mapOrder(proto: ProtoOrder): PaymentHandlerRequest {
  const order: PaymentHandlerRequest = {
    id: proto.id,
    status: mapOrderStatus(proto.status),
    createdAt: proto.createdAt?.toISOString() ?? null,
    updatedAt: proto.updatedAt?.toISOString() ?? null,
    products: proto.products.map(mapProduct),
    metadata: purgeReservedDevvitKeysFromMetadata(proto.metadata),
  };

  if (order.products.length > 1) throw Error('Multi-product orders not supported');
  if (order.products.length === 0) throw Error('No products in order');
  return order;
}

function mapOrderStatus(status: ProtoOrderStatus): PaymentHandlerOrderStatus {
  switch (status) {
    case ProtoOrderStatus.ORDER_STATUS_NEW:
      return 'NEW';
    case ProtoOrderStatus.ORDER_STATUS_CREATED:
      return 'CREATED';
    case ProtoOrderStatus.ORDER_STATUS_PAID:
      return 'PAID';
    case ProtoOrderStatus.ORDER_STATUS_DELIVERED:
      return 'DELIVERED';
    case ProtoOrderStatus.ORDER_STATUS_CANCELED:
      return 'CANCELED';
    case ProtoOrderStatus.ORDER_STATUS_REVERTED:
      return 'REVERTED';
    default:
      status satisfies never;
    // fallthrough
    case ProtoOrderStatus.ORDER_STATUS_UNSPECIFIED:
    case ProtoOrderStatus.UNRECOGNIZED:
      return 'UNRECOGNIZED';
  }
}

function mapProduct(proto: ProtoProduct): PaymentHandlerProduct {
  if (proto.price == null) throw Error('Product price is null or undefined');

  const icon = proto.images['icon'];
  return {
    sku: proto.sku,
    price: proto.price.amount,
    displayName: proto.name,
    accountingType: mapAccountingType(proto.accountingType),
    description: proto.description,
    metadata: purgeReservedDevvitKeysFromMetadata(proto.productMetadata),
    ...(icon ? { images: { icon } } : {}),
  };
}

function mapAccountingType(accountingType: ProtoAccountingType): PaymentHandlerAccountingType {
  switch (accountingType) {
    case ProtoAccountingType.ACCOUNTING_TYPE_INSTANT:
      return 'INSTANT';
    case ProtoAccountingType.ACCOUNTING_TYPE_DURABLE:
      return 'DURABLE';
    case ProtoAccountingType.ACCOUNTING_TYPE_CONSUMABLE:
      return 'CONSUMABLE';
    case ProtoAccountingType.ACCOUNTING_TYPE_VALID_FOR_1D:
      return 'VALID_FOR_1D';
    case ProtoAccountingType.ACCOUNTING_TYPE_VALID_FOR_7D:
      return 'VALID_FOR_7D';
    case ProtoAccountingType.ACCOUNTING_TYPE_VALID_FOR_30D:
      return 'VALID_FOR_30D';
    case ProtoAccountingType.ACCOUNTING_TYPE_VALID_FOR_1Y:
      return 'VALID_FOR_1Y';
    default:
      accountingType satisfies never;
    // fallthrough
    case ProtoAccountingType.ACCOUNTING_TYPE_UNSPECIFIED:
    case ProtoAccountingType.UNRECOGNIZED:
      return 'UNRECOGNIZED';
  }
}
