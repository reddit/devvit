# Class: RedditAPIClient

The Reddit API Client

Make sure you initialize this with `new RedditAPIClient()` at the top of your `main.ts` file before using it.

**`Example`**

```ts
const reddit = new RedditAPIClient();

const memes = await reddit.getSubredditByName('memes', metadata);
const posts = await memes.getHotPosts(metadata).all();
const hottestPost = posts[0];
const comments = await hottestPost.comments().all();
```

## Table of contents

### Methods

- [addEditorToWikiPage](RedditAPIClient.md#addeditortowikipage)
- [addModNote](RedditAPIClient.md#addmodnote)
- [addWidget](RedditAPIClient.md#addwidget)
- [addWikiContributor](RedditAPIClient.md#addwikicontributor)
- [approve](RedditAPIClient.md#approve)
- [approveUser](RedditAPIClient.md#approveuser)
- [banUser](RedditAPIClient.md#banuser)
- [banWikiContributor](RedditAPIClient.md#banwikicontributor)
- [createPostFlairTemplate](RedditAPIClient.md#createpostflairtemplate)
- [createUserFlairTemplate](RedditAPIClient.md#createuserflairtemplate)
- [createWikiPage](RedditAPIClient.md#createwikipage)
- [crosspost](RedditAPIClient.md#crosspost)
- [deleteFlairTemplate](RedditAPIClient.md#deleteflairtemplate)
- [deleteModNote](RedditAPIClient.md#deletemodnote)
- [deleteWidget](RedditAPIClient.md#deletewidget)
- [editFlairTemplate](RedditAPIClient.md#editflairtemplate)
- [getAppUser](RedditAPIClient.md#getappuser)
- [getApprovedUsers](RedditAPIClient.md#getapprovedusers)
- [getBannedUsers](RedditAPIClient.md#getbannedusers)
- [getBannedWikiContributors](RedditAPIClient.md#getbannedwikicontributors)
- [getCommentById](RedditAPIClient.md#getcommentbyid)
- [getComments](RedditAPIClient.md#getcomments)
- [getCommentsByUser](RedditAPIClient.md#getcommentsbyuser)
- [getControversialPosts](RedditAPIClient.md#getcontroversialposts)
- [getCurrentSubreddit](RedditAPIClient.md#getcurrentsubreddit)
- [getCurrentUser](RedditAPIClient.md#getcurrentuser)
- [getHotPosts](RedditAPIClient.md#gethotposts)
- [getModNotes](RedditAPIClient.md#getmodnotes)
- [getModerationLog](RedditAPIClient.md#getmoderationlog)
- [getModerators](RedditAPIClient.md#getmoderators)
- [getMutedUsers](RedditAPIClient.md#getmutedusers)
- [getNewPosts](RedditAPIClient.md#getnewposts)
- [getPostById](RedditAPIClient.md#getpostbyid)
- [getPostFlairTemplates](RedditAPIClient.md#getpostflairtemplates)
- [getPostsByUser](RedditAPIClient.md#getpostsbyuser)
- [getRisingPosts](RedditAPIClient.md#getrisingposts)
- [getSubredditById](RedditAPIClient.md#getsubredditbyid)
- [getSubredditByName](RedditAPIClient.md#getsubredditbyname)
- [getTopPosts](RedditAPIClient.md#gettopposts)
- [getUserById](RedditAPIClient.md#getuserbyid)
- [getUserByUsername](RedditAPIClient.md#getuserbyusername)
- [getUserFlairTemplates](RedditAPIClient.md#getuserflairtemplates)
- [getWidgets](RedditAPIClient.md#getwidgets)
- [getWikiContributors](RedditAPIClient.md#getwikicontributors)
- [getWikiPage](RedditAPIClient.md#getwikipage)
- [getWikiPageRevisions](RedditAPIClient.md#getwikipagerevisions)
- [getWikiPageSettings](RedditAPIClient.md#getwikipagesettings)
- [getWikiPages](RedditAPIClient.md#getwikipages)
- [inviteModerator](RedditAPIClient.md#invitemoderator)
- [muteUser](RedditAPIClient.md#muteuser)
- [remove](RedditAPIClient.md#remove)
- [removeEditorFromWikiPage](RedditAPIClient.md#removeeditorfromwikipage)
- [removeModerator](RedditAPIClient.md#removemoderator)
- [removePostFlair](RedditAPIClient.md#removepostflair)
- [removeUser](RedditAPIClient.md#removeuser)
- [removeUserFlair](RedditAPIClient.md#removeuserflair)
- [removeWikiContributor](RedditAPIClient.md#removewikicontributor)
- [reorderWidgets](RedditAPIClient.md#reorderwidgets)
- [revertWikiPage](RedditAPIClient.md#revertwikipage)
- [revokeModeratorInvite](RedditAPIClient.md#revokemoderatorinvite)
- [sendPrivateMessage](RedditAPIClient.md#sendprivatemessage)
- [sendPrivateMessageAsSubreddit](RedditAPIClient.md#sendprivatemessageassubreddit)
- [setModeratorPermissions](RedditAPIClient.md#setmoderatorpermissions)
- [setPostFlair](RedditAPIClient.md#setpostflair)
- [setUserFlair](RedditAPIClient.md#setuserflair)
- [submitComment](RedditAPIClient.md#submitcomment)
- [submitPost](RedditAPIClient.md#submitpost)
- [unbanUser](RedditAPIClient.md#unbanuser)
- [unbanWikiContributor](RedditAPIClient.md#unbanwikicontributor)
- [unmuteUser](RedditAPIClient.md#unmuteuser)
- [updateWikiPage](RedditAPIClient.md#updatewikipage)
- [updateWikiPageSettings](RedditAPIClient.md#updatewikipagesettings)

## Methods

### addEditorToWikiPage

▸ **addEditorToWikiPage**(`subredditName`, `page`, `username`, `metadata`): `Promise`\< `void`\>

Add an editor to a wiki page.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `subredditName` | `string`                  | The name of the subreddit the wiki is in.                                |
| `page`          | `string`                  | The name of the wiki page to add the editor to.                          |
| `username`      | `string`                  | The username of the user to add as an editor.                            |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### addModNote

▸ **addModNote**(`options`, `metadata`): `Promise`\< [`ModNote`](ModNote.md)\>

Add a mod note.

#### Parameters

| Name       | Type                                                                                                                                                                                                        | Description                                                              |
| :--------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | `Omit`\< `Prettify`\< `PostNotesRequest` & \{ `label`: [`UserNoteLabel`](../README.md#usernotelabel) ; `redditId`: \`t1\_$\{string}\` \| \`t3\_$\{string}\` }\>, `"redditId"`\> & \{ `redditId`: `string` } | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                                                                                                                                                                   | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`ModNote`](ModNote.md)\>

A Promise that resolves if the mod note was successfully added.

---

### addWidget

▸ **addWidget**(`widgetData`, `metadata`): `Promise`\< [`ImageWidget`](ImageWidget.md) \| [`CalendarWidget`](CalendarWidget.md) \| [`TextAreaWidget`](TextAreaWidget.md) \| [`ButtonWidget`](ButtonWidget.md) \| [`CommunityListWidget`](CommunityListWidget.md) \| [`PostFlairWidget`](PostFlairWidget.md) \| [`CustomWidget`](CustomWidget.md)\>

Add a widget to a subreddit.

#### Parameters

| Name         | Type                                          | Description                                                              |
| :----------- | :-------------------------------------------- | :----------------------------------------------------------------------- |
| `widgetData` | [`AddWidgetData`](../README.md#addwidgetdata) | The data for the widget to add.                                          |
| `metadata`   | `undefined` \| `Metadata`                     | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`ImageWidget`](ImageWidget.md) \| [`CalendarWidget`](CalendarWidget.md) \| [`TextAreaWidget`](TextAreaWidget.md) \| [`ButtonWidget`](ButtonWidget.md) \| [`CommunityListWidget`](CommunityListWidget.md) \| [`PostFlairWidget`](PostFlairWidget.md) \| [`CustomWidget`](CustomWidget.md)\>

- The added Widget object.

---

### addWikiContributor

▸ **addWikiContributor**(`username`, `subredditName`, `metadata`): `Promise`\< `void`\>

Add a user as a wiki contributor for a subreddit.

#### Parameters

| Name            | Type                      | Description                                                                   |
| :-------------- | :------------------------ | :---------------------------------------------------------------------------- |
| `username`      | `string`                  | The username of the user to add as a wiki contributor. e.g. 'spez'            |
| `subredditName` | `string`                  | The name of the subreddit to add the user as a wiki contributor. e.g. 'memes' |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this.      |

#### Returns

`Promise`\< `void`\>

---

### approve

▸ **approve**(`id`, `metadata`): `Promise`\< `void`\>

Approve a post or comment.

**`Example`**

```ts
await reddit.approve('t3_123456', metadata);
await reddit.approve('t1_123456', metadata);
```

#### Parameters

| Name       | Type                      | Description                                                              |
| :--------- | :------------------------ | :----------------------------------------------------------------------- |
| `id`       | `string`                  | The id of the post (t3*) or comment (t1*) to approve.                    |
| `metadata` | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### approveUser

▸ **approveUser**(`username`, `subredditName`, `metadata`): `Promise`\< `void`\>

Approve a user to post in a subreddit.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `username`      | `string`                  | The username of the user to approve. e.g. 'spez'                         |
| `subredditName` | `string`                  | The name of the subreddit to approve the user in. e.g. 'memes'           |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### banUser

▸ **banUser**(`options`, `metadata`): `Promise`\< `void`\>

Ban a user from a subreddit.

#### Parameters

| Name       | Type                                                | Description                                                              |
| :--------- | :-------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | [`BanUserOptions`](../interfaces/BanUserOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                           | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### banWikiContributor

▸ **banWikiContributor**(`options`, `metadata`): `Promise`\< `void`\>

Ban a user from contributing to the wiki on a subreddit.

#### Parameters

| Name       | Type                                                                      | Description                                                              |
| :--------- | :------------------------------------------------------------------------ | :----------------------------------------------------------------------- |
| `options`  | [`BanWikiContributorOptions`](../interfaces/BanWikiContributorOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                                 | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### createPostFlairTemplate

▸ **createPostFlairTemplate**(`options`, `metadata`): `Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

Create a post flair template for a subreddit.

#### Parameters

| Name       | Type                                                                        | Description                                                              |
| :--------- | :-------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | [`CreateFlairTemplateOptions`](../interfaces/CreateFlairTemplateOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                                   | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

The created FlairTemplate object.

---

### createUserFlairTemplate

▸ **createUserFlairTemplate**(`options`, `metadata`): `Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

Create a user flair template for a subreddit.

#### Parameters

| Name       | Type                                                                        | Description                                                              |
| :--------- | :-------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | [`CreateFlairTemplateOptions`](../interfaces/CreateFlairTemplateOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                                   | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

The created FlairTemplate object.

---

### createWikiPage

▸ **createWikiPage**(`options`, `metadata`): `Promise`\< [`WikiPage`](WikiPage.md)\>

Create a new wiki page for a subreddit.

#### Parameters

| Name       | Type                                                              | Description                                                              |
| :--------- | :---------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | [`CreateWikiPageOptions`](../interfaces/CreateWikiPageOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                         | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`WikiPage`](WikiPage.md)\>

- The created WikiPage object.

---

### crosspost

▸ **crosspost**(`options`, `metadata`): `Promise`\< [`Post`](Post.md)\>

Crossposts a post to a subreddit.

#### Parameters

| Name       | Type                                                    | Description                                                              |
| :--------- | :------------------------------------------------------ | :----------------------------------------------------------------------- |
| `options`  | [`CrosspostOptions`](../interfaces/CrosspostOptions.md) | Options for crossposting a post                                          |
| `metadata` | `undefined` \| `Metadata`                               | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`Post`](Post.md)\>

- A Promise that resolves to a Post object.

---

### deleteFlairTemplate

▸ **deleteFlairTemplate**(`subredditName`, `flairTemplateId`, `metadata`): `Promise`\< `void`\>

Delete a flair template from a subreddit.

#### Parameters

| Name              | Type                      | Description                                                              |
| :---------------- | :------------------------ | :----------------------------------------------------------------------- |
| `subredditName`   | `string`                  | The name of the subreddit to delete the flair template from.             |
| `flairTemplateId` | `string`                  | The ID of the flair template to delete.                                  |
| `metadata`        | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### deleteModNote

▸ **deleteModNote**(`options`, `metadata`): `Promise`\< `boolean`\>

Delete a mod note.

#### Parameters

| Name       | Type                      | Description                                                              |
| :--------- | :------------------------ | :----------------------------------------------------------------------- |
| `options`  | `DeleteNotesRequest`      | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `boolean`\>

---

### deleteWidget

▸ **deleteWidget**(`subredditName`, `widgetId`, `metadata`): `Promise`\< `void`\>

Delete a widget from a subreddit.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `subredditName` | `string`                  | The name of the subreddit to delete the widget from.                     |
| `widgetId`      | `string`                  | The ID of the widget to delete.                                          |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### editFlairTemplate

▸ **editFlairTemplate**(`options`, `metadata`): `Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

Edit a flair template for a subreddit. This can be either a post or user flair template.
Note: If you leave any of the options fields as undefined, they will reset to their default values.

#### Parameters

| Name       | Type                                                                    | Description                                                              |
| :--------- | :---------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | [`EditFlairTemplateOptions`](../interfaces/EditFlairTemplateOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                               | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`FlairTemplate`](FlairTemplate.md)\>

The edited FlairTemplate object.

---

### getAppUser

▸ **getAppUser**(`metadata`): `Promise`\< [`User`](User.md)\>

Get the user that the app runs as on the provided metadata.

**`Example`**

```ts
const user = await reddit.getAppUser(metadata);
```

#### Parameters

| Name       | Type                      | Description                                                              |
| :--------- | :------------------------ | :----------------------------------------------------------------------- |
| `metadata` | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`User`](User.md)\>

A Promise that resolves to a User object.

---

### getApprovedUsers

▸ **getApprovedUsers**(`options`, `metadata`): [`Listing`](Listing.md)\< [`User`](User.md)\>

Get a list of users who have been approved to post in a subreddit.

#### Parameters

| Name       | Type                       | Description                                                              |
| :--------- | :------------------------- | :----------------------------------------------------------------------- |
| `options`  | `GetSubredditUsersOptions` | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`  | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`User`](User.md)\>

A Listing of User objects.

---

### getBannedUsers

▸ **getBannedUsers**(`options`, `metadata`): [`Listing`](Listing.md)\< [`User`](User.md)\>

Get a list of users who are banned from a subreddit.

#### Parameters

| Name       | Type                       | Description                                                              |
| :--------- | :------------------------- | :----------------------------------------------------------------------- |
| `options`  | `GetSubredditUsersOptions` | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`  | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`User`](User.md)\>

A Listing of User objects.

---

### getBannedWikiContributors

▸ **getBannedWikiContributors**(`options`, `metadata`): [`Listing`](Listing.md)\< [`User`](User.md)\>

Get a list of users who are banned from contributing to the wiki on a subreddit.

#### Parameters

| Name       | Type                       | Description                                                              |
| :--------- | :------------------------- | :----------------------------------------------------------------------- |
| `options`  | `GetSubredditUsersOptions` | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`  | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`User`](User.md)\>

A Listing of User objects.

---

### getCommentById

▸ **getCommentById**(`id`, `metadata`): `Promise`\< [`Comment`](Comment.md)\>

Get a [Comment](Comment.md) object by ID

**`Example`**

```ts
const comment = await reddit.getCommentById('t1_1qjpg', metadata);
```

#### Parameters

| Name       | Type                      | Description                                                              |
| :--------- | :------------------------ | :----------------------------------------------------------------------- |
| `id`       | `string`                  | The ID (starting with t1\_) of the comment to retrieve. e.g. t1_1qjpg    |
| `metadata` | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`Comment`](Comment.md)\>

A Promise that resolves to a Comment object.

---

### getComments

▸ **getComments**(`options`, `metadata`): [`Listing`](Listing.md)\< [`Comment`](Comment.md)\>

Get a list of comments from a specific post or comment.

**`Example`**

```ts
const comments = await reddit
  .getComments(
    {
      postId: 't3_1qjpg',
      limit: 1000,
      pageSize: 100,
    },
    metadata
  )
  .all();
```

#### Parameters

| Name       | Type                                                        | Description                                                              |
| :--------- | :---------------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | [`GetCommentsOptions`](../interfaces/GetCommentsOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                   | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`Comment`](Comment.md)\>

A Listing of Comment objects.

---

### getCommentsByUser

▸ **getCommentsByUser**(`options`, `metadata`): [`Listing`](Listing.md)\< [`Comment`](Comment.md)\>

Get a list of comments by a specific user.

#### Parameters

| Name       | Type                                                                    | Description                                                              |
| :--------- | :---------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | [`GetCommentsByUserOptions`](../interfaces/GetCommentsByUserOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                               | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`Comment`](Comment.md)\>

A Listing of Comment objects.

---

### getControversialPosts

▸ **getControversialPosts**(`options`, `metadata`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

Get a list of controversial posts from a specific subreddit.

**`Example`**

```ts
const posts = await reddit
  .getControversialPosts(
    {
      subredditName: 'memes',
      timeframe: 'day',
      limit: 1000,
      pageSize: 100,
    },
    metadata
  )
  .all();
```

#### Parameters

| Name       | Type                                                                            | Description                                                              |
| :--------- | :------------------------------------------------------------------------------ | :----------------------------------------------------------------------- |
| `options`  | [`GetPostsOptionsWithTimeframe`](../interfaces/GetPostsOptionsWithTimeframe.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                                       | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

A Listing of Post objects.

---

### getCurrentSubreddit

▸ **getCurrentSubreddit**(`metadata`): `Promise`\< [`Subreddit`](Subreddit.md)\>

Retrieves the current subreddit based on the provided metadata.

**`Example`**

```ts
const currentSubreddit = await reddit.getCurrentSubreddit(metadata);
```

#### Parameters

| Name       | Type                      | Description                                                              |
| :--------- | :------------------------ | :----------------------------------------------------------------------- |
| `metadata` | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`Subreddit`](Subreddit.md)\>

A Promise that resolves a Subreddit object.

---

### getCurrentUser

▸ **getCurrentUser**(`metadata`): `Promise`\< [`User`](User.md)\>

Get the current calling user based on the provided metadata.

**`Example`**

```ts
const user = await reddit.getCurrentUser(metadata);
```

#### Parameters

| Name       | Type                      | Description                                                              |
| :--------- | :------------------------ | :----------------------------------------------------------------------- |
| `metadata` | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`User`](User.md)\>

A Promise that resolves to a User object.

---

### getHotPosts

▸ **getHotPosts**(`options`, `metadata`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

Get a list of hot posts from a specific subreddit.

**`Example`**

```ts
const posts = await reddit
  .getHotPosts(
    {
      subredditName: 'memes',
      limit: 1000,
      pageSize: 100,
    },
    metadata
  )
  .all();
```

#### Parameters

| Name       | Type                                                        | Description                                                              |
| :--------- | :---------------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | [`GetHotPostsOptions`](../interfaces/GetHotPostsOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                   | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

A Listing of Post objects.

---

### getModNotes

▸ **getModNotes**(`options`, `metadata`): [`Listing`](Listing.md)\< [`ModNote`](ModNote.md)\>

Get a list of mod notes related to a user in a subreddit.

#### Parameters

| Name       | Type                                                                                                                                                                                                                                   | Description                                                              |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | `Prettify`\< `Pick`\< `GetNotesRequest`, `"subreddit"` \| `"user"`\> & \{ `filter?`: [`ModNoteType`](../README.md#modnotetype) } & `Pick`\< [`ListingFetchOptions`](../interfaces/ListingFetchOptions.md), `"before"` \| `"limit"`\>\> | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                                                                                                                                                                                              | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`ModNote`](ModNote.md)\>

A listing of ModNote objects.

---

### getModerationLog

▸ **getModerationLog**(`options`, `metadata`): [`Listing`](Listing.md)\< [`ModAction`](../interfaces/ModAction.md)\>

Get the moderation log for a subreddit.

**`Example`**

```ts
const modActions = await reddit
  .getModerationLog(
    {
      subredditName: 'memes',
      limit: 1000,
      pageSize: 100,
    },
    metadata
  )
  .all();
```

#### Parameters

| Name       | Type                                                                  | Description                                  |
| :--------- | :-------------------------------------------------------------------- | :------------------------------------------- |
| `options`  | [`GetModerationLogOptions`](../interfaces/GetModerationLogOptions.md) | Options for the request                      |
| `metadata` | `undefined` \| `Metadata`                                             | Additional metadata to attach to the request |

#### Returns

[`Listing`](Listing.md)\< [`ModAction`](../interfaces/ModAction.md)\>

A Listing of ModAction objects.

---

### getModerators

▸ **getModerators**(`options`, `metadata`): [`Listing`](Listing.md)\< [`User`](User.md)\>

Get a list of users who are moderators for a subreddit.

#### Parameters

| Name       | Type                       | Description                                                              |
| :--------- | :------------------------- | :----------------------------------------------------------------------- |
| `options`  | `GetSubredditUsersOptions` | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`  | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`User`](User.md)\>

A Listing of User objects.

---

### getMutedUsers

▸ **getMutedUsers**(`options`, `metadata`): [`Listing`](Listing.md)\< [`User`](User.md)\>

Get a list of users who are muted in a subreddit.

#### Parameters

| Name       | Type                       | Description                                                              |
| :--------- | :------------------------- | :----------------------------------------------------------------------- |
| `options`  | `GetSubredditUsersOptions` | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`  | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`User`](User.md)\>

A listing of User objects.

---

### getNewPosts

▸ **getNewPosts**(`options`, `metadata`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

Get a list of new posts from a specific subreddit.

**`Example`**

```ts
const posts = await reddit
  .getNewPosts(
    {
      subredditName: 'memes',
      limit: 1000,
      pageSize: 100,
    },
    metadata
  )
  .all();
```

#### Parameters

| Name       | Type                                                  | Description                                                              |
| :--------- | :---------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | [`GetPostsOptions`](../interfaces/GetPostsOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                             | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

A Listing of Post objects.

---

### getPostById

▸ **getPostById**(`id`, `metadata`): `Promise`\< [`Post`](Post.md)\>

Gets a [Post](Post.md) object by ID

#### Parameters

| Name       | Type                      |
| :--------- | :------------------------ |
| `id`       | `string`                  |
| `metadata` | `undefined` \| `Metadata` |

#### Returns

`Promise`\< [`Post`](Post.md)\>

A Promise that resolves to a Post object.

---

### getPostFlairTemplates

▸ **getPostFlairTemplates**(`subredditName`, `metadata`): `Promise`\< [`FlairTemplate`](FlairTemplate.md)[]\>

Get the list of post flair templates for a subreddit.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `subredditName` | `string`                  | The name of the subreddit to get the post flair templates for.           |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`FlairTemplate`](FlairTemplate.md)[]\>

A Promise that resolves with an array of FlairTemplate objects.

---

### getPostsByUser

▸ **getPostsByUser**(`options`, `metadata`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

Get a list of posts from a specific user.

#### Parameters

| Name       | Type                                                              | Description                                                              |
| :--------- | :---------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | [`GetPostsByUserOptions`](../interfaces/GetPostsByUserOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                         | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

A Listing of Post objects.

---

### getRisingPosts

▸ **getRisingPosts**(`options`, `metadata`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

Get a list of hot posts from a specific subreddit.

**`Example`**

```ts
const posts = await reddit
  .getRisingPosts(
    {
      subredditName: 'memes',
      timeframe: 'day',
      limit: 1000,
      pageSize: 100,
    },
    metadata
  )
  .all();
```

#### Parameters

| Name       | Type                                                  | Description                                                              |
| :--------- | :---------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | [`GetPostsOptions`](../interfaces/GetPostsOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                             | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

A Listing of Post objects.

---

### getSubredditById

▸ **getSubredditById**(`id`, `metadata`): `Promise`\< [`Subreddit`](Subreddit.md)\>

Gets a [Subreddit](Subreddit.md) object by ID

**`Example`**

```ts
const memes = await reddit.getSubredditById('t5_2qjpg', metadata);
```

#### Parameters

| Name       | Type                      | Description                                                              |
| :--------- | :------------------------ | :----------------------------------------------------------------------- |
| `id`       | `string`                  | The ID (starting with t5\_) of the subreddit to retrieve. e.g. t5_2qjpg  |
| `metadata` | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`Subreddit`](Subreddit.md)\>

A Promise that resolves a Subreddit object.

---

### getSubredditByName

▸ **getSubredditByName**(`name`, `metadata`): `Promise`\< [`Subreddit`](Subreddit.md)\>

Gets a [Subreddit](Subreddit.md) object by name

**`Example`**

```ts
const askReddit = await reddit.getSubredditByName('askReddit', metadata);
```

#### Parameters

| Name       | Type                      | Description                                                              |
| :--------- | :------------------------ | :----------------------------------------------------------------------- |
| `name`     | `string`                  | The name of a subreddit omitting the r/. This is case insensitive.       |
| `metadata` | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`Subreddit`](Subreddit.md)\>

A Promise that resolves a Subreddit object.

---

### getTopPosts

▸ **getTopPosts**(`options`, `metadata`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

Get a list of controversial posts from a specific subreddit.

**`Example`**

```ts
const posts = await reddit
  .getControversialPosts(
    {
      subredditName: 'memes',
      timeframe: 'day',
      limit: 1000,
      pageSize: 100,
    },
    metadata
  )
  .all();
```

#### Parameters

| Name       | Type                                                                            | Description                                                              |
| :--------- | :------------------------------------------------------------------------------ | :----------------------------------------------------------------------- |
| `options`  | [`GetPostsOptionsWithTimeframe`](../interfaces/GetPostsOptionsWithTimeframe.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                                       | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

A Listing of Post objects.

---

### getUserById

▸ **getUserById**(`id`, `metadata`): `Promise`\< [`User`](User.md)\>

Gets a [User](User.md) object by ID

**`Example`**

```ts
const user = await reddit.getUserById('t2_1qjpg', metadata);
```

#### Parameters

| Name       | Type                      | Description                                                              |
| :--------- | :------------------------ | :----------------------------------------------------------------------- |
| `id`       | `string`                  | The ID (starting with t2\_) of the user to retrieve. e.g. t2_1qjpg       |
| `metadata` | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`User`](User.md)\>

A Promise that resolves to a User object.

---

### getUserByUsername

▸ **getUserByUsername**(`username`, `metadata`): `Promise`\< [`User`](User.md)\>

Gets a [User](User.md) object by username

**`Example`**

```ts
const user = await reddit.getUserByUsername('devvit', metadata);
```

#### Parameters

| Name       | Type                      | Description                                                              |
| :--------- | :------------------------ | :----------------------------------------------------------------------- |
| `username` | `string`                  | The username of the user omitting the u/. e.g. 'devvit'                  |
| `metadata` | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`User`](User.md)\>

A Promise that resolves to a User object.

---

### getUserFlairTemplates

▸ **getUserFlairTemplates**(`subredditName`, `metadata`): `Promise`\< [`FlairTemplate`](FlairTemplate.md)[]\>

Get the list of user flair templates for a subreddit.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `subredditName` | `string`                  | The name of the subreddit to get the user flair templates for.           |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`FlairTemplate`](FlairTemplate.md)[]\>

A Promise that resolves with an array of FlairTemplate objects.

---

### getWidgets

▸ **getWidgets**(`subredditName`, `metadata`): `Promise`\< ([`ImageWidget`](ImageWidget.md) \| [`CalendarWidget`](CalendarWidget.md) \| [`TextAreaWidget`](TextAreaWidget.md) \| [`ButtonWidget`](ButtonWidget.md) \| [`CommunityListWidget`](CommunityListWidget.md) \| [`PostFlairWidget`](PostFlairWidget.md) \| [`CustomWidget`](CustomWidget.md))[]\>

Get the widgets for a subreddit.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `subredditName` | `string`                  | The name of the subreddit to get the widgets for.                        |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< ([`ImageWidget`](ImageWidget.md) \| [`CalendarWidget`](CalendarWidget.md) \| [`TextAreaWidget`](TextAreaWidget.md) \| [`ButtonWidget`](ButtonWidget.md) \| [`CommunityListWidget`](CommunityListWidget.md) \| [`PostFlairWidget`](PostFlairWidget.md) \| [`CustomWidget`](CustomWidget.md))[]\>

- An array of Widget objects.

---

### getWikiContributors

▸ **getWikiContributors**(`options`, `metadata`): [`Listing`](Listing.md)\< [`User`](User.md)\>

Get a list of users who are wiki contributors of a subreddit.

#### Parameters

| Name       | Type                       | Description                                                              |
| :--------- | :------------------------- | :----------------------------------------------------------------------- |
| `options`  | `GetSubredditUsersOptions` | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`  | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`User`](User.md)\>

A Listing of User objects.

---

### getWikiPage

▸ **getWikiPage**(`subredditName`, `page`, `metadata`): `Promise`\< [`WikiPage`](WikiPage.md)\>

Get a wiki page from a subreddit.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `subredditName` | `string`                  | The name of the subreddit to get the wiki page from.                     |
| `page`          | `string`                  | The name of the wiki page to get.                                        |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`WikiPage`](WikiPage.md)\>

The requested WikiPage object.

---

### getWikiPageRevisions

▸ **getWikiPageRevisions**(`options`, `metadata`): [`Listing`](Listing.md)\< [`WikiPageRevision`](WikiPageRevision.md)\>

Get the revisions for a wiki page.

#### Parameters

| Name       | Type                                                                  | Description                                                              |
| :--------- | :-------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | [`GetPageRevisionsOptions`](../interfaces/GetPageRevisionsOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                             | Metadata from the originating handler. Make sure to always include this. |

#### Returns

[`Listing`](Listing.md)\< [`WikiPageRevision`](WikiPageRevision.md)\>

A Listing of WikiPageRevision objects.

---

### getWikiPageSettings

▸ **getWikiPageSettings**(`subredditName`, `page`, `metadata`): `Promise`\< [`WikiPageSettings`](WikiPageSettings.md)\>

Get the settings for a wiki page.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `subredditName` | `string`                  | The name of the subreddit the wiki is in.                                |
| `page`          | `string`                  | The name of the wiki page to get the settings for.                       |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`WikiPageSettings`](WikiPageSettings.md)\>

A WikiPageSettings object.

---

### getWikiPages

▸ **getWikiPages**(`subredditName`, `metadata`): `Promise`\< `string`[]\>

Get the wiki pages for a subreddit.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `subredditName` | `string`                  | The name of the subreddit to get the wiki pages from.                    |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `string`[]\>

A list of the wiki page names for the subreddit.

---

### inviteModerator

▸ **inviteModerator**(`options`, `metadata`): `Promise`\< `void`\>

Invite a user to become a moderator of a subreddit.

#### Parameters

| Name       | Type                                                                | Description                                                              |
| :--------- | :------------------------------------------------------------------ | :----------------------------------------------------------------------- |
| `options`  | [`InviteModeratorOptions`](../interfaces/InviteModeratorOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                           | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### muteUser

▸ **muteUser**(`options`, `metadata`): `Promise`\< `void`\>

Mute a user in a subreddit. Muting a user prevents them from sending modmail.

#### Parameters

| Name       | Type                                                  | Description                                                              |
| :--------- | :---------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | [`MuteUserOptions`](../interfaces/MuteUserOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                             | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### remove

▸ **remove**(`id`, `isSpam`, `metadata`): `Promise`\< `void`\>

Remove a post or comment.

**`Example`**

```ts
await reddit.remove('t3_123456', false, metadata);
await reddit.remove('t1_123456', true, metadata);
```

#### Parameters

| Name       | Type                      | Description                                                              |
| :--------- | :------------------------ | :----------------------------------------------------------------------- |
| `id`       | `string`                  | The id of the post (t3*) or comment (t1*) to remove.                     |
| `isSpam`   | `boolean`                 | Whether or not the post/comment is spam.                                 |
| `metadata` | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### removeEditorFromWikiPage

▸ **removeEditorFromWikiPage**(`subredditName`, `page`, `username`, `metadata`): `Promise`\< `void`\>

Remove an editor from a wiki page.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `subredditName` | `string`                  | The name of the subreddit the wiki is in.                                |
| `page`          | `string`                  | The name of the wiki page to remove the editor from.                     |
| `username`      | `string`                  | The username of the user to remove as an editor.                         |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### removeModerator

▸ **removeModerator**(`username`, `subredditName`, `metadata`): `Promise`\< `void`\>

Remove a user as a moderator of a subreddit.

#### Parameters

| Name            | Type                      | Description                                                                    |
| :-------------- | :------------------------ | :----------------------------------------------------------------------------- |
| `username`      | `string`                  | The username of the user to remove as a moderator. e.g. 'spez'                 |
| `subredditName` | `string`                  | The name of the subreddit to remove the user as a moderator from. e.g. 'memes' |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this.       |

#### Returns

`Promise`\< `void`\>

---

### removePostFlair

▸ **removePostFlair**(`subredditName`, `postId`, `metadata`): `Promise`\< `void`\>

Remove the flair for a post in a subreddit.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `subredditName` | `string`                  | The name of the subreddit to remove the flair from.                      |
| `postId`        | `string`                  | The ID of the post to remove the flair from.                             |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### removeUser

▸ **removeUser**(`username`, `subredditName`, `metadata`): `Promise`\< `void`\>

Remove a user's approval to post in a subreddit.

#### Parameters

| Name            | Type                      | Description                                                                |
| :-------------- | :------------------------ | :------------------------------------------------------------------------- |
| `username`      | `string`                  | The username of the user to remove approval from. e.g. 'spez'              |
| `subredditName` | `string`                  | The name of the subreddit to remove the user's approval from. e.g. 'memes' |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this.   |

#### Returns

`Promise`\< `void`\>

---

### removeUserFlair

▸ **removeUserFlair**(`subredditName`, `username`, `metadata`): `Promise`\< `void`\>

Remove the flair for a user in a subreddit.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `subredditName` | `string`                  | The name of the subreddit to remove the flair from.                      |
| `username`      | `string`                  | The username of the user to remove the flair from.                       |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### removeWikiContributor

▸ **removeWikiContributor**(`username`, `subredditName`, `metadata`): `Promise`\< `void`\>

Remove a user's wiki contributor status for a subreddit.

#### Parameters

| Name            | Type                      | Description                                                                               |
| :-------------- | :------------------------ | :---------------------------------------------------------------------------------------- |
| `username`      | `string`                  | The username of the user to remove wiki contributor status from. e.g. 'spez'              |
| `subredditName` | `string`                  | The name of the subreddit to remove the user's wiki contributor status from. e.g. 'memes' |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this.                  |

#### Returns

`Promise`\< `void`\>

---

### reorderWidgets

▸ **reorderWidgets**(`subredditName`, `orderByIds`, `metadata`): `Promise`\< `void`\>

Reorder the widgets for a subreddit.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `subredditName` | `string`                  | The name of the subreddit to reorder the widgets for.                    |
| `orderByIds`    | `string`[]                | An array of widget IDs in the order that they should be displayed.       |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### revertWikiPage

▸ **revertWikiPage**(`subredditName`, `page`, `revisionId`, `metadata`): `Promise`\< `void`\>

Revert a wiki page to a previous revision.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `subredditName` | `string`                  | The name of the subreddit the wiki is in.                                |
| `page`          | `string`                  | The name of the wiki page to revert.                                     |
| `revisionId`    | `string`                  | The ID of the revision to revert to.                                     |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### revokeModeratorInvite

▸ **revokeModeratorInvite**(`username`, `subredditName`, `metadata`): `Promise`\< `void`\>

Revoke a moderator invite for a user to a subreddit.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `username`      | `string`                  | The username of the user to revoke the invite for. e.g. 'spez'           |
| `subredditName` | `string`                  | The name of the subreddit to revoke the invite for. e.g. 'memes'         |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### sendPrivateMessage

▸ **sendPrivateMessage**(`options`, `metadata`): `Promise`\< `void`\>

Sends a private message to a user.

#### Parameters

| Name       | Type                                                                      | Description                           |
| :--------- | :------------------------------------------------------------------------ | :------------------------------------ |
| `options`  | [`SendPrivateMessageOptions`](../interfaces/SendPrivateMessageOptions.md) | The options for sending the message.  |
| `metadata` | `undefined` \| `Metadata`                                                 | Metadata from the orignating handler. |

#### Returns

`Promise`\< `void`\>

A Promise that resolves if the private message was successfully sent.

---

### sendPrivateMessageAsSubreddit

▸ **sendPrivateMessageAsSubreddit**(`options`, `metadata`): `Promise`\< `void`\>

Sends a private message to a user on behalf of a subreddit.

#### Parameters

| Name       | Type                                                                                            | Description                                         |
| :--------- | :---------------------------------------------------------------------------------------------- | :-------------------------------------------------- |
| `options`  | [`SendPrivateMessageAsSubredditOptions`](../interfaces/SendPrivateMessageAsSubredditOptions.md) | The options for sending the message as a subreddit. |
| `metadata` | `undefined` \| `Metadata`                                                                       | Metadata from the orignating handler.               |

#### Returns

`Promise`\< `void`\>

A Promise that resolves if the private message was successfully sent.

---

### setModeratorPermissions

▸ **setModeratorPermissions**(`username`, `subredditName`, `permissions`, `metadata`): `Promise`\< `void`\>

Update the permissions of a moderator of a subreddit.

#### Parameters

| Name            | Type                                                        | Description                                                              |
| :-------------- | :---------------------------------------------------------- | :----------------------------------------------------------------------- |
| `username`      | `string`                                                    | The username of the user to update the permissions for. e.g. 'spez'      |
| `subredditName` | `string`                                                    | The name of the subreddit. e.g. 'memes'                                  |
| `permissions`   | [`ModeratorPermission`](../README.md#moderatorpermission)[] | The permissions to give the user. e.g ['posts', 'wiki']                  |
| `metadata`      | `undefined` \| `Metadata`                                   | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### setPostFlair

▸ **setPostFlair**(`options`, `metadata`): `Promise`\< `void`\>

Set the flair for a post in a subreddit.

#### Parameters

| Name       | Type                                                          | Description                                                              |
| :--------- | :------------------------------------------------------------ | :----------------------------------------------------------------------- |
| `options`  | [`SetPostFlairOptions`](../interfaces/SetPostFlairOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                     | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### setUserFlair

▸ **setUserFlair**(`options`, `metadata`): `Promise`\< `void`\>

Set the flair for a user in a subreddit.

#### Parameters

| Name       | Type                                                          | Description                                                              |
| :--------- | :------------------------------------------------------------ | :----------------------------------------------------------------------- |
| `options`  | [`SetUserFlairOptions`](../interfaces/SetUserFlairOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                     | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### submitComment

▸ **submitComment**(`options`, `metadata`): `Promise`\< [`Comment`](Comment.md)\>

Submit a new comment to a post or comment.

#### Parameters

| Name       | Type                      | Description                                                                |
| :--------- | :------------------------ | :------------------------------------------------------------------------- |
| `options`  | `Object`                  | You must provide either `options.text` or `options.richtext` but not both. |
| `metadata` | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this.   |

#### Returns

`Promise`\< [`Comment`](Comment.md)\>

A Promise that resolves to a Comment object.

---

### submitPost

▸ **submitPost**(`options`, `metadata`): `Promise`\< [`Post`](Post.md)\>

Submits a new post to a subreddit.

**`Example`**

```ts
const post = await reddit.submitPost(
  {
    subredditName: 'devvit',
    title: 'Hello World',
    richtext: new RichTextBuilder()
      .heading({ level: 1 }, (h) => {
        h.rawText('Hello world');
      })
      .codeBlock({}, (cb) => cb.rawText('This post was created via the Devvit API'))
      .build(),
  },
  metadata
);
```

#### Parameters

| Name       | Type                                                  | Description                                                              |
| :--------- | :---------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | [`SubmitPostOptions`](../README.md#submitpostoptions) | Either a self post or a link post.                                       |
| `metadata` | `undefined` \| `Metadata`                             | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`Post`](Post.md)\>

A Promise that resolves to a Post object.

---

### unbanUser

▸ **unbanUser**(`username`, `subredditName`, `metadata`): `Promise`\< `void`\>

Unban a user from a subreddit.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `username`      | `string`                  | The username of the user to unban. e.g. 'spez'                           |
| `subredditName` | `string`                  | The name of the subreddit to unban the user from. e.g. 'memes'           |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### unbanWikiContributor

▸ **unbanWikiContributor**(`username`, `subredditName`, `metadata`): `Promise`\< `void`\>

#### Parameters

| Name            | Type                      | Description                                                                                |
| :-------------- | :------------------------ | :----------------------------------------------------------------------------------------- |
| `username`      | `string`                  | The username of the user to unban. e.g. 'spez'                                             |
| `subredditName` | `string`                  | The name of the subreddit to unban the user from contributing to the wiki on. e.g. 'memes' |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this.                   |

#### Returns

`Promise`\< `void`\>

---

### unmuteUser

▸ **unmuteUser**(`username`, `subredditName`, `metadata`): `Promise`\< `void`\>

Unmute a user in a subreddit. Unmuting a user allows them to send modmail.

#### Parameters

| Name            | Type                      | Description                                                              |
| :-------------- | :------------------------ | :----------------------------------------------------------------------- |
| `username`      | `string`                  | The username of the user to unmute. e.g. 'spez'                          |
| `subredditName` | `string`                  | The name of the subreddit to unmute the user in. e.g. 'memes'            |
| `metadata`      | `undefined` \| `Metadata` | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< `void`\>

---

### updateWikiPage

▸ **updateWikiPage**(`options`, `metadata`): `Promise`\< [`WikiPage`](WikiPage.md)\>

Update a wiki page.

#### Parameters

| Name       | Type                                                              | Description                                                              |
| :--------- | :---------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `options`  | [`UpdateWikiPageOptions`](../interfaces/UpdateWikiPageOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                         | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`WikiPage`](WikiPage.md)\>

The updated WikiPage object.

---

### updateWikiPageSettings

▸ **updateWikiPageSettings**(`options`, `metadata`): `Promise`\< [`WikiPageSettings`](WikiPageSettings.md)\>

Update the settings for a wiki page.

#### Parameters

| Name       | Type                                                                      | Description                                                              |
| :--------- | :------------------------------------------------------------------------ | :----------------------------------------------------------------------- |
| `options`  | [`UpdatePageSettingsOptions`](../interfaces/UpdatePageSettingsOptions.md) | Options for the request                                                  |
| `metadata` | `undefined` \| `Metadata`                                                 | Metadata from the originating handler. Make sure to always include this. |

#### Returns

`Promise`\< [`WikiPageSettings`](WikiPageSettings.md)\>

A WikiPageSettings object.
