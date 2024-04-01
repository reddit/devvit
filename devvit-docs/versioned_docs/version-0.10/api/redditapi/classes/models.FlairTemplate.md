# Class: FlairTemplate

[models](../modules/models.md).FlairTemplate

## Table of contents

### Accessors

- [allowUserEdits](models.FlairTemplate.md#allowuseredits)
- [allowableContent](models.FlairTemplate.md#allowablecontent)
- [backgroundColor](models.FlairTemplate.md#backgroundcolor)
- [id](models.FlairTemplate.md#id)
- [maxEmojis](models.FlairTemplate.md#maxemojis)
- [modOnly](models.FlairTemplate.md#modonly)
- [text](models.FlairTemplate.md#text)
- [textColor](models.FlairTemplate.md#textcolor)

### Methods

- [delete](models.FlairTemplate.md#delete)
- [edit](models.FlairTemplate.md#edit)

## Accessors

### <a id="allowuseredits" name="allowuseredits"></a> allowUserEdits

• `get` **allowUserEdits**(): `boolean`

Does the flair template allow users to edit their flair?

#### Returns

`boolean`

---

### <a id="allowablecontent" name="allowablecontent"></a> allowableContent

• `get` **allowableContent**(): [`AllowableFlairContent`](../modules/models.md#allowableflaircontent)

The flair template's allowable content. Either 'all', 'emoji', or 'text'.

#### Returns

[`AllowableFlairContent`](../modules/models.md#allowableflaircontent)

---

### <a id="backgroundcolor" name="backgroundcolor"></a> backgroundColor

• `get` **backgroundColor**(): [`FlairBackgroundColor`](../modules/models.md#flairbackgroundcolor)

The flair template's background color. Either 'transparent' or a hex color code. e.g. #FFC0CB

#### Returns

[`FlairBackgroundColor`](../modules/models.md#flairbackgroundcolor)

---

### <a id="id" name="id"></a> id

• `get` **id**(): `string`

The flair template's ID

#### Returns

`string`

---

### <a id="maxemojis" name="maxemojis"></a> maxEmojis

• `get` **maxEmojis**(): `number`

The flair template's maximum number of emojis.

#### Returns

`number`

---

### <a id="modonly" name="modonly"></a> modOnly

• `get` **modOnly**(): `boolean`

Is the flair template only available to moderators?

#### Returns

`boolean`

---

### <a id="text" name="text"></a> text

• `get` **text**(): `string`

The flair template's text

#### Returns

`string`

---

### <a id="textcolor" name="textcolor"></a> textColor

• `get` **textColor**(): [`FlairTextColor`](../modules/models.md#flairtextcolor)

The flair template's text color. Either 'dark' or 'light'.

#### Returns

[`FlairTextColor`](../modules/models.md#flairtextcolor)

## Methods

### <a id="delete" name="delete"></a> delete

▸ **delete**(): `Promise`\<`void`\>

Delete this flair template

#### Returns

`Promise`\<`void`\>

---

### <a id="edit" name="edit"></a> edit

▸ **edit**(`options`): `Promise`\<[`FlairTemplate`](models.FlairTemplate.md)\>

Edit this flair template

#### Parameters

| Name      | Type                                                                                                                            |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------ |
| `options` | `Partial`\<`Omit`\<[`EditFlairTemplateOptions`](../modules/models.md#editflairtemplateoptions), `"subredditName"` \| `"id"`\>\> |

#### Returns

`Promise`\<[`FlairTemplate`](models.FlairTemplate.md)\>
