import type { FormKey } from '@devvit/shared-types/useForm.js';
import type { Context } from './context.js';
import type { Data } from './data.js';
import type { Form, FormFunction, FormValues } from './form.js';
import type { ChannelOptions, ChannelStatus } from './realtime.js';

export type Dispatch<A> = (value: A) => void;
export type SetStateAction<S> = S | ((prevState: S) => S);
export type StateSetter<S> = Dispatch<SetStateAction<S>>;

/** A tuple containing the current state and a function to update it */
export type UseStateResult<S> = [S, StateSetter<S>];
export type UseStateHook = Context['useState'];
export type AsyncUseStateInitializer<S> = () => Promise<S>;
export type UseStateInitializer<S> = S | (() => S) | AsyncUseStateInitializer<S>;
export type AsyncError = { message: string; details: string | null };
export type UseAsyncResult<S> = { data: S | null; loading: boolean; error: AsyncError | null };

/** @internal */
export const Hook = Object.freeze({
  INTERVAL: 0, // useInterval hook
  FORM: 1, // useForm hook
  STATE: 2, // useState hook
  CHANNEL: 3, // useChannel hook
});

/** @internal */
export type Hook = (typeof Hook)[keyof typeof Hook];

/** @internal */
export type UseFormHookState = {
  formKey: FormKey;
  preventSubmit: boolean;
  type: Hook;
};

/** A hook that returns a form key that can be used in the `ui.showForm` */
export type UseFormHook = (
  form: Form | FormFunction,
  onSubmit: (values: FormValues) => void | Promise<void>
) => FormKey;

/** An object that contains functions to start and stop the interval created by the `useInterval` hook */
export type UseIntervalResult = {
  /** Start the interval */
  start: () => void;
  /** Stop the interval */
  stop: () => void;
};

/** A hook that can used to run a callback on an interval between Block renders. Only one useInterval hook may be running at a time. */
export type UseIntervalHook = (
  /** The callback to run on an interval */
  callback: () => void | Promise<void>,
  /** The delay between each callback run in milliseconds. Delay must be at least 100ms. */
  delay: number
) => UseIntervalResult;

/** @internal */
export type UseIntervalHookState = {
  lastRun: number | undefined;
  running: boolean;
  preventCallback: boolean;
  type: Hook;
};

export type UseChannelHook = (options: ChannelOptions) => UseChannelResult;

/** @internal */
export type UseChannelHookState = {
  channel: string;
  active: boolean;
  connected: boolean;
  preventCallback: boolean;
  type: Hook;
};

export type UseChannelResult = {
  /** Subscribe to the channel */
  subscribe(): void;
  /** Unsubscribe from the channel */
  unsubscribe(): void;
  /** Publish a message to the channel */
  send(data: Data): Promise<void>;
  /** Current subscription status */
  status: ChannelStatus;
};
