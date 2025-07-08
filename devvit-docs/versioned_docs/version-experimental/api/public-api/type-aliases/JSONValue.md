[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: JSONValue

> **JSONValue** = [`JSONPrimitive`](JSONPrimitive.md) \| [`JSONArray`](JSONArray.md) \| [`JSONObject`](JSONObject.md)

Any JSON type. Ie, a string, number, boolean, null, an array of these JSON
types, or an object with JSON type values, recursively.

This type is often used to type-check attempts to serialize and deserialize
classes, functions, and other _JavaScript_-only types that cannot be
represented losslessly in plain JSON.

## See

- https://github.com/microsoft/TypeScript/issues/1897
- https://www.json.org
