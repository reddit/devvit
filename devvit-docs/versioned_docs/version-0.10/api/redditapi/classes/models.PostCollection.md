# Class: PostCollection

[models](../modules/models.md).PostCollection

## Table of contents

### Accessors

- [authorId](models.PostCollection.md#authorid)
- [authorName](models.PostCollection.md#authorname)
- [createdAtUtc](models.PostCollection.md#createdatutc)
- [description](models.PostCollection.md#description)
- [displayLayout](models.PostCollection.md#displaylayout)
- [id](models.PostCollection.md#id)
- [lastUpdateUtc](models.PostCollection.md#lastupdateutc)
- [linkIds](models.PostCollection.md#linkids)
- [permalink](models.PostCollection.md#permalink)
- [primaryLinkId](models.PostCollection.md#primarylinkid)
- [subredditId](models.PostCollection.md#subredditid)
- [title](models.PostCollection.md#title)

### Methods

- [addPost](models.PostCollection.md#addpost)
- [delete](models.PostCollection.md#delete)
- [follow](models.PostCollection.md#follow)
- [removePost](models.PostCollection.md#removepost)
- [reorder](models.PostCollection.md#reorder)
- [updateDescription](models.PostCollection.md#updatedescription)
- [updateLayout](models.PostCollection.md#updatelayout)
- [updateTitle](models.PostCollection.md#updatetitle)

## Accessors

### <a id="authorid" name="authorid"></a> authorId

• `get` **authorId**(): `string`

The user ID of the author of the collection.

#### Returns

`string`

---

### <a id="authorname" name="authorname"></a> authorName

• `get` **authorName**(): `string`

The username of the author of the collection.

#### Returns

`string`

---

### <a id="createdatutc" name="createdatutc"></a> createdAtUtc

• `get` **createdAtUtc**(): `Date`

The timestamp when this collection was created.

#### Returns

`Date`

---

### <a id="description" name="description"></a> description

• `get` **description**(): `string`

The description of the collection.

#### Returns

`string`

---

### <a id="displaylayout" name="displaylayout"></a> displayLayout

• `get` **displayLayout**(): [`CollectionDisplayLayout`](../enums/models.CollectionDisplayLayout.md)

The layout used to display this collection in the UI.

#### Returns

[`CollectionDisplayLayout`](../enums/models.CollectionDisplayLayout.md)

---

### <a id="id" name="id"></a> id

• `get` **id**(): `string`

The ID of the collection

#### Returns

`string`

---

### <a id="lastupdateutc" name="lastupdateutc"></a> lastUpdateUtc

• `get` **lastUpdateUtc**(): `Date`

The timestamp when this collection was last updated.

#### Returns

`Date`

---

### <a id="linkids" name="linkids"></a> linkIds

• `get` **linkIds**(): `string`[]

The post IDs of the posts in the collection.

#### Returns

`string`[]

---

### <a id="permalink" name="permalink"></a> permalink

• `get` **permalink**(): `undefined` \| `string`

The permalink to the collection.

#### Returns

`undefined` \| `string`

---

### <a id="primarylinkid" name="primarylinkid"></a> primaryLinkId

• `get` **primaryLinkId**(): `undefined` \| `string`

The primaryLinkId in the collection.

#### Returns

`undefined` \| `string`

---

### <a id="subredditid" name="subredditid"></a> subredditId

• `get` **subredditId**(): `string`

The subreddit ID of the subreddit where the collection belongs.

#### Returns

`string`

---

### <a id="title" name="title"></a> title

• `get` **title**(): `string`

The title of the collection.

#### Returns

`string`

## Methods

### <a id="addpost" name="addpost"></a> addPost

▸ **addPost**(`postId`): `Promise`\<`void`\>

Adds a post to the collection.

#### Parameters

| Name     | Type     | Description                                  |
| :------- | :------- | :------------------------------------------- |
| `postId` | `string` | The id of the post to add to the collection. |

#### Returns

`Promise`\<`void`\>

Void

**`Example`**

```ts
const collection = await reddit.getCollectionById('198febf6-084c-4a21-bdbd-a014e5fd0d4d');
await collection.addPost('t3_asd');
```

---

### <a id="delete" name="delete"></a> delete

▸ **delete**(): `Promise`\<`void`\>

Deletes the collection.

#### Returns

`Promise`\<`void`\>

Void

**`Example`**

```ts
const collection = await reddit.getCollectionById('198febf6-084c-4a21-bdbd-a014e5fd0d4d');
await collection.delete();
```

---

### <a id="follow" name="follow"></a> follow

▸ **follow**(`follow`): `Promise`\<`void`\>

Follows the collection.

#### Parameters

| Name     | Type      | Description                                                      |
| :------- | :-------- | :--------------------------------------------------------------- |
| `follow` | `boolean` | True to follow the collection, false to unfollow the collection. |

#### Returns

`Promise`\<`void`\>

Void

**`Example`**

```ts
const collection = await reddit.getCollectionById('198febf6-084c-4a21-bdbd-a014e5fd0d4d');
// Follow the collection
await collection.follow(true);
// Unfollow the collection
await collection.follow(false);
```

---

### <a id="removepost" name="removepost"></a> removePost

▸ **removePost**(`postId`): `Promise`\<`void`\>

Remove a post from the collection.

#### Parameters

| Name     | Type     | Description                                  |
| :------- | :------- | :------------------------------------------- |
| `postId` | `string` | The id of the post to add to the collection. |

#### Returns

`Promise`\<`void`\>

Void

**`Example`**

```ts
const collection = await reddit.getCollectionById('198febf6-084c-4a21-bdbd-a014e5fd0d4d');
await collection.removePost('t3_asd');
```

---

### <a id="reorder" name="reorder"></a> reorder

▸ **reorder**(`postIds`): `Promise`\<`void`\>

Sets the order of the posts in the collection.

#### Parameters

| Name      | Type       | Description                                                                |
| :-------- | :--------- | :------------------------------------------------------------------------- |
| `postIds` | `string`[] | Array of post ids that determins the order of the posts in the collection. |

#### Returns

`Promise`\<`void`\>

Void

**`Example`**

```ts
const collection = await reddit.getCollectionById('198febf6-084c-4a21-bdbd-a014e5fd0d4d');
await collection.reorder(['t3_asd', 't3_fgh']);
```

---

### <a id="updatedescription" name="updatedescription"></a> updateDescription

▸ **updateDescription**(`description`): `Promise`\<`void`\>

Sets the description of the collection.

#### Parameters

| Name          | Type     | Description                            |
| :------------ | :------- | :------------------------------------- |
| `description` | `string` | The new description of the collection. |

#### Returns

`Promise`\<`void`\>

Void

**`Example`**

```ts
const collection = await reddit.getCollectionById('198febf6-084c-4a21-bdbd-a014e5fd0d4d');
await collection.updateDescription('Posts about dogs');
```

---

### <a id="updatelayout" name="updatelayout"></a> updateLayout

▸ **updateLayout**(`displayLayout`): `Promise`\<`void`\>

Sets the display layout of the collection

#### Parameters

| Name            | Type                                                                    | Description                                                                            |
| :-------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| `displayLayout` | [`CollectionDisplayLayout`](../enums/models.CollectionDisplayLayout.md) | One of: TIMELINE \| GALLERY. This determines the layout of posts in the collection UI. |

#### Returns

`Promise`\<`void`\>

Void

**`Example`**

```ts
const collection = await reddit.getCollectionById('198febf6-084c-4a21-bdbd-a014e5fd0d4d');
await collection.updateLayout('GALLERY');
```

---

### <a id="updatetitle" name="updatetitle"></a> updateTitle

▸ **updateTitle**(`title`): `Promise`\<`void`\>

Sets the title of the collection.

#### Parameters

| Name    | Type     | Description                      |
| :------ | :------- | :------------------------------- |
| `title` | `string` | The new title of the collection. |

#### Returns

`Promise`\<`void`\>

Void

**`Example`**

```ts
const collection = await reddit.getCollectionById('198febf6-084c-4a21-bdbd-a014e5fd0d4d');
await collection.updateTitle('Dogs');
```
