# Class: KeyValueStorage

Simplified wrapper around KVStore which stores all data as serialized JSON objects

## Table of contents

### Constructors

- [constructor](KeyValueStorage.md#constructor)

### Methods

- [delete](KeyValueStorage.md#delete)
- [get](KeyValueStorage.md#get)
- [list](KeyValueStorage.md#list)
- [put](KeyValueStorage.md#put)

## Constructors

### constructor

• **new KeyValueStorage**(`storage?`)

#### Parameters

| Name      | Type      |
| :-------- | :-------- |
| `storage` | `KVStore` |

## Methods

### delete

▸ **delete**(`key`, `metadata?`): `Promise`\< `void`\>

Deletes a key from the store if present

#### Parameters

| Name        | Type       |
| :---------- | :--------- |
| `key`       | `string`   |
| `metadata?` | `Metadata` |

#### Returns

`Promise`\< `void`\>

---

### get

▸ **get**\< `T`\>(`key`, `metadata?`, `defaultValue?`): `Promise`\< `undefined` \| `T`\>

Retrieves a value from the store at the given key or defaultValue if not found or falsy

to-do: remove defaultValue and use builtin nullish coalescing at call
sites.
to-do: change falsy comparison to an undefined check since undefineds are
stripped by JSON parsing. This will allow KV to represent sets with any
values and be less surprising.

#### Type parameters

| Name | Type                |
| :--- | :------------------ |
| `T`  | extends `JSONValue` |

#### Parameters

| Name            | Type       |
| :-------------- | :--------- |
| `key`           | `string`   |
| `metadata?`     | `Metadata` |
| `defaultValue?` | `T`        |

#### Returns

`Promise`\< `undefined` \| `T`\>

---

### list

▸ **list**(`metadata?`): `Promise`\< `string`[]\>

Returns a list of keys in the store

#### Parameters

| Name        | Type       |
| :---------- | :--------- |
| `metadata?` | `Metadata` |

#### Returns

`Promise`\< `string`[]\>

---

### put

▸ **put**(`key`, `value`, `metadata?`): `Promise`\< `void`\>

Assigns a value to a key in the store

#### Parameters

| Name        | Type        |
| :---------- | :---------- |
| `key`       | `string`    |
| `value`     | `JSONValue` |
| `metadata?` | `Metadata`  |

#### Returns

`Promise`\< `void`\>
