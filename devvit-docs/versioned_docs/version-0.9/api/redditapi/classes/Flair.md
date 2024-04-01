# Class: Flair

## Table of contents

### Constructors

- [constructor](Flair.md#constructor)

### Methods

- [removePostFlair](Flair.md#removepostflair)
- [removeUserFlair](Flair.md#removeuserflair)
- [setPostFlair](Flair.md#setpostflair)
- [setUserFlair](Flair.md#setuserflair)

## Constructors

### constructor

• **new Flair**()

## Methods

### removePostFlair

▸ `Static` **removePostFlair**(`subredditName`, `postId`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name            | Type               |
| :-------------- | :----------------- |
| `subredditName` | `string`           |
| `postId`        | \`t3\_$\{string}\` |
| `metadata?`     | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### removeUserFlair

▸ `Static` **removeUserFlair**(`subredditName`, `username`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name            | Type       |
| :-------------- | :--------- |
| `subredditName` | `string`   |
| `username`      | `string`   |
| `metadata?`     | `Metadata` |

#### Returns

`Promise`\< `void`\>

---

### setPostFlair

▸ `Static` **setPostFlair**(`options`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type                                                          |
| :---------- | :------------------------------------------------------------ |
| `options`   | [`SetPostFlairOptions`](../interfaces/SetPostFlairOptions.md) |
| `metadata?` | `Metadata`                                                    |

#### Returns

`Promise`\< `void`\>

---

### setUserFlair

▸ `Static` **setUserFlair**(`options`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type                                                          |
| :---------- | :------------------------------------------------------------ |
| `options`   | [`SetUserFlairOptions`](../interfaces/SetUserFlairOptions.md) |
| `metadata?` | `Metadata`                                                    |

#### Returns

`Promise`\< `void`\>
