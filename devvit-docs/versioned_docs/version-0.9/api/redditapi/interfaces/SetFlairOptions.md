# Interface: SetFlairOptions

## Hierarchy

- **`SetFlairOptions`**

  ↳ [`SetUserFlairOptions`](SetUserFlairOptions.md)

  ↳ [`SetPostFlairOptions`](SetPostFlairOptions.md)

  ↳ [`InternalSetPostFlairOptions`](InternalSetPostFlairOptions.md)

## Table of contents

### Properties

- [backgroundColor](SetFlairOptions.md#backgroundcolor)
- [cssClass](SetFlairOptions.md#cssclass)
- [flairTemplateId](SetFlairOptions.md#flairtemplateid)
- [subredditName](SetFlairOptions.md#subredditname)
- [text](SetFlairOptions.md#text)
- [textColor](SetFlairOptions.md#textcolor)

## Properties

### backgroundColor

• `Optional` **backgroundColor**: `string`

The flair background color. Either 'transparent' or a hex color code. e.g. #FFC0CB

---

### cssClass

• `Optional` **cssClass**: `string`

The flair CSS class

---

### flairTemplateId

• `Optional` **flairTemplateId**: `string`

The flair template's ID

---

### subredditName

• **subredditName**: `string`

The name of the subreddit of the item to set the flair on

---

### text

• `Optional` **text**: `string`

The flair text

---

### textColor

• `Optional` **textColor**: [`FlairTextColor`](../README.md#flairtextcolor)

The flair text color. Either 'dark' or 'light'.
