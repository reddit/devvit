# Class: WikiPage

## Table of contents

### Constructors

- [constructor](WikiPage.md#constructor)

### Accessors

- [content](WikiPage.md#content)
- [name](WikiPage.md#name)
- [revisionAuthor](WikiPage.md#revisionauthor)
- [revisionDate](WikiPage.md#revisiondate)
- [revisionId](WikiPage.md#revisionid)
- [revisionReason](WikiPage.md#revisionreason)
- [subredditName](WikiPage.md#subredditname)

### Methods

- [addEditor](WikiPage.md#addeditor)
- [getRevisions](WikiPage.md#getrevisions)
- [getSettings](WikiPage.md#getsettings)
- [removeEditor](WikiPage.md#removeeditor)
- [revertTo](WikiPage.md#revertto)
- [toJSON](WikiPage.md#tojson)
- [update](WikiPage.md#update)
- [updateSettings](WikiPage.md#updatesettings)
- [addEditor](WikiPage.md#addeditor-1)
- [createPage](WikiPage.md#createpage)
- [getPage](WikiPage.md#getpage)
- [getPageRevisions](WikiPage.md#getpagerevisions)
- [getPageSettings](WikiPage.md#getpagesettings)
- [getPages](WikiPage.md#getpages)
- [removeEditor](WikiPage.md#removeeditor-1)
- [revertPage](WikiPage.md#revertpage)
- [updatePage](WikiPage.md#updatepage)
- [updatePageSettings](WikiPage.md#updatepagesettings)

## Constructors

### constructor

• **new WikiPage**(`name`, `subredditName`, `data`, `metadata`)

#### Parameters

| Name            | Type                      |
| :-------------- | :------------------------ |
| `name`          | `string`                  |
| `subredditName` | `string`                  |
| `data`          | `WikiPage`                |
| `metadata`      | `undefined` \| `Metadata` |

## Accessors

### content

• `get` **content**(): `string`

The Markdown content of the page.

#### Returns

`string`

---

### name

• `get` **name**(): `string`

The name of the page.

#### Returns

`string`

---

### revisionAuthor

• `get` **revisionAuthor**(): [`User`](User.md)

The author of this revision.

#### Returns

[`User`](User.md)

---

### revisionDate

• `get` **revisionDate**(): `Date`

The date of the revision.

#### Returns

`Date`

---

### revisionId

• `get` **revisionId**(): `string`

The ID of the revision.

#### Returns

`string`

---

### revisionReason

• `get` **revisionReason**(): `string`

The reason for the revision.

#### Returns

`string`

---

### subredditName

• `get` **subredditName**(): `string`

The name of the subreddit the page is in.

#### Returns

`string`

## Methods

### addEditor

▸ **addEditor**(`username`): `Promise`\<`void`\>

Add an editor to this page.

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\<`void`\>

---

### getRevisions

▸ **getRevisions**(`options`): `Promise`\<[`Listing`](Listing.md)\<[`WikiPageRevision`](WikiPageRevision.md)\>\>

Get the revisions for this page.

#### Parameters

| Name      | Type                                                                                                           |
| :-------- | :------------------------------------------------------------------------------------------------------------- |
| `options` | `Omit`\<[`GetPageRevisionsOptions`](../interfaces/GetPageRevisionsOptions.md), `"page"` \| `"subredditName"`\> |

#### Returns

`Promise`\<[`Listing`](Listing.md)\<[`WikiPageRevision`](WikiPageRevision.md)\>\>

---

### getSettings

▸ **getSettings**(): `Promise`\<[`WikiPageSettings`](WikiPageSettings.md)\>

Get the settings for this page.

#### Returns

`Promise`\<[`WikiPageSettings`](WikiPageSettings.md)\>

---

### removeEditor

▸ **removeEditor**(`username`): `Promise`\<`void`\>

Remove an editor from this page.

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\<`void`\>

---

### revertTo

▸ **revertTo**(`revisionId`): `Promise`\<`void`\>

Revert this page to a previous revision.

#### Parameters

| Name         | Type     |
| :----------- | :------- |
| `revisionId` | `string` |

#### Returns

`Promise`\<`void`\>

---

### toJSON

▸ **toJSON**(): `Object`

#### Returns

`Object`

| Name                                       | Type                                                                                                                                                                                                      |
| :----------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content`                                  | `string`                                                                                                                                                                                                  |
| `name`                                     | `string`                                                                                                                                                                                                  |
| `revisionAuthor`                           | \{ `commentKarma`: `number` ; `createdAt`: `Date` ; `id`: \`t2\_$\{string}\` ; `linkKarma`: `number` ; `modPermissionsBySubreddit`: \{ `[k: string]`: `T`; } ; `nsfw`: `boolean` ; `username`: `string` } |
| `revisionAuthor.commentKarma`              | `number`                                                                                                                                                                                                  |
| `revisionAuthor.createdAt`                 | `Date`                                                                                                                                                                                                    |
| `revisionAuthor.id`                        | \`t2\_$\{string}\`                                                                                                                                                                                        |
| `revisionAuthor.linkKarma`                 | `number`                                                                                                                                                                                                  |
| `revisionAuthor.modPermissionsBySubreddit` | \{ `[k: string]`: `T`; }                                                                                                                                                                                  |
| `revisionAuthor.nsfw`                      | `boolean`                                                                                                                                                                                                 |
| `revisionAuthor.username`                  | `string`                                                                                                                                                                                                  |
| `revisionDate`                             | `Date`                                                                                                                                                                                                    |
| `revisionId`                               | `string`                                                                                                                                                                                                  |
| `revisionReason`                           | `string`                                                                                                                                                                                                  |
| `subredditName`                            | `string`                                                                                                                                                                                                  |

---

### update

▸ **update**(`content`, `reason?`): `Promise`\<[`WikiPage`](WikiPage.md)\>

Update this page.

#### Parameters

| Name      | Type     |
| :-------- | :------- |
| `content` | `string` |
| `reason?` | `string` |

#### Returns

`Promise`\<[`WikiPage`](WikiPage.md)\>

---

### updateSettings

▸ **updateSettings**(`options`): `Promise`\<[`WikiPageSettings`](WikiPageSettings.md)\>

Update the settings for this page.

#### Parameters

| Name      | Type                                                                                                               |
| :-------- | :----------------------------------------------------------------------------------------------------------------- |
| `options` | `Omit`\<[`UpdatePageSettingsOptions`](../interfaces/UpdatePageSettingsOptions.md), `"page"` \| `"subredditName"`\> |

#### Returns

`Promise`\<[`WikiPageSettings`](WikiPageSettings.md)\>

---

### addEditor

▸ `Static` **addEditor**(`subredditName`, `page`, `username`, `metadata`): `Promise`\<`void`\>

#### Parameters

| Name            | Type                      |
| :-------------- | :------------------------ |
| `subredditName` | `string`                  |
| `page`          | `string`                  |
| `username`      | `string`                  |
| `metadata`      | `undefined` \| `Metadata` |

#### Returns

`Promise`\<`void`\>

---

### createPage

▸ `Static` **createPage**(`options`, `metadata`): `Promise`\<[`WikiPage`](WikiPage.md)\>

#### Parameters

| Name       | Type                                                              |
| :--------- | :---------------------------------------------------------------- |
| `options`  | [`CreateWikiPageOptions`](../interfaces/CreateWikiPageOptions.md) |
| `metadata` | `undefined` \| `Metadata`                                         |

#### Returns

`Promise`\<[`WikiPage`](WikiPage.md)\>

---

### getPage

▸ `Static` **getPage**(`subredditName`, `page`, `metadata`): `Promise`\<[`WikiPage`](WikiPage.md)\>

#### Parameters

| Name            | Type                      |
| :-------------- | :------------------------ |
| `subredditName` | `string`                  |
| `page`          | `string`                  |
| `metadata`      | `undefined` \| `Metadata` |

#### Returns

`Promise`\<[`WikiPage`](WikiPage.md)\>

---

### getPageRevisions

▸ `Static` **getPageRevisions**(`options`, `metadata`): [`Listing`](Listing.md)\<[`WikiPageRevision`](WikiPageRevision.md)\>

#### Parameters

| Name       | Type                                                                  |
| :--------- | :-------------------------------------------------------------------- |
| `options`  | [`GetPageRevisionsOptions`](../interfaces/GetPageRevisionsOptions.md) |
| `metadata` | `undefined` \| `Metadata`                                             |

#### Returns

[`Listing`](Listing.md)\<[`WikiPageRevision`](WikiPageRevision.md)\>

---

### getPageSettings

▸ `Static` **getPageSettings**(`subredditName`, `page`, `metadata`): `Promise`\<[`WikiPageSettings`](WikiPageSettings.md)\>

#### Parameters

| Name            | Type                      |
| :-------------- | :------------------------ |
| `subredditName` | `string`                  |
| `page`          | `string`                  |
| `metadata`      | `undefined` \| `Metadata` |

#### Returns

`Promise`\<[`WikiPageSettings`](WikiPageSettings.md)\>

---

### getPages

▸ `Static` **getPages**(`subredditName`, `metadata`): `Promise`\<`string`[]\>

#### Parameters

| Name            | Type                      |
| :-------------- | :------------------------ |
| `subredditName` | `string`                  |
| `metadata`      | `undefined` \| `Metadata` |

#### Returns

`Promise`\<`string`[]\>

---

### removeEditor

▸ `Static` **removeEditor**(`subredditName`, `page`, `username`, `metadata`): `Promise`\<`void`\>

#### Parameters

| Name            | Type                      |
| :-------------- | :------------------------ |
| `subredditName` | `string`                  |
| `page`          | `string`                  |
| `username`      | `string`                  |
| `metadata`      | `undefined` \| `Metadata` |

#### Returns

`Promise`\<`void`\>

---

### revertPage

▸ `Static` **revertPage**(`subredditName`, `page`, `revisionId`, `metadata`): `Promise`\<`void`\>

#### Parameters

| Name            | Type                      |
| :-------------- | :------------------------ |
| `subredditName` | `string`                  |
| `page`          | `string`                  |
| `revisionId`    | `string`                  |
| `metadata`      | `undefined` \| `Metadata` |

#### Returns

`Promise`\<`void`\>

---

### updatePage

▸ `Static` **updatePage**(`options`, `metadata`): `Promise`\<[`WikiPage`](WikiPage.md)\>

#### Parameters

| Name       | Type                                                              |
| :--------- | :---------------------------------------------------------------- |
| `options`  | [`UpdateWikiPageOptions`](../interfaces/UpdateWikiPageOptions.md) |
| `metadata` | `undefined` \| `Metadata`                                         |

#### Returns

`Promise`\<[`WikiPage`](WikiPage.md)\>

---

### updatePageSettings

▸ `Static` **updatePageSettings**(`options`, `metadata`): `Promise`\<[`WikiPageSettings`](WikiPageSettings.md)\>

#### Parameters

| Name       | Type                                                                      |
| :--------- | :------------------------------------------------------------------------ |
| `options`  | [`UpdatePageSettingsOptions`](../interfaces/UpdatePageSettingsOptions.md) |
| `metadata` | `undefined` \| `Metadata`                                                 |

#### Returns

`Promise`\<[`WikiPageSettings`](WikiPageSettings.md)\>
