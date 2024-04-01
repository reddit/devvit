# Class: Listing\< T\>

## Type parameters

| Name |
| :--- |
| `T`  |

## Table of contents

### Constructors

- [constructor](Listing.md#constructor)

### Properties

- [limit](Listing.md#limit)
- [pageSize](Listing.md#pagesize)

### Accessors

- [hasMore](Listing.md#hasmore)

### Methods

- [[asyncIterator]](Listing.md#[asynciterator])
- [all](Listing.md#all)
- [get](Listing.md#get)
- [preventInitialFetch](Listing.md#preventinitialfetch)
- [setMore](Listing.md#setmore)

## Constructors

### constructor

• **new Listing**\< `T`\>(`options`)

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name      | Type                     |
| :-------- | :----------------------- |
| `options` | `ListingOptions`\< `T`\> |

## Properties

### limit

• **limit**: `number` = `DEFAULT_LIMIT`

---

### pageSize

• **pageSize**: `number` = `DEFAULT_PAGE_SIZE`

## Accessors

### hasMore

• `get` **hasMore**(): `boolean`

#### Returns

`boolean`

## Methods

### [asyncIterator]

▸ **[asyncIterator]**(): `AsyncIterator`\< `T`, `any`, `undefined`\>

#### Returns

`AsyncIterator`\< `T`, `any`, `undefined`\>

---

### all

▸ **all**(): `Promise`\< `T`[]\>

#### Returns

`Promise`\< `T`[]\>

---

### get

▸ **get**(`count`): `Promise`\< `T`[]\>

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `count` | `number` |

#### Returns

`Promise`\< `T`[]\>

---

### preventInitialFetch

▸ **preventInitialFetch**(): `void`

#### Returns

`void`

---

### setMore

▸ **setMore**(`more`): `void`

#### Parameters

| Name   | Type                                                       |
| :----- | :--------------------------------------------------------- |
| `more` | `undefined` \| [`MoreObject`](../interfaces/MoreObject.md) |

#### Returns

`void`
