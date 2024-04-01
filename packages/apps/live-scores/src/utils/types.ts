export type DevvitState<T> = [T, (newValue: T) => void];
export const noop = (): void => {};
export type Nullable<T> = null | T;
export type CurrentEventData = {
  primaryString: string;
  secondaryString: string;
};
