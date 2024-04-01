# Class: User

A class representing a user.

## Table of contents

### Accessors

- [commentKarma](User.md#commentkarma)
- [createdAt](User.md#createdat)
- [id](User.md#id)
- [linkKarma](User.md#linkkarma)
- [modPermissions](User.md#modpermissions)
- [nsfw](User.md#nsfw)
- [username](User.md#username)

### Methods

- [getComments](User.md#getcomments)
- [getModPermissionsForSubreddit](User.md#getmodpermissionsforsubreddit)
- [getPosts](User.md#getposts)
- [toJSON](User.md#tojson)
- [createRelationship](User.md#createrelationship)
- [getById](User.md#getbyid)
- [getByUsername](User.md#getbyusername)
- [getFromMetadata](User.md#getfrommetadata)
- [getSubredditUsersByType](User.md#getsubredditusersbytype)
- [removeRelationship](User.md#removerelationship)
- [setModeratorPermissions](User.md#setmoderatorpermissions)

## Accessors

### commentKarma

• `get` **commentKarma**(): `number`

The amount of comment karma the user has.

#### Returns

`number`

---

### createdAt

• `get` **createdAt**(): `Date`

The date the user was created.

#### Returns

`Date`

---

### id

• `get` **id**(): \`t2\_$\{string}\`

The ID (starting with t2\_) of the user to retrieve.

**`Example`**

```ts
't2_1w72';
```

#### Returns

\`t2\_$\{string}\`

---

### linkKarma

• `get` **linkKarma**(): `number`

The amount of link karma the user has.

#### Returns

`number`

---

### modPermissions

• `get` **modPermissions**(): `Map`\< `string`, [`ModeratorPermission`](../README.md#moderatorpermission)[]\>

The permissions the user has on the subreddit.

#### Returns

`Map`\< `string`, [`ModeratorPermission`](../README.md#moderatorpermission)[]\>

---

### nsfw

• `get` **nsfw**(): `boolean`

Whether the user's profile is marked as NSFW (Not Safe For Work).

#### Returns

`boolean`

---

### username

• `get` **username**(): `string`

The username of the user omitting the u/.

**`Example`**

```ts
'spez';
```

#### Returns

`string`

## Methods

### getComments

▸ **getComments**(`options`): [`Listing`](Listing.md)\< [`Comment`](Comment.md)\>

Get the user's comments.

#### Parameters

| Name      | Type                                                                                             | Description             |
| :-------- | :----------------------------------------------------------------------------------------------- | :---------------------- |
| `options` | `Omit`\< [`GetCommentsByUserOptions`](../interfaces/GetCommentsByUserOptions.md), `"username"`\> | Options for the request |

#### Returns

[`Listing`](Listing.md)\< [`Comment`](Comment.md)\>

A Listing of Comment objects.

---

### getModPermissionsForSubreddit

▸ **getModPermissionsForSubreddit**(`subredditName`): `undefined` \| [`ModeratorPermission`](../README.md#moderatorpermission)[]

Get the mod permissions the user has on the subreddit if they are a moderator.

#### Parameters

| Name            | Type     | Description           |
| :-------------- | :------- | :-------------------- |
| `subredditName` | `string` | name of the subreddit |

#### Returns

`undefined` \| [`ModeratorPermission`](../README.md#moderatorpermission)[]

the moderator permissions the user has on the subreddit

---

### getPosts

▸ **getPosts**(`options`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

Get the user's posts.

#### Parameters

| Name      | Type                                                                                       | Description             |
| :-------- | :----------------------------------------------------------------------------------------- | :---------------------- |
| `options` | `Omit`\< [`GetPostsByUserOptions`](../interfaces/GetPostsByUserOptions.md), `"username"`\> | Options for the request |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

A Listing of Post objects.

---

### toJSON

▸ **toJSON**(): `Object`

#### Returns

`Object`

| Name                        | Type                     |
| :-------------------------- | :----------------------- |
| `commentKarma`              | `number`                 |
| `createdAt`                 | `Date`                   |
| `id`                        | \`t2\_$\{string}\`       |
| `linkKarma`                 | `number`                 |
| `modPermissionsBySubreddit` | \{ `[k: string]`: `T`; } |
| `nsfw`                      | `boolean`                |
| `username`                  | `string`                 |

---

### createRelationship

▸ `Static` **createRelationship**(`options`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type                                                                      |
| :---------- | :------------------------------------------------------------------------ |
| `options`   | [`CreateRelationshipOptions`](../interfaces/CreateRelationshipOptions.md) |
| `metadata?` | `Metadata`                                                                |

#### Returns

`Promise`\< `void`\>

---

### getById

▸ `Static` **getById**(`id`, `metadata?`): `Promise`\< [`User`](User.md)\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t2\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< [`User`](User.md)\>

---

### getByUsername

▸ `Static` **getByUsername**(`username`, `metadata?`): `Promise`\< [`User`](User.md)\>

#### Parameters

| Name        | Type       |
| :---------- | :--------- |
| `username`  | `string`   |
| `metadata?` | `Metadata` |

#### Returns

`Promise`\< [`User`](User.md)\>

---

### getFromMetadata

▸ `Static` **getFromMetadata**(`key`, `metadata?`): `Promise`\< [`User`](User.md)\>

#### Parameters

| Name        | Type       |
| :---------- | :--------- |
| `key`       | `string`   |
| `metadata?` | `Metadata` |

#### Returns

`Promise`\< [`User`](User.md)\>

---

### getSubredditUsersByType

▸ `Static` **getSubredditUsersByType**(`options`, `metadata?`): [`Listing`](Listing.md)\< [`User`](User.md)\>

#### Parameters

| Name        | Type                                                                                |
| :---------- | :---------------------------------------------------------------------------------- |
| `options`   | [`GetSubredditUsersByTypeOptions`](../interfaces/GetSubredditUsersByTypeOptions.md) |
| `metadata?` | `Metadata`                                                                          |

#### Returns

[`Listing`](Listing.md)\< [`User`](User.md)\>

---

### removeRelationship

▸ `Static` **removeRelationship**(`options`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type                                                                      |
| :---------- | :------------------------------------------------------------------------ |
| `options`   | [`RemoveRelationshipOptions`](../interfaces/RemoveRelationshipOptions.md) |
| `metadata?` | `Metadata`                                                                |

#### Returns

`Promise`\< `void`\>

---

### setModeratorPermissions

▸ `Static` **setModeratorPermissions**(`username`, `subredditName`, `permissions`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name            | Type                                                        |
| :-------------- | :---------------------------------------------------------- |
| `username`      | `string`                                                    |
| `subredditName` | `string`                                                    |
| `permissions`   | [`ModeratorPermission`](../README.md#moderatorpermission)[] |
| `metadata?`     | `Metadata`                                                  |

#### Returns

`Promise`\< `void`\>
