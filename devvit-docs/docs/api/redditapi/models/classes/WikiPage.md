[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: WikiPage

## Accessors

<a id="content"></a>

### content

#### Get Signature

> **get** **content**(): `string`

The Markdown content of the page.

##### Returns

`string`

---

<a id="contenthtml"></a>

### contentHtml

#### Get Signature

> **get** **contentHtml**(): `string`

The HTML content of the page.

##### Returns

`string`

---

<a id="name"></a>

### name

#### Get Signature

> **get** **name**(): `string`

The name of the page.

##### Returns

`string`

---

<a id="revisionauthor"></a>

### revisionAuthor

#### Get Signature

> **get** **revisionAuthor**(): `undefined` \| [`User`](User.md)

The author of this revision.

##### Returns

`undefined` \| [`User`](User.md)

---

<a id="revisiondate"></a>

### revisionDate

#### Get Signature

> **get** **revisionDate**(): `Date`

The date of the revision.

##### Returns

`Date`

---

<a id="revisionid"></a>

### revisionId

#### Get Signature

> **get** **revisionId**(): `string`

The ID of the revision.

##### Returns

`string`

---

<a id="revisionreason"></a>

### revisionReason

#### Get Signature

> **get** **revisionReason**(): `string`

The reason for the revision.

##### Returns

`string`

---

<a id="subredditname"></a>

### subredditName

#### Get Signature

> **get** **subredditName**(): `string`

The name of the subreddit the page is in.

##### Returns

`string`

## Methods

<a id="addeditor"></a>

### addEditor()

> **addEditor**(`username`): `Promise`\<`void`\>

Add an editor to this page.

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`void`\>

---

<a id="getrevisions"></a>

### getRevisions()

> **getRevisions**(`options`): `Promise`\<[`Listing`](Listing.md)\<[`WikiPageRevision`](WikiPageRevision.md)\>\>

Get the revisions for this page.

#### Parameters

##### options

`Omit`\<[`GetPageRevisionsOptions`](../type-aliases/GetPageRevisionsOptions.md), `"subredditName"` \| `"page"`\>

#### Returns

`Promise`\<[`Listing`](Listing.md)\<[`WikiPageRevision`](WikiPageRevision.md)\>\>

---

<a id="getsettings"></a>

### getSettings()

> **getSettings**(): `Promise`\<[`WikiPageSettings`](WikiPageSettings.md)\>

Get the settings for this page.

#### Returns

`Promise`\<[`WikiPageSettings`](WikiPageSettings.md)\>

---

<a id="removeeditor"></a>

### removeEditor()

> **removeEditor**(`username`): `Promise`\<`void`\>

Remove an editor from this page.

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`void`\>

---

<a id="revertto"></a>

### revertTo()

> **revertTo**(`revisionId`): `Promise`\<`void`\>

Revert this page to a previous revision.

#### Parameters

##### revisionId

`string`

#### Returns

`Promise`\<`void`\>

---

<a id="tojson"></a>

### toJSON()

> **toJSON**(): `Pick`\<`WikiPage`, `"subredditName"` \| `"name"` \| `"content"` \| `"contentHtml"` \| `"revisionId"` \| `"revisionDate"` \| `"revisionReason"`\> & `object`

#### Returns

`Pick`\<`WikiPage`, `"subredditName"` \| `"name"` \| `"content"` \| `"contentHtml"` \| `"revisionId"` \| `"revisionDate"` \| `"revisionReason"`\> & `object`

---

<a id="update"></a>

### update()

> **update**(`content`, `reason`?): `Promise`\<`WikiPage`\>

Update this page.

#### Parameters

##### content

`string`

##### reason?

`string`

#### Returns

`Promise`\<`WikiPage`\>

---

<a id="updatesettings"></a>

### updateSettings()

> **updateSettings**(`options`): `Promise`\<[`WikiPageSettings`](WikiPageSettings.md)\>

Update the settings for this page.

#### Parameters

##### options

`Omit`\<[`UpdatePageSettingsOptions`](../type-aliases/UpdatePageSettingsOptions.md), `"subredditName"` \| `"page"`\>

#### Returns

`Promise`\<[`WikiPageSettings`](WikiPageSettings.md)\>
