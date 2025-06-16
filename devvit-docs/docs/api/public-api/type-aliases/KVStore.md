[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: KVStore

> **KVStore** = `object`

## Methods

<a id="delete"></a>

### delete()

> **delete**(`key`): `Promise`\<`void`\>

Deletes a key from the store if present

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`void`\>

---

<a id="get"></a>

### get()

> **get**\<`T`\>(`key`): `Promise`\<`undefined` \| `T`\>

Retrieves a value from the store at the given key

#### Type Parameters

##### T

`T` _extends_ [`JSONValue`](JSONValue.md) = [`JSONValue`](JSONValue.md)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`undefined` \| `T`\>

---

<a id="list"></a>

### list()

> **list**(): `Promise`\<`string`[]\>

Returns a list of keys in the store

#### Returns

`Promise`\<`string`[]\>

---

<a id="put"></a>

### put()

> **put**(`key`, `value`): `Promise`\<`void`\>

Assigns a value to a key in the store

#### Parameters

##### key

`string`

##### value

[`JSONValue`](JSONValue.md)

#### Returns

`Promise`\<`void`\>
