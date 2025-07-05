[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: UseWebViewOnMessage()\<From, To\>

> **UseWebViewOnMessage**\<`From`, `To`\> = (`message`, `hook`) => `void` \| `Promise`\<`void`\>

## Type Parameters

### From

`From` _extends_ [`JSONValue`](JSONValue.md) = [`JSONValue`](JSONValue.md)

Message from web view to Devvit Blocks app.

### To

`To` _extends_ [`JSONValue`](JSONValue.md) = [`JSONValue`](JSONValue.md)

Message from Devvit Blocks app to web view.

## Parameters

### message

`From`

### hook

[`UseWebViewResult`](UseWebViewResult.md)\<`To`\>

## Returns

`void` \| `Promise`\<`void`\>
