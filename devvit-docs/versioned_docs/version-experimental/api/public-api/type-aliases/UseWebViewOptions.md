[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: UseWebViewOptions\<From, To\>

> **UseWebViewOptions**\<`From`, `To`\> = `object`

## Type Parameters

### From

`From` _extends_ [`JSONValue`](JSONValue.md) = [`JSONValue`](JSONValue.md)

Message from web view to Devvit Blocks app.

### To

`To` _extends_ [`JSONValue`](JSONValue.md) = [`JSONValue`](JSONValue.md)

Message from Devvit Blocks app to web view.

## Properties

<a id="onmessage"></a>

### onMessage

> **onMessage**: [`UseWebViewOnMessage`](UseWebViewOnMessage.md)\<`From`, `To`\>

Handle UI events originating from the web view to be handled by a Devvit app

---

<a id="onunmount"></a>

### ~~onUnmount()?~~

> `optional` **onUnmount**: (`hook`) => `void` \| `Promise`\<`void`\>

The callback to run when the web view has been unmounted. Might be used to
set state, stop or resume timers, or perform other tasks now that the web view is no longer visible.

#### Parameters

##### hook

[`UseWebViewResult`](UseWebViewResult.md)\<`To`\>

#### Returns

`void` \| `Promise`\<`void`\>

#### Deprecated

use the page visibility API for now.

---

<a id="url"></a>

### url?

> `optional` **url**: `string`

Relative HTML asset filename like `foo/bar.html`. Defaults to index.html if omitted.
