[**@devvit/public-api v0.11.18-dev**](../README.md)

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

`Subreddit`

##### Returns

`void`

#### Call Signature

> **navigateTo**(`post`): `void`

##### Parameters

###### post

`Post`

##### Returns

`void`

#### Call Signature

> **navigateTo**(`comment`): `void`

##### Parameters

###### comment

`Comment`

##### Returns

`void`

#### Call Signature

> **navigateTo**(`user`): `void`

##### Parameters

###### user

`User`

##### Returns

`void`

#### Call Signature

> **navigateTo**(`urlOrThing`): `void`

##### Parameters

###### urlOrThing

`string` | `User` | `Subreddit` | `Post` | `Comment`

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
