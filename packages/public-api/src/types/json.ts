/**
 * Any JSON type. Ie, a string, number, boolean, null, an array of these JSON
 * types, or an object with JSON type values, recursively.
 *
 * This type is often used to type-check attempts to serialize and deserialize
 * classes, functions, and other _JavaScript_-only types that cannot be
 * represented losslessly in plain JSON.
 *
 * @see https://github.com/microsoft/TypeScript/issues/1897
 * @see https://www.json.org
 */
export type JSONValue = JSONPrimitive | JSONArray | JSONObject;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];
export type JSONPrimitive = boolean | null | number | string;

/**
 * Like JSONValue but deeply allow lossy undefined values that are easier to
 * type but may de/serialize differently or incorrectly. For example:
 *
 * - `JSON.stringify({a: 1, b: 2, c: undefined, d: 3})`: `'{"a":1,"b":2,"d":3}'`.
 * - `JSON.stringify([1, 2, undefined, 3])`: `'[1,2,null,3]'`.
 * - `JSON.stringify(undefined)`: `undefined`.
 *
 * JSON.stringify() accepts an `any` input so there are no typing guards. Prefer
 * plain JSONValue when possible.
 *
 * One mostly only cares about stringify since creating a JSON string with
 * undefineds in it would require deliberate effort. These all throw errors:
 *
 * - `JSON.parse('{a: 1, b: 2, c: undefined, d: 3}')`.
 * - `JSON.parse('[1, 2, undefined, 3]')`.
 * - `JSON.parse('undefined')`.
 * - `JSON.parse(undefined)` (also a typing error).
 */
export type PartialJSONValue = PartialJSONPrimitive | PartialJSONArray | PartialJSONObject;
export type PartialJSONObject = Partial<{ [key: string]: PartialJSONValue }>;
export type PartialJSONArray = PartialJSONValue[];
export type PartialJSONPrimitive = boolean | null | number | string | undefined;
