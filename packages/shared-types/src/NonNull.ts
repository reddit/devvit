export function assertNonNull<T>(
  val: null extends T ? T : never,
  msg?: string
): asserts val is null extends T ? NonNullable<T> : never;
export function assertNonNull<T>(
  val: undefined extends T ? T : never,
  msg?: string
): asserts val is undefined extends T ? NonNullable<T> : never;
export function assertNonNull<T>(val: T, msg?: string): asserts val is NonNullable<T> {
  if (val == null) throw Error(msg ?? 'Expected nonnullish value.');
}

/**
 * Returns a nonnullish value or throws.
 *
 * This function can be thought of as casting or enforcing nonnullish
 * values similar to the way `BigInt(.5)` throws a RangeError when
 * passed a noninteger.
 */
export function NonNull<T>(val: null extends T ? T : never, msg?: string): NonNullable<T>;
export function NonNull<T>(val: undefined extends T ? T : never, msg?: string): NonNullable<T>;
export function NonNull<T>(val: NonNullable<T> | undefined | null, msg?: string): NonNullable<T> {
  assertNonNull(val, msg);
  return val;
}
