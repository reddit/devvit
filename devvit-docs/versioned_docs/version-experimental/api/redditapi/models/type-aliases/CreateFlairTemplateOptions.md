[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Type Alias: CreateFlairTemplateOptions

> **CreateFlairTemplateOptions** = `object`

## Properties

<a id="allowablecontent"></a>

### allowableContent?

> `optional` **allowableContent**: [`AllowableFlairContent`](AllowableFlairContent.md)

The flair template's allowable content. Either 'all', 'emoji', or 'text'.

---

<a id="allowuseredits"></a>

### allowUserEdits?

> `optional` **allowUserEdits**: `boolean`

Whether or not users are allowed to edit this flair template before using it.

---

<a id="backgroundcolor"></a>

### backgroundColor?

> `optional` **backgroundColor**: `string`

The background color of the flair. Either 'transparent' or a hex color code. e.g. #FFC0CB

---

<a id="maxemojis"></a>

### maxEmojis?

> `optional` **maxEmojis**: `number`

---

<a id="modonly"></a>

### modOnly?

> `optional` **modOnly**: `boolean`

Whether or not this flair template is only available to moderators.

---

<a id="subredditname"></a>

### subredditName

> **subredditName**: `string`

The name of the subreddit to create the flair template in.

---

<a id="text"></a>

### text

> **text**: `string`

The text to display in the flair.

---

<a id="textcolor"></a>

### textColor?

> `optional` **textColor**: [`FlairTextColor`](FlairTextColor.md)

Either 'dark' or 'light'.
