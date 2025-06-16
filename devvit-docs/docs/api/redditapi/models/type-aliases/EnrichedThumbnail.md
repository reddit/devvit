[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Type Alias: EnrichedThumbnail

> **EnrichedThumbnail** = `object`

Contains data about a post's thumbnail. Also contains a blurred version if the thumbnail is NSFW.

## Properties

<a id="attribution"></a>

### attribution?

> `optional` **attribution**: `string`

Attribution text for the thumbnail

---

<a id="image"></a>

### image

> **image**: `object`

The image used for the thumbnail. May have different resolution from Post.thumbnail

#### height

> **height**: `number`

#### url

> **url**: `string`

#### width

> **width**: `number`

---

<a id="isobfuscateddefault"></a>

### isObfuscatedDefault

> **isObfuscatedDefault**: `boolean`

Whether this thumbnail appears blurred by default

---

<a id="obfuscatedimage"></a>

### obfuscatedImage?

> `optional` **obfuscatedImage**: `object`

The blurred image for NSFW thumbnails

#### height

> **height**: `number`

#### url

> **url**: `string`

#### width

> **width**: `number`
