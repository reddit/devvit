# Class: WikiPageSettings

## Table of contents

### Constructors

- [constructor](WikiPageSettings.md#constructor)

### Accessors

- [editors](WikiPageSettings.md#editors)
- [listed](WikiPageSettings.md#listed)
- [permLevel](WikiPageSettings.md#permlevel)

### Methods

- [toJSON](WikiPageSettings.md#tojson)

## Constructors

### constructor

• **new WikiPageSettings**(`data`, `metadata`)

#### Parameters

| Name       | Type                      |
| :--------- | :------------------------ |
| `data`     | `WikiPageSettings_Data`   |
| `metadata` | `undefined` \| `Metadata` |

## Accessors

### editors

• `get` **editors**(): [`User`](User.md)[]

#### Returns

[`User`](User.md)[]

---

### listed

• `get` **listed**(): `boolean`

#### Returns

`boolean`

---

### permLevel

• `get` **permLevel**(): [`WikiPagePermissionLevel`](../enums/WikiPagePermissionLevel.md)

#### Returns

[`WikiPagePermissionLevel`](../enums/WikiPagePermissionLevel.md)

## Methods

### toJSON

▸ **toJSON**(): `Object`

#### Returns

`Object`

| Name        | Type                                                                                                                                                                                                        |
| :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `editors`   | \{ `commentKarma`: `number` ; `createdAt`: `Date` ; `id`: \`t2\_$\{string}\` ; `linkKarma`: `number` ; `modPermissionsBySubreddit`: \{ `[k: string]`: `T`; } ; `nsfw`: `boolean` ; `username`: `string` }[] |
| `listed`    | `boolean`                                                                                                                                                                                                   |
| `permLevel` | [`WikiPagePermissionLevel`](../enums/WikiPagePermissionLevel.md)                                                                                                                                            |
