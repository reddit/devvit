[**@devvit/public-api v0.12.2-dev**](../README.md)

---

# Type Alias: Configuration

> **Configuration** = `object`

## Properties

<a id="http"></a>

### http?

> `optional` **http**: [`PluginSettings`](PluginSettings.md) \| `boolean` \| \{ `domains`: `string`[]; \}

Allows your app to use the HTTP/Fetch API

---

<a id="kvstore"></a>

### kvStore?

> `optional` **kvStore**: [`PluginSettings`](PluginSettings.md) \| `boolean`

Allows your app to use the Key-Value Store

---

<a id="media"></a>

### media?

> `optional` **media**: [`PluginSettings`](PluginSettings.md) \| `boolean`

Allows media uploads from apps

---

<a id="modlog"></a>

### modLog?

> `optional` **modLog**: [`PluginSettings`](PluginSettings.md) \| `boolean`

Allows using ModLog API

---

<a id="realtime"></a>

### realtime?

> `optional` **realtime**: [`PluginSettings`](PluginSettings.md) \| `boolean`

Allows your app to use the Realtime Plugin

---

<a id="redditapi"></a>

### redditAPI?

> `optional` **redditAPI**: [`PluginSettings`](PluginSettings.md) \| `boolean`

Allows your app to use the reddit API

---

<a id="redis"></a>

### redis?

> `optional` **redis**: [`PluginSettings`](PluginSettings.md) \| `boolean`

Allows your app to use the Redis Plugin

---

<a id="useractions"></a>

### userActions?

> `optional` **userActions**: `boolean` \| \{ `enabled`: `boolean`; \} \| \{ `scopes`: `Scope`[]; \}

Allows your app to call Reddit APIs on behalf of the User. Passing a boolean allows you to submit post/comments on behalf of the user.

#### Type declaration

`boolean`

\{ `enabled`: `boolean`; \}

#### enabled

> **enabled**: `boolean`

Defaults to SUBMIT_POST and SUBMIT_COMMENT.

\{ `scopes`: `Scope`[]; \}

#### scopes

> **scopes**: `Scope`[]
