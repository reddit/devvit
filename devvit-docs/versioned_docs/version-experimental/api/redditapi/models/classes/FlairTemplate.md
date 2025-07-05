[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: FlairTemplate

## Accessors

<a id="allowablecontent"></a>

### allowableContent

#### Get Signature

> **get** **allowableContent**(): [`AllowableFlairContent`](../type-aliases/AllowableFlairContent.md)

The flair template's allowable content. Either 'all', 'emoji', or 'text'.

##### Returns

[`AllowableFlairContent`](../type-aliases/AllowableFlairContent.md)

---

<a id="allowuseredits"></a>

### allowUserEdits

#### Get Signature

> **get** **allowUserEdits**(): `boolean`

Does the flair template allow users to edit their flair?

##### Returns

`boolean`

---

<a id="backgroundcolor"></a>

### backgroundColor

#### Get Signature

> **get** **backgroundColor**(): [`FlairBackgroundColor`](../type-aliases/FlairBackgroundColor.md)

The flair template's background color. Either 'transparent' or a hex color code. e.g. #FFC0CB

##### Returns

[`FlairBackgroundColor`](../type-aliases/FlairBackgroundColor.md)

---

<a id="id"></a>

### id

#### Get Signature

> **get** **id**(): `string`

The flair template's ID

##### Returns

`string`

---

<a id="maxemojis"></a>

### maxEmojis

#### Get Signature

> **get** **maxEmojis**(): `number`

The flair template's maximum number of emojis.

##### Returns

`number`

---

<a id="modonly"></a>

### modOnly

#### Get Signature

> **get** **modOnly**(): `boolean`

Is the flair template only available to moderators?

##### Returns

`boolean`

---

<a id="text"></a>

### text

#### Get Signature

> **get** **text**(): `string`

The flair template's text

##### Returns

`string`

---

<a id="textcolor"></a>

### textColor

#### Get Signature

> **get** **textColor**(): [`FlairTextColor`](../type-aliases/FlairTextColor.md)

The flair template's text color. Either 'dark' or 'light'.

##### Returns

[`FlairTextColor`](../type-aliases/FlairTextColor.md)

## Methods

<a id="delete"></a>

### delete()

> **delete**(): `Promise`\<`void`\>

Delete this flair template

#### Returns

`Promise`\<`void`\>

---

<a id="edit"></a>

### edit()

> **edit**(`options`): `Promise`\<`FlairTemplate`\>

Edit this flair template

#### Parameters

##### options

`Partial`\<`Omit`\<[`EditFlairTemplateOptions`](../type-aliases/EditFlairTemplateOptions.md), `"subredditName"` \| `"id"`\>\>

#### Returns

`Promise`\<`FlairTemplate`\>
