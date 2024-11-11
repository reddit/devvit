# Class: WikiPage

[models](../modules/models.md).WikiPage

## Table of contents

### Accessors

- [content](models.WikiPage.md#content)
- [contentHtml](models.WikiPage.md#contenthtml)
- [name](models.WikiPage.md#name)
- [revisionAuthor](models.WikiPage.md#revisionauthor)
- [revisionDate](models.WikiPage.md#revisiondate)
- [revisionId](models.WikiPage.md#revisionid)
- [revisionReason](models.WikiPage.md#revisionreason)
- [subredditName](models.WikiPage.md#subredditname)

### Methods

- [addEditor](models.WikiPage.md#addeditor)
- [getRevisions](models.WikiPage.md#getrevisions)
- [getSettings](models.WikiPage.md#getsettings)
- [removeEditor](models.WikiPage.md#removeeditor)
- [revertTo](models.WikiPage.md#revertto)
- [toJSON](models.WikiPage.md#tojson)
- [update](models.WikiPage.md#update)
- [updateSettings](models.WikiPage.md#updatesettings)

## Accessors

### <a id="content" name="content"></a> content

• `get` **content**(): `string`

The Markdown content of the page.

#### Returns

`string`

---

### <a id="contenthtml" name="contenthtml"></a> contentHtml

• `get` **contentHtml**(): `string`

The HTML content of the page.

#### Returns

`string`

---

### <a id="name" name="name"></a> name

• `get` **name**(): `string`

The name of the page.

#### Returns

`string`

---

### <a id="revisionauthor" name="revisionauthor"></a> revisionAuthor

• `get` **revisionAuthor**(): `undefined` \| [`User`](models.User.md)

The author of this revision.

#### Returns

`undefined` \| [`User`](models.User.md)

---

### <a id="revisiondate" name="revisiondate"></a> revisionDate

• `get` **revisionDate**(): `Date`

The date of the revision.

#### Returns

`Date`

---

### <a id="revisionid" name="revisionid"></a> revisionId

• `get` **revisionId**(): `string`

The ID of the revision.

#### Returns

`string`

---

### <a id="revisionreason" name="revisionreason"></a> revisionReason

• `get` **revisionReason**(): `string`

The reason for the revision.

#### Returns

`string`

---

### <a id="subredditname" name="subredditname"></a> subredditName

• `get` **subredditName**(): `string`

The name of the subreddit the page is in.

#### Returns

`string`

## Methods

### <a id="addeditor" name="addeditor"></a> addEditor

▸ **addEditor**(`username`): `Promise`\<`void`\>

Add an editor to this page.

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\<`void`\>

---

### <a id="getrevisions" name="getrevisions"></a> getRevisions

▸ **getRevisions**(`options`): `Promise`\<[`Listing`](models.Listing.md)\<[`WikiPageRevision`](models.WikiPageRevision.md)\>\>

Get the revisions for this page.

#### Parameters

| Name      | Type                                                                                                               |
| :-------- | :----------------------------------------------------------------------------------------------------------------- |
| `options` | `Omit`\<[`GetPageRevisionsOptions`](../modules/models.md#getpagerevisionsoptions), `"subredditName"` \| `"page"`\> |

#### Returns

`Promise`\<[`Listing`](models.Listing.md)\<[`WikiPageRevision`](models.WikiPageRevision.md)\>\>

---

### <a id="getsettings" name="getsettings"></a> getSettings

▸ **getSettings**(): `Promise`\<[`WikiPageSettings`](models.WikiPageSettings.md)\>

Get the settings for this page.

#### Returns

`Promise`\<[`WikiPageSettings`](models.WikiPageSettings.md)\>

---

### <a id="removeeditor" name="removeeditor"></a> removeEditor

▸ **removeEditor**(`username`): `Promise`\<`void`\>

Remove an editor from this page.

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\<`void`\>

---

### <a id="revertto" name="revertto"></a> revertTo

▸ **revertTo**(`revisionId`): `Promise`\<`void`\>

Revert this page to a previous revision.

#### Parameters

| Name         | Type     |
| :----------- | :------- |
| `revisionId` | `string` |

#### Returns

`Promise`\<`void`\>

---

### <a id="tojson" name="tojson"></a> toJSON

▸ **toJSON**(): `Pick`\<[`WikiPage`](models.WikiPage.md), `"subredditName"` \| `"name"` \| `"content"` \| `"contentHtml"` \| `"revisionId"` \| `"revisionDate"` \| `"revisionReason"`\> & \{ `revisionAuthor`: `undefined` \| `Pick`\<[`User`](models.User.md), `"username"` \| `"id"` \| `"nsfw"` \| `"createdAt"` \| `"linkKarma"` \| `"commentKarma"`\> & \{ `modPermissionsBySubreddit`: `Record`\<`string`, [`ModeratorPermission`](../modules/models.md#moderatorpermission)[]\> } }

#### Returns

`Pick`\<[`WikiPage`](models.WikiPage.md), `"subredditName"` \| `"name"` \| `"content"` \| `"contentHtml"` \| `"revisionId"` \| `"revisionDate"` \| `"revisionReason"`\> & \{ `revisionAuthor`: `undefined` \| `Pick`\<[`User`](models.User.md), `"username"` \| `"id"` \| `"nsfw"` \| `"createdAt"` \| `"linkKarma"` \| `"commentKarma"`\> & \{ `modPermissionsBySubreddit`: `Record`\<`string`, [`ModeratorPermission`](../modules/models.md#moderatorpermission)[]\> } }

---

### <a id="update" name="update"></a> update

▸ **update**(`content`, `reason?`): `Promise`\<[`WikiPage`](models.WikiPage.md)\>

Update this page.

#### Parameters

| Name      | Type     |
| :-------- | :------- |
| `content` | `string` |
| `reason?` | `string` |

#### Returns

`Promise`\<[`WikiPage`](models.WikiPage.md)\>

---

### <a id="updatesettings" name="updatesettings"></a> updateSettings

▸ **updateSettings**(`options`): `Promise`\<[`WikiPageSettings`](models.WikiPageSettings.md)\>

Update the settings for this page.

#### Parameters

| Name      | Type                                                                                                                   |
| :-------- | :--------------------------------------------------------------------------------------------------------------------- |
| `options` | `Omit`\<[`UpdatePageSettingsOptions`](../modules/models.md#updatepagesettingsoptions), `"subredditName"` \| `"page"`\> |

#### Returns

`Promise`\<[`WikiPageSettings`](models.WikiPageSettings.md)\>
