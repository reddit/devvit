# Class: Subreddit

[models](../modules/models.md).Subreddit

A class representing a subreddit.

## Table of contents

### Accessors

- [createdAt](models.Subreddit.md#createdat)
- [description](models.Subreddit.md#description)
- [id](models.Subreddit.md#id)
- [language](models.Subreddit.md#language)
- [name](models.Subreddit.md#name)
- [nsfw](models.Subreddit.md#nsfw)
- [numberOfActiveUsers](models.Subreddit.md#numberofactiveusers)
- [numberOfSubscribers](models.Subreddit.md#numberofsubscribers)
- [permalink](models.Subreddit.md#permalink)
- [postFlairsEnabled](models.Subreddit.md#postflairsenabled)
- [settings](models.Subreddit.md#settings)
- [title](models.Subreddit.md#title)
- [type](models.Subreddit.md#type)
- [url](models.Subreddit.md#url)
- [userFlairsEnabled](models.Subreddit.md#userflairsenabled)
- [usersCanAssignPostFlairs](models.Subreddit.md#userscanassignpostflairs)
- [usersCanAssignUserFlairs](models.Subreddit.md#userscanassignuserflairs)

### Methods

- [addWikiContributor](models.Subreddit.md#addwikicontributor)
- [approveUser](models.Subreddit.md#approveuser)
- [banUser](models.Subreddit.md#banuser)
- [banWikiContributor](models.Subreddit.md#banwikicontributor)
- [createPostFlairTemplate](models.Subreddit.md#createpostflairtemplate)
- [createUserFlairTemplate](models.Subreddit.md#createuserflairtemplate)
- [getApprovedUsers](models.Subreddit.md#getapprovedusers)
- [getBannedUsers](models.Subreddit.md#getbannedusers)
- [getBannedWikiContributors](models.Subreddit.md#getbannedwikicontributors)
- [getCommentsAndPostsByIds](models.Subreddit.md#getcommentsandpostsbyids)
- [getControversialPosts](models.Subreddit.md#getcontroversialposts)
- [getEdited](models.Subreddit.md#getedited)
- [getModQueue](models.Subreddit.md#getmodqueue)
- [getModerationLog](models.Subreddit.md#getmoderationlog)
- [getModerators](models.Subreddit.md#getmoderators)
- [getMutedUsers](models.Subreddit.md#getmutedusers)
- [getPostFlairTemplates](models.Subreddit.md#getpostflairtemplates)
- [getReports](models.Subreddit.md#getreports)
- [getSpam](models.Subreddit.md#getspam)
- [getTopPosts](models.Subreddit.md#gettopposts)
- [getUnmoderated](models.Subreddit.md#getunmoderated)
- [getUserFlair](models.Subreddit.md#getuserflair)
- [getUserFlairTemplates](models.Subreddit.md#getuserflairtemplates)
- [getWikiContributors](models.Subreddit.md#getwikicontributors)
- [inviteModerator](models.Subreddit.md#invitemoderator)
- [muteUser](models.Subreddit.md#muteuser)
- [removeModerator](models.Subreddit.md#removemoderator)
- [removeUser](models.Subreddit.md#removeuser)
- [removeWikiContributor](models.Subreddit.md#removewikicontributor)
- [revokeModeratorInvite](models.Subreddit.md#revokemoderatorinvite)
- [setModeratorPermissions](models.Subreddit.md#setmoderatorpermissions)
- [submitPost](models.Subreddit.md#submitpost)
- [toJSON](models.Subreddit.md#tojson)
- [unbanUser](models.Subreddit.md#unbanuser)
- [unbanWikiContributor](models.Subreddit.md#unbanwikicontributor)
- [unmuteUser](models.Subreddit.md#unmuteuser)

## Accessors

### <a id="createdat" name="createdat"></a> createdAt

• `get` **createdAt**(): `Date`

The creation date of the subreddit.

#### Returns

`Date`

---

### <a id="description" name="description"></a> description

• `get` **description**(): `undefined` \| `string`

The description of the subreddit.

#### Returns

`undefined` \| `string`

---

### <a id="id" name="id"></a> id

• `get` **id**(): \`t5\_$\{string}\`

The ID (starting with t5\_) of the subreddit to retrieve. e.g. t5_2qjpg

#### Returns

\`t5\_$\{string}\`

---

### <a id="language" name="language"></a> language

• `get` **language**(): `string`

The language of the subreddit.

#### Returns

`string`

---

### <a id="name" name="name"></a> name

• `get` **name**(): `string`

The name of a subreddit omitting the r/.

#### Returns

`string`

---

### <a id="nsfw" name="nsfw"></a> nsfw

• `get` **nsfw**(): `boolean`

Whether the subreddit is marked as NSFW (Not Safe For Work).

#### Returns

`boolean`

---

### <a id="numberofactiveusers" name="numberofactiveusers"></a> numberOfActiveUsers

• `get` **numberOfActiveUsers**(): `number`

The number of active users of the subreddit.

#### Returns

`number`

---

### <a id="numberofsubscribers" name="numberofsubscribers"></a> numberOfSubscribers

• `get` **numberOfSubscribers**(): `number`

The number of subscribers of the subreddit.

#### Returns

`number`

---

### <a id="permalink" name="permalink"></a> permalink

• `get` **permalink**(): `string`

Returns a permalink path
(R2 bug: subreddit.url is a permalink, and does not have a subreddit.permalink field)

#### Returns

`string`

---

### <a id="postflairsenabled" name="postflairsenabled"></a> postFlairsEnabled

• `get` **postFlairsEnabled**(): `boolean`

Whether the post flairs are enabled for this subreddit.

#### Returns

`boolean`

---

### <a id="settings" name="settings"></a> settings

• `get` **settings**(): [`SubredditSettings`](../modules/models.md#subredditsettings)

The settings of the subreddit.

#### Returns

[`SubredditSettings`](../modules/models.md#subredditsettings)

---

### <a id="title" name="title"></a> title

• `get` **title**(): `undefined` \| `string`

The title of the subreddit.

#### Returns

`undefined` \| `string`

---

### <a id="type" name="type"></a> type

• `get` **type**(): [`SubredditType`](../modules/models.md#subreddittype)

The type of subreddit (public, private, etc.).

#### Returns

[`SubredditType`](../modules/models.md#subreddittype)

---

### <a id="url" name="url"></a> url

• `get` **url**(): `string`

Returns the HTTP URL for the subreddit.
(R2 bug: subreddit.url is a permalink path and does not return a fully qualified URL in subreddit.url)

#### Returns

`string`

---

### <a id="userflairsenabled" name="userflairsenabled"></a> userFlairsEnabled

• `get` **userFlairsEnabled**(): `boolean`

Whether the user flairs are enabled for this subreddit.

#### Returns

`boolean`

---

### <a id="userscanassignpostflairs" name="userscanassignpostflairs"></a> usersCanAssignPostFlairs

• `get` **usersCanAssignPostFlairs**(): `boolean`

Whether the user can assign post flairs.
This is only true if the post flairs are enabled.

#### Returns

`boolean`

---

### <a id="userscanassignuserflairs" name="userscanassignuserflairs"></a> usersCanAssignUserFlairs

• `get` **usersCanAssignUserFlairs**(): `boolean`

Whether the user can assign user flairs.
This is only true if the user flairs are enabled.

#### Returns

`boolean`

## Methods

### <a id="addwikicontributor" name="addwikicontributor"></a> addWikiContributor

▸ **addWikiContributor**(`username`): `Promise`\<`void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\<`void`\>

---

### <a id="approveuser" name="approveuser"></a> approveUser

▸ **approveUser**(`username`): `Promise`\<`void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\<`void`\>

---

### <a id="banuser" name="banuser"></a> banUser

▸ **banUser**(`options`): `Promise`\<`void`\>

#### Parameters

| Name      | Type                                                                                 |
| :-------- | :----------------------------------------------------------------------------------- |
| `options` | `Omit`\<[`BanUserOptions`](../modules/models.md#banuseroptions), `"subredditName"`\> |

#### Returns

`Promise`\<`void`\>

---

### <a id="banwikicontributor" name="banwikicontributor"></a> banWikiContributor

▸ **banWikiContributor**(`options`): `Promise`\<`void`\>

#### Parameters

| Name      | Type                                                                                                       |
| :-------- | :--------------------------------------------------------------------------------------------------------- |
| `options` | `Omit`\<[`BanWikiContributorOptions`](../modules/models.md#banwikicontributoroptions), `"subredditName"`\> |

#### Returns

`Promise`\<`void`\>

---

### <a id="createpostflairtemplate" name="createpostflairtemplate"></a> createPostFlairTemplate

▸ **createPostFlairTemplate**(`options`): `Promise`\<[`FlairTemplate`](models.FlairTemplate.md)\>

#### Parameters

| Name      | Type                                                                                                         |
| :-------- | :----------------------------------------------------------------------------------------------------------- |
| `options` | `Omit`\<[`CreateFlairTemplateOptions`](../modules/models.md#createflairtemplateoptions), `"subredditName"`\> |

#### Returns

`Promise`\<[`FlairTemplate`](models.FlairTemplate.md)\>

---

### <a id="createuserflairtemplate" name="createuserflairtemplate"></a> createUserFlairTemplate

▸ **createUserFlairTemplate**(`options`): `Promise`\<[`FlairTemplate`](models.FlairTemplate.md)\>

#### Parameters

| Name      | Type                                                                                                         |
| :-------- | :----------------------------------------------------------------------------------------------------------- |
| `options` | `Omit`\<[`CreateFlairTemplateOptions`](../modules/models.md#createflairtemplateoptions), `"subredditName"`\> |

#### Returns

`Promise`\<[`FlairTemplate`](models.FlairTemplate.md)\>

---

### <a id="getapprovedusers" name="getapprovedusers"></a> getApprovedUsers

▸ **getApprovedUsers**(`options?`): [`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

#### Parameters

| Name      | Type              |
| :-------- | :---------------- |
| `options` | `GetUsersOptions` |

#### Returns

[`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

---

### <a id="getbannedusers" name="getbannedusers"></a> getBannedUsers

▸ **getBannedUsers**(`options?`): [`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

#### Parameters

| Name      | Type              |
| :-------- | :---------------- |
| `options` | `GetUsersOptions` |

#### Returns

[`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

---

### <a id="getbannedwikicontributors" name="getbannedwikicontributors"></a> getBannedWikiContributors

▸ **getBannedWikiContributors**(`options?`): [`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

#### Parameters

| Name      | Type              |
| :-------- | :---------------- |
| `options` | `GetUsersOptions` |

#### Returns

[`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

---

### <a id="getcommentsandpostsbyids" name="getcommentsandpostsbyids"></a> getCommentsAndPostsByIds

▸ **getCommentsAndPostsByIds**(`ids`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

Return a listing of things specified by their fullnames.

#### Parameters

| Name  | Type       | Description                              |
| :---- | :--------- | :--------------------------------------- |
| `ids` | `string`[] | Array of thing full ids (e.g. t3_abc123) |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

**`Example`**

```ts
const subreddit = await reddit.getSubredditByName('askReddit');
const listing = subreddit.getCommentsAndPostsByIds(['t3_abc123', 't1_xyz123']);
const items = await listing.all();
console.log(items); // [Post, Comment]
```

---

### <a id="getcontroversialposts" name="getcontroversialposts"></a> getControversialPosts

▸ **getControversialPosts**(`options?`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

#### Parameters

| Name      | Type                                                                                                             |
| :-------- | :--------------------------------------------------------------------------------------------------------------- |
| `options` | `Omit`\<[`GetPostsOptionsWithTimeframe`](../modules/models.md#getpostsoptionswithtimeframe), `"subredditName"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

---

### <a id="getedited" name="getedited"></a> getEdited

▸ **getEdited**(`options`): [`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

Return a listing of things that have been edited recently.

#### Parameters

| Name      | Type                                   |
| :-------- | :------------------------------------- |
| `options` | `AboutSubredditOptions`\<`"comment"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

**`Example`**

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getEdited();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getEdited({ type: 'post' });
console.log('Posts: ', await listing.all());
```

▸ **getEdited**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

#### Parameters

| Name      | Type                                |
| :-------- | :---------------------------------- |
| `options` | `AboutSubredditOptions`\<`"post"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

▸ **getEdited**(`options?`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

#### Parameters

| Name       | Type                               |
| :--------- | :--------------------------------- |
| `options?` | `AboutSubredditOptions`\<`"all"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

---

### <a id="getmodqueue" name="getmodqueue"></a> getModQueue

▸ **getModQueue**(`options`): [`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

Return a listing of things requiring moderator review, such as reported things and items.

#### Parameters

| Name      | Type                                   |
| :-------- | :------------------------------------- |
| `options` | `AboutSubredditOptions`\<`"comment"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

**`Example`**

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getModQueue();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getModQueue({ type: 'post' });
console.log('Posts: ', await listing.all());
```

▸ **getModQueue**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

#### Parameters

| Name      | Type                                |
| :-------- | :---------------------------------- |
| `options` | `AboutSubredditOptions`\<`"post"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

▸ **getModQueue**(`options?`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

#### Parameters

| Name       | Type                               |
| :--------- | :--------------------------------- |
| `options?` | `AboutSubredditOptions`\<`"all"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

---

### <a id="getmoderationlog" name="getmoderationlog"></a> getModerationLog

▸ **getModerationLog**(`options`): [`Listing`](models.Listing.md)\<[`ModAction`](../interfaces/models.ModAction.md)\>

#### Parameters

| Name      | Type                      |
| :-------- | :------------------------ |
| `options` | `GetModerationLogOptions` |

#### Returns

[`Listing`](models.Listing.md)\<[`ModAction`](../interfaces/models.ModAction.md)\>

---

### <a id="getmoderators" name="getmoderators"></a> getModerators

▸ **getModerators**(`options?`): [`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

#### Parameters

| Name      | Type              |
| :-------- | :---------------- |
| `options` | `GetUsersOptions` |

#### Returns

[`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

---

### <a id="getmutedusers" name="getmutedusers"></a> getMutedUsers

▸ **getMutedUsers**(`options?`): [`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

#### Parameters

| Name      | Type              |
| :-------- | :---------------- |
| `options` | `GetUsersOptions` |

#### Returns

[`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

---

### <a id="getpostflairtemplates" name="getpostflairtemplates"></a> getPostFlairTemplates

▸ **getPostFlairTemplates**(): `Promise`\<[`FlairTemplate`](models.FlairTemplate.md)[]\>

#### Returns

`Promise`\<[`FlairTemplate`](models.FlairTemplate.md)[]\>

---

### <a id="getreports" name="getreports"></a> getReports

▸ **getReports**(`options`): [`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

Return a listing of things that have been reported.

#### Parameters

| Name      | Type                                   |
| :-------- | :------------------------------------- |
| `options` | `AboutSubredditOptions`\<`"comment"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

**`Example`**

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getReports();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getReports({ type: 'post' });
console.log('Posts: ', await listing.all());
```

▸ **getReports**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

#### Parameters

| Name      | Type                                |
| :-------- | :---------------------------------- |
| `options` | `AboutSubredditOptions`\<`"post"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

▸ **getReports**(`options?`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

#### Parameters

| Name       | Type                               |
| :--------- | :--------------------------------- |
| `options?` | `AboutSubredditOptions`\<`"all"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

---

### <a id="getspam" name="getspam"></a> getSpam

▸ **getSpam**(`options`): [`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

Return a listing of things that have been marked as spam or otherwise removed.

#### Parameters

| Name      | Type                                   |
| :-------- | :------------------------------------- |
| `options` | `AboutSubredditOptions`\<`"comment"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

**`Example`**

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getSpam();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getSpam({ type: 'post' });
console.log('Posts: ', await listing.all());
```

▸ **getSpam**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

#### Parameters

| Name      | Type                                |
| :-------- | :---------------------------------- |
| `options` | `AboutSubredditOptions`\<`"post"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

▸ **getSpam**(`options?`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

#### Parameters

| Name       | Type                               |
| :--------- | :--------------------------------- |
| `options?` | `AboutSubredditOptions`\<`"all"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

---

### <a id="gettopposts" name="gettopposts"></a> getTopPosts

▸ **getTopPosts**(`options?`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

#### Parameters

| Name      | Type                                                                                                             |
| :-------- | :--------------------------------------------------------------------------------------------------------------- |
| `options` | `Omit`\<[`GetPostsOptionsWithTimeframe`](../modules/models.md#getpostsoptionswithtimeframe), `"subredditName"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

---

### <a id="getunmoderated" name="getunmoderated"></a> getUnmoderated

▸ **getUnmoderated**(`options`): [`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

Return a listing of things that have yet to be approved/removed by a mod.

#### Parameters

| Name      | Type                                   |
| :-------- | :------------------------------------- |
| `options` | `AboutSubredditOptions`\<`"comment"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

**`Example`**

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getUnmoderated();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getUnmoderated({ type: 'post' });
console.log('Posts: ', await listing.all());
```

▸ **getUnmoderated**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

#### Parameters

| Name      | Type                                |
| :-------- | :---------------------------------- |
| `options` | `AboutSubredditOptions`\<`"post"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

▸ **getUnmoderated**(`options?`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

#### Parameters

| Name       | Type                               |
| :--------- | :--------------------------------- |
| `options?` | `AboutSubredditOptions`\<`"all"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

---

### <a id="getuserflair" name="getuserflair"></a> getUserFlair

▸ **getUserFlair**(`options?`): `Promise`\<[`GetUserFlairBySubredditResponse`](../modules/models.md#getuserflairbysubredditresponse)\>

Get the user flair for the given subreddit. If `usernames` is provided then it will return only the
flair for the specified users. If retrieving the list of flair for a given subreddit and the list is long
then this method will return a `next` field which can be passed into the `after` field on the next call to
retrieve the next slice of data. To retrieve the previous slice of data pass the `prev` field into the `before` field
during the subsequent call.

#### Parameters

| Name       | Type                                                              | Description   |
| :--------- | :---------------------------------------------------------------- | :------------ |
| `options?` | [`GetUserFlairOptions`](../modules/models.md#getuserflairoptions) | See interface |

#### Returns

`Promise`\<[`GetUserFlairBySubredditResponse`](../modules/models.md#getuserflairbysubredditresponse)\>

**`Example`**

```ts
const subredditName = 'mysubreddit';
const subreddit = await reddit.getSubredditByName(subredditName);
const response = await subreddit.getUserFlair();
const userFlairList = response.users;
```

**`Example`**

```ts
const response = await subreddit.getUserFlair({ after: 't2_awefae' });
const userFlairList = response.users;
```

**`Example`**

```ts
const response = await subreddit.getUserFlair({ usernames: ['toxictoad', 'badapple'] });
const userFlairList = response.users;
```

---

### <a id="getuserflairtemplates" name="getuserflairtemplates"></a> getUserFlairTemplates

▸ **getUserFlairTemplates**(): `Promise`\<[`FlairTemplate`](models.FlairTemplate.md)[]\>

#### Returns

`Promise`\<[`FlairTemplate`](models.FlairTemplate.md)[]\>

---

### <a id="getwikicontributors" name="getwikicontributors"></a> getWikiContributors

▸ **getWikiContributors**(`options?`): [`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

#### Parameters

| Name      | Type              |
| :-------- | :---------------- |
| `options` | `GetUsersOptions` |

#### Returns

[`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

---

### <a id="invitemoderator" name="invitemoderator"></a> inviteModerator

▸ **inviteModerator**(`username`, `permissions?`): `Promise`\<`void`\>

#### Parameters

| Name           | Type                                                                |
| :------------- | :------------------------------------------------------------------ |
| `username`     | `string`                                                            |
| `permissions?` | [`ModeratorPermission`](../modules/models.md#moderatorpermission)[] |

#### Returns

`Promise`\<`void`\>

---

### <a id="muteuser" name="muteuser"></a> muteUser

▸ **muteUser**(`username`, `note?`): `Promise`\<`void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |
| `note?`    | `string` |

#### Returns

`Promise`\<`void`\>

---

### <a id="removemoderator" name="removemoderator"></a> removeModerator

▸ **removeModerator**(`username`): `Promise`\<`void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\<`void`\>

---

### <a id="removeuser" name="removeuser"></a> removeUser

▸ **removeUser**(`username`): `Promise`\<`void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\<`void`\>

---

### <a id="removewikicontributor" name="removewikicontributor"></a> removeWikiContributor

▸ **removeWikiContributor**(`username`): `Promise`\<`void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\<`void`\>

---

### <a id="revokemoderatorinvite" name="revokemoderatorinvite"></a> revokeModeratorInvite

▸ **revokeModeratorInvite**(`username`): `Promise`\<`void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\<`void`\>

---

### <a id="setmoderatorpermissions" name="setmoderatorpermissions"></a> setModeratorPermissions

▸ **setModeratorPermissions**(`username`, `permissions`): `Promise`\<`void`\>

#### Parameters

| Name          | Type                                                                |
| :------------ | :------------------------------------------------------------------ |
| `username`    | `string`                                                            |
| `permissions` | [`ModeratorPermission`](../modules/models.md#moderatorpermission)[] |

#### Returns

`Promise`\<`void`\>

---

### <a id="submitpost" name="submitpost"></a> submitPost

▸ **submitPost**(`options`): `Promise`\<[`Post`](models.Post.md)\>

#### Parameters

| Name      | Type                                                                                                                                   |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| `options` | [`SubmitLinkOptions`](../modules/models.md#submitlinkoptions) \| [`SubmitSelfPostOptions`](../modules/models.md#submitselfpostoptions) |

#### Returns

`Promise`\<[`Post`](models.Post.md)\>

---

### <a id="tojson" name="tojson"></a> toJSON

▸ **toJSON**(): `Pick`\<[`Subreddit`](models.Subreddit.md), `"description"` \| `"type"` \| `"id"` \| `"name"` \| `"title"` \| `"settings"` \| `"language"` \| `"nsfw"` \| `"createdAt"` \| `"numberOfSubscribers"` \| `"numberOfActiveUsers"`\>

#### Returns

`Pick`\<[`Subreddit`](models.Subreddit.md), `"description"` \| `"type"` \| `"id"` \| `"name"` \| `"title"` \| `"settings"` \| `"language"` \| `"nsfw"` \| `"createdAt"` \| `"numberOfSubscribers"` \| `"numberOfActiveUsers"`\>

---

### <a id="unbanuser" name="unbanuser"></a> unbanUser

▸ **unbanUser**(`username`): `Promise`\<`void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\<`void`\>

---

### <a id="unbanwikicontributor" name="unbanwikicontributor"></a> unbanWikiContributor

▸ **unbanWikiContributor**(`username`): `Promise`\<`void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\<`void`\>

---

### <a id="unmuteuser" name="unmuteuser"></a> unmuteUser

▸ **unmuteUser**(`username`): `Promise`\<`void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\<`void`\>
