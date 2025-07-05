[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: User

A class representing a user.

## Accessors

<a id="commentkarma"></a>

### commentKarma

#### Get Signature

> **get** **commentKarma**(): `number`

The amount of comment karma the user has.

##### Returns

`number`

---

<a id="createdat"></a>

### createdAt

#### Get Signature

> **get** **createdAt**(): `Date`

The date the user was created.

##### Returns

`Date`

---

<a id="hasverifiedemail"></a>

### hasVerifiedEmail

#### Get Signature

> **get** **hasVerifiedEmail**(): `boolean`

Indicates whether or not the user has verified their email address.

##### Returns

`boolean`

---

<a id="id"></a>

### id

#### Get Signature

> **get** **id**(): `` `t2_${string}` ``

The ID (starting with t2\_) of the user to retrieve.

##### Example

```ts
't2_1w72';
```

##### Returns

`` `t2_${string}` ``

---

<a id="isadmin"></a>

### isAdmin

#### Get Signature

> **get** **isAdmin**(): `boolean`

Whether the user is admin.

##### Returns

`boolean`

---

<a id="linkkarma"></a>

### linkKarma

#### Get Signature

> **get** **linkKarma**(): `number`

The amount of link karma the user has.

##### Returns

`number`

---

<a id="modpermissions"></a>

### modPermissions

#### Get Signature

> **get** **modPermissions**(): `Map`\<`string`, [`ModeratorPermission`](../type-aliases/ModeratorPermission.md)[]\>

The permissions the user has on the subreddit.

##### Returns

`Map`\<`string`, [`ModeratorPermission`](../type-aliases/ModeratorPermission.md)[]\>

---

<a id="nsfw"></a>

### nsfw

#### Get Signature

> **get** **nsfw**(): `boolean`

Whether the user's profile is marked as NSFW (Not Safe For Work).

##### Returns

`boolean`

---

<a id="permalink"></a>

### permalink

#### Get Signature

> **get** **permalink**(): `string`

Returns a permalink path relative to https://www.reddit.com

##### Returns

`string`

---

<a id="url"></a>

### url

#### Get Signature

> **get** **url**(): `string`

Returns the HTTP URL for the user

##### Returns

`string`

---

<a id="username"></a>

### username

#### Get Signature

> **get** **username**(): `string`

The username of the user omitting the u/.

##### Example

```ts
'spez';
```

##### Returns

`string`

## Methods

<a id="getcomments"></a>

### getComments()

> **getComments**(`options`): [`Listing`](Listing.md)\<[`Comment`](Comment.md)\>

Get the user's comments.

#### Parameters

##### options

`Omit`\<[`GetCommentsByUserOptions`](../type-aliases/GetCommentsByUserOptions.md), `"username"`\>

Options for the request

#### Returns

[`Listing`](Listing.md)\<[`Comment`](Comment.md)\>

A Listing of Comment objects.

---

<a id="getmodpermissionsforsubreddit"></a>

### getModPermissionsForSubreddit()

> **getModPermissionsForSubreddit**(`subredditName`): `Promise`\<[`ModeratorPermission`](../type-aliases/ModeratorPermission.md)[]\>

Get the mod permissions the user has on the subreddit if they are a moderator.

#### Parameters

##### subredditName

`string`

name of the subreddit

#### Returns

`Promise`\<[`ModeratorPermission`](../type-aliases/ModeratorPermission.md)[]\>

the moderator permissions the user has on the subreddit

---

<a id="getposts"></a>

### getPosts()

> **getPosts**(`options`): [`Listing`](Listing.md)\<[`Post`](Post.md)\>

Get the user's posts.

#### Parameters

##### options

`Omit`\<[`GetPostsByUserOptions`](../type-aliases/GetPostsByUserOptions.md), `"username"`\>

Options for the request

#### Returns

[`Listing`](Listing.md)\<[`Post`](Post.md)\>

A Listing of Post objects.

---

<a id="getsnoovatarurl"></a>

### getSnoovatarUrl()

> **getSnoovatarUrl**(): `Promise`\<`undefined` \| `string`\>

#### Returns

`Promise`\<`undefined` \| `string`\>

---

<a id="getsociallinks"></a>

### getSocialLinks()

> **getSocialLinks**(): `Promise`\<[`UserSocialLink`](../type-aliases/UserSocialLink.md)[]\>

Gets social links of the user

#### Returns

`Promise`\<[`UserSocialLink`](../type-aliases/UserSocialLink.md)[]\>

A Promise that resolves an Array of UserSocialLink objects

#### Example

```ts
const socialLinks = await user.getSocialLinks();
```

---

<a id="getuserflairbysubreddit"></a>

### getUserFlairBySubreddit()

> **getUserFlairBySubreddit**(`subreddit`): `Promise`\<`undefined` \| [`UserFlair`](../type-aliases/UserFlair.md)\>

Retrieve the user's flair for the subreddit.

#### Parameters

##### subreddit

`string`

The name of the subreddit associated with the user's flair.

#### Returns

`Promise`\<`undefined` \| [`UserFlair`](../type-aliases/UserFlair.md)\>

#### Example

```ts
const username = 'badapple';
const subredditName = 'mysubreddit';
const user = await reddit.getUserByUsername(username);
const userFlair = await user.getUserFlairBySubreddit(subredditName);
```

---

<a id="tojson"></a>

### toJSON()

> **toJSON**(): `Pick`\<`User`, `"username"` \| `"id"` \| `"nsfw"` \| `"createdAt"` \| `"linkKarma"` \| `"commentKarma"`\> & `object`

#### Returns

`Pick`\<`User`, `"username"` \| `"id"` \| `"nsfw"` \| `"createdAt"` \| `"linkKarma"` \| `"commentKarma"`\> & `object`
