# Class: FlairTemplate

## Table of contents

### Accessors

- [allowUserEdits](FlairTemplate.md#allowuseredits)
- [allowableContent](FlairTemplate.md#allowablecontent)
- [backgroundColor](FlairTemplate.md#backgroundcolor)
- [id](FlairTemplate.md#id)
- [maxEmojis](FlairTemplate.md#maxemojis)
- [modOnly](FlairTemplate.md#modonly)
- [text](FlairTemplate.md#text)
- [textColor](FlairTemplate.md#textcolor)

### Methods

- [delete](FlairTemplate.md#delete)
- [edit](FlairTemplate.md#edit)
- [createPostFlairTemplate](FlairTemplate.md#createpostflairtemplate)
- [createUserFlairTemplate](FlairTemplate.md#createuserflairtemplate)
- [deleteFlairTemplate](FlairTemplate.md#deleteflairtemplate)
- [editFlairTemplate](FlairTemplate.md#editflairtemplate)
- [getPostFlairTemplates](FlairTemplate.md#getpostflairtemplates)
- [getUserFlairTemplates](FlairTemplate.md#getuserflairtemplates)

## Accessors

### allowUserEdits

• `get` **allowUserEdits**(): `boolean`

Whether or not the flair template allows users to edit their flair.

#### Returns

`boolean`

---

### allowableContent

• `get` **allowableContent**(): [`AllowableFlairContent`](../README.md#allowableflaircontent)

The flair template's allowable content. Either 'all', 'emoji', or 'text'.

#### Returns

[`AllowableFlairContent`](../README.md#allowableflaircontent)

---

### backgroundColor

• `get` **backgroundColor**(): [`FlairBackgroundColor`](../README.md#flairbackgroundcolor)

The flair template's background color. Either 'transparent' or a hex color code. e.g. #FFC0CB

#### Returns

[`FlairBackgroundColor`](../README.md#flairbackgroundcolor)

---

### id

• `get` **id**(): `string`

The flair template's ID

#### Returns

`string`

---

### maxEmojis

• `get` **maxEmojis**(): `number`

The flair template's maximum number of emojis.

#### Returns

`number`

---

### modOnly

• `get` **modOnly**(): `boolean`

Whether or not the flair template is only available to moderators.

#### Returns

`boolean`

---

### text

• `get` **text**(): `string`

The flair template's text

#### Returns

`string`

---

### textColor

• `get` **textColor**(): [`FlairTextColor`](../README.md#flairtextcolor)

The flair template's text color. Either 'dark' or 'light'.

#### Returns

[`FlairTextColor`](../README.md#flairtextcolor)

## Methods

### delete

▸ **delete**(): `Promise`\< `void`\>

Delete this flair template

#### Returns

`Promise`\< `void`\>

---

### edit

▸ **edit**(`options`): `Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

Edit this flair template

#### Parameters

| Name      | Type                                                                                                                          |
| :-------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `options` | `Partial`\< `Omit`\< [`EditFlairTemplateOptions`](../interfaces/EditFlairTemplateOptions.md), `"id"` \| `"subredditName"`\>\> |

#### Returns

`Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

---

### createPostFlairTemplate

▸ `Static` **createPostFlairTemplate**(`options`, `metadata?`): `Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

#### Parameters

| Name        | Type                                                                        |
| :---------- | :-------------------------------------------------------------------------- |
| `options`   | [`CreateFlairTemplateOptions`](../interfaces/CreateFlairTemplateOptions.md) |
| `metadata?` | `Metadata`                                                                  |

#### Returns

`Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

---

### createUserFlairTemplate

▸ `Static` **createUserFlairTemplate**(`options`, `metadata?`): `Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

#### Parameters

| Name        | Type                                                                        |
| :---------- | :-------------------------------------------------------------------------- |
| `options`   | [`CreateFlairTemplateOptions`](../interfaces/CreateFlairTemplateOptions.md) |
| `metadata?` | `Metadata`                                                                  |

#### Returns

`Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

---

### deleteFlairTemplate

▸ `Static` **deleteFlairTemplate**(`subredditName`, `flairTemplateId`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name              | Type       |
| :---------------- | :--------- |
| `subredditName`   | `string`   |
| `flairTemplateId` | `string`   |
| `metadata?`       | `Metadata` |

#### Returns

`Promise`\< `void`\>

---

### editFlairTemplate

▸ `Static` **editFlairTemplate**(`editOptions`, `metadata?`): `Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

#### Parameters

| Name          | Type                                                                    |
| :------------ | :---------------------------------------------------------------------- |
| `editOptions` | [`EditFlairTemplateOptions`](../interfaces/EditFlairTemplateOptions.md) |
| `metadata?`   | `Metadata`                                                              |

#### Returns

`Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

---

### getPostFlairTemplates

▸ `Static` **getPostFlairTemplates**(`subredditName`, `metadata?`): `Promise`\< [`FlairTemplate`](FlairTemplate.md)[]\>

#### Parameters

| Name            | Type       |
| :-------------- | :--------- |
| `subredditName` | `string`   |
| `metadata?`     | `Metadata` |

#### Returns

`Promise`\< [`FlairTemplate`](FlairTemplate.md)[]\>

---

### getUserFlairTemplates

▸ `Static` **getUserFlairTemplates**(`subredditName`, `metadata?`): `Promise`\< [`FlairTemplate`](FlairTemplate.md)[]\>

#### Parameters

| Name            | Type       |
| :-------------- | :--------- |
| `subredditName` | `string`   |
| `metadata?`     | `Metadata` |

#### Returns

`Promise`\< [`FlairTemplate`](FlairTemplate.md)[]\>
