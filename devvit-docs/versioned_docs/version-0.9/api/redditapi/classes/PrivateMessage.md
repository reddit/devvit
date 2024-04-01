# Class: PrivateMessage

## Table of contents

### Constructors

- [constructor](PrivateMessage.md#constructor)

### Methods

- [send](PrivateMessage.md#send)
- [sendAsSubreddit](PrivateMessage.md#sendassubreddit)

## Constructors

### constructor

• **new PrivateMessage**()

## Methods

### send

▸ `Static` **send**(`«destructured»`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name             | Type                                                                      |
| :--------------- | :------------------------------------------------------------------------ |
| `«destructured»` | [`SendPrivateMessageOptions`](../interfaces/SendPrivateMessageOptions.md) |
| `metadata?`      | `Metadata`                                                                |

#### Returns

`Promise`\< `void`\>

---

### sendAsSubreddit

▸ `Static` **sendAsSubreddit**(`«destructured»`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name             | Type                                                                                            |
| :--------------- | :---------------------------------------------------------------------------------------------- |
| `«destructured»` | [`SendPrivateMessageAsSubredditOptions`](../interfaces/SendPrivateMessageAsSubredditOptions.md) |
| `metadata?`      | `Metadata`                                                                                      |

#### Returns

`Promise`\< `void`\>
