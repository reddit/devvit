# Class: ModNote

## Table of contents

### Properties

- [createdAt](ModNote.md#createdat)
- [id](ModNote.md#id)
- [modAction](ModNote.md#modaction)
- [operator](ModNote.md#operator)
- [subreddit](ModNote.md#subreddit)
- [type](ModNote.md#type)
- [user](ModNote.md#user)
- [userNote](ModNote.md#usernote)

### Methods

- [add](ModNote.md#add)
- [delete](ModNote.md#delete)
- [get](ModNote.md#get)

## Properties

### createdAt

• **createdAt**: `Date`

---

### id

• **id**: `string`

---

### modAction

• `Optional` **modAction**: [`ModAction`](../interfaces/ModAction.md)

---

### operator

• **operator**: `Object`

#### Type declaration

| Name    | Type               |
| :------ | :----------------- |
| `id?`   | \`t2\_$\{string}\` |
| `name?` | `string`           |

---

### subreddit

• **subreddit**: `Object`

#### Type declaration

| Name    | Type               |
| :------ | :----------------- |
| `id?`   | \`t5\_$\{string}\` |
| `name?` | `string`           |

---

### type

• **type**: [`ModNoteType`](../README.md#modnotetype)

---

### user

• **user**: `Object`

#### Type declaration

| Name    | Type               |
| :------ | :----------------- |
| `id?`   | \`t2\_$\{string}\` |
| `name?` | `string`           |

---

### userNote

• `Optional` **userNote**: [`UserNote`](../interfaces/UserNote.md)

## Methods

### add

▸ `Static` **add**(`options`, `metadata?`): `Promise`\< [`ModNote`](ModNote.md)\>

#### Parameters

| Name        | Type                                                                                                                                                   |
| :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`   | `Prettify`\< `PostNotesRequest` & \{ `label`: [`UserNoteLabel`](../README.md#usernotelabel) ; `redditId`: \`t1\_$\{string}\` \| \`t3\_$\{string}\` }\> |
| `metadata?` | `Metadata`                                                                                                                                             |

#### Returns

`Promise`\< [`ModNote`](ModNote.md)\>

---

### delete

▸ `Static` **delete**(`options`, `metadata?`): `Promise`\< `boolean`\>

#### Parameters

| Name        | Type                 |
| :---------- | :------------------- |
| `options`   | `DeleteNotesRequest` |
| `metadata?` | `Metadata`           |

#### Returns

`Promise`\< `boolean`\>

---

### get

▸ `Static` **get**(`options`, `metadata?`): [`Listing`](Listing.md)\< [`ModNote`](ModNote.md)\>

#### Parameters

| Name        | Type                                                                                                                                                                                                                                   |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`   | `Prettify`\< `Pick`\< `GetNotesRequest`, `"subreddit"` \| `"user"`\> & \{ `filter?`: [`ModNoteType`](../README.md#modnotetype) } & `Pick`\< [`ListingFetchOptions`](../interfaces/ListingFetchOptions.md), `"before"` \| `"limit"`\>\> |
| `metadata?` | `Metadata`                                                                                                                                                                                                                             |

#### Returns

[`Listing`](Listing.md)\< [`ModNote`](ModNote.md)\>
