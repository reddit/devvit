[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: PartialJSONValue

> **PartialJSONValue** = [`PartialJSONPrimitive`](PartialJSONPrimitive.md) \| [`PartialJSONArray`](PartialJSONArray.md) \| [`PartialJSONObject`](PartialJSONObject.md)

Like JSONValue but deeply allow lossy undefined values that are easier to
type but may de/serialize differently or incorrectly. For example:

- `JSON.stringify({a: 1, b: 2, c: undefined, d: 3})`: `'{"a":1,"b":2,"d":3}'`.
- `JSON.stringify([1, 2, undefined, 3])`: `'[1,2,null,3]'`.
- `JSON.stringify(undefined)`: `undefined`.

JSON.stringify() accepts an `any` input so there are no typing guards. Prefer
plain JSONValue when possible.

One mostly only cares about stringify since creating a JSON string with
undefineds in it would require deliberate effort. These all throw errors:

- `JSON.parse('{a: 1, b: 2, c: undefined, d: 3}')`.
- `JSON.parse('[1, 2, undefined, 3]')`.
- `JSON.parse('undefined')`.
- `JSON.parse(undefined)` (also a typing error).
