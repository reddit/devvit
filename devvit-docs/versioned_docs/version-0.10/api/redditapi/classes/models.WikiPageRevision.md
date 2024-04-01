# Class: WikiPageRevision

[models](../modules/models.md).WikiPageRevision

## Table of contents

### Constructors

- [constructor](models.WikiPageRevision.md#constructor)

### Accessors

- [author](models.WikiPageRevision.md#author)
- [date](models.WikiPageRevision.md#date)
- [hidden](models.WikiPageRevision.md#hidden)
- [id](models.WikiPageRevision.md#id)
- [page](models.WikiPageRevision.md#page)
- [reason](models.WikiPageRevision.md#reason)

### Methods

- [toJSON](models.WikiPageRevision.md#tojson)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new WikiPageRevision**(`data`, `metadata`): [`WikiPageRevision`](models.WikiPageRevision.md)

#### Parameters

| Name       | Type                      |
| :--------- | :------------------------ |
| `data`     | `WikiPageRevision`        |
| `metadata` | `undefined` \| `Metadata` |

#### Returns

[`WikiPageRevision`](models.WikiPageRevision.md)

## Accessors

### <a id="author" name="author"></a> author

• `get` **author**(): [`User`](models.User.md)

#### Returns

[`User`](models.User.md)

---

### <a id="date" name="date"></a> date

• `get` **date**(): `Date`

#### Returns

`Date`

---

### <a id="hidden" name="hidden"></a> hidden

• `get` **hidden**(): `boolean`

#### Returns

`boolean`

---

### <a id="id" name="id"></a> id

• `get` **id**(): `string`

#### Returns

`string`

---

### <a id="page" name="page"></a> page

• `get` **page**(): `string`

#### Returns

`string`

---

### <a id="reason" name="reason"></a> reason

• `get` **reason**(): `string`

#### Returns

`string`

## Methods

### <a id="tojson" name="tojson"></a> toJSON

▸ **toJSON**(): `Pick`\<[`WikiPageRevision`](models.WikiPageRevision.md), `"id"` \| `"reason"` \| `"hidden"` \| `"page"` \| `"date"`\> & \{ `author`: `Pick`\<[`User`](models.User.md), `"username"` \| `"id"` \| `"nsfw"` \| `"createdAt"` \| `"linkKarma"` \| `"commentKarma"`\> & \{ `modPermissionsBySubreddit`: `Record`\<`string`, [`ModeratorPermission`](../modules/models.md#moderatorpermission)[]\> } }

#### Returns

`Pick`\<[`WikiPageRevision`](models.WikiPageRevision.md), `"id"` \| `"reason"` \| `"hidden"` \| `"page"` \| `"date"`\> & \{ `author`: `Pick`\<[`User`](models.User.md), `"username"` \| `"id"` \| `"nsfw"` \| `"createdAt"` \| `"linkKarma"` \| `"commentKarma"`\> & \{ `modPermissionsBySubreddit`: `Record`\<`string`, [`ModeratorPermission`](../modules/models.md#moderatorpermission)[]\> } }
