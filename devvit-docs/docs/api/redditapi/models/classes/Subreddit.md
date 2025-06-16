[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: Subreddit

A class representing a subreddit.

## Accessors

<a id="createdat"></a>

### createdAt

#### Get Signature

> **get** **createdAt**(): `Date`

The creation date of the subreddit.

##### Returns

`Date`

---

<a id="description"></a>

### description

#### Get Signature

> **get** **description**(): `undefined` \| `string`

The description of the subreddit.

##### Returns

`undefined` \| `string`

---

<a id="id"></a>

### id

#### Get Signature

> **get** **id**(): `` `t5_${string}` ``

The ID (starting with t5\_) of the subreddit to retrieve. e.g. t5_2qjpg

##### Returns

`` `t5_${string}` ``

---

<a id="language"></a>

### language

#### Get Signature

> **get** **language**(): `string`

The language of the subreddit.

##### Returns

`string`

---

<a id="name"></a>

### name

#### Get Signature

> **get** **name**(): `string`

The name of a subreddit omitting the r/.

##### Returns

`string`

---

<a id="nsfw"></a>

### nsfw

#### Get Signature

> **get** **nsfw**(): `boolean`

Whether the subreddit is marked as NSFW (Not Safe For Work).

##### Returns

`boolean`

---

<a id="numberofactiveusers"></a>

### numberOfActiveUsers

#### Get Signature

> **get** **numberOfActiveUsers**(): `number`

The number of active users of the subreddit.

##### Returns

`number`

---

<a id="numberofsubscribers"></a>

### numberOfSubscribers

#### Get Signature

> **get** **numberOfSubscribers**(): `number`

The number of subscribers of the subreddit.

##### Returns

`number`

---

<a id="permalink"></a>

### permalink

#### Get Signature

> **get** **permalink**(): `string`

Returns a permalink path
(R2 bug: subreddit.url is a permalink, and does not have a subreddit.permalink field)

##### Returns

`string`

---

<a id="postflairsenabled"></a>

### postFlairsEnabled

#### Get Signature

> **get** **postFlairsEnabled**(): `boolean`

Whether the post flairs are enabled for this subreddit.

##### Returns

`boolean`

---

<a id="settings"></a>

### settings

#### Get Signature

> **get** **settings**(): [`SubredditSettings`](../type-aliases/SubredditSettings.md)

The settings of the subreddit.

##### Returns

[`SubredditSettings`](../type-aliases/SubredditSettings.md)

---

<a id="title"></a>

### title

#### Get Signature

> **get** **title**(): `undefined` \| `string`

The title of the subreddit.

##### Returns

`undefined` \| `string`

---

<a id="type"></a>

### type

#### Get Signature

> **get** **type**(): [`SubredditType`](../type-aliases/SubredditType.md)

The type of subreddit (public, private, etc.).

##### Returns

[`SubredditType`](../type-aliases/SubredditType.md)

---

<a id="url"></a>

### url

#### Get Signature

> **get** **url**(): `string`

Returns the HTTP URL for the subreddit.
(R2 bug: subreddit.url is a permalink path and does not return a fully qualified URL in subreddit.url)

##### Returns

`string`

---

<a id="userflairsenabled"></a>

### userFlairsEnabled

#### Get Signature

> **get** **userFlairsEnabled**(): `boolean`

Whether the user flairs are enabled for this subreddit.

##### Returns

`boolean`

---

<a id="userscanassignpostflairs"></a>

### usersCanAssignPostFlairs

#### Get Signature

> **get** **usersCanAssignPostFlairs**(): `boolean`

Whether the user can assign post flairs.
This is only true if the post flairs are enabled.

##### Returns

`boolean`

---

<a id="userscanassignuserflairs"></a>

### usersCanAssignUserFlairs

#### Get Signature

> **get** **usersCanAssignUserFlairs**(): `boolean`

Whether the user can assign user flairs.
This is only true if the user flairs are enabled.

##### Returns

`boolean`

## Methods

<a id="addwikicontributor"></a>

### addWikiContributor()

> **addWikiContributor**(`username`): `Promise`\<`void`\>

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`void`\>

---

<a id="approveuser"></a>

### approveUser()

> **approveUser**(`username`): `Promise`\<`void`\>

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`void`\>

---

<a id="banuser"></a>

### banUser()

> **banUser**(`options`): `Promise`\<`void`\>

#### Parameters

##### options

`Omit`\<[`BanUserOptions`](../type-aliases/BanUserOptions.md), `"subredditName"`\>

#### Returns

`Promise`\<`void`\>

---

<a id="banwikicontributor"></a>

### banWikiContributor()

> **banWikiContributor**(`options`): `Promise`\<`void`\>

#### Parameters

##### options

`Omit`\<[`BanWikiContributorOptions`](../type-aliases/BanWikiContributorOptions.md), `"subredditName"`\>

#### Returns

`Promise`\<`void`\>

---

<a id="createpostflairtemplate"></a>

### createPostFlairTemplate()

> **createPostFlairTemplate**(`options`): `Promise`\<[`FlairTemplate`](FlairTemplate.md)\>

#### Parameters

##### options

`Omit`\<[`CreateFlairTemplateOptions`](../type-aliases/CreateFlairTemplateOptions.md), `"subredditName"`\>

#### Returns

`Promise`\<[`FlairTemplate`](FlairTemplate.md)\>

---

<a id="createuserflairtemplate"></a>

### createUserFlairTemplate()

> **createUserFlairTemplate**(`options`): `Promise`\<[`FlairTemplate`](FlairTemplate.md)\>

#### Parameters

##### options

`Omit`\<[`CreateFlairTemplateOptions`](../type-aliases/CreateFlairTemplateOptions.md), `"subredditName"`\>

#### Returns

`Promise`\<[`FlairTemplate`](FlairTemplate.md)\>

---

<a id="getapprovedusers"></a>

### getApprovedUsers()

> **getApprovedUsers**(`options`): [`Listing`](Listing.md)\<[`User`](User.md)\>

#### Parameters

##### options

`GetUsersOptions` = `{}`

#### Returns

[`Listing`](Listing.md)\<[`User`](User.md)\>

---

<a id="getbannedusers"></a>

### getBannedUsers()

> **getBannedUsers**(`options`): [`Listing`](Listing.md)\<[`User`](User.md)\>

#### Parameters

##### options

`GetUsersOptions` = `{}`

#### Returns

[`Listing`](Listing.md)\<[`User`](User.md)\>

---

<a id="getbannedwikicontributors"></a>

### getBannedWikiContributors()

> **getBannedWikiContributors**(`options`): [`Listing`](Listing.md)\<[`User`](User.md)\>

#### Parameters

##### options

`GetUsersOptions` = `{}`

#### Returns

[`Listing`](Listing.md)\<[`User`](User.md)\>

---

<a id="getcommentsandpostsbyids"></a>

### getCommentsAndPostsByIds()

> **getCommentsAndPostsByIds**(`ids`): [`Listing`](Listing.md)\<[`Post`](Post.md) \| [`Comment`](Comment.md)\>

Return a listing of things specified by their fullnames.

#### Parameters

##### ids

`string`[]

Array of thing full ids (e.g. t3_abc123)

#### Returns

[`Listing`](Listing.md)\<[`Post`](Post.md) \| [`Comment`](Comment.md)\>

#### Example

```ts
const subreddit = await reddit.getSubredditByName('askReddit');
const listing = subreddit.getCommentsAndPostsByIds(['t3_abc123', 't1_xyz123']);
const items = await listing.all();
console.log(items); // [Post, Comment]
```

---

<a id="getcontroversialposts"></a>

### getControversialPosts()

> **getControversialPosts**(`options`): [`Listing`](Listing.md)\<[`Post`](Post.md)\>

#### Parameters

##### options

`Omit`\<[`GetPostsOptionsWithTimeframe`](../type-aliases/GetPostsOptionsWithTimeframe.md), `"subredditName"`\> = `{}`

#### Returns

[`Listing`](Listing.md)\<[`Post`](Post.md)\>

---

<a id="getedited"></a>

### getEdited()

#### Call Signature

> **getEdited**(`options`): [`Listing`](Listing.md)\<[`Comment`](Comment.md)\>

Return a listing of things that have been edited recently.

##### Parameters

###### options

`AboutSubredditOptions`\<`"comment"`\>

##### Returns

[`Listing`](Listing.md)\<[`Comment`](Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getEdited();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getEdited({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getEdited**(`options`): [`Listing`](Listing.md)\<[`Post`](Post.md)\>

Return a listing of things that have been edited recently.

##### Parameters

###### options

`AboutSubredditOptions`\<`"post"`\>

##### Returns

[`Listing`](Listing.md)\<[`Post`](Post.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getEdited();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getEdited({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getEdited**(`options`?): [`Listing`](Listing.md)\<[`Post`](Post.md) \| [`Comment`](Comment.md)\>

Return a listing of things that have been edited recently.

##### Parameters

###### options?

`AboutSubredditOptions`\<`"all"`\>

##### Returns

[`Listing`](Listing.md)\<[`Post`](Post.md) \| [`Comment`](Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getEdited();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getEdited({ type: 'post' });
console.log('Posts: ', await listing.all());
```

---

<a id="getmoderationlog"></a>

### getModerationLog()

> **getModerationLog**(`options`): [`Listing`](Listing.md)\<[`ModAction`](../interfaces/ModAction.md)\>

#### Parameters

##### options

`GetModerationLogOptions`

#### Returns

[`Listing`](Listing.md)\<[`ModAction`](../interfaces/ModAction.md)\>

---

<a id="getmoderators"></a>

### getModerators()

> **getModerators**(`options`): [`Listing`](Listing.md)\<[`User`](User.md)\>

#### Parameters

##### options

`GetUsersOptions` = `{}`

#### Returns

[`Listing`](Listing.md)\<[`User`](User.md)\>

---

<a id="getmodqueue"></a>

### getModQueue()

#### Call Signature

> **getModQueue**(`options`): [`Listing`](Listing.md)\<[`Comment`](Comment.md)\>

Return a listing of things requiring moderator review, such as reported things and items.

##### Parameters

###### options

`AboutSubredditOptions`\<`"comment"`\>

##### Returns

[`Listing`](Listing.md)\<[`Comment`](Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getModQueue();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getModQueue({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getModQueue**(`options`): [`Listing`](Listing.md)\<[`Post`](Post.md)\>

Return a listing of things requiring moderator review, such as reported things and items.

##### Parameters

###### options

`AboutSubredditOptions`\<`"post"`\>

##### Returns

[`Listing`](Listing.md)\<[`Post`](Post.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getModQueue();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getModQueue({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getModQueue**(`options`?): [`Listing`](Listing.md)\<[`Post`](Post.md) \| [`Comment`](Comment.md)\>

Return a listing of things requiring moderator review, such as reported things and items.

##### Parameters

###### options?

`AboutSubredditOptions`\<`"all"`\>

##### Returns

[`Listing`](Listing.md)\<[`Post`](Post.md) \| [`Comment`](Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getModQueue();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getModQueue({ type: 'post' });
console.log('Posts: ', await listing.all());
```

---

<a id="getmutedusers"></a>

### getMutedUsers()

> **getMutedUsers**(`options`): [`Listing`](Listing.md)\<[`User`](User.md)\>

#### Parameters

##### options

`GetUsersOptions` = `{}`

#### Returns

[`Listing`](Listing.md)\<[`User`](User.md)\>

---

<a id="getpostflairtemplates"></a>

### getPostFlairTemplates()

> **getPostFlairTemplates**(): `Promise`\<[`FlairTemplate`](FlairTemplate.md)[]\>

#### Returns

`Promise`\<[`FlairTemplate`](FlairTemplate.md)[]\>

---

<a id="getreports"></a>

### getReports()

#### Call Signature

> **getReports**(`options`): [`Listing`](Listing.md)\<[`Comment`](Comment.md)\>

Return a listing of things that have been reported.

##### Parameters

###### options

`AboutSubredditOptions`\<`"comment"`\>

##### Returns

[`Listing`](Listing.md)\<[`Comment`](Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getReports();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getReports({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getReports**(`options`): [`Listing`](Listing.md)\<[`Post`](Post.md)\>

Return a listing of things that have been reported.

##### Parameters

###### options

`AboutSubredditOptions`\<`"post"`\>

##### Returns

[`Listing`](Listing.md)\<[`Post`](Post.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getReports();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getReports({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getReports**(`options`?): [`Listing`](Listing.md)\<[`Post`](Post.md) \| [`Comment`](Comment.md)\>

Return a listing of things that have been reported.

##### Parameters

###### options?

`AboutSubredditOptions`\<`"all"`\>

##### Returns

[`Listing`](Listing.md)\<[`Post`](Post.md) \| [`Comment`](Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getReports();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getReports({ type: 'post' });
console.log('Posts: ', await listing.all());
```

---

<a id="getspam"></a>

### getSpam()

#### Call Signature

> **getSpam**(`options`): [`Listing`](Listing.md)\<[`Comment`](Comment.md)\>

Return a listing of things that have been marked as spam or otherwise removed.

##### Parameters

###### options

`AboutSubredditOptions`\<`"comment"`\>

##### Returns

[`Listing`](Listing.md)\<[`Comment`](Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getSpam();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getSpam({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getSpam**(`options`): [`Listing`](Listing.md)\<[`Post`](Post.md)\>

Return a listing of things that have been marked as spam or otherwise removed.

##### Parameters

###### options

`AboutSubredditOptions`\<`"post"`\>

##### Returns

[`Listing`](Listing.md)\<[`Post`](Post.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getSpam();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getSpam({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getSpam**(`options`?): [`Listing`](Listing.md)\<[`Post`](Post.md) \| [`Comment`](Comment.md)\>

Return a listing of things that have been marked as spam or otherwise removed.

##### Parameters

###### options?

`AboutSubredditOptions`\<`"all"`\>

##### Returns

[`Listing`](Listing.md)\<[`Post`](Post.md) \| [`Comment`](Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getSpam();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getSpam({ type: 'post' });
console.log('Posts: ', await listing.all());
```

---

<a id="gettopposts"></a>

### getTopPosts()

> **getTopPosts**(`options`): [`Listing`](Listing.md)\<[`Post`](Post.md)\>

#### Parameters

##### options

`Omit`\<[`GetPostsOptionsWithTimeframe`](../type-aliases/GetPostsOptionsWithTimeframe.md), `"subredditName"`\> = `{}`

#### Returns

[`Listing`](Listing.md)\<[`Post`](Post.md)\>

---

<a id="getunmoderated"></a>

### getUnmoderated()

#### Call Signature

> **getUnmoderated**(`options`): [`Listing`](Listing.md)\<[`Comment`](Comment.md)\>

Return a listing of things that have yet to be approved/removed by a mod.

##### Parameters

###### options

`AboutSubredditOptions`\<`"comment"`\>

##### Returns

[`Listing`](Listing.md)\<[`Comment`](Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getUnmoderated();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getUnmoderated({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getUnmoderated**(`options`): [`Listing`](Listing.md)\<[`Post`](Post.md)\>

Return a listing of things that have yet to be approved/removed by a mod.

##### Parameters

###### options

`AboutSubredditOptions`\<`"post"`\>

##### Returns

[`Listing`](Listing.md)\<[`Post`](Post.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getUnmoderated();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getUnmoderated({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getUnmoderated**(`options`?): [`Listing`](Listing.md)\<[`Post`](Post.md) \| [`Comment`](Comment.md)\>

Return a listing of things that have yet to be approved/removed by a mod.

##### Parameters

###### options?

`AboutSubredditOptions`\<`"all"`\>

##### Returns

[`Listing`](Listing.md)\<[`Post`](Post.md) \| [`Comment`](Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getUnmoderated();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getUnmoderated({ type: 'post' });
console.log('Posts: ', await listing.all());
```

---

<a id="getuserflair"></a>

### getUserFlair()

> **getUserFlair**(`options`?): `Promise`\<[`GetUserFlairBySubredditResponse`](../type-aliases/GetUserFlairBySubredditResponse.md)\>

Get the user flair for the given subreddit. If `usernames` is provided then it will return only the
flair for the specified users. If retrieving the list of flair for a given subreddit and the list is long
then this method will return a `next` field which can be passed into the `after` field on the next call to
retrieve the next slice of data. To retrieve the previous slice of data pass the `prev` field into the `before` field
during the subsequent call.

#### Parameters

##### options?

[`GetUserFlairOptions`](../type-aliases/GetUserFlairOptions.md)

See interface

#### Returns

`Promise`\<[`GetUserFlairBySubredditResponse`](../type-aliases/GetUserFlairBySubredditResponse.md)\>

#### Examples

```ts
const subredditName = 'mysubreddit';
const subreddit = await reddit.getSubredditByName(subredditName);
const response = await subreddit.getUserFlair();
const userFlairList = response.users;
```

```ts
const response = await subreddit.getUserFlair({ after: 't2_awefae' });
const userFlairList = response.users;
```

```ts
const response = await subreddit.getUserFlair({ usernames: ['toxictoad', 'badapple'] });
const userFlairList = response.users;
```

---

<a id="getuserflairtemplates"></a>

### getUserFlairTemplates()

> **getUserFlairTemplates**(): `Promise`\<[`FlairTemplate`](FlairTemplate.md)[]\>

#### Returns

`Promise`\<[`FlairTemplate`](FlairTemplate.md)[]\>

---

<a id="getwikicontributors"></a>

### getWikiContributors()

> **getWikiContributors**(`options`): [`Listing`](Listing.md)\<[`User`](User.md)\>

#### Parameters

##### options

`GetUsersOptions` = `{}`

#### Returns

[`Listing`](Listing.md)\<[`User`](User.md)\>

---

<a id="invitemoderator"></a>

### inviteModerator()

> **inviteModerator**(`username`, `permissions`?): `Promise`\<`void`\>

#### Parameters

##### username

`string`

##### permissions?

[`ModeratorPermission`](../type-aliases/ModeratorPermission.md)[]

#### Returns

`Promise`\<`void`\>

---

<a id="muteuser"></a>

### muteUser()

> **muteUser**(`username`, `note`?): `Promise`\<`void`\>

#### Parameters

##### username

`string`

##### note?

`string`

#### Returns

`Promise`\<`void`\>

---

<a id="removemoderator"></a>

### removeModerator()

> **removeModerator**(`username`): `Promise`\<`void`\>

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`void`\>

---

<a id="removeuser"></a>

### removeUser()

> **removeUser**(`username`): `Promise`\<`void`\>

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`void`\>

---

<a id="removewikicontributor"></a>

### removeWikiContributor()

> **removeWikiContributor**(`username`): `Promise`\<`void`\>

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`void`\>

---

<a id="revokemoderatorinvite"></a>

### revokeModeratorInvite()

> **revokeModeratorInvite**(`username`): `Promise`\<`void`\>

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`void`\>

---

<a id="setmoderatorpermissions"></a>

### setModeratorPermissions()

> **setModeratorPermissions**(`username`, `permissions`): `Promise`\<`void`\>

#### Parameters

##### username

`string`

##### permissions

[`ModeratorPermission`](../type-aliases/ModeratorPermission.md)[]

#### Returns

`Promise`\<`void`\>

---

<a id="submitpost"></a>

### submitPost()

> **submitPost**(`options`): `Promise`\<[`Post`](Post.md)\>

#### Parameters

##### options

[`SubmitLinkOptions`](../type-aliases/SubmitLinkOptions.md) | [`SubmitSelfPostOptions`](../type-aliases/SubmitSelfPostOptions.md)

#### Returns

`Promise`\<[`Post`](Post.md)\>

---

<a id="tojson"></a>

### toJSON()

> **toJSON**(): `Pick`\<`Subreddit`, `"description"` \| `"type"` \| `"id"` \| `"name"` \| `"title"` \| `"settings"` \| `"language"` \| `"nsfw"` \| `"createdAt"` \| `"numberOfSubscribers"` \| `"numberOfActiveUsers"`\>

#### Returns

`Pick`\<`Subreddit`, `"description"` \| `"type"` \| `"id"` \| `"name"` \| `"title"` \| `"settings"` \| `"language"` \| `"nsfw"` \| `"createdAt"` \| `"numberOfSubscribers"` \| `"numberOfActiveUsers"`\>

---

<a id="unbanuser"></a>

### unbanUser()

> **unbanUser**(`username`): `Promise`\<`void`\>

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`void`\>

---

<a id="unbanwikicontributor"></a>

### unbanWikiContributor()

> **unbanWikiContributor**(`username`): `Promise`\<`void`\>

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`void`\>

---

<a id="unmuteuser"></a>

### unmuteUser()

> **unmuteUser**(`username`): `Promise`\<`void`\>

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`void`\>
