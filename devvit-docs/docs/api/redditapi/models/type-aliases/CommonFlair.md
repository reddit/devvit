[**@devvit/public-api v0.12.7-dev**](../../README.md)

---

# Type Alias: CommonFlair

> **CommonFlair** = `object`

This type is used for both the link and author flairs on Post and Comment objects.

## Properties

<a id="backgroundcolor"></a>

### backgroundColor?

> `optional` **backgroundColor**: `string`

Flair background color as a hex color string (# prefixed) or transparent

#### Example

```ts
'#FF4500';
```

---

<a id="cssclass"></a>

### cssClass?

> `optional` **cssClass**: `string`

Custom CSS classes from the subreddit's stylesheet to apply to the flair if rendered as HTML

---

<a id="richtext"></a>

### richtext

> **richtext**: `object`[]

RichText object representation of the flair

#### elementType?

> `optional` **elementType**: `string`

Enum of element types. e.g. emoji or text

#### emojiRef?

> `optional` **emojiRef**: `string`

Emoji references, e.g. ":rainbow:"

#### text?

> `optional` **text**: `string`

Text to show up in the flair, e.g. "Need Advice"

#### url?

> `optional` **url**: `string`

url string, e.g. "https://reddit.com/"

---

<a id="templateid"></a>

### templateId?

> `optional` **templateId**: `string`

Flair template ID to use when rendering this flair

---

<a id="text"></a>

### text?

> `optional` **text**: `string`

Plain text representation of the flair

---

<a id="textcolor"></a>

### textColor?

> `optional` **textColor**: `string`

One of: "light", "dark"

---

<a id="type"></a>

### type?

> `optional` **type**: `string`

One of: "text", "richtext"
