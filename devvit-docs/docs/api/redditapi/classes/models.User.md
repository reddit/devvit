# Class: User

[models](../modules/models.md).User

A class representing a user.

## Table of contents

### Accessors

- [commentKarma](models.User.md#commentkarma)
- [createdAt](models.User.md#createdat)
- [hasVerifiedEmail](models.User.md#hasverifiedemail)
- [id](models.User.md#id)
- [isAdmin](models.User.md#isadmin)
- [linkKarma](models.User.md#linkkarma)
- [modPermissions](models.User.md#modpermissions)
- [nsfw](models.User.md#nsfw)
- [permalink](models.User.md#permalink)
- [url](models.User.md#url)
- [username](models.User.md#username)

### Methods

- [getComments](models.User.md#getcomments)
- [getModPermissionsForSubreddit](models.User.md#getmodpermissionsforsubreddit)
- [getPosts](models.User.md#getposts)
- [getSnoovatarUrl](models.User.md#getsnoovatarurl)
- [getSocialLinks](models.User.md#getsociallinks)
- [getUserFlairBySubreddit](models.User.md#getuserflairbysubreddit)
- [toJSON](models.User.md#tojson)

## Accessors

### <a id="commentkarma" name="commentkarma"></a> commentKarma

• `get` **commentKarma**(): `number`

The amount of comment karma the user has.

#### Returns

`number`

---

### <a id="createdat" name="createdat"></a> createdAt

• `get` **createdAt**(): `Date`

The date the user was created.

#### Returns

`Date`

---

### <a id="hasverifiedemail" name="hasverifiedemail"></a> hasVerifiedEmail

• `get` **hasVerifiedEmail**(): `boolean`

Indicates whether or not the user has verified their email address.

#### Returns

`boolean`

---

### <a id="id" name="id"></a> id

• `get` **id**(): \`t2\_$\{string}\`

The ID (starting with t2\_) of the user to retrieve.

#### Returns

\`t2\_$\{string}\`

**`Example`**

```ts
't2_1w72';
```

---

### <a id="isadmin" name="isadmin"></a> isAdmin

• `get` **isAdmin**(): `boolean`

Whether the user is admin.

#### Returns

`boolean`

---

### <a id="linkkarma" name="linkkarma"></a> linkKarma

• `get` **linkKarma**(): `number`

The amount of link karma the user has.

#### Returns

`number`

---

### <a id="modpermissions" name="modpermissions"></a> modPermissions

• `get` **modPermissions**(): `Map`\<`string`, [`ModeratorPermission`](../modules/models.md#moderatorpermission)[]\>

The permissions the user has on the subreddit.

#### Returns

`Map`\<`string`, [`ModeratorPermission`](../modules/models.md#moderatorpermission)[]\>

---

### <a id="nsfw" name="nsfw"></a> nsfw

• `get` **nsfw**(): `boolean`

Whether the user's profile is marked as NSFW (Not Safe For Work).

#### Returns

`boolean`

---

### <a id="permalink" name="permalink"></a> permalink

• `get` **permalink**(): `string`

Returns a permalink path relative to https://www.reddit.com

#### Returns

`string`

---

### <a id="url" name="url"></a> url

• `get` **url**(): `string`

Returns the HTTP URL for the user

#### Returns

`string`

---

### <a id="username" name="username"></a> username

• `get` **username**(): `string`

The username of the user omitting the u/.

#### Returns

`string`

**`Example`**

```ts
'spez';
```

## Methods

### <a id="getcomments" name="getcomments"></a> getComments

▸ **getComments**(`options`): [`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

Get the user's comments.

#### Parameters

| Name      | Type                                                                                                | Description             |
| :-------- | :-------------------------------------------------------------------------------------------------- | :---------------------- |
| `options` | `Omit`\<[`GetCommentsByUserOptions`](../modules/models.md#getcommentsbyuseroptions), `"username"`\> | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

A Listing of Comment objects.

---

### <a id="getmodpermissionsforsubreddit" name="getmodpermissionsforsubreddit"></a> getModPermissionsForSubreddit

▸ **getModPermissionsForSubreddit**(`subredditName`): `Promise`\<[`ModeratorPermission`](../modules/models.md#moderatorpermission)[]\>

Get the mod permissions the user has on the subreddit if they are a moderator.

#### Parameters

| Name            | Type     | Description           |
| :-------------- | :------- | :-------------------- |
| `subredditName` | `string` | name of the subreddit |

#### Returns

`Promise`\<[`ModeratorPermission`](../modules/models.md#moderatorpermission)[]\>

the moderator permissions the user has on the subreddit

---

### <a id="getposts" name="getposts"></a> getPosts

▸ **getPosts**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

Get the user's posts.

#### Parameters

| Name      | Type                                                                                          | Description             |
| :-------- | :-------------------------------------------------------------------------------------------- | :---------------------- |
| `options` | `Omit`\<[`GetPostsByUserOptions`](../modules/models.md#getpostsbyuseroptions), `"username"`\> | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

A Listing of Post objects.

---

### <a id="getsnoovatarurl" name="getsnoovatarurl"></a> getSnoovatarUrl

▸ **getSnoovatarUrl**(): `Promise`\<`undefined` \| `string`\>

#### Returns

`Promise`\<`undefined` \| `string`\>

---

### <a id="getsociallinks" name="getsociallinks"></a> getSocialLinks

▸ **getSocialLinks**(): `Promise`\<[`UserSocialLink`](../modules/models.md#usersociallink)[]\>

Gets social links of the user

#### Returns

`Promise`\<[`UserSocialLink`](../modules/models.md#usersociallink)[]\>

A Promise that resolves an Array of UserSocialLink objects

**`Example`**

```ts
const socialLinks = await user.getSocialLinks();
```

---

### <a id="getuserflairbysubreddit" name="getuserflairbysubreddit"></a> getUserFlairBySubreddit

▸ **getUserFlairBySubreddit**(`subreddit`): `Promise`\<`undefined` \| [`UserFlair`](../modules/models.md#userflair)\>

Retrieve the user's flair for the subreddit.

#### Parameters

| Name        | Type     | Description                                                 |
| :---------- | :------- | :---------------------------------------------------------- |
| `subreddit` | `string` | The name of the subreddit associated with the user's flair. |

#### Returns

`Promise`\<`undefined` \| [`UserFlair`](../modules/models.md#userflair)\>

**`Example`**

```ts
const username = 'badapple';
const subredditName = 'mysubreddit';
const user = await reddit.getUserByUsername(username);
const userFlair = await user.getUserFlairBySubreddit(subredditName);
```

---

### <a id="tojson" name="tojson"></a> toJSON

▸ **toJSON**(): `Pick`\<[`User`](models.User.md), `"username"` \| `"id"` \| `"nsfw"` \| `"createdAt"` \| `"linkKarma"` \| `"commentKarma"`\> & \{ `modPermissionsBySubreddit`: `Record`\<`string`, [`ModeratorPermission`](../modules/models.md#moderatorpermission)[]\> }

#### Returns

`Pick`\<[`User`](models.User.md), `"username"` \| `"id"` \| `"nsfw"` \| `"createdAt"` \| `"linkKarma"` \| `"commentKarma"`\> & \{ `modPermissionsBySubreddit`: `Record`\<`string`, [`ModeratorPermission`](../modules/models.md#moderatorpermission)[]\> }
