# Interface: EditFlairTemplateOptions

## Hierarchy

- [`CreateFlairTemplateOptions`](CreateFlairTemplateOptions.md)

  ↳ **`EditFlairTemplateOptions`**

## Table of contents

### Properties

- [allowUserEdits](EditFlairTemplateOptions.md#allowuseredits)
- [allowableContent](EditFlairTemplateOptions.md#allowablecontent)
- [backgroundColor](EditFlairTemplateOptions.md#backgroundcolor)
- [id](EditFlairTemplateOptions.md#id)
- [maxEmojis](EditFlairTemplateOptions.md#maxemojis)
- [modOnly](EditFlairTemplateOptions.md#modonly)
- [subredditName](EditFlairTemplateOptions.md#subredditname)
- [text](EditFlairTemplateOptions.md#text)
- [textColor](EditFlairTemplateOptions.md#textcolor)

## Properties

### allowUserEdits

• `Optional` **allowUserEdits**: `boolean`

Whether or not users are allowed to edit this flair template before using it.

#### Inherited from

[CreateFlairTemplateOptions](CreateFlairTemplateOptions.md).[allowUserEdits](CreateFlairTemplateOptions.md#allowuseredits)

---

### allowableContent

• `Optional` **allowableContent**: [`AllowableFlairContent`](../README.md#allowableflaircontent)

The flair template's allowable content. Either 'all', 'emoji', or 'text'.

#### Inherited from

[CreateFlairTemplateOptions](CreateFlairTemplateOptions.md).[allowableContent](CreateFlairTemplateOptions.md#allowablecontent)

---

### backgroundColor

• `Optional` **backgroundColor**: `string`

The background color of the flair. Either 'transparent' or a hex color code. e.g. #FFC0CB

#### Inherited from

[CreateFlairTemplateOptions](CreateFlairTemplateOptions.md).[backgroundColor](CreateFlairTemplateOptions.md#backgroundcolor)

---

### id

• **id**: `string`

---

### maxEmojis

• `Optional` **maxEmojis**: `number`

#### Inherited from

[CreateFlairTemplateOptions](CreateFlairTemplateOptions.md).[maxEmojis](CreateFlairTemplateOptions.md#maxemojis)

---

### modOnly

• `Optional` **modOnly**: `boolean`

Whether or not this flair template is only available to moderators.

#### Inherited from

[CreateFlairTemplateOptions](CreateFlairTemplateOptions.md).[modOnly](CreateFlairTemplateOptions.md#modonly)

---

### subredditName

• **subredditName**: `string`

The name of the subreddit to create the flair template in.

#### Inherited from

[CreateFlairTemplateOptions](CreateFlairTemplateOptions.md).[subredditName](CreateFlairTemplateOptions.md#subredditname)

---

### text

• **text**: `string`

The text to display in the flair.

#### Inherited from

[CreateFlairTemplateOptions](CreateFlairTemplateOptions.md).[text](CreateFlairTemplateOptions.md#text)

---

### textColor

• `Optional` **textColor**: [`FlairTextColor`](../README.md#flairtextcolor)

Either 'dark' or 'light'.

#### Inherited from

[CreateFlairTemplateOptions](CreateFlairTemplateOptions.md).[textColor](CreateFlairTemplateOptions.md#textcolor)
