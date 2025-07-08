[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: UseChannelResult\<Message\>

> **UseChannelResult**\<`Message`\> = `object`

## Type Parameters

### Message

`Message` _extends_ [`JSONValue`](JSONValue.md) = [`JSONValue`](JSONValue.md)

## Properties

<a id="status"></a>

### status

> **status**: `ChannelStatus`

Current subscription status

## Methods

<a id="send"></a>

### send()

> **send**(`msg`): `Promise`\<`void`\>

Publish a message to the channel

#### Parameters

##### msg

`Message`

#### Returns

`Promise`\<`void`\>

---

<a id="subscribe"></a>

### subscribe()

> **subscribe**(): `void`

Subscribe to the channel

#### Returns

`void`

---

<a id="unsubscribe"></a>

### unsubscribe()

> **unsubscribe**(): `void`

Unsubscribe from the channel

#### Returns

`void`
