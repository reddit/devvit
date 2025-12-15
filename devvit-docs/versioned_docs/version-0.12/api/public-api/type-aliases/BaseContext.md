[**@devvit/public-api v0.12.6-dev**](../README.md)

---

# Type Alias: BaseContext

> **BaseContext** = `object`

## Properties

<a id="appaccountid"></a>

### ~~appAccountId~~

> **appAccountId**: `string`

The ID of the current app's account

#### Deprecated

Use [BaseContext.appName](#appname) instead to get the app's username

---

<a id="appname"></a>

### appName

> **appName**: `string`

The slug of the app that is running

---

<a id="appversion"></a>

### appVersion

> **appVersion**: `string`

The version of the app that is running

---

<a id="commentid"></a>

### commentId?

> `optional` **commentId**: `string`

The ID of the current comment

---

<a id="debug"></a>

### debug

> **debug**: [`ContextDebugInfo`](ContextDebugInfo.md)

More useful things, but probably not for the average developer

---

<a id="metadata"></a>

### metadata

> **metadata**: [`Metadata`](Metadata.md)

Request headers.

---

<a id="postdata"></a>

### postData

> **postData**: `PostData` \| `undefined`

---

<a id="postid"></a>

### postId?

> `optional` **postId**: `string`

The ID of the current post

---

<a id="snoovatar"></a>

### snoovatar?

> `optional` **snoovatar**: `string`

**`Experimental`**

The current user's snoovtar URL if logged in

---

<a id="subredditid"></a>

### subredditId

> **subredditId**: `string`

The ID of the current subreddit

---

<a id="subredditname"></a>

### subredditName?

> `optional` **subredditName**: `string`

The name of the current subreddit

---

<a id="userid"></a>

### userId?

> `optional` **userId**: `string`

The current user's ID if this event was triggered by a logged in user

---

<a id="username"></a>

### username?

> `optional` **username**: `string`

**`Experimental`**

The current user's handle if logged in

## Methods

<a id="tojson"></a>

### toJSON()

> **toJSON**(): `Omit`\<`BaseContext`, `"toJSON"`\>

Returns a JSON representation of the context

#### Returns

`Omit`\<`BaseContext`, `"toJSON"`\>
