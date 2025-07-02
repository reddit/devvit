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
