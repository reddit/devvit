[**@devvit/public-api v0.11.18-dev**](../../../../README.md)

---

# Variable: AccountDelete

> **AccountDelete**: `object`

## Type declaration

<a id="type"></a>

### $type

> **$type**: `"devvit.events.v1alpha.AccountDelete"`

<a id="create"></a>

### create()

#### Parameters

##### base?

###### deletedAt?

`Date`

###### user?

\{ `banned`: `boolean`; `description`: `string`; `flair`: \{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}; `iconImage`: `string`; `id`: `string`; `isGold`: `boolean`; `karma`: `number`; `name`: `string`; `snoovatarImage`: `string`; `spam`: `boolean`; `suspended`: `boolean`; `url`: `string`; \}

###### user.banned?

`boolean`

###### user.description?

`string`

###### user.flair?

\{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}

###### user.flair.backgroundColor?

`string`

###### user.flair.cssClass?

`string`

###### user.flair.enabled?

`boolean`

###### user.flair.subredditId?

`string`

###### user.flair.templateId?

`string`

###### user.flair.text?

`string`

###### user.flair.textColor?

`string`

###### user.flair.userId?

`string`

###### user.iconImage?

`string`

###### user.id?

`string`

###### user.isGold?

`boolean`

###### user.karma?

`number`

###### user.name?

`string`

###### user.snoovatarImage?

`string`

###### user.spam?

`boolean`

###### user.suspended?

`boolean`

###### user.url?

`string`

###### userId?

`string`

#### Returns

[`AccountDelete`](../interfaces/AccountDelete.md)

<a id="decode"></a>

### decode()

#### Parameters

##### input

`Uint8Array`\<`ArrayBufferLike`\> | `Reader`

##### length?

`number`

#### Returns

[`AccountDelete`](../interfaces/AccountDelete.md)

<a id="encode"></a>

### encode()

#### Parameters

##### message

[`AccountDelete`](../interfaces/AccountDelete.md)

##### writer?

`Writer`

#### Returns

`Writer`

<a id="fromjson"></a>

### fromJSON()

#### Parameters

##### object

`any`

#### Returns

[`AccountDelete`](../interfaces/AccountDelete.md)

<a id="frompartial"></a>

### fromPartial()

#### Parameters

##### object

###### deletedAt?

`Date`

###### user?

\{ `banned`: `boolean`; `description`: `string`; `flair`: \{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}; `iconImage`: `string`; `id`: `string`; `isGold`: `boolean`; `karma`: `number`; `name`: `string`; `snoovatarImage`: `string`; `spam`: `boolean`; `suspended`: `boolean`; `url`: `string`; \}

###### user.banned?

`boolean`

###### user.description?

`string`

###### user.flair?

\{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}

###### user.flair.backgroundColor?

`string`

###### user.flair.cssClass?

`string`

###### user.flair.enabled?

`boolean`

###### user.flair.subredditId?

`string`

###### user.flair.templateId?

`string`

###### user.flair.text?

`string`

###### user.flair.textColor?

`string`

###### user.flair.userId?

`string`

###### user.iconImage?

`string`

###### user.id?

`string`

###### user.isGold?

`boolean`

###### user.karma?

`number`

###### user.name?

`string`

###### user.snoovatarImage?

`string`

###### user.spam?

`boolean`

###### user.suspended?

`boolean`

###### user.url?

`string`

###### userId?

`string`

#### Returns

[`AccountDelete`](../interfaces/AccountDelete.md)

<a id="tojson"></a>

### toJSON()

#### Parameters

##### message

[`AccountDelete`](../interfaces/AccountDelete.md)

#### Returns

`unknown`
