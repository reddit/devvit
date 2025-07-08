[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: WikiPageSettings

## Constructors

<a id="constructor"></a>

### new WikiPageSettings()

> **new WikiPageSettings**(`data`, `metadata`): `WikiPageSettings`

#### Parameters

##### data

`WikiPageSettings_Data`

##### metadata

`undefined` | `Metadata`

#### Returns

`WikiPageSettings`

## Accessors

<a id="editors"></a>

### editors

#### Get Signature

> **get** **editors**(): [`User`](User.md)[]

##### Returns

[`User`](User.md)[]

---

<a id="listed"></a>

### listed

#### Get Signature

> **get** **listed**(): `boolean`

##### Returns

`boolean`

---

<a id="permlevel"></a>

### permLevel

#### Get Signature

> **get** **permLevel**(): [`WikiPagePermissionLevel`](../enumerations/WikiPagePermissionLevel.md)

##### Returns

[`WikiPagePermissionLevel`](../enumerations/WikiPagePermissionLevel.md)

## Methods

<a id="tojson"></a>

### toJSON()

> **toJSON**(): `Pick`\<`WikiPageSettings`, `"listed"` \| `"permLevel"`\> & `object`

#### Returns

`Pick`\<`WikiPageSettings`, `"listed"` \| `"permLevel"`\> & `object`
