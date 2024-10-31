# Class: Listing\<T\>

[models](../modules/models.md).Listing

## Type parameters

| Name |
| :--- |
| `T`  |

## Table of contents

### Properties

- [limit](models.Listing.md#limit)
- [pageSize](models.Listing.md#pagesize)

### Accessors

- [hasMore](models.Listing.md#hasmore)

### Methods

- [[asyncIterator]](models.Listing.md#[asynciterator])
- [all](models.Listing.md#all)
- [get](models.Listing.md#get)
- [preventInitialFetch](models.Listing.md#preventinitialfetch)
- [setMore](models.Listing.md#setmore)

## Properties

### <a id="limit" name="limit"></a> limit

• **limit**: `number` = `DEFAULT_LIMIT`

---

### <a id="pagesize" name="pagesize"></a> pageSize

• **pageSize**: `number` = `DEFAULT_PAGE_SIZE`

## Accessors

### <a id="hasmore" name="hasmore"></a> hasMore

• `get` **hasMore**(): `boolean`

#### Returns

`boolean`

## Methods

### <a id="[asynciterator]" name="[asynciterator]"></a> [asyncIterator]

▸ **[asyncIterator]**(): `AsyncIterator`\<`T`, `any`, `undefined`\>

#### Returns

`AsyncIterator`\<`T`, `any`, `undefined`\>

---

### <a id="all" name="all"></a> all

▸ **all**(): `Promise`\<`T`[]\>

#### Returns

`Promise`\<`T`[]\>

---

### <a id="get" name="get"></a> get

▸ **get**(`count`): `Promise`\<`T`[]\>

#### Parameters

| Name    | Type     |
| :------ | :------- |
| `count` | `number` |

#### Returns

`Promise`\<`T`[]\>

---

### <a id="preventinitialfetch" name="preventinitialfetch"></a> preventInitialFetch

▸ **preventInitialFetch**(): `void`

#### Returns

`void`

---

### <a id="setmore" name="setmore"></a> setMore

▸ **setMore**(`more`): `void`

#### Parameters

| Name   | Type                                                           |
| :----- | :------------------------------------------------------------- |
| `more` | `undefined` \| [`MoreObject`](../modules/models.md#moreobject) |

#### Returns

`void`
