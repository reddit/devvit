/**
 * Tests if val is a nonnullish, non-array object that may contain key-values.
 *
 * This function often works best when layered with additional type checks. Eg:
 *
 *   type Foo = {bar: string}
 *   function isFoo(val: unknown): val is Foo {
 *     return isObject(val) && typeof val.bar === 'string'
 *   }
 */
export function isObject(val: unknown): val is Record<PropertyKey, unknown> {
  return val != null && !Array.isArray(val) && typeof val === 'object';
}
