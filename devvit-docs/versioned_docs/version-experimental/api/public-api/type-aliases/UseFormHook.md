[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: UseFormHook()\<T\>

> **UseFormHook**\<`T`\> = (`form`, `onSubmit`) => [`FormKey`](FormKey.md)

A hook that returns a form key that can be used in the `ui.showForm`

## Type Parameters

### T

`T` _extends_ [`Form`](Form.md) \| [`FormFunction`](FormFunction.md) = [`Form`](Form.md) \| [`FormFunction`](FormFunction.md)

## Parameters

### form

`T`

### onSubmit

(`values`) => `void` \| `Promise`\<`void`\>

## Returns

[`FormKey`](FormKey.md)
