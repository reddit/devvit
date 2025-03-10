# Class: RedditAPIClient

[RedditAPIClient](../modules/RedditAPIClient.md).RedditAPIClient

The Reddit API Client

To use the Reddit API Client, add it to the plugin configuration at the top of the file.

**`Example`**

```ts
Devvit.configure({
  redditAPI: true,
  // other plugins
});

// use within one of our capability handlers e.g. Menu Actions, Triggers, Scheduled Job Type, etc
async (event, context) => {
  const subreddit = await context.reddit.getSubredditById(context.subredditId);
  context.reddit.submitPost({
    subredditName: subreddit.name,
    title: 'test post',
    text: 'test body',
  });
  // additional code
};
```

## Table of contents

### Constructors

- [constructor](RedditAPIClient.RedditAPIClient.md#constructor)

### Accessors

- [modMail](RedditAPIClient.RedditAPIClient.md#modmail)

### Methods

- [addEditorToWikiPage](RedditAPIClient.RedditAPIClient.md#addeditortowikipage)
- [addModNote](RedditAPIClient.RedditAPIClient.md#addmodnote)
- [addRemovalNote](RedditAPIClient.RedditAPIClient.md#addremovalnote)
- [addSubredditRemovalReason](RedditAPIClient.RedditAPIClient.md#addsubredditremovalreason)
- [addWidget](RedditAPIClient.RedditAPIClient.md#addwidget)
- [addWikiContributor](RedditAPIClient.RedditAPIClient.md#addwikicontributor)
- [approve](RedditAPIClient.RedditAPIClient.md#approve)
- [approveUser](RedditAPIClient.RedditAPIClient.md#approveuser)
- [banUser](RedditAPIClient.RedditAPIClient.md#banuser)
- [banWikiContributor](RedditAPIClient.RedditAPIClient.md#banwikicontributor)
- [createPostFlairTemplate](RedditAPIClient.RedditAPIClient.md#createpostflairtemplate)
- [createUserFlairTemplate](RedditAPIClient.RedditAPIClient.md#createuserflairtemplate)
- [createWikiPage](RedditAPIClient.RedditAPIClient.md#createwikipage)
- [crosspost](RedditAPIClient.RedditAPIClient.md#crosspost)
- [deleteFlairTemplate](RedditAPIClient.RedditAPIClient.md#deleteflairtemplate)
- [deleteModNote](RedditAPIClient.RedditAPIClient.md#deletemodnote)
- [deleteWidget](RedditAPIClient.RedditAPIClient.md#deletewidget)
- [editFlairTemplate](RedditAPIClient.RedditAPIClient.md#editflairtemplate)
- [getAppUser](RedditAPIClient.RedditAPIClient.md#getappuser)
- [getApprovedUsers](RedditAPIClient.RedditAPIClient.md#getapprovedusers)
- [getBannedUsers](RedditAPIClient.RedditAPIClient.md#getbannedusers)
- [getBannedWikiContributors](RedditAPIClient.RedditAPIClient.md#getbannedwikicontributors)
- [getCommentById](RedditAPIClient.RedditAPIClient.md#getcommentbyid)
- [getComments](RedditAPIClient.RedditAPIClient.md#getcomments)
- [getCommentsAndPostsByUser](RedditAPIClient.RedditAPIClient.md#getcommentsandpostsbyuser)
- [getCommentsByUser](RedditAPIClient.RedditAPIClient.md#getcommentsbyuser)
- [getControversialPosts](RedditAPIClient.RedditAPIClient.md#getcontroversialposts)
- [getCurrentSubreddit](RedditAPIClient.RedditAPIClient.md#getcurrentsubreddit)
- [getCurrentSubredditName](RedditAPIClient.RedditAPIClient.md#getcurrentsubredditname)
- [getCurrentUser](RedditAPIClient.RedditAPIClient.md#getcurrentuser)
- [getCurrentUsername](RedditAPIClient.RedditAPIClient.md#getcurrentusername)
- [getEdited](RedditAPIClient.RedditAPIClient.md#getedited)
- [getHotPosts](RedditAPIClient.RedditAPIClient.md#gethotposts)
- [getMessages](RedditAPIClient.RedditAPIClient.md#getmessages)
- [getModNotes](RedditAPIClient.RedditAPIClient.md#getmodnotes)
- [getModQueue](RedditAPIClient.RedditAPIClient.md#getmodqueue)
- [getModerationLog](RedditAPIClient.RedditAPIClient.md#getmoderationlog)
- [getModerators](RedditAPIClient.RedditAPIClient.md#getmoderators)
- [getMutedUsers](RedditAPIClient.RedditAPIClient.md#getmutedusers)
- [getNewPosts](RedditAPIClient.RedditAPIClient.md#getnewposts)
- [getPostById](RedditAPIClient.RedditAPIClient.md#getpostbyid)
- [getPostFlairTemplates](RedditAPIClient.RedditAPIClient.md#getpostflairtemplates)
- [getPostsByUser](RedditAPIClient.RedditAPIClient.md#getpostsbyuser)
- [getReports](RedditAPIClient.RedditAPIClient.md#getreports)
- [getRisingPosts](RedditAPIClient.RedditAPIClient.md#getrisingposts)
- [getSnoovatarUrl](RedditAPIClient.RedditAPIClient.md#getsnoovatarurl)
- [getSpam](RedditAPIClient.RedditAPIClient.md#getspam)
- [getSubredditById](RedditAPIClient.RedditAPIClient.md#getsubredditbyid)
- [getSubredditByName](RedditAPIClient.RedditAPIClient.md#getsubredditbyname)
- [getSubredditInfoById](RedditAPIClient.RedditAPIClient.md#getsubredditinfobyid)
- [getSubredditInfoByName](RedditAPIClient.RedditAPIClient.md#getsubredditinfobyname)
- [getSubredditLeaderboard](RedditAPIClient.RedditAPIClient.md#getsubredditleaderboard)
- [getSubredditRemovalReasons](RedditAPIClient.RedditAPIClient.md#getsubredditremovalreasons)
- [getSubredditStyles](RedditAPIClient.RedditAPIClient.md#getsubredditstyles)
- [getTopPosts](RedditAPIClient.RedditAPIClient.md#gettopposts)
- [getUnmoderated](RedditAPIClient.RedditAPIClient.md#getunmoderated)
- [getUserById](RedditAPIClient.RedditAPIClient.md#getuserbyid)
- [getUserByUsername](RedditAPIClient.RedditAPIClient.md#getuserbyusername)
- [getUserFlairTemplates](RedditAPIClient.RedditAPIClient.md#getuserflairtemplates)
- [getVaultByAddress](RedditAPIClient.RedditAPIClient.md#getvaultbyaddress)
- [getVaultByUserId](RedditAPIClient.RedditAPIClient.md#getvaultbyuserid)
- [getWidgets](RedditAPIClient.RedditAPIClient.md#getwidgets)
- [getWikiContributors](RedditAPIClient.RedditAPIClient.md#getwikicontributors)
- [getWikiPage](RedditAPIClient.RedditAPIClient.md#getwikipage)
- [getWikiPageRevisions](RedditAPIClient.RedditAPIClient.md#getwikipagerevisions)
- [getWikiPageSettings](RedditAPIClient.RedditAPIClient.md#getwikipagesettings)
- [getWikiPages](RedditAPIClient.RedditAPIClient.md#getwikipages)
- [inviteModerator](RedditAPIClient.RedditAPIClient.md#invitemoderator)
- [markAllMessagesAsRead](RedditAPIClient.RedditAPIClient.md#markallmessagesasread)
- [muteUser](RedditAPIClient.RedditAPIClient.md#muteuser)
- [remove](RedditAPIClient.RedditAPIClient.md#remove)
- [removeEditorFromWikiPage](RedditAPIClient.RedditAPIClient.md#removeeditorfromwikipage)
- [removeModerator](RedditAPIClient.RedditAPIClient.md#removemoderator)
- [removePostFlair](RedditAPIClient.RedditAPIClient.md#removepostflair)
- [removeUser](RedditAPIClient.RedditAPIClient.md#removeuser)
- [removeUserFlair](RedditAPIClient.RedditAPIClient.md#removeuserflair)
- [removeWikiContributor](RedditAPIClient.RedditAPIClient.md#removewikicontributor)
- [reorderWidgets](RedditAPIClient.RedditAPIClient.md#reorderwidgets)
- [report](RedditAPIClient.RedditAPIClient.md#report)
- [revertWikiPage](RedditAPIClient.RedditAPIClient.md#revertwikipage)
- [revokeModeratorInvite](RedditAPIClient.RedditAPIClient.md#revokemoderatorinvite)
- [sendPrivateMessage](RedditAPIClient.RedditAPIClient.md#sendprivatemessage)
- [sendPrivateMessageAsSubreddit](RedditAPIClient.RedditAPIClient.md#sendprivatemessageassubreddit)
- [setModeratorPermissions](RedditAPIClient.RedditAPIClient.md#setmoderatorpermissions)
- [setPostFlair](RedditAPIClient.RedditAPIClient.md#setpostflair)
- [setUserFlair](RedditAPIClient.RedditAPIClient.md#setuserflair)
- [setUserFlairBatch](RedditAPIClient.RedditAPIClient.md#setuserflairbatch)
- [submitComment](RedditAPIClient.RedditAPIClient.md#submitcomment)
- [submitPost](RedditAPIClient.RedditAPIClient.md#submitpost)
- [subscribeToCurrentSubreddit](RedditAPIClient.RedditAPIClient.md#subscribetocurrentsubreddit)
- [unbanUser](RedditAPIClient.RedditAPIClient.md#unbanuser)
- [unbanWikiContributor](RedditAPIClient.RedditAPIClient.md#unbanwikicontributor)
- [unmuteUser](RedditAPIClient.RedditAPIClient.md#unmuteuser)
- [unsubscribeFromCurrentSubreddit](RedditAPIClient.RedditAPIClient.md#unsubscribefromcurrentsubreddit)
- [updateWikiPage](RedditAPIClient.RedditAPIClient.md#updatewikipage)
- [updateWikiPageSettings](RedditAPIClient.RedditAPIClient.md#updatewikipagesettings)

## Constructors

### <a id="constructor" name="constructor"></a> constructor

• **new RedditAPIClient**(`metadata`): [`RedditAPIClient`](RedditAPIClient.RedditAPIClient.md)

#### Parameters

| Name       | Type       |
| :--------- | :--------- |
| `metadata` | `Metadata` |

#### Returns

[`RedditAPIClient`](RedditAPIClient.RedditAPIClient.md)

## Accessors

### <a id="modmail" name="modmail"></a> modMail

• `get` **modMail**(): [`ModMailService`](models.ModMailService.md)

Get ModMail API object

#### Returns

[`ModMailService`](models.ModMailService.md)

**`Example`**

```ts
await reddit.modMail.reply({
  body: "Here is my message",
  conversationId: "abcd42";
})
```

## Methods

### <a id="addeditortowikipage" name="addeditortowikipage"></a> addEditorToWikiPage

▸ **addEditorToWikiPage**(`subredditName`, `page`, `username`): `Promise`\<`void`\>

Add an editor to a wiki page.

#### Parameters

| Name            | Type     | Description                                     |
| :-------------- | :------- | :---------------------------------------------- |
| `subredditName` | `string` | The name of the subreddit the wiki is in.       |
| `page`          | `string` | The name of the wiki page to add the editor to. |
| `username`      | `string` | The username of the user to add as an editor.   |

#### Returns

`Promise`\<`void`\>

---

### <a id="addmodnote" name="addmodnote"></a> addModNote

▸ **addModNote**(`options`): `Promise`\<[`ModNote`](models.ModNote.md)\>

Add a mod note.

#### Parameters

| Name      | Type                                                                                                                                                            | Description             |
| :-------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- |
| `options` | `Prettify`\<`PostNotesRequest` & \{ `label?`: [`UserNoteLabel`](../modules/models.md#usernotelabel) ; `redditId?`: \`t1\_$\{string}\` \| \`t3\_$\{string}\` }\> | Options for the request |

#### Returns

`Promise`\<[`ModNote`](models.ModNote.md)\>

A Promise that resolves if the mod note was successfully added.

---

### <a id="addremovalnote" name="addremovalnote"></a> addRemovalNote

▸ **addRemovalNote**(`options`): `Promise`\<`void`\>

Add a mod note for why a post or comment was removed

#### Parameters

| Name      | Type                                   |
| :-------- | :------------------------------------- |
| `options` | `Prettify`\<`PostRemovalNoteRequest`\> |

#### Returns

`Promise`\<`void`\>

---

### <a id="addsubredditremovalreason" name="addsubredditremovalreason"></a> addSubredditRemovalReason

▸ **addSubredditRemovalReason**(`subredditName`, `options`): `Promise`\<`string`\>

Add a removal reason to a subreddit

#### Parameters

| Name              | Type     | Description                                     |
| :---------------- | :------- | :---------------------------------------------- |
| `subredditName`   | `string` | Name of the subreddit being removed.            |
| `options`         | `Object` | Options.                                        |
| `options.message` | `string` | The message associated with the removal reason. |
| `options.title`   | `string` | The title of the removal reason.                |

#### Returns

`Promise`\<`string`\>

Removal Reason ID

**`Example`**

```ts
const newReason = await reddit.addSubredditRemovalReasons('askReddit', {
  title: 'Spam',
  message: 'This is spam!',
});
console.log(newReason.id);
```

---

### <a id="addwidget" name="addwidget"></a> addWidget

▸ **addWidget**(`widgetData`): `Promise`\<[`Widget`](models.Widget.md)\>

Add a widget to a subreddit.

#### Parameters

| Name         | Type                                                  | Description                     |
| :----------- | :---------------------------------------------------- | :------------------------------ |
| `widgetData` | [`AddWidgetData`](../modules/models.md#addwidgetdata) | The data for the widget to add. |

#### Returns

`Promise`\<[`Widget`](models.Widget.md)\>

- The added Widget object.

---

### <a id="addwikicontributor" name="addwikicontributor"></a> addWikiContributor

▸ **addWikiContributor**(`username`, `subredditName`): `Promise`\<`void`\>

Add a user as a wiki contributor for a subreddit.

#### Parameters

| Name            | Type     | Description                                                                   |
| :-------------- | :------- | :---------------------------------------------------------------------------- |
| `username`      | `string` | The username of the user to add as a wiki contributor. e.g. 'spez'            |
| `subredditName` | `string` | The name of the subreddit to add the user as a wiki contributor. e.g. 'memes' |

#### Returns

`Promise`\<`void`\>

---

### <a id="approve" name="approve"></a> approve

▸ **approve**(`id`): `Promise`\<`void`\>

Approve a post or comment.

#### Parameters

| Name | Type     | Description                                           |
| :--- | :------- | :---------------------------------------------------- |
| `id` | `string` | The id of the post (t3*) or comment (t1*) to approve. |

#### Returns

`Promise`\<`void`\>

**`Example`**

```ts
await reddit.approve('t3_123456');
await reddit.approve('t1_123456');
```

---

### <a id="approveuser" name="approveuser"></a> approveUser

▸ **approveUser**(`username`, `subredditName`): `Promise`\<`void`\>

Approve a user to post in a subreddit.

#### Parameters

| Name            | Type     | Description                                                    |
| :-------------- | :------- | :------------------------------------------------------------- |
| `username`      | `string` | The username of the user to approve. e.g. 'spez'               |
| `subredditName` | `string` | The name of the subreddit to approve the user in. e.g. 'memes' |

#### Returns

`Promise`\<`void`\>

---

### <a id="banuser" name="banuser"></a> banUser

▸ **banUser**(`options`): `Promise`\<`void`\>

Ban a user from a subreddit.

#### Parameters

| Name      | Type                                                    | Description             |
| :-------- | :------------------------------------------------------ | :---------------------- |
| `options` | [`BanUserOptions`](../modules/models.md#banuseroptions) | Options for the request |

#### Returns

`Promise`\<`void`\>

---

### <a id="banwikicontributor" name="banwikicontributor"></a> banWikiContributor

▸ **banWikiContributor**(`options`): `Promise`\<`void`\>

Ban a user from contributing to the wiki on a subreddit.

#### Parameters

| Name      | Type                                                                          | Description             |
| :-------- | :---------------------------------------------------------------------------- | :---------------------- |
| `options` | [`BanWikiContributorOptions`](../modules/models.md#banwikicontributoroptions) | Options for the request |

#### Returns

`Promise`\<`void`\>

---

### <a id="createpostflairtemplate" name="createpostflairtemplate"></a> createPostFlairTemplate

▸ **createPostFlairTemplate**(`options`): `Promise`\<[`FlairTemplate`](models.FlairTemplate.md)\>

Create a post flair template for a subreddit.

#### Parameters

| Name      | Type                                                                            | Description             |
| :-------- | :------------------------------------------------------------------------------ | :---------------------- |
| `options` | [`CreateFlairTemplateOptions`](../modules/models.md#createflairtemplateoptions) | Options for the request |

#### Returns

`Promise`\<[`FlairTemplate`](models.FlairTemplate.md)\>

The created FlairTemplate object.

---

### <a id="createuserflairtemplate" name="createuserflairtemplate"></a> createUserFlairTemplate

▸ **createUserFlairTemplate**(`options`): `Promise`\<[`FlairTemplate`](models.FlairTemplate.md)\>

Create a user flair template for a subreddit.

#### Parameters

| Name      | Type                                                                            | Description             |
| :-------- | :------------------------------------------------------------------------------ | :---------------------- |
| `options` | [`CreateFlairTemplateOptions`](../modules/models.md#createflairtemplateoptions) | Options for the request |

#### Returns

`Promise`\<[`FlairTemplate`](models.FlairTemplate.md)\>

The created FlairTemplate object.

---

### <a id="createwikipage" name="createwikipage"></a> createWikiPage

▸ **createWikiPage**(`options`): `Promise`\<[`WikiPage`](models.WikiPage.md)\>

Create a new wiki page for a subreddit.

#### Parameters

| Name      | Type                                                                  | Description             |
| :-------- | :-------------------------------------------------------------------- | :---------------------- |
| `options` | [`CreateWikiPageOptions`](../modules/models.md#createwikipageoptions) | Options for the request |

#### Returns

`Promise`\<[`WikiPage`](models.WikiPage.md)\>

- The created WikiPage object.

---

### <a id="crosspost" name="crosspost"></a> crosspost

▸ **crosspost**(`options`): `Promise`\<[`Post`](models.Post.md)\>

Crossposts a post to a subreddit.

#### Parameters

| Name      | Type                                                        | Description                     |
| :-------- | :---------------------------------------------------------- | :------------------------------ |
| `options` | [`CrosspostOptions`](../modules/models.md#crosspostoptions) | Options for crossposting a post |

#### Returns

`Promise`\<[`Post`](models.Post.md)\>

- A Promise that resolves to a Post object.

---

### <a id="deleteflairtemplate" name="deleteflairtemplate"></a> deleteFlairTemplate

▸ **deleteFlairTemplate**(`subredditName`, `flairTemplateId`): `Promise`\<`void`\>

Delete a flair template from a subreddit.

#### Parameters

| Name              | Type     | Description                                                  |
| :---------------- | :------- | :----------------------------------------------------------- |
| `subredditName`   | `string` | The name of the subreddit to delete the flair template from. |
| `flairTemplateId` | `string` | The ID of the flair template to delete.                      |

#### Returns

`Promise`\<`void`\>

---

### <a id="deletemodnote" name="deletemodnote"></a> deleteModNote

▸ **deleteModNote**(`options`): `Promise`\<`boolean`\>

Delete a mod note.

#### Parameters

| Name      | Type                               | Description             |
| :-------- | :--------------------------------- | :---------------------- |
| `options` | `Prettify`\<`DeleteNotesRequest`\> | Options for the request |

#### Returns

`Promise`\<`boolean`\>

True if it was deleted successfully; false otherwise.

---

### <a id="deletewidget" name="deletewidget"></a> deleteWidget

▸ **deleteWidget**(`subredditName`, `widgetId`): `Promise`\<`void`\>

Delete a widget from a subreddit.

#### Parameters

| Name            | Type     | Description                                          |
| :-------------- | :------- | :--------------------------------------------------- |
| `subredditName` | `string` | The name of the subreddit to delete the widget from. |
| `widgetId`      | `string` | The ID of the widget to delete.                      |

#### Returns

`Promise`\<`void`\>

---

### <a id="editflairtemplate" name="editflairtemplate"></a> editFlairTemplate

▸ **editFlairTemplate**(`options`): `Promise`\<[`FlairTemplate`](models.FlairTemplate.md)\>

Edit a flair template for a subreddit. This can be either a post or user flair template.
Note: If you leave any of the options fields as undefined, they will reset to their default values.

#### Parameters

| Name      | Type                                                                        | Description             |
| :-------- | :-------------------------------------------------------------------------- | :---------------------- |
| `options` | [`EditFlairTemplateOptions`](../modules/models.md#editflairtemplateoptions) | Options for the request |

#### Returns

`Promise`\<[`FlairTemplate`](models.FlairTemplate.md)\>

The edited FlairTemplate object.

---

### <a id="getappuser" name="getappuser"></a> getAppUser

▸ **getAppUser**(): `Promise`\<[`User`](models.User.md)\>

Get the user that the app runs as on the provided metadata.

#### Returns

`Promise`\<[`User`](models.User.md)\>

A Promise that resolves to a User object.

**`Example`**

```ts
const user = await reddit.getAppUser(metadata);
```

---

### <a id="getapprovedusers" name="getapprovedusers"></a> getApprovedUsers

▸ **getApprovedUsers**(`options`): [`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

Get a list of users who have been approved to post in a subreddit.

#### Parameters

| Name      | Type                       | Description             |
| :-------- | :------------------------- | :---------------------- |
| `options` | `GetSubredditUsersOptions` | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

A Listing of User objects.

---

### <a id="getbannedusers" name="getbannedusers"></a> getBannedUsers

▸ **getBannedUsers**(`options`): [`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

Get a list of users who are banned from a subreddit.

#### Parameters

| Name      | Type                       | Description             |
| :-------- | :------------------------- | :---------------------- |
| `options` | `GetSubredditUsersOptions` | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

A Listing of User objects.

---

### <a id="getbannedwikicontributors" name="getbannedwikicontributors"></a> getBannedWikiContributors

▸ **getBannedWikiContributors**(`options`): [`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

Get a list of users who are banned from contributing to the wiki on a subreddit.

#### Parameters

| Name      | Type                       | Description             |
| :-------- | :------------------------- | :---------------------- |
| `options` | `GetSubredditUsersOptions` | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

A Listing of User objects.

---

### <a id="getcommentbyid" name="getcommentbyid"></a> getCommentById

▸ **getCommentById**(`id`): `Promise`\<[`Comment`](models.Comment.md)\>

Get a [Comment](models.Comment.md) object by ID

#### Parameters

| Name | Type     | Description                                                           |
| :--- | :------- | :-------------------------------------------------------------------- |
| `id` | `string` | The ID (starting with t1\_) of the comment to retrieve. e.g. t1_1qjpg |

#### Returns

`Promise`\<[`Comment`](models.Comment.md)\>

A Promise that resolves to a Comment object.

**`Example`**

```ts
const comment = await reddit.getCommentById('t1_1qjpg');
```

---

### <a id="getcomments" name="getcomments"></a> getComments

▸ **getComments**(`options`): [`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

Get a list of comments from a specific post or comment.

#### Parameters

| Name      | Type                                                            | Description             |
| :-------- | :-------------------------------------------------------------- | :---------------------- |
| `options` | [`GetCommentsOptions`](../modules/models.md#getcommentsoptions) | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

A Listing of Comment objects.

**`Example`**

```ts
const comments = await reddit
  .getComments({
    postId: 't3_1qjpg',
    limit: 1000,
    pageSize: 100,
  })
  .all();
```

---

### <a id="getcommentsandpostsbyuser" name="getcommentsandpostsbyuser"></a> getCommentsAndPostsByUser

▸ **getCommentsAndPostsByUser**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

Get a list of posts and comments from a specific user.

#### Parameters

| Name      | Type                                                                    | Description             |
| :-------- | :---------------------------------------------------------------------- | :---------------------- |
| `options` | [`GetUserOverviewOptions`](../modules/models.md#getuseroverviewoptions) | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

A Listing of `Post` and `Comment` objects.

---

### <a id="getcommentsbyuser" name="getcommentsbyuser"></a> getCommentsByUser

▸ **getCommentsByUser**(`options`): [`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

Get a list of comments by a specific user.

#### Parameters

| Name      | Type                                                                        | Description             |
| :-------- | :-------------------------------------------------------------------------- | :---------------------- |
| `options` | [`GetCommentsByUserOptions`](../modules/models.md#getcommentsbyuseroptions) | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

A Listing of Comment objects.

---

### <a id="getcontroversialposts" name="getcontroversialposts"></a> getControversialPosts

▸ **getControversialPosts**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

Get a list of controversial posts from a specific subreddit.

#### Parameters

| Name      | Type                                                                                | Description             |
| :-------- | :---------------------------------------------------------------------------------- | :---------------------- |
| `options` | [`GetPostsOptionsWithTimeframe`](../modules/models.md#getpostsoptionswithtimeframe) | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

A Listing of Post objects.

**`Example`**

```ts
const posts = await reddit
  .getControversialPosts({
    subredditName: 'memes',
    timeframe: 'day',
    limit: 1000,
    pageSize: 100,
  })
  .all();
```

---

### <a id="getcurrentsubreddit" name="getcurrentsubreddit"></a> getCurrentSubreddit

▸ **getCurrentSubreddit**(): `Promise`\<[`Subreddit`](models.Subreddit.md)\>

Retrieves the current subreddit.

#### Returns

`Promise`\<[`Subreddit`](models.Subreddit.md)\>

A Promise that resolves a Subreddit object.

**`Example`**

```ts
const currentSubreddit = await reddit.getCurrentSubreddit();
```

---

### <a id="getcurrentsubredditname" name="getcurrentsubredditname"></a> getCurrentSubredditName

▸ **getCurrentSubredditName**(): `Promise`\<`string`\>

Retrieves the name of the current subreddit.

#### Returns

`Promise`\<`string`\>

A Promise that resolves a string representing the current subreddit's name.

**`Example`**

```ts
const currentSubredditName = await reddit.getCurrentSubredditName();
```

---

### <a id="getcurrentuser" name="getcurrentuser"></a> getCurrentUser

▸ **getCurrentUser**(): `Promise`\<`undefined` \| [`User`](models.User.md)\>

Get the current calling user.
Resolves to undefined for logged-out custom post renders.

#### Returns

`Promise`\<`undefined` \| [`User`](models.User.md)\>

A Promise that resolves to a User object or undefined

**`Example`**

```ts
const user = await reddit.getCurrentUser();
```

---

### <a id="getcurrentusername" name="getcurrentusername"></a> getCurrentUsername

▸ **getCurrentUsername**(): `Promise`\<`undefined` \| `string`\>

Get the current calling user's username.
Resolves to undefined for logged-out custom post renders.

#### Returns

`Promise`\<`undefined` \| `string`\>

A Promise that resolves to a string representing the username or undefined

**`Example`**

```ts
const username = await reddit.getCurrentUsername();
```

---

### <a id="getedited" name="getedited"></a> getEdited

▸ **getEdited**(`options`): [`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

Return a listing of things that have been edited recently.

#### Parameters

| Name      | Type                                                                 |
| :-------- | :------------------------------------------------------------------- |
| `options` | [`ModLogOptions`](../modules/models.md#modlogoptions)\<`"comment"`\> |

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

| Name      | Type                                                              |
| :-------- | :---------------------------------------------------------------- |
| `options` | [`ModLogOptions`](../modules/models.md#modlogoptions)\<`"post"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

▸ **getEdited**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

#### Parameters

| Name      | Type                                                             |
| :-------- | :--------------------------------------------------------------- |
| `options` | [`ModLogOptions`](../modules/models.md#modlogoptions)\<`"all"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

---

### <a id="gethotposts" name="gethotposts"></a> getHotPosts

▸ **getHotPosts**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

Get a list of hot posts from a specific subreddit.

#### Parameters

| Name      | Type                                                            | Description             |
| :-------- | :-------------------------------------------------------------- | :---------------------- |
| `options` | [`GetHotPostsOptions`](../modules/models.md#gethotpostsoptions) | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

A Listing of Post objects.

**`Example`**

```ts
const posts = await reddit
  .getHotPosts({
    subredditName: 'memes',
    timeframe: 'day',
    limit: 1000,
    pageSize: 100,
  })
  .all();
```

---

### <a id="getmessages" name="getmessages"></a> getMessages

▸ **getMessages**(`options`): `Promise`\<[`Listing`](models.Listing.md)\<[`PrivateMessage`](models.PrivateMessage.md)\>\>

Get private messages sent to the currently authenticated user.

#### Parameters

| Name      | Type                                                                                                                                | Description             |
| :-------- | :---------------------------------------------------------------------------------------------------------------------------------- | :---------------------- |
| `options` | `Prettify`\<\{ `type?`: `"inbox"` \| `"unread"` \| `"sent"` } & [`ListingFetchOptions`](../modules/models.md#listingfetchoptions)\> | Options for the request |

#### Returns

`Promise`\<[`Listing`](models.Listing.md)\<[`PrivateMessage`](models.PrivateMessage.md)\>\>

---

### <a id="getmodnotes" name="getmodnotes"></a> getModNotes

▸ **getModNotes**(`options`): [`Listing`](models.Listing.md)\<[`ModNote`](models.ModNote.md)\>

Get a list of mod notes related to a user in a subreddit.

#### Parameters

| Name      | Type                                                                                                                                                                                                                                            | Description             |
| :-------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- |
| `options` | `Prettify`\<`Pick`\<`GetNotesRequest`, `"subreddit"` \| `"user"`\> & \{ `filter?`: [`ModNoteType`](../modules/models.md#modnotetype) } & `Pick`\<[`ListingFetchOptions`](../modules/models.md#listingfetchoptions), `"before"` \| `"limit"`\>\> | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`ModNote`](models.ModNote.md)\>

A listing of ModNote objects.

---

### <a id="getmodqueue" name="getmodqueue"></a> getModQueue

▸ **getModQueue**(`options`): [`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

Return a listing of things requiring moderator review, such as reported things and items.

#### Parameters

| Name      | Type                                                                 |
| :-------- | :------------------------------------------------------------------- |
| `options` | [`ModLogOptions`](../modules/models.md#modlogoptions)\<`"comment"`\> |

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

| Name      | Type                                                              |
| :-------- | :---------------------------------------------------------------- |
| `options` | [`ModLogOptions`](../modules/models.md#modlogoptions)\<`"post"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

▸ **getModQueue**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

#### Parameters

| Name      | Type                                                             |
| :-------- | :--------------------------------------------------------------- |
| `options` | [`ModLogOptions`](../modules/models.md#modlogoptions)\<`"all"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

---

### <a id="getmoderationlog" name="getmoderationlog"></a> getModerationLog

▸ **getModerationLog**(`options`): [`Listing`](models.Listing.md)\<[`ModAction`](../interfaces/models.ModAction.md)\>

Get the moderation log for a subreddit.

#### Parameters

| Name      | Type                                                                      | Description             |
| :-------- | :------------------------------------------------------------------------ | :---------------------- |
| `options` | [`GetModerationLogOptions`](../modules/models.md#getmoderationlogoptions) | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`ModAction`](../interfaces/models.ModAction.md)\>

A Listing of ModAction objects.

**`Example`**

```ts
const modActions = await reddit
  .getModerationLog({
    subredditName: 'memes',
    moderatorUsernames: ['spez'],
    type: 'banuser',
    limit: 1000,
    pageSize: 100,
  })
  .all();
```

---

### <a id="getmoderators" name="getmoderators"></a> getModerators

▸ **getModerators**(`options`): [`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

Get a list of users who are moderators for a subreddit.

#### Parameters

| Name      | Type                       | Description             |
| :-------- | :------------------------- | :---------------------- |
| `options` | `GetSubredditUsersOptions` | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

A Listing of User objects.

---

### <a id="getmutedusers" name="getmutedusers"></a> getMutedUsers

▸ **getMutedUsers**(`options`): [`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

Get a list of users who are muted in a subreddit.

#### Parameters

| Name      | Type                       | Description             |
| :-------- | :------------------------- | :---------------------- |
| `options` | `GetSubredditUsersOptions` | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

A listing of User objects.

---

### <a id="getnewposts" name="getnewposts"></a> getNewPosts

▸ **getNewPosts**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

Get a list of new posts from a specific subreddit.

#### Parameters

| Name      | Type                                                      | Description             |
| :-------- | :-------------------------------------------------------- | :---------------------- |
| `options` | [`GetPostsOptions`](../modules/models.md#getpostsoptions) | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

A Listing of Post objects.

**`Example`**

```ts
const posts = await reddit
  .getNewPosts({
    subredditName: 'memes',
    limit: 1000,
    pageSize: 100,
  })
  .all();
```

---

### <a id="getpostbyid" name="getpostbyid"></a> getPostById

▸ **getPostById**(`id`): `Promise`\<[`Post`](models.Post.md)\>

Gets a [Post](models.Post.md) object by ID

#### Parameters

| Name | Type     |
| :--- | :------- |
| `id` | `string` |

#### Returns

`Promise`\<[`Post`](models.Post.md)\>

A Promise that resolves to a Post object.

---

### <a id="getpostflairtemplates" name="getpostflairtemplates"></a> getPostFlairTemplates

▸ **getPostFlairTemplates**(`subredditName`): `Promise`\<[`FlairTemplate`](models.FlairTemplate.md)[]\>

Get the list of post flair templates for a subreddit.

#### Parameters

| Name            | Type     | Description                                                    |
| :-------------- | :------- | :------------------------------------------------------------- |
| `subredditName` | `string` | The name of the subreddit to get the post flair templates for. |

#### Returns

`Promise`\<[`FlairTemplate`](models.FlairTemplate.md)[]\>

A Promise that resolves with an array of FlairTemplate objects.

---

### <a id="getpostsbyuser" name="getpostsbyuser"></a> getPostsByUser

▸ **getPostsByUser**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

Get a list of posts from a specific user.

#### Parameters

| Name      | Type                                                                  | Description             |
| :-------- | :-------------------------------------------------------------------- | :---------------------- |
| `options` | [`GetPostsByUserOptions`](../modules/models.md#getpostsbyuseroptions) | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

A Listing of Post objects.

---

### <a id="getreports" name="getreports"></a> getReports

▸ **getReports**(`options`): [`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

Return a listing of things that have been reported.

#### Parameters

| Name      | Type                                                                 |
| :-------- | :------------------------------------------------------------------- |
| `options` | [`ModLogOptions`](../modules/models.md#modlogoptions)\<`"comment"`\> |

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

| Name      | Type                                                              |
| :-------- | :---------------------------------------------------------------- |
| `options` | [`ModLogOptions`](../modules/models.md#modlogoptions)\<`"post"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

▸ **getReports**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

#### Parameters

| Name      | Type                                                             |
| :-------- | :--------------------------------------------------------------- |
| `options` | [`ModLogOptions`](../modules/models.md#modlogoptions)\<`"all"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

---

### <a id="getrisingposts" name="getrisingposts"></a> getRisingPosts

▸ **getRisingPosts**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

Get a list of hot posts from a specific subreddit.

#### Parameters

| Name      | Type                                                      | Description             |
| :-------- | :-------------------------------------------------------- | :---------------------- |
| `options` | [`GetPostsOptions`](../modules/models.md#getpostsoptions) | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

A Listing of Post objects.

**`Example`**

```ts
const posts = await reddit
  .getRisingPosts({
    subredditName: 'memes',
    timeframe: 'day',
    limit: 1000,
    pageSize: 100,
  })
  .all();
```

---

### <a id="getsnoovatarurl" name="getsnoovatarurl"></a> getSnoovatarUrl

▸ **getSnoovatarUrl**(`username`): `Promise`\<`undefined` \| `string`\>

Get the snoovatar URL for a given username.

#### Parameters

| Name       | Type     | Description                               |
| :--------- | :------- | :---------------------------------------- |
| `username` | `string` | The username of the snoovatar to retrieve |

#### Returns

`Promise`\<`undefined` \| `string`\>

A Promise that resolves to a URL of the snoovatar image if it exists.

---

### <a id="getspam" name="getspam"></a> getSpam

▸ **getSpam**(`options`): [`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

Return a listing of things that have been marked as spam or otherwise removed.

#### Parameters

| Name      | Type                                                                 |
| :-------- | :------------------------------------------------------------------- |
| `options` | [`ModLogOptions`](../modules/models.md#modlogoptions)\<`"comment"`\> |

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

| Name      | Type                                                              |
| :-------- | :---------------------------------------------------------------- |
| `options` | [`ModLogOptions`](../modules/models.md#modlogoptions)\<`"post"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

▸ **getSpam**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

#### Parameters

| Name      | Type                                                             |
| :-------- | :--------------------------------------------------------------- |
| `options` | [`ModLogOptions`](../modules/models.md#modlogoptions)\<`"all"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

---

### <a id="getsubredditbyid" name="getsubredditbyid"></a> getSubredditById

▸ **getSubredditById**(`id`): `Promise`\<`undefined` \| [`Subreddit`](models.Subreddit.md)\>

Gets a [Subreddit](models.Subreddit.md) object by ID

#### Parameters

| Name | Type     | Description                                                             |
| :--- | :------- | :---------------------------------------------------------------------- |
| `id` | `string` | The ID (starting with t5\_) of the subreddit to retrieve. e.g. t5_2qjpg |

#### Returns

`Promise`\<`undefined` \| [`Subreddit`](models.Subreddit.md)\>

A Promise that resolves a Subreddit object.

**`Deprecated`**

Use [getSubredditInfoById](../modules/models.md#getsubredditinfobyid) instead.

**`Example`**

```ts
const memes = await reddit.getSubredditById('t5_2qjpg');
```

---

### <a id="getsubredditbyname" name="getsubredditbyname"></a> getSubredditByName

▸ **getSubredditByName**(`name`): `Promise`\<[`Subreddit`](models.Subreddit.md)\>

Gets a [Subreddit](models.Subreddit.md) object by name

#### Parameters

| Name   | Type     | Description                                                        |
| :----- | :------- | :----------------------------------------------------------------- |
| `name` | `string` | The name of a subreddit omitting the r/. This is case insensitive. |

#### Returns

`Promise`\<[`Subreddit`](models.Subreddit.md)\>

A Promise that resolves a Subreddit object.

**`Deprecated`**

Use [getSubredditInfoByName](../modules/models.md#getsubredditinfobyname) instead.

**`Example`**

```ts
const askReddit = await reddit.getSubredditByName('askReddit');
```

---

### <a id="getsubredditinfobyid" name="getsubredditinfobyid"></a> getSubredditInfoById

▸ **getSubredditInfoById**(`id`): `Promise`\<[`SubredditInfo`](../modules/models.md#subredditinfo)\>

Gets a [SubredditInfo](../modules/models.md#subredditinfo) object by ID

#### Parameters

| Name | Type     | Description                                                             |
| :--- | :------- | :---------------------------------------------------------------------- |
| `id` | `string` | The ID (starting with t5\_) of the subreddit to retrieve. e.g. t5_2qjpg |

#### Returns

`Promise`\<[`SubredditInfo`](../modules/models.md#subredditinfo)\>

A Promise that resolves a SubredditInfo object.

**`Example`**

```ts
const memes = await reddit.getSubredditInfoById('t5_2qjpg');
```

---

### <a id="getsubredditinfobyname" name="getsubredditinfobyname"></a> getSubredditInfoByName

▸ **getSubredditInfoByName**(`name`): `Promise`\<[`SubredditInfo`](../modules/models.md#subredditinfo)\>

Gets a [SubredditInfo](../modules/models.md#subredditinfo) object by name

#### Parameters

| Name   | Type     | Description                                                        |
| :----- | :------- | :----------------------------------------------------------------- |
| `name` | `string` | The name of a subreddit omitting the r/. This is case insensitive. |

#### Returns

`Promise`\<[`SubredditInfo`](../modules/models.md#subredditinfo)\>

A Promise that resolves a SubredditInfo object.

**`Example`**

```ts
const askReddit = await reddit.getSubredditInfoByName('askReddit');
```

---

### <a id="getsubredditleaderboard" name="getsubredditleaderboard"></a> getSubredditLeaderboard

▸ **getSubredditLeaderboard**(`subredditId`): `Promise`\<[`SubredditLeaderboard`](../modules/models.md#subredditleaderboard)\>

Returns a leaderboard for a given subreddit ID.

#### Parameters

| Name          | Type     | Description                                                     |
| :------------ | :------- | :-------------------------------------------------------------- |
| `subredditId` | `string` | ID of the subreddit for which the leaderboard is being queried. |

#### Returns

`Promise`\<[`SubredditLeaderboard`](../modules/models.md#subredditleaderboard)\>

Leaderboard for the given subreddit.

---

### <a id="getsubredditremovalreasons" name="getsubredditremovalreasons"></a> getSubredditRemovalReasons

▸ **getSubredditRemovalReasons**(`subredditName`): `Promise`\<[`RemovalReason`](../modules/models.md#removalreason)[]\>

Get the list of subreddit's removal reasons (ordered)

#### Parameters

| Name            | Type     |
| :-------------- | :------- |
| `subredditName` | `string` |

#### Returns

`Promise`\<[`RemovalReason`](../modules/models.md#removalreason)[]\>

Ordered array of Removal Reasons

**`Example`**

```ts
const reasons = await reddit.getSubredditRemovalReasons('askReddit');

for (let reason of reasons) {
  console.log(reason.id, reason.message, reason.title);
}
```

---

### <a id="getsubredditstyles" name="getsubredditstyles"></a> getSubredditStyles

▸ **getSubredditStyles**(`subredditId`): `Promise`\<[`SubredditStyles`](../modules/models.md#subredditstyles)\>

Returns the styles for a given subreddit ID.

#### Parameters

| Name          | Type     | Description                                            |
| :------------ | :------- | :----------------------------------------------------- |
| `subredditId` | `string` | ID of the subreddit from which to retrieve the styles. |

#### Returns

`Promise`\<[`SubredditStyles`](../modules/models.md#subredditstyles)\>

Styles for the given subreddit.

---

### <a id="gettopposts" name="gettopposts"></a> getTopPosts

▸ **getTopPosts**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

Get a list of controversial posts from a specific subreddit.

#### Parameters

| Name      | Type                                                                                | Description             |
| :-------- | :---------------------------------------------------------------------------------- | :---------------------- |
| `options` | [`GetPostsOptionsWithTimeframe`](../modules/models.md#getpostsoptionswithtimeframe) | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

A Listing of Post objects.

**`Example`**

```ts
const posts = await reddit
  .getControversialPosts({
    subredditName: 'memes',
    timeframe: 'day',
    limit: 1000,
    pageSize: 100,
  })
  .all();
```

---

### <a id="getunmoderated" name="getunmoderated"></a> getUnmoderated

▸ **getUnmoderated**(`options`): [`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

Return a listing of things that have yet to be approved/removed by a mod.

#### Parameters

| Name      | Type                                                                 |
| :-------- | :------------------------------------------------------------------- |
| `options` | [`ModLogOptions`](../modules/models.md#modlogoptions)\<`"comment"`\> |

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

| Name      | Type                                                              |
| :-------- | :---------------------------------------------------------------- |
| `options` | [`ModLogOptions`](../modules/models.md#modlogoptions)\<`"post"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md)\>

▸ **getUnmoderated**(`options`): [`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

#### Parameters

| Name      | Type                                                             |
| :-------- | :--------------------------------------------------------------- |
| `options` | [`ModLogOptions`](../modules/models.md#modlogoptions)\<`"all"`\> |

#### Returns

[`Listing`](models.Listing.md)\<[`Post`](models.Post.md) \| [`Comment`](models.Comment.md)\>

---

### <a id="getuserbyid" name="getuserbyid"></a> getUserById

▸ **getUserById**(`id`): `Promise`\<`undefined` \| [`User`](models.User.md)\>

Gets a [User](models.User.md) object by ID

#### Parameters

| Name | Type     | Description                                                        |
| :--- | :------- | :----------------------------------------------------------------- |
| `id` | `string` | The ID (starting with t2\_) of the user to retrieve. e.g. t2_1qjpg |

#### Returns

`Promise`\<`undefined` \| [`User`](models.User.md)\>

A Promise that resolves to a User object.

**`Example`**

```ts
const user = await reddit.getUserById('t2_1qjpg');
```

---

### <a id="getuserbyusername" name="getuserbyusername"></a> getUserByUsername

▸ **getUserByUsername**(`username`): `Promise`\<`undefined` \| [`User`](models.User.md)\>

Gets a [User](models.User.md) object by username

#### Parameters

| Name       | Type     | Description                                             |
| :--------- | :------- | :------------------------------------------------------ |
| `username` | `string` | The username of the user omitting the u/. e.g. 'devvit' |

#### Returns

`Promise`\<`undefined` \| [`User`](models.User.md)\>

A Promise that resolves to a User object or undefined if user is
not found (user doesn't exist, account suspended, etc).

**`Example`**

```ts
const user = await reddit.getUserByUsername('devvit');
if (user) {
  console.log(user);
}
```

---

### <a id="getuserflairtemplates" name="getuserflairtemplates"></a> getUserFlairTemplates

▸ **getUserFlairTemplates**(`subredditName`): `Promise`\<[`FlairTemplate`](models.FlairTemplate.md)[]\>

Get the list of user flair templates for a subreddit.

#### Parameters

| Name            | Type     | Description                                                    |
| :-------------- | :------- | :------------------------------------------------------------- |
| `subredditName` | `string` | The name of the subreddit to get the user flair templates for. |

#### Returns

`Promise`\<[`FlairTemplate`](models.FlairTemplate.md)[]\>

A Promise that resolves with an array of FlairTemplate objects.

---

### <a id="getvaultbyaddress" name="getvaultbyaddress"></a> getVaultByAddress

▸ **getVaultByAddress**(`address`): `Promise`\<[`Vault`](../modules/models.md#vault)\>

Gets a [Vault](../modules/models.md#vault) for the specified address.

#### Parameters

| Name      | Type     | Description                                  |
| :-------- | :------- | :------------------------------------------- |
| `address` | `string` | The address (starting with 0x) of the Vault. |

#### Returns

`Promise`\<[`Vault`](../modules/models.md#vault)\>

**`Example`**

```ts
const vault = await reddit.getVaultByAddress('0x205ee28744456bDBf180A0Fa7De51e0F116d54Ed');
```

---

### <a id="getvaultbyuserid" name="getvaultbyuserid"></a> getVaultByUserId

▸ **getVaultByUserId**(`userId`): `Promise`\<[`Vault`](../modules/models.md#vault)\>

Gets a [Vault](../modules/models.md#vault) for the specified user.

#### Parameters

| Name     | Type     | Description                                     |
| :------- | :------- | :---------------------------------------------- |
| `userId` | `string` | The ID (starting with t2\_) of the Vault owner. |

#### Returns

`Promise`\<[`Vault`](../modules/models.md#vault)\>

**`Example`**

```ts
const vault = await reddit.getVaultByUserId('t2_1w72');
```

---

### <a id="getwidgets" name="getwidgets"></a> getWidgets

▸ **getWidgets**(`subredditName`): `Promise`\<[`Widget`](models.Widget.md)[]\>

Get the widgets for a subreddit.

#### Parameters

| Name            | Type     | Description                                       |
| :-------------- | :------- | :------------------------------------------------ |
| `subredditName` | `string` | The name of the subreddit to get the widgets for. |

#### Returns

`Promise`\<[`Widget`](models.Widget.md)[]\>

- An array of Widget objects.

---

### <a id="getwikicontributors" name="getwikicontributors"></a> getWikiContributors

▸ **getWikiContributors**(`options`): [`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

Get a list of users who are wiki contributors of a subreddit.

#### Parameters

| Name      | Type                       | Description             |
| :-------- | :------------------------- | :---------------------- |
| `options` | `GetSubredditUsersOptions` | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`User`](models.User.md)\>

A Listing of User objects.

---

### <a id="getwikipage" name="getwikipage"></a> getWikiPage

▸ **getWikiPage**(`subredditName`, `page`): `Promise`\<[`WikiPage`](models.WikiPage.md)\>

Get a wiki page from a subreddit.

#### Parameters

| Name            | Type     | Description                                          |
| :-------------- | :------- | :--------------------------------------------------- |
| `subredditName` | `string` | The name of the subreddit to get the wiki page from. |
| `page`          | `string` | The name of the wiki page to get.                    |

#### Returns

`Promise`\<[`WikiPage`](models.WikiPage.md)\>

The requested WikiPage object.

---

### <a id="getwikipagerevisions" name="getwikipagerevisions"></a> getWikiPageRevisions

▸ **getWikiPageRevisions**(`options`): [`Listing`](models.Listing.md)\<[`WikiPageRevision`](models.WikiPageRevision.md)\>

Get the revisions for a wiki page.

#### Parameters

| Name      | Type                                                                      | Description             |
| :-------- | :------------------------------------------------------------------------ | :---------------------- |
| `options` | [`GetPageRevisionsOptions`](../modules/models.md#getpagerevisionsoptions) | Options for the request |

#### Returns

[`Listing`](models.Listing.md)\<[`WikiPageRevision`](models.WikiPageRevision.md)\>

A Listing of WikiPageRevision objects.

---

### <a id="getwikipagesettings" name="getwikipagesettings"></a> getWikiPageSettings

▸ **getWikiPageSettings**(`subredditName`, `page`): `Promise`\<[`WikiPageSettings`](models.WikiPageSettings.md)\>

Get the settings for a wiki page.

#### Parameters

| Name            | Type     | Description                                        |
| :-------------- | :------- | :------------------------------------------------- |
| `subredditName` | `string` | The name of the subreddit the wiki is in.          |
| `page`          | `string` | The name of the wiki page to get the settings for. |

#### Returns

`Promise`\<[`WikiPageSettings`](models.WikiPageSettings.md)\>

A WikiPageSettings object.

---

### <a id="getwikipages" name="getwikipages"></a> getWikiPages

▸ **getWikiPages**(`subredditName`): `Promise`\<`string`[]\>

Get the wiki pages for a subreddit.

#### Parameters

| Name            | Type     | Description                                           |
| :-------------- | :------- | :---------------------------------------------------- |
| `subredditName` | `string` | The name of the subreddit to get the wiki pages from. |

#### Returns

`Promise`\<`string`[]\>

A list of the wiki page names for the subreddit.

---

### <a id="invitemoderator" name="invitemoderator"></a> inviteModerator

▸ **inviteModerator**(`options`): `Promise`\<`void`\>

Invite a user to become a moderator of a subreddit.

#### Parameters

| Name      | Type                                                                             | Description             |
| :-------- | :------------------------------------------------------------------------------- | :---------------------- |
| `options` | [`InviteModeratorOptions`](../modules/RedditAPIClient.md#invitemoderatoroptions) | Options for the request |

#### Returns

`Promise`\<`void`\>

---

### <a id="markallmessagesasread" name="markallmessagesasread"></a> markAllMessagesAsRead

▸ **markAllMessagesAsRead**(): `Promise`\<`void`\>

Mark all private messages as read.

#### Returns

`Promise`\<`void`\>

---

### <a id="muteuser" name="muteuser"></a> muteUser

▸ **muteUser**(`options`): `Promise`\<`void`\>

Mute a user in a subreddit. Muting a user prevents them from sending modmail.

#### Parameters

| Name      | Type                                                               | Description             |
| :-------- | :----------------------------------------------------------------- | :---------------------- |
| `options` | [`MuteUserOptions`](../modules/RedditAPIClient.md#muteuseroptions) | Options for the request |

#### Returns

`Promise`\<`void`\>

---

### <a id="remove" name="remove"></a> remove

▸ **remove**(`id`, `isSpam`): `Promise`\<`void`\>

Remove a post or comment.

#### Parameters

| Name     | Type      | Description                                             |
| :------- | :-------- | :------------------------------------------------------ |
| `id`     | `string`  | The id of the post (t3*) or comment (t1*) to remove.    |
| `isSpam` | `boolean` | Is the post or comment being removed because it's spam? |

#### Returns

`Promise`\<`void`\>

**`Example`**

```ts
await reddit.remove('t3_123456', false);
await reddit.remove('t1_123456', true);
```

---

### <a id="removeeditorfromwikipage" name="removeeditorfromwikipage"></a> removeEditorFromWikiPage

▸ **removeEditorFromWikiPage**(`subredditName`, `page`, `username`): `Promise`\<`void`\>

Remove an editor from a wiki page.

#### Parameters

| Name            | Type     | Description                                          |
| :-------------- | :------- | :--------------------------------------------------- |
| `subredditName` | `string` | The name of the subreddit the wiki is in.            |
| `page`          | `string` | The name of the wiki page to remove the editor from. |
| `username`      | `string` | The username of the user to remove as an editor.     |

#### Returns

`Promise`\<`void`\>

---

### <a id="removemoderator" name="removemoderator"></a> removeModerator

▸ **removeModerator**(`username`, `subredditName`): `Promise`\<`void`\>

Remove a user as a moderator of a subreddit.

#### Parameters

| Name            | Type     | Description                                                                    |
| :-------------- | :------- | :----------------------------------------------------------------------------- |
| `username`      | `string` | The username of the user to remove as a moderator. e.g. 'spez'                 |
| `subredditName` | `string` | The name of the subreddit to remove the user as a moderator from. e.g. 'memes' |

#### Returns

`Promise`\<`void`\>

---

### <a id="removepostflair" name="removepostflair"></a> removePostFlair

▸ **removePostFlair**(`subredditName`, `postId`): `Promise`\<`void`\>

Remove the flair for a post in a subreddit.

#### Parameters

| Name            | Type     | Description                                         |
| :-------------- | :------- | :-------------------------------------------------- |
| `subredditName` | `string` | The name of the subreddit to remove the flair from. |
| `postId`        | `string` | The ID of the post to remove the flair from.        |

#### Returns

`Promise`\<`void`\>

---

### <a id="removeuser" name="removeuser"></a> removeUser

▸ **removeUser**(`username`, `subredditName`): `Promise`\<`void`\>

Remove a user's approval to post in a subreddit.

#### Parameters

| Name            | Type     | Description                                                                |
| :-------------- | :------- | :------------------------------------------------------------------------- |
| `username`      | `string` | The username of the user to remove approval from. e.g. 'spez'              |
| `subredditName` | `string` | The name of the subreddit to remove the user's approval from. e.g. 'memes' |

#### Returns

`Promise`\<`void`\>

---

### <a id="removeuserflair" name="removeuserflair"></a> removeUserFlair

▸ **removeUserFlair**(`subredditName`, `username`): `Promise`\<`void`\>

Remove the flair for a user in a subreddit.

#### Parameters

| Name            | Type     | Description                                         |
| :-------------- | :------- | :-------------------------------------------------- |
| `subredditName` | `string` | The name of the subreddit to remove the flair from. |
| `username`      | `string` | The username of the user to remove the flair from.  |

#### Returns

`Promise`\<`void`\>

---

### <a id="removewikicontributor" name="removewikicontributor"></a> removeWikiContributor

▸ **removeWikiContributor**(`username`, `subredditName`): `Promise`\<`void`\>

Remove a user's wiki contributor status for a subreddit.

#### Parameters

| Name            | Type     | Description                                                                               |
| :-------------- | :------- | :---------------------------------------------------------------------------------------- |
| `username`      | `string` | The username of the user to remove wiki contributor status from. e.g. 'spez'              |
| `subredditName` | `string` | The name of the subreddit to remove the user's wiki contributor status from. e.g. 'memes' |

#### Returns

`Promise`\<`void`\>

---

### <a id="reorderwidgets" name="reorderwidgets"></a> reorderWidgets

▸ **reorderWidgets**(`subredditName`, `orderByIds`): `Promise`\<`void`\>

Reorder the widgets for a subreddit.

#### Parameters

| Name            | Type       | Description                                                        |
| :-------------- | :--------- | :----------------------------------------------------------------- |
| `subredditName` | `string`   | The name of the subreddit to reorder the widgets for.              |
| `orderByIds`    | `string`[] | An array of widget IDs in the order that they should be displayed. |

#### Returns

`Promise`\<`void`\>

---

### <a id="report" name="report"></a> report

▸ **report**(`thing`, `options`): `Promise`\<`JsonStatus`\>

Report a Post or Comment

The report is sent to the moderators of the subreddit for review.

#### Parameters

| Name             | Type                                                       | Description               |
| :--------------- | :--------------------------------------------------------- | :------------------------ |
| `thing`          | [`Post`](models.Post.md) \| [`Comment`](models.Comment.md) | Post or Comment           |
| `options`        | `Object`                                                   | Options                   |
| `options.reason` | `string`                                                   | Why the thing is reported |

#### Returns

`Promise`\<`JsonStatus`\>

**`Example`**

```ts
await reddit.report(post, {
  reason: 'This is spam!',
});
```

---

### <a id="revertwikipage" name="revertwikipage"></a> revertWikiPage

▸ **revertWikiPage**(`subredditName`, `page`, `revisionId`): `Promise`\<`void`\>

Revert a wiki page to a previous revision.

#### Parameters

| Name            | Type     | Description                               |
| :-------------- | :------- | :---------------------------------------- |
| `subredditName` | `string` | The name of the subreddit the wiki is in. |
| `page`          | `string` | The name of the wiki page to revert.      |
| `revisionId`    | `string` | The ID of the revision to revert to.      |

#### Returns

`Promise`\<`void`\>

---

### <a id="revokemoderatorinvite" name="revokemoderatorinvite"></a> revokeModeratorInvite

▸ **revokeModeratorInvite**(`username`, `subredditName`): `Promise`\<`void`\>

Revoke a moderator invite for a user to a subreddit.

#### Parameters

| Name            | Type     | Description                                                      |
| :-------------- | :------- | :--------------------------------------------------------------- |
| `username`      | `string` | The username of the user to revoke the invite for. e.g. 'spez'   |
| `subredditName` | `string` | The name of the subreddit to revoke the invite for. e.g. 'memes' |

#### Returns

`Promise`\<`void`\>

---

### <a id="sendprivatemessage" name="sendprivatemessage"></a> sendPrivateMessage

▸ **sendPrivateMessage**(`options`): `Promise`\<`void`\>

Sends a private message to a user.

#### Parameters

| Name      | Type                                                                          | Description                          |
| :-------- | :---------------------------------------------------------------------------- | :----------------------------------- |
| `options` | [`SendPrivateMessageOptions`](../modules/models.md#sendprivatemessageoptions) | The options for sending the message. |

#### Returns

`Promise`\<`void`\>

A Promise that resolves if the private message was successfully sent.

---

### <a id="sendprivatemessageassubreddit" name="sendprivatemessageassubreddit"></a> sendPrivateMessageAsSubreddit

▸ **sendPrivateMessageAsSubreddit**(`options`): `Promise`\<`void`\>

Sends a private message to a user on behalf of a subreddit.

#### Parameters

| Name      | Type                                                                                                | Description                                         |
| :-------- | :-------------------------------------------------------------------------------------------------- | :-------------------------------------------------- |
| `options` | [`SendPrivateMessageAsSubredditOptions`](../modules/models.md#sendprivatemessageassubredditoptions) | The options for sending the message as a subreddit. |

#### Returns

`Promise`\<`void`\>

A Promise that resolves if the private message was successfully sent.

---

### <a id="setmoderatorpermissions" name="setmoderatorpermissions"></a> setModeratorPermissions

▸ **setModeratorPermissions**(`username`, `subredditName`, `permissions`): `Promise`\<`void`\>

Update the permissions of a moderator of a subreddit.

#### Parameters

| Name            | Type                                                                | Description                                                         |
| :-------------- | :------------------------------------------------------------------ | :------------------------------------------------------------------ |
| `username`      | `string`                                                            | The username of the user to update the permissions for. e.g. 'spez' |
| `subredditName` | `string`                                                            | The name of the subreddit. e.g. 'memes'                             |
| `permissions`   | [`ModeratorPermission`](../modules/models.md#moderatorpermission)[] | The permissions to give the user. e.g ['posts', 'wiki']             |

#### Returns

`Promise`\<`void`\>

---

### <a id="setpostflair" name="setpostflair"></a> setPostFlair

▸ **setPostFlair**(`options`): `Promise`\<`void`\>

Set the flair for a post in a subreddit.

#### Parameters

| Name      | Type                                                              | Description             |
| :-------- | :---------------------------------------------------------------- | :---------------------- |
| `options` | [`SetPostFlairOptions`](../modules/models.md#setpostflairoptions) | Options for the request |

#### Returns

`Promise`\<`void`\>

---

### <a id="setuserflair" name="setuserflair"></a> setUserFlair

▸ **setUserFlair**(`options`): `Promise`\<`void`\>

Set the flair for a user in a subreddit.

#### Parameters

| Name      | Type                                                              | Description             |
| :-------- | :---------------------------------------------------------------- | :---------------------- |
| `options` | [`SetUserFlairOptions`](../modules/models.md#setuserflairoptions) | Options for the request |

#### Returns

`Promise`\<`void`\>

---

### <a id="setuserflairbatch" name="setuserflairbatch"></a> setUserFlairBatch

▸ **setUserFlairBatch**(`subredditName`, `flairs`): `Promise`\<`FlairCsvResult`[]\>

Set the flair of multiple users in the same subreddit with a single API call.
Can process up to 100 entries at once.

#### Parameters

| Name            | Type                                                                        | Description                                                                                                                |
| :-------------- | :-------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `subredditName` | `string`                                                                    | The name of the subreddit to edit flairs in.                                                                               |
| `flairs`        | [`SetUserFlairBatchConfig`](../modules/models.md#setuserflairbatchconfig)[] | Array of user flair configuration objects. If both text and cssClass are empty for a given user the flair will be cleared. |

#### Returns

`Promise`\<`FlairCsvResult`[]\>

- Array of statuses for each entry provided.

---

### <a id="submitcomment" name="submitcomment"></a> submitComment

▸ **submitComment**(`options`): `Promise`\<[`Comment`](models.Comment.md)\>

Submit a new comment to a post or comment.

#### Parameters

| Name      | Type                                                                                              | Description                                                                |
| :-------- | :------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------- |
| `options` | [`CommentSubmissionOptions`](../modules/models.md#commentsubmissionoptions) & \{ `id`: `string` } | You must provide either `options.text` or `options.richtext` but not both. |

#### Returns

`Promise`\<[`Comment`](models.Comment.md)\>

A Promise that resolves to a Comment object.

---

### <a id="submitpost" name="submitpost"></a> submitPost

▸ **submitPost**(`options`): `Promise`\<[`Post`](models.Post.md)\>

Submits a new post to a subreddit.

#### Parameters

| Name      | Type                                                          | Description                        |
| :-------- | :------------------------------------------------------------ | :--------------------------------- |
| `options` | [`SubmitPostOptions`](../modules/models.md#submitpostoptions) | Either a self post or a link post. |

#### Returns

`Promise`\<[`Post`](models.Post.md)\>

A Promise that resolves to a Post object.

**`Example`**

```ts
const post = await reddit.submitPost({
  subredditName: 'devvit',
  title: 'Hello World',
  richtext: new RichTextBuilder()
    .heading({ level: 1 }, (h) => {
      h.rawText('Hello world');
    })
    .codeBlock({}, (cb) => cb.rawText('This post was created via the Devvit API'))
    .build(),
});
```

---

### <a id="subscribetocurrentsubreddit" name="subscribetocurrentsubreddit"></a> subscribeToCurrentSubreddit

▸ **subscribeToCurrentSubreddit**(): `Promise`\<`void`\>

Subscribes to the subreddit in which the app is installed. No-op if the user is already subscribed.
This method will execute as the app account by default.
To subscribe on behalf of a user, please contact Reddit.

#### Returns

`Promise`\<`void`\>

---

### <a id="unbanuser" name="unbanuser"></a> unbanUser

▸ **unbanUser**(`username`, `subredditName`): `Promise`\<`void`\>

Unban a user from a subreddit.

#### Parameters

| Name            | Type     | Description                                                    |
| :-------------- | :------- | :------------------------------------------------------------- |
| `username`      | `string` | The username of the user to unban. e.g. 'spez'                 |
| `subredditName` | `string` | The name of the subreddit to unban the user from. e.g. 'memes' |

#### Returns

`Promise`\<`void`\>

---

### <a id="unbanwikicontributor" name="unbanwikicontributor"></a> unbanWikiContributor

▸ **unbanWikiContributor**(`username`, `subredditName`): `Promise`\<`void`\>

#### Parameters

| Name            | Type     | Description                                                                                |
| :-------------- | :------- | :----------------------------------------------------------------------------------------- |
| `username`      | `string` | The username of the user to unban. e.g. 'spez'                                             |
| `subredditName` | `string` | The name of the subreddit to unban the user from contributing to the wiki on. e.g. 'memes' |

#### Returns

`Promise`\<`void`\>

---

### <a id="unmuteuser" name="unmuteuser"></a> unmuteUser

▸ **unmuteUser**(`username`, `subredditName`): `Promise`\<`void`\>

Unmute a user in a subreddit. Unmuting a user allows them to send modmail.

#### Parameters

| Name            | Type     | Description                                                   |
| :-------------- | :------- | :------------------------------------------------------------ |
| `username`      | `string` | The username of the user to unmute. e.g. 'spez'               |
| `subredditName` | `string` | The name of the subreddit to unmute the user in. e.g. 'memes' |

#### Returns

`Promise`\<`void`\>

---

### <a id="unsubscribefromcurrentsubreddit" name="unsubscribefromcurrentsubreddit"></a> unsubscribeFromCurrentSubreddit

▸ **unsubscribeFromCurrentSubreddit**(): `Promise`\<`void`\>

Unsubscribes from the subreddit in which the app is installed. No-op if the user isn't subscribed.
This method will execute as the app account by default.
To unsubscribe on behalf of a user, please contact Reddit.

#### Returns

`Promise`\<`void`\>

---

### <a id="updatewikipage" name="updatewikipage"></a> updateWikiPage

▸ **updateWikiPage**(`options`): `Promise`\<[`WikiPage`](models.WikiPage.md)\>

Update a wiki page.

#### Parameters

| Name      | Type                                                                  | Description             |
| :-------- | :-------------------------------------------------------------------- | :---------------------- |
| `options` | [`UpdateWikiPageOptions`](../modules/models.md#updatewikipageoptions) | Options for the request |

#### Returns

`Promise`\<[`WikiPage`](models.WikiPage.md)\>

The updated WikiPage object.

---

### <a id="updatewikipagesettings" name="updatewikipagesettings"></a> updateWikiPageSettings

▸ **updateWikiPageSettings**(`options`): `Promise`\<[`WikiPageSettings`](models.WikiPageSettings.md)\>

Update the settings for a wiki page.

#### Parameters

| Name      | Type                                                                          | Description             |
| :-------- | :---------------------------------------------------------------------------- | :---------------------- |
| `options` | [`UpdatePageSettingsOptions`](../modules/models.md#updatepagesettingsoptions) | Options for the request |

#### Returns

`Promise`\<[`WikiPageSettings`](models.WikiPageSettings.md)\>

A WikiPageSettings object.
