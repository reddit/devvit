# Class: Subreddit

A class representing a subreddit.

## Table of contents

### Accessors

- [createdAt](Subreddit.md#createdat)
- [description](Subreddit.md#description)
- [id](Subreddit.md#id)
- [language](Subreddit.md#language)
- [name](Subreddit.md#name)
- [nsfw](Subreddit.md#nsfw)
- [numberOfActiveUsers](Subreddit.md#numberofactiveusers)
- [numberOfSubscribers](Subreddit.md#numberofsubscribers)
- [postFlairsEnabled](Subreddit.md#postflairsenabled)
- [settings](Subreddit.md#settings)
- [title](Subreddit.md#title)
- [type](Subreddit.md#type)
- [userFlairsEnabled](Subreddit.md#userflairsenabled)
- [usersCanAssignPostFlairs](Subreddit.md#userscanassignpostflairs)
- [usersCanAssignUserFlairs](Subreddit.md#userscanassignuserflairs)

### Methods

- [addWikiContributor](Subreddit.md#addwikicontributor)
- [approveUser](Subreddit.md#approveuser)
- [banUser](Subreddit.md#banuser)
- [banWikiContributor](Subreddit.md#banwikicontributor)
- [createPostFlairTemplate](Subreddit.md#createpostflairtemplate)
- [createUserFlairTemplate](Subreddit.md#createuserflairtemplate)
- [getApprovedUsers](Subreddit.md#getapprovedusers)
- [getBannedUsers](Subreddit.md#getbannedusers)
- [getBannedWikiContributors](Subreddit.md#getbannedwikicontributors)
- [getControversialPosts](Subreddit.md#getcontroversialposts)
- [getModerationLog](Subreddit.md#getmoderationlog)
- [getModerators](Subreddit.md#getmoderators)
- [getMutedUsers](Subreddit.md#getmutedusers)
- [getPostFlairTemplates](Subreddit.md#getpostflairtemplates)
- [getTopPosts](Subreddit.md#gettopposts)
- [getUserFlairTemplates](Subreddit.md#getuserflairtemplates)
- [getWikiContributors](Subreddit.md#getwikicontributors)
- [inviteModerator](Subreddit.md#invitemoderator)
- [muteUser](Subreddit.md#muteuser)
- [removeModerator](Subreddit.md#removemoderator)
- [removeUser](Subreddit.md#removeuser)
- [removeWikiContributor](Subreddit.md#removewikicontributor)
- [revokeModeratorInvite](Subreddit.md#revokemoderatorinvite)
- [setModeratorPermissions](Subreddit.md#setmoderatorpermissions)
- [submitPost](Subreddit.md#submitpost)
- [toJSON](Subreddit.md#tojson)
- [unbanUser](Subreddit.md#unbanuser)
- [unbanWikiContributor](Subreddit.md#unbanwikicontributor)
- [unmuteUser](Subreddit.md#unmuteuser)
- [getById](Subreddit.md#getbyid)
- [getByName](Subreddit.md#getbyname)
- [getFromMetadata](Subreddit.md#getfrommetadata)

## Accessors

### createdAt

• `get` **createdAt**(): `Date`

The creation date of the subreddit.

#### Returns

`Date`

---

### description

• `get` **description**(): `undefined` \| `string`

The description of the subreddit.

#### Returns

`undefined` \| `string`

---

### id

• `get` **id**(): \`t5\_$\{string}\`

The ID (starting with t5\_) of the subreddit to retrieve. e.g. t5_2qjpg

#### Returns

\`t5\_$\{string}\`

---

### language

• `get` **language**(): `string`

The language of the subreddit.

#### Returns

`string`

---

### name

• `get` **name**(): `string`

The name of a subreddit omitting the r/.

#### Returns

`string`

---

### nsfw

• `get` **nsfw**(): `boolean`

Whether the subreddit is marked as NSFW (Not Safe For Work).

#### Returns

`boolean`

---

### numberOfActiveUsers

• `get` **numberOfActiveUsers**(): `number`

The number of active users of the subreddit.

#### Returns

`number`

---

### numberOfSubscribers

• `get` **numberOfSubscribers**(): `number`

The number of subscribers of the subreddit.

#### Returns

`number`

---

### postFlairsEnabled

• `get` **postFlairsEnabled**(): `boolean`

Whether the post flairs are enabled for this subreddit.

#### Returns

`boolean`

---

### settings

• `get` **settings**(): [`SubredditSettings`](../interfaces/SubredditSettings.md)

The settings of the subreddit.

#### Returns

[`SubredditSettings`](../interfaces/SubredditSettings.md)

---

### title

• `get` **title**(): `undefined` \| `string`

The title of the subreddit.

#### Returns

`undefined` \| `string`

---

### type

• `get` **type**(): [`SubredditType`](../README.md#subreddittype)

The type of subreddit (public, private, etc.).

#### Returns

[`SubredditType`](../README.md#subreddittype)

---

### userFlairsEnabled

• `get` **userFlairsEnabled**(): `boolean`

Whether the user flairs are enabled for this subreddit.

#### Returns

`boolean`

---

### usersCanAssignPostFlairs

• `get` **usersCanAssignPostFlairs**(): `boolean`

Whether the user can assign post flairs.
This is only true if the post flairs are enabled.

#### Returns

`boolean`

---

### usersCanAssignUserFlairs

• `get` **usersCanAssignUserFlairs**(): `boolean`

Whether the user can assign user flairs.
This is only true if the user flairs are enabled.

#### Returns

`boolean`

## Methods

### addWikiContributor

▸ **addWikiContributor**(`username`): `Promise`\< `void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\< `void`\>

---

### approveUser

▸ **approveUser**(`username`): `Promise`\< `void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\< `void`\>

---

### banUser

▸ **banUser**(`options`): `Promise`\< `void`\>

#### Parameters

| Name      | Type                                                                              |
| :-------- | :-------------------------------------------------------------------------------- |
| `options` | `Omit`\< [`BanUserOptions`](../interfaces/BanUserOptions.md), `"subredditName"`\> |

#### Returns

`Promise`\< `void`\>

---

### banWikiContributor

▸ **banWikiContributor**(`options`): `Promise`\< `void`\>

#### Parameters

| Name      | Type                                                                                                    |
| :-------- | :------------------------------------------------------------------------------------------------------ |
| `options` | `Omit`\< [`BanWikiContributorOptions`](../interfaces/BanWikiContributorOptions.md), `"subredditName"`\> |

#### Returns

`Promise`\< `void`\>

---

### createPostFlairTemplate

▸ **createPostFlairTemplate**(`options`): `Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

#### Parameters

| Name      | Type                                                                                                      |
| :-------- | :-------------------------------------------------------------------------------------------------------- |
| `options` | `Omit`\< [`CreateFlairTemplateOptions`](../interfaces/CreateFlairTemplateOptions.md), `"subredditName"`\> |

#### Returns

`Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

---

### createUserFlairTemplate

▸ **createUserFlairTemplate**(`options`): `Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

#### Parameters

| Name      | Type                                                                                                      |
| :-------- | :-------------------------------------------------------------------------------------------------------- |
| `options` | `Omit`\< [`CreateFlairTemplateOptions`](../interfaces/CreateFlairTemplateOptions.md), `"subredditName"`\> |

#### Returns

`Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

---

### getApprovedUsers

▸ **getApprovedUsers**(`options?`): [`Listing`](Listing.md)\< [`User`](User.md)\>

#### Parameters

| Name      | Type              |
| :-------- | :---------------- |
| `options` | `GetUsersOptions` |

#### Returns

[`Listing`](Listing.md)\< [`User`](User.md)\>

---

### getBannedUsers

▸ **getBannedUsers**(`options?`): [`Listing`](Listing.md)\< [`User`](User.md)\>

#### Parameters

| Name      | Type              |
| :-------- | :---------------- |
| `options` | `GetUsersOptions` |

#### Returns

[`Listing`](Listing.md)\< [`User`](User.md)\>

---

### getBannedWikiContributors

▸ **getBannedWikiContributors**(`options?`): [`Listing`](Listing.md)\< [`User`](User.md)\>

#### Parameters

| Name      | Type              |
| :-------- | :---------------- |
| `options` | `GetUsersOptions` |

#### Returns

[`Listing`](Listing.md)\< [`User`](User.md)\>

---

### getControversialPosts

▸ **getControversialPosts**(`options?`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

#### Parameters

| Name      | Type                                                                                                          |
| :-------- | :------------------------------------------------------------------------------------------------------------ |
| `options` | `Omit`\< [`GetPostsOptionsWithTimeframe`](../interfaces/GetPostsOptionsWithTimeframe.md), `"subredditName"`\> |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

---

### getModerationLog

▸ **getModerationLog**(`options`): [`Listing`](Listing.md)\< [`ModAction`](../interfaces/ModAction.md)\>

#### Parameters

| Name      | Type                      |
| :-------- | :------------------------ |
| `options` | `GetModerationLogOptions` |

#### Returns

[`Listing`](Listing.md)\< [`ModAction`](../interfaces/ModAction.md)\>

---

### getModerators

▸ **getModerators**(`options?`): [`Listing`](Listing.md)\< [`User`](User.md)\>

#### Parameters

| Name      | Type              |
| :-------- | :---------------- |
| `options` | `GetUsersOptions` |

#### Returns

[`Listing`](Listing.md)\< [`User`](User.md)\>

---

### getMutedUsers

▸ **getMutedUsers**(`options?`): [`Listing`](Listing.md)\< [`User`](User.md)\>

#### Parameters

| Name      | Type              |
| :-------- | :---------------- |
| `options` | `GetUsersOptions` |

#### Returns

[`Listing`](Listing.md)\< [`User`](User.md)\>

---

### getPostFlairTemplates

▸ **getPostFlairTemplates**(): `Promise`\< [`FlairTemplate`](FlairTemplate.md)[]\>

#### Returns

`Promise`\< [`FlairTemplate`](FlairTemplate.md)[]\>

---

### getTopPosts

▸ **getTopPosts**(`options?`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

#### Parameters

| Name      | Type                                                                                                          |
| :-------- | :------------------------------------------------------------------------------------------------------------ |
| `options` | `Omit`\< [`GetPostsOptionsWithTimeframe`](../interfaces/GetPostsOptionsWithTimeframe.md), `"subredditName"`\> |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

---

### getUserFlairTemplates

▸ **getUserFlairTemplates**(): `Promise`\< [`FlairTemplate`](FlairTemplate.md)[]\>

#### Returns

`Promise`\< [`FlairTemplate`](FlairTemplate.md)[]\>

---

### getWikiContributors

▸ **getWikiContributors**(`options?`): [`Listing`](Listing.md)\< [`User`](User.md)\>

#### Parameters

| Name      | Type              |
| :-------- | :---------------- |
| `options` | `GetUsersOptions` |

#### Returns

[`Listing`](Listing.md)\< [`User`](User.md)\>

---

### inviteModerator

▸ **inviteModerator**(`username`, `permissions?`): `Promise`\< `void`\>

#### Parameters

| Name           | Type                                                        |
| :------------- | :---------------------------------------------------------- |
| `username`     | `string`                                                    |
| `permissions?` | [`ModeratorPermission`](../README.md#moderatorpermission)[] |

#### Returns

`Promise`\< `void`\>

---

### muteUser

▸ **muteUser**(`username`, `note?`): `Promise`\< `void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |
| `note?`    | `string` |

#### Returns

`Promise`\< `void`\>

---

### removeModerator

▸ **removeModerator**(`username`): `Promise`\< `void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\< `void`\>

---

### removeUser

▸ **removeUser**(`username`): `Promise`\< `void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\< `void`\>

---

### removeWikiContributor

▸ **removeWikiContributor**(`username`): `Promise`\< `void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\< `void`\>

---

### revokeModeratorInvite

▸ **revokeModeratorInvite**(`username`): `Promise`\< `void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\< `void`\>

---

### setModeratorPermissions

▸ **setModeratorPermissions**(`username`, `permissions`): `Promise`\< `void`\>

#### Parameters

| Name          | Type                                                        |
| :------------ | :---------------------------------------------------------- |
| `username`    | `string`                                                    |
| `permissions` | [`ModeratorPermission`](../README.md#moderatorpermission)[] |

#### Returns

`Promise`\< `void`\>

---

### submitPost

▸ **submitPost**(`options`, `metadata?`): `Promise`\< [`Post`](Post.md)\>

#### Parameters

| Name        | Type                                                                                                                       |
| :---------- | :------------------------------------------------------------------------------------------------------------------------- |
| `options`   | [`SubmitLinkOptions`](../interfaces/SubmitLinkOptions.md) \| [`SubmitSelfPostOptions`](../README.md#submitselfpostoptions) |
| `metadata?` | `Metadata`                                                                                                                 |

#### Returns

`Promise`\< [`Post`](Post.md)\>

---

### toJSON

▸ **toJSON**(): `Object`

#### Returns

`Object`

| Name                  | Type                                                      |
| :-------------------- | :-------------------------------------------------------- |
| `createdAt`           | `Date`                                                    |
| `description`         | `undefined` \| `string`                                   |
| `id`                  | \`t5\_$\{string}\`                                        |
| `language`            | `string`                                                  |
| `name`                | `string`                                                  |
| `nsfw`                | `boolean`                                                 |
| `numberOfActiveUsers` | `number`                                                  |
| `numberOfSubscribers` | `number`                                                  |
| `settings`            | [`SubredditSettings`](../interfaces/SubredditSettings.md) |
| `title`               | `undefined` \| `string`                                   |
| `type`                | [`SubredditType`](../README.md#subreddittype)             |

---

### unbanUser

▸ **unbanUser**(`username`): `Promise`\< `void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\< `void`\>

---

### unbanWikiContributor

▸ **unbanWikiContributor**(`username`): `Promise`\< `void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\< `void`\>

---

### unmuteUser

▸ **unmuteUser**(`username`): `Promise`\< `void`\>

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `username` | `string` |

#### Returns

`Promise`\< `void`\>

---

### getById

▸ `Static` **getById**(`id`, `metadata?`): `Promise`\< [`Subreddit`](Subreddit.md)\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t5\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< [`Subreddit`](Subreddit.md)\>

---

### getByName

▸ `Static` **getByName**(`subredditName`, `metadata?`): `Promise`\< [`Subreddit`](Subreddit.md)\>

#### Parameters

| Name            | Type       |
| :-------------- | :--------- |
| `subredditName` | `string`   |
| `metadata?`     | `Metadata` |

#### Returns

`Promise`\< [`Subreddit`](Subreddit.md)\>

---

### getFromMetadata

▸ `Static` **getFromMetadata**(`metadata?`): `Promise`\< [`Subreddit`](Subreddit.md)\>

#### Parameters

| Name        | Type       |
| :---------- | :--------- |
| `metadata?` | `Metadata` |

#### Returns

`Promise`\< [`Subreddit`](Subreddit.md)\>
