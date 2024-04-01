# Interface: CreateFlairTemplateOptions

## Hierarchy

- **`CreateFlairTemplateOptions`**

  ↳ [`EditFlairTemplateOptions`](EditFlairTemplateOptions.md)

## Table of contents

### Properties

- [allowUserEdits](CreateFlairTemplateOptions.md#allowuseredits)
- [allowableContent](CreateFlairTemplateOptions.md#allowablecontent)
- [backgroundColor](CreateFlairTemplateOptions.md#backgroundcolor)
- [maxEmojis](CreateFlairTemplateOptions.md#maxemojis)
- [modOnly](CreateFlairTemplateOptions.md#modonly)
- [subredditName](CreateFlairTemplateOptions.md#subredditname)
- [text](CreateFlairTemplateOptions.md#text)
- [textColor](CreateFlairTemplateOptions.md#textcolor)

## Properties

### allowUserEdits

• `Optional` **allowUserEdits**: `boolean`

Whether or not users are allowed to edit this flair template before using it.

---

### allowableContent

• `Optional` **allowableContent**: [`AllowableFlairContent`](../README.md#allowableflaircontent)

The flair template's allowable content. Either 'all', 'emoji', or 'text'.

---

### backgroundColor

• `Optional` **backgroundColor**: `string`

The background color of the flair. Either 'transparent' or a hex color code. e.g. #FFC0CB

---

### maxEmojis

• `Optional` **maxEmojis**: `number`

---

### modOnly

• `Optional` **modOnly**: `boolean`

Whether or not this flair template is only available to moderators.

---

### subredditName

• **subredditName**: `string`

The name of the subreddit to create the flair template in.

---

### text

• **text**: `string`

The text to display in the flair.

---

### textColor

• `Optional` **textColor**: [`FlairTextColor`](../README.md#flairtextcolor)

Either 'dark' or 'light'.
