# Class: WikiPageRevision

## Table of contents

### Constructors

- [constructor](WikiPageRevision.md#constructor)

### Accessors

- [author](WikiPageRevision.md#author)
- [date](WikiPageRevision.md#date)
- [hidden](WikiPageRevision.md#hidden)
- [id](WikiPageRevision.md#id)
- [page](WikiPageRevision.md#page)
- [reason](WikiPageRevision.md#reason)

### Methods

- [toJSON](WikiPageRevision.md#tojson)

## Constructors

### constructor

• **new WikiPageRevision**(`data`, `metadata`)

#### Parameters

| Name       | Type                      |
| :--------- | :------------------------ |
| `data`     | `WikiPageRevision`        |
| `metadata` | `undefined` \| `Metadata` |

## Accessors

### author

• `get` **author**(): [`User`](User.md)

#### Returns

[`User`](User.md)

---

### date

• `get` **date**(): `Date`

#### Returns

`Date`

---

### hidden

• `get` **hidden**(): `boolean`

#### Returns

`boolean`

---

### id

• `get` **id**(): `string`

#### Returns

`string`

---

### page

• `get` **page**(): `string`

#### Returns

`string`

---

### reason

• `get` **reason**(): `string`

#### Returns

`string`

## Methods

### toJSON

▸ **toJSON**(): `Object`

#### Returns

`Object`

| Name                               | Type                                                                                                                                                                                                      |
| :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `author`                           | \{ `commentKarma`: `number` ; `createdAt`: `Date` ; `id`: \`t2\_$\{string}\` ; `linkKarma`: `number` ; `modPermissionsBySubreddit`: \{ `[k: string]`: `T`; } ; `nsfw`: `boolean` ; `username`: `string` } |
| `author.commentKarma`              | `number`                                                                                                                                                                                                  |
| `author.createdAt`                 | `Date`                                                                                                                                                                                                    |
| `author.id`                        | \`t2\_$\{string}\`                                                                                                                                                                                        |
| `author.linkKarma`                 | `number`                                                                                                                                                                                                  |
| `author.modPermissionsBySubreddit` | \{ `[k: string]`: `T`; }                                                                                                                                                                                  |
| `author.nsfw`                      | `boolean`                                                                                                                                                                                                 |
| `author.username`                  | `string`                                                                                                                                                                                                  |
| `date`                             | `Date`                                                                                                                                                                                                    |
| `hidden`                           | `boolean`                                                                                                                                                                                                 |
| `id`                               | `string`                                                                                                                                                                                                  |
| `page`                             | `string`                                                                                                                                                                                                  |
| `reason`                           | `string`                                                                                                                                                                                                  |
