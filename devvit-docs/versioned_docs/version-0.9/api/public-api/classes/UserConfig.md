# Class: UserConfig

Helper class to add and manage configuration to your actor.
Saves and loads all values to a KVStore with JSON encoding.

## Table of contents

### Constructors

- [constructor](UserConfig.md#constructor)

### Methods

- [builder](UserConfig.md#builder)
- [get](UserConfig.md#get)

## Constructors

### constructor

• **new UserConfig**(`storage?`)

#### Parameters

| Name      | Type      | Description                                        |
| :-------- | :-------- | :------------------------------------------------- |
| `storage` | `KVStore` | provide a custom KVStore or use the system default |

## Methods

### builder

▸ **builder**(): [`ConfigFormBuilder`](ConfigFormBuilder.md)

#### Returns

[`ConfigFormBuilder`](ConfigFormBuilder.md)

---

### get

▸ **get**(`key`): `Promise`\< `unknown`\>

Retrieve a value from user configuration

#### Parameters

| Name  | Type     |
| :---- | :------- |
| `key` | `string` |

#### Returns

`Promise`\< `unknown`\>
