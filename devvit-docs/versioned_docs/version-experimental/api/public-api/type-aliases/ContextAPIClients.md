[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: ContextAPIClients

> **ContextAPIClients** = `object`

## Properties

<a id="assets"></a>

### assets

> **assets**: `AssetsClient`

A client for resolving static assets to public URLs

---

<a id="cache"></a>

### cache

> **cache**: `CacheHelper`

**`Experimental`**

The cache helper will let you cache JSON-able objects in your devvit apps for a limited amount of time.

Under the covers, It's just Redis, so you do need to enable the redis feature. This provides a pattern for e.g. fetching
remote calls without overwhelming someone's server.

```ts
Devvit.configure({
  redis: true, // Enable access to Redis
});

/// ...

let component = (context) => {
  let cached = context.cache(async () => {
    let rsp = await fetch("https://google.com")
    return rsp.body
  },
  {
    key: "some-fetch",
    ttl: 10_000 // millis
  }
  doSomethingWith(cached);
  return <text>yay</text>
}
```

---

<a id="dimensions"></a>

### dimensions?

> `optional` **dimensions**: `UIDimensions`

**`Experimental`**

Information about about a custom post's layout. Will be undefined
for non custom post surface areas such as menu items and task schedulers.

---

<a id="kvstore"></a>

### kvStore

> **kvStore**: [`KVStore`](KVStore.md)

A client for the Key Value Store

---

<a id="media"></a>

### media

> **media**: [`MediaPlugin`](MediaPlugin.md)

A client for media API

---

<a id="modlog"></a>

### modLog

> **modLog**: `ModLogClient`

A client for the ModLog API

---

<a id="realtime"></a>

### realtime

> **realtime**: `RealtimeClient`

A client for Realtime API

---

<a id="reddit"></a>

### reddit

> **reddit**: `RedditAPIClient`

A client for the Reddit API

---

<a id="redis"></a>

### redis

> **redis**: [`RedisClient`](RedisClient.md)

A client for the Redis API

---

<a id="scheduler"></a>

### scheduler

> **scheduler**: [`Scheduler`](Scheduler.md)

A client for the Scheduler API

---

<a id="settings"></a>

### settings

> **settings**: [`SettingsClient`](SettingsClient.md)

A client for the Settings API

---

<a id="ui"></a>

### ui

> **ui**: [`UIClient`](UIClient.md)

A client for the User Interface API

---

<a id="uienvironment"></a>

### uiEnvironment?

> `optional` **uiEnvironment**: `UIEnvironment`

**`Experimental`**

Additional information about client environment.
Will be undefined for non-ui contexts such as task schedulers or triggers.

---

<a id="usechannel"></a>

### ~~useChannel()~~

> **useChannel**: \<`Message`\>(`options`) => [`UseChannelResult`](UseChannelResult.md)\<`Message`\>

A hook for managing a realtime pubsub channel between Block renders.
This is only available within a Block Component.

#### Type Parameters

##### Message

`Message` _extends_ [`JSONValue`](JSONValue.md) = [`JSONValue`](JSONValue.md)

#### Parameters

##### options

`ChannelOptions`\<`Message`\>

#### Returns

[`UseChannelResult`](UseChannelResult.md)\<`Message`\>

#### Deprecated

Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.

```ts
// Old:
const channel = context.useChannel(...);

// New:
import { useChannel } from '@devvit/public-api'

const channel = useChannel(...);
```

---

<a id="useform"></a>

### ~~useForm()~~

> **useForm**: \<`T`\>(`form`, `onSubmit`) => [`FormKey`](FormKey.md)

A hook for managing a form between Block renders.
This is only available within a Block Component.

#### Type Parameters

##### T

`T` _extends_ [`Form`](Form.md) \| [`FormFunction`](FormFunction.md) = [`Form`](Form.md) \| [`FormFunction`](FormFunction.md)

#### Parameters

##### form

`T`

##### onSubmit

(`values`) => `void` \| `Promise`\<`void`\>

#### Returns

[`FormKey`](FormKey.md)

#### Deprecated

Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.

```ts
// Old:
const myForm = context.useForm(...);

// New:
import { useForm } from '@devvit/public-api'

const myForm = useForm(...);
```

---

<a id="useinterval"></a>

### ~~useInterval~~

> **useInterval**: [`UseIntervalHook`](UseIntervalHook.md)

A hook for managing a callback that runs on an interval between Block renders.
This is only available within a Block Component.

#### Deprecated

Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.

```ts
// Old:
const interval = context.useInterval(() => {}, 1000);

// New:
import { useInterval } from '@devvit/public-api';

const interval = useInterval(() => {}, 1000);
```

## Methods

<a id="usestate"></a>

### ~~useState()~~

#### Call Signature

> **useState**(`initialState`): [`UseStateResult`](UseStateResult.md)\<`boolean`\>

A hook for managing a state between Block renders. This is only available
within a Block Component. Returns a tuple containing the current state and
a function to update it.

```ts
const [counter, setCounter] = useState(0);
setCounter(1); // counter = 1
setCounter((count) => count + 1); // counter = 2
```

##### Parameters

###### initialState

`boolean` | () => `boolean` \| `Promise`\<`boolean`\>

##### Returns

[`UseStateResult`](UseStateResult.md)\<`boolean`\>

##### Deprecated

Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.

```ts
// Old:
const [counter, setCounter] = context.useState(0);

// New:
import { useState } from '@devvit/public-api';

const [counter, setCounter] = useState(0);
```

#### Call Signature

> **useState**(`initialState`): [`UseStateResult`](UseStateResult.md)\<`number`\>

A hook for managing a state between Block renders. This is only available
within a Block Component. Returns a tuple containing the current state and
a function to update it.

```ts
const [counter, setCounter] = useState(0);
setCounter(1); // counter = 1
setCounter((count) => count + 1); // counter = 2
```

##### Parameters

###### initialState

`number` | () => `number` \| `Promise`\<`number`\>

##### Returns

[`UseStateResult`](UseStateResult.md)\<`number`\>

##### Deprecated

Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.

```ts
// Old:
const [counter, setCounter] = context.useState(0);

// New:
import { useState } from '@devvit/public-api';

const [counter, setCounter] = useState(0);
```

#### Call Signature

> **useState**(`initialState`): [`UseStateResult`](UseStateResult.md)\<`string`\>

A hook for managing a state between Block renders. This is only available
within a Block Component. Returns a tuple containing the current state and
a function to update it.

```ts
const [counter, setCounter] = useState(0);
setCounter(1); // counter = 1
setCounter((count) => count + 1); // counter = 2
```

##### Parameters

###### initialState

`string` | () => `string` \| `Promise`\<`string`\>

##### Returns

[`UseStateResult`](UseStateResult.md)\<`string`\>

##### Deprecated

Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.

```ts
// Old:
const [counter, setCounter] = context.useState(0);

// New:
import { useState } from '@devvit/public-api';

const [counter, setCounter] = useState(0);
```

#### Call Signature

> **useState**\<`S`\>(`initialState`): [`UseStateResult`](UseStateResult.md)\<`S`\>

A hook for managing a state between Block renders. This is only available
within a Block Component. Returns a tuple containing the current state and
a function to update it.

```ts
const [counter, setCounter] = useState(0);
setCounter(1); // counter = 1
setCounter((count) => count + 1); // counter = 2
```

##### Type Parameters

###### S

`S` _extends_ `undefined` \| `void` \| [`JSONValue`](JSONValue.md)

##### Parameters

###### initialState

A hook for managing a state between Block renders. This is only available
within a Block Component. Returns a tuple containing the current state and
a function to update it.

```ts
const [counter, setCounter] = useState(0);
setCounter(1); // counter = 1
setCounter((count) => count + 1); // counter = 2
```

**Deprecated**

Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.

```ts
// Old:
const [counter, setCounter] = context.useState(0);

// New:
import { useState } from '@devvit/public-api';

const [counter, setCounter] = useState(0);
```

`S` | () => `S` \| `Promise`\<`S`\>

##### Returns

[`UseStateResult`](UseStateResult.md)\<`S`\>

##### Deprecated

Using hooks from context is deprecated and will be removed in a future release. Import and use hooks directly from the public-api.

```ts
// Old:
const [counter, setCounter] = context.useState(0);

// New:
import { useState } from '@devvit/public-api';

const [counter, setCounter] = useState(0);
```
