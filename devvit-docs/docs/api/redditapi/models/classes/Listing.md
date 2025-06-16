[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: Listing\<T\>

## Type Parameters

### T

`T`

## Properties

<a id="limit"></a>

### limit

> **limit**: `number` = `DEFAULT_LIMIT`

---

<a id="pagesize"></a>

### pageSize

> **pageSize**: `number` = `DEFAULT_PAGE_SIZE`

## Accessors

<a id="hasmore"></a>

### hasMore

#### Get Signature

> **get** **hasMore**(): `boolean`

##### Returns

`boolean`

## Methods

<a id="asynciterator"></a>

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncIterator`\<`T`\>

#### Returns

`AsyncIterator`\<`T`\>

---

<a id="all"></a>

### all()

> **all**(): `Promise`\<`T`[]\>

#### Returns

`Promise`\<`T`[]\>

---

<a id="get"></a>

### get()

> **get**(`count`): `Promise`\<`T`[]\>

#### Parameters

##### count

`number`

#### Returns

`Promise`\<`T`[]\>

---

<a id="preventinitialfetch"></a>

### preventInitialFetch()

> **preventInitialFetch**(): `void`

#### Returns

`void`

---

<a id="setmore"></a>

### setMore()

> **setMore**(`more`): `void`

#### Parameters

##### more

`undefined` | [`MoreObject`](../type-aliases/MoreObject.md)

#### Returns

`void`
