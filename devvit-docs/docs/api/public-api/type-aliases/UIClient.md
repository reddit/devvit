[**@devvit/public-api v0.12.6-dev**](../README.md)

---

# Type Alias: UIClient

> **UIClient** = `object`

The UI client lets your app interact with the Reddit frontend.
This client will only be available for capabilities that have
a frontend component, such as within the Custom Post component's
event handlers, a Form's `onSubmit` handler, and Menu items.

## Properties

<a id="webview"></a>

### webView

> **webView**: `WebViewUIClient`

Interact with WebView blocks

## Methods

<a id="navigateto"></a>

### navigateTo()

#### Call Signature

> **navigateTo**(`url`): `void`

Navigate to a URL

##### Parameters

###### url

`string`

##### Returns

`void`

#### Call Signature

> **navigateTo**(`subreddit`): `void`

##### Parameters

###### subreddit

`Pick`\<`Subreddit`, `"url"`\>

##### Returns

`void`

#### Call Signature

> **navigateTo**(`post`): `void`

##### Parameters

###### post

`Pick`\<`Post`, `"url"`\>

##### Returns

`void`

#### Call Signature

> **navigateTo**(`comment`): `void`

##### Parameters

###### comment

`Pick`\<`Comment`, `"url"`\>

##### Returns

`void`

#### Call Signature

> **navigateTo**(`user`): `void`

##### Parameters

###### user

`Pick`\<`User`, `"url"`\>

##### Returns

`void`

#### Call Signature

> **navigateTo**(`urlOrThing`): `void`

##### Parameters

###### urlOrThing

`string` | \{ `url`: `string`; \}

##### Returns

`void`

---

<a id="showform"></a>

### showForm()

> **showForm**(`formKey`, `data`?): `void`

Open a form in a modal

#### Parameters

##### formKey

[`FormKey`](FormKey.md)

##### data?

[`JSONObject`](JSONObject.md)

#### Returns

`void`

---

<a id="showforminternal"></a>

### showFormInternal()

> **showFormInternal**(`formKey`, `data`?, `formDataOverride`?): `void`

Internal use only.

#### Parameters

##### formKey

[`FormKey`](FormKey.md)

##### data?

[`JSONObject`](JSONObject.md)

##### formDataOverride?

[`Form`](Form.md)

#### Returns

`void`

---

<a id="showtoast"></a>

### showToast()

#### Call Signature

> **showToast**(`text`): `void`

Show a message in a toast.

##### Parameters

###### text

`string`

##### Returns

`void`

#### Call Signature

> **showToast**(`toast`): `void`

##### Parameters

###### toast

[`Toast`](Toast.md)

##### Returns

`void`

#### Call Signature

> **showToast**(`textOrToast`): `void`

##### Parameters

###### textOrToast

`string` | [`Toast`](Toast.md)

##### Returns

`void`
