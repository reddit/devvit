[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: WikiPageRevision

## Constructors

<a id="constructor"></a>

### new WikiPageRevision()

> **new WikiPageRevision**(`data`, `metadata`): `WikiPageRevision`

#### Parameters

##### data

`WikiPageRevision`

##### metadata

`undefined` | `Metadata`

#### Returns

`WikiPageRevision`

## Accessors

<a id="author"></a>

### author

#### Get Signature

> **get** **author**(): [`User`](User.md)

##### Returns

[`User`](User.md)

---

<a id="date"></a>

### date

#### Get Signature

> **get** **date**(): `Date`

##### Returns

`Date`

---

<a id="hidden"></a>

### hidden

#### Get Signature

> **get** **hidden**(): `boolean`

##### Returns

`boolean`

---

<a id="id"></a>

### id

#### Get Signature

> **get** **id**(): `string`

##### Returns

`string`

---

<a id="page"></a>

### page

#### Get Signature

> **get** **page**(): `string`

##### Returns

`string`

---

<a id="reason"></a>

### reason

#### Get Signature

> **get** **reason**(): `string`

##### Returns

`string`

## Methods

<a id="tojson"></a>

### toJSON()

> **toJSON**(): `Pick`\<`WikiPageRevision`, `"id"` \| `"reason"` \| `"hidden"` \| `"page"` \| `"date"`\> & `object`

#### Returns

`Pick`\<`WikiPageRevision`, `"id"` \| `"reason"` \| `"hidden"` \| `"page"` \| `"date"`\> & `object`
