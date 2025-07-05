[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Function: useAsync()

> **useAsync**\<`S`\>(`initializer`, `options`): [`UseAsyncResult`](../type-aliases/UseAsyncResult.md)\<`S`\>

This is the preferred way to handle async state in Devvit.

## Type Parameters

### S

`S` _extends_ [`JSONValue`](../type-aliases/JSONValue.md)

## Parameters

### initializer

[`AsyncUseStateInitializer`](../type-aliases/AsyncUseStateInitializer.md)\<`S`\>

any async function that returns a JSONValue

### options

`AsyncOptions`\<`S`\> = `{}`

## Returns

[`UseAsyncResult`](../type-aliases/UseAsyncResult.md)\<`S`\>

UseAsyncResult<S>
