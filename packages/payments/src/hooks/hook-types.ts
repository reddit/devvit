import { OrderResultStatus as OrderResultStatusProto } from '@devvit/protos/types/devvit/ui/effect_types/v1alpha/create_order.js';
import type { AsyncError } from '@devvit/public-api/types/hooks.js';

export enum OrderResultStatus {
  Cancelled,
  Success,
  Error,
}

export type OrderMetadata = Record<string, string>;

export type OnPurchaseResult = {
  status: OrderResultStatus;
  errorCode?: number | undefined;
  errorMessage?: string | undefined;
  orderId?: string | undefined;
  sku: string;
  metadata: OrderMetadata;
};

export type OnPurchaseResultHandler = (result: OnPurchaseResult) => void | Promise<void>;

/** @internal */
export function orderStatusProtoToHook(
  orderResultStatus: OrderResultStatusProto
): OrderResultStatus {
  switch (orderResultStatus) {
    case OrderResultStatusProto.STATUS_SUCCESS:
      return OrderResultStatus.Success;
    case OrderResultStatusProto.STATUS_ERROR:
      return OrderResultStatus.Error;
    default:
      return OrderResultStatus.Cancelled;
  }
}

export type LoadingAsyncState = {
  loading: true;
  error: null;
};

export type SuccessAsyncState = {
  loading: false;
  error: null;
};

export type ErrorAsyncState = {
  loading: false;
  error: AsyncError;
};

/**
@link https://github.com/sindresorhus/type-fest/blob/main/source/simplify.d.ts#L58C1-L58C67
@description Useful to flatten the type output to improve type hints shown in editors. And also to transform an interface into a type to aide with assignability.
*/
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {};

export type AsyncHookResult<T extends Record<string, unknown>> = Simplify<
  T & (SuccessAsyncState | ErrorAsyncState | LoadingAsyncState)
>;
