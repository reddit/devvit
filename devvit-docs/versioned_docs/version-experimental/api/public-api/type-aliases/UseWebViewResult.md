[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: UseWebViewResult\<To\>

> **UseWebViewResult**\<`To`\> = `object`

## Type Parameters

### To

`To` _extends_ [`JSONValue`](JSONValue.md) = [`JSONValue`](JSONValue.md)

Message from Devvit Blocks app to web view.

## Methods

<a id="mount"></a>

### mount()

> **mount**(): `void`

Initiate a request for the web view to open

#### Returns

`void`

---

<a id="postmessage"></a>

### postMessage()

> **postMessage**(`message`): `void`

Send a message to the web view

#### Parameters

##### message

`To`

#### Returns

`void`

---

<a id="unmount"></a>

### unmount()

> **unmount**(): `void`

Initiate a request for the web view to be closed

#### Returns

`void`
