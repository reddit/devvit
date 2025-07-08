[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: RedditAPIClient

The Reddit API Client

To use the Reddit API Client, add it to the plugin configuration at the top of the file.

## Example

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

## Constructors

<a id="constructor"></a>

### new RedditAPIClient()

> **new RedditAPIClient**(`metadata`): `RedditAPIClient`

#### Parameters

##### metadata

`Metadata`

#### Returns

`RedditAPIClient`

## Accessors

<a id="modmail"></a>

### modMail

#### Get Signature

> **get** **modMail**(): [`ModMailService`](../../models/classes/ModMailService.md)

Get ModMail API object

##### Example

```ts
await reddit.modMail.reply({
  body: "Here is my message",
  conversationId: "abcd42";
})
```

##### Returns

[`ModMailService`](../../models/classes/ModMailService.md)

## Methods

<a id="addeditortowikipage"></a>

### addEditorToWikiPage()

> **addEditorToWikiPage**(`subredditName`, `page`, `username`): `Promise`\<`void`\>

Add an editor to a wiki page.

#### Parameters

##### subredditName

`string`

The name of the subreddit the wiki is in.

##### page

`string`

The name of the wiki page to add the editor to.

##### username

`string`

The username of the user to add as an editor.

#### Returns

`Promise`\<`void`\>

---

<a id="addmodnote"></a>

### addModNote()

> **addModNote**(`options`): `Promise`\<[`ModNote`](../../models/classes/ModNote.md)\>

Add a mod note.

#### Parameters

##### options

`Prettify`

Options for the request

#### Returns

`Promise`\<[`ModNote`](../../models/classes/ModNote.md)\>

A Promise that resolves if the mod note was successfully added.

---

<a id="addremovalnote"></a>

### addRemovalNote()

> **addRemovalNote**(`options`): `Promise`\<`void`\>

Add a mod note for why a post or comment was removed

#### Parameters

##### options

`Prettify`

#### Returns

`Promise`\<`void`\>

---

<a id="addsubredditremovalreason"></a>

### addSubredditRemovalReason()

> **addSubredditRemovalReason**(`subredditName`, `options`): `Promise`\<`string`\>

Add a removal reason to a subreddit

#### Parameters

##### subredditName

`string`

Name of the subreddit being removed.

##### options

Options.

###### message

`string`

The message associated with the removal reason.

###### title

`string`

The title of the removal reason.

#### Returns

`Promise`\<`string`\>

Removal Reason ID

#### Example

```ts
const newReason = await reddit.addSubredditRemovalReasons('askReddit', {
  title: 'Spam',
  message: 'This is spam!',
});
console.log(newReason.id);
```

---

<a id="addwidget"></a>

### addWidget()

> **addWidget**(`widgetData`): `Promise`\<[`Widget`](../../models/classes/Widget.md)\>

Add a widget to a subreddit.

#### Parameters

##### widgetData

[`AddWidgetData`](../../models/type-aliases/AddWidgetData.md)

The data for the widget to add.

#### Returns

`Promise`\<[`Widget`](../../models/classes/Widget.md)\>

- The added Widget object.

---

<a id="addwikicontributor"></a>

### addWikiContributor()

> **addWikiContributor**(`username`, `subredditName`): `Promise`\<`void`\>

Add a user as a wiki contributor for a subreddit.

#### Parameters

##### username

`string`

The username of the user to add as a wiki contributor. e.g. 'spez'

##### subredditName

`string`

The name of the subreddit to add the user as a wiki contributor. e.g. 'memes'

#### Returns

`Promise`\<`void`\>

---

<a id="approve"></a>

### approve()

> **approve**(`id`): `Promise`\<`void`\>

Approve a post or comment.

#### Parameters

##### id

`string`

The id of the post (t3*) or comment (t1*) to approve.

#### Returns

`Promise`\<`void`\>

#### Example

```ts
await reddit.approve('t3_123456');
await reddit.approve('t1_123456');
```

---

<a id="approveuser"></a>

### approveUser()

> **approveUser**(`username`, `subredditName`): `Promise`\<`void`\>

Approve a user to post in a subreddit.

#### Parameters

##### username

`string`

The username of the user to approve. e.g. 'spez'

##### subredditName

`string`

The name of the subreddit to approve the user in. e.g. 'memes'

#### Returns

`Promise`\<`void`\>

---

<a id="banuser"></a>

### banUser()

> **banUser**(`options`): `Promise`\<`void`\>

Ban a user from a subreddit.

#### Parameters

##### options

[`BanUserOptions`](../../models/type-aliases/BanUserOptions.md)

Options for the request

#### Returns

`Promise`\<`void`\>

---

<a id="banwikicontributor"></a>

### banWikiContributor()

> **banWikiContributor**(`options`): `Promise`\<`void`\>

Ban a user from contributing to the wiki on a subreddit.

#### Parameters

##### options

[`BanWikiContributorOptions`](../../models/type-aliases/BanWikiContributorOptions.md)

Options for the request

#### Returns

`Promise`\<`void`\>

---

<a id="createpostflairtemplate"></a>

### createPostFlairTemplate()

> **createPostFlairTemplate**(`options`): `Promise`\<[`FlairTemplate`](../../models/classes/FlairTemplate.md)\>

Create a post flair template for a subreddit.

#### Parameters

##### options

[`CreateFlairTemplateOptions`](../../models/type-aliases/CreateFlairTemplateOptions.md)

Options for the request

#### Returns

`Promise`\<[`FlairTemplate`](../../models/classes/FlairTemplate.md)\>

The created FlairTemplate object.

---

<a id="createuserflairtemplate"></a>

### createUserFlairTemplate()

> **createUserFlairTemplate**(`options`): `Promise`\<[`FlairTemplate`](../../models/classes/FlairTemplate.md)\>

Create a user flair template for a subreddit.

#### Parameters

##### options

[`CreateFlairTemplateOptions`](../../models/type-aliases/CreateFlairTemplateOptions.md)

Options for the request

#### Returns

`Promise`\<[`FlairTemplate`](../../models/classes/FlairTemplate.md)\>

The created FlairTemplate object.

---

<a id="createwikipage"></a>

### createWikiPage()

> **createWikiPage**(`options`): `Promise`\<[`WikiPage`](../../models/classes/WikiPage.md)\>

Create a new wiki page for a subreddit.

#### Parameters

##### options

[`CreateWikiPageOptions`](../../models/type-aliases/CreateWikiPageOptions.md)

Options for the request

#### Returns

`Promise`\<[`WikiPage`](../../models/classes/WikiPage.md)\>

- The created WikiPage object.

---

<a id="crosspost"></a>

### crosspost()

> **crosspost**(`options`): `Promise`\<[`Post`](../../models/classes/Post.md)\>

Crossposts a post to a subreddit.

#### Parameters

##### options

[`CrosspostOptions`](../../models/type-aliases/CrosspostOptions.md)

Options for crossposting a post

#### Returns

`Promise`\<[`Post`](../../models/classes/Post.md)\>

- A Promise that resolves to a Post object.

---

<a id="deleteflairtemplate"></a>

### deleteFlairTemplate()

> **deleteFlairTemplate**(`subredditName`, `flairTemplateId`): `Promise`\<`void`\>

Delete a flair template from a subreddit.

#### Parameters

##### subredditName

`string`

The name of the subreddit to delete the flair template from.

##### flairTemplateId

`string`

The ID of the flair template to delete.

#### Returns

`Promise`\<`void`\>

---

<a id="deletemodnote"></a>

### deleteModNote()

> **deleteModNote**(`options`): `Promise`\<`boolean`\>

Delete a mod note.

#### Parameters

##### options

`Prettify`

Options for the request

#### Returns

`Promise`\<`boolean`\>

True if it was deleted successfully; false otherwise.

---

<a id="deletewidget"></a>

### deleteWidget()

> **deleteWidget**(`subredditName`, `widgetId`): `Promise`\<`void`\>

Delete a widget from a subreddit.

#### Parameters

##### subredditName

`string`

The name of the subreddit to delete the widget from.

##### widgetId

`string`

The ID of the widget to delete.

#### Returns

`Promise`\<`void`\>

---

<a id="editflairtemplate"></a>

### editFlairTemplate()

> **editFlairTemplate**(`options`): `Promise`\<[`FlairTemplate`](../../models/classes/FlairTemplate.md)\>

Edit a flair template for a subreddit. This can be either a post or user flair template.
Note: If you leave any of the options fields as undefined, they will reset to their default values.

#### Parameters

##### options

[`EditFlairTemplateOptions`](../../models/type-aliases/EditFlairTemplateOptions.md)

Options for the request

#### Returns

`Promise`\<[`FlairTemplate`](../../models/classes/FlairTemplate.md)\>

The edited FlairTemplate object.

---

<a id="getapprovedusers"></a>

### getApprovedUsers()

> **getApprovedUsers**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`User`](../../models/classes/User.md)\>

Get a list of users who have been approved to post in a subreddit.

#### Parameters

##### options

`GetSubredditUsersOptions`

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`User`](../../models/classes/User.md)\>

A Listing of User objects.

---

<a id="getappuser"></a>

### getAppUser()

> **getAppUser**(): `Promise`\<[`User`](../../models/classes/User.md)\>

Get the user that the app runs as on the provided metadata.

#### Returns

`Promise`\<[`User`](../../models/classes/User.md)\>

A Promise that resolves to a User object.

#### Example

```ts
const user = await reddit.getAppUser(metadata);
```

---

<a id="getbannedusers"></a>

### getBannedUsers()

> **getBannedUsers**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`User`](../../models/classes/User.md)\>

Get a list of users who are banned from a subreddit.

#### Parameters

##### options

`GetSubredditUsersOptions`

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`User`](../../models/classes/User.md)\>

A Listing of User objects.

---

<a id="getbannedwikicontributors"></a>

### getBannedWikiContributors()

> **getBannedWikiContributors**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`User`](../../models/classes/User.md)\>

Get a list of users who are banned from contributing to the wiki on a subreddit.

#### Parameters

##### options

`GetSubredditUsersOptions`

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`User`](../../models/classes/User.md)\>

A Listing of User objects.

---

<a id="getcommentbyid"></a>

### getCommentById()

> **getCommentById**(`id`): `Promise`\<[`Comment`](../../models/classes/Comment.md)\>

Get a [Comment](../../models/classes/Comment.md) object by ID

#### Parameters

##### id

`string`

The ID (starting with t1\_) of the comment to retrieve. e.g. t1_1qjpg

#### Returns

`Promise`\<[`Comment`](../../models/classes/Comment.md)\>

A Promise that resolves to a Comment object.

#### Example

```ts
const comment = await reddit.getCommentById('t1_1qjpg');
```

---

<a id="getcomments"></a>

### getComments()

> **getComments**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Comment`](../../models/classes/Comment.md)\>

Get a list of comments from a specific post or comment.

#### Parameters

##### options

[`GetCommentsOptions`](../../models/type-aliases/GetCommentsOptions.md)

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Comment`](../../models/classes/Comment.md)\>

A Listing of Comment objects.

#### Example

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

<a id="getcommentsandpostsbyuser"></a>

### getCommentsAndPostsByUser()

> **getCommentsAndPostsByUser**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md) \| [`Comment`](../../models/classes/Comment.md)\>

Get a list of posts and comments from a specific user.

#### Parameters

##### options

[`GetUserOverviewOptions`](../../models/type-aliases/GetUserOverviewOptions.md)

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md) \| [`Comment`](../../models/classes/Comment.md)\>

A Listing of `Post` and `Comment` objects.

---

<a id="getcommentsbyuser"></a>

### getCommentsByUser()

> **getCommentsByUser**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Comment`](../../models/classes/Comment.md)\>

Get a list of comments by a specific user.

#### Parameters

##### options

[`GetCommentsByUserOptions`](../../models/type-aliases/GetCommentsByUserOptions.md)

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Comment`](../../models/classes/Comment.md)\>

A Listing of Comment objects.

---

<a id="getcontroversialposts"></a>

### getControversialPosts()

> **getControversialPosts**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

Get a list of controversial posts from a specific subreddit.

#### Parameters

##### options

[`GetPostsOptionsWithTimeframe`](../../models/type-aliases/GetPostsOptionsWithTimeframe.md)

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

A Listing of Post objects.

#### Example

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

<a id="getcurrentsubreddit"></a>

### getCurrentSubreddit()

> **getCurrentSubreddit**(): `Promise`\<[`Subreddit`](../../models/classes/Subreddit.md)\>

Retrieves the current subreddit.

#### Returns

`Promise`\<[`Subreddit`](../../models/classes/Subreddit.md)\>

A Promise that resolves a Subreddit object.

#### Example

```ts
const currentSubreddit = await reddit.getCurrentSubreddit();
```

---

<a id="getcurrentsubredditname"></a>

### getCurrentSubredditName()

> **getCurrentSubredditName**(): `Promise`\<`string`\>

Retrieves the name of the current subreddit.

#### Returns

`Promise`\<`string`\>

A Promise that resolves a string representing the current subreddit's name.

#### Example

```ts
const currentSubredditName = await reddit.getCurrentSubredditName();
```

---

<a id="getcurrentuser"></a>

### getCurrentUser()

> **getCurrentUser**(): `Promise`\<`undefined` \| [`User`](../../models/classes/User.md)\>

Get the current calling user.
Resolves to undefined for logged-out custom post renders.

#### Returns

`Promise`\<`undefined` \| [`User`](../../models/classes/User.md)\>

A Promise that resolves to a User object or undefined

#### Example

```ts
const user = await reddit.getCurrentUser();
```

---

<a id="getcurrentusername"></a>

### getCurrentUsername()

> **getCurrentUsername**(): `Promise`\<`undefined` \| `string`\>

Get the current calling user's username.
Resolves to undefined for logged-out custom post renders.

#### Returns

`Promise`\<`undefined` \| `string`\>

A Promise that resolves to a string representing the username or undefined

#### Example

```ts
const username = await reddit.getCurrentUsername();
```

---

<a id="getedited"></a>

### getEdited()

#### Call Signature

> **getEdited**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Comment`](../../models/classes/Comment.md)\>

Return a listing of things that have been edited recently.

##### Parameters

###### options

[`ModLogOptions`](../../models/type-aliases/ModLogOptions.md)\<`"comment"`\>

##### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Comment`](../../models/classes/Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getEdited();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getEdited({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getEdited**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

Return a listing of things that have been edited recently.

##### Parameters

###### options

[`ModLogOptions`](../../models/type-aliases/ModLogOptions.md)\<`"post"`\>

##### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getEdited();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getEdited({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getEdited**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md) \| [`Comment`](../../models/classes/Comment.md)\>

Return a listing of things that have been edited recently.

##### Parameters

###### options

[`ModLogOptions`](../../models/type-aliases/ModLogOptions.md)\<`"all"`\>

##### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md) \| [`Comment`](../../models/classes/Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getEdited();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getEdited({ type: 'post' });
console.log('Posts: ', await listing.all());
```

---

<a id="gethotposts"></a>

### getHotPosts()

> **getHotPosts**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

Get a list of hot posts from a specific subreddit.

#### Parameters

##### options

[`GetHotPostsOptions`](../../models/type-aliases/GetHotPostsOptions.md)

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

A Listing of Post objects.

#### Example

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

<a id="getmessages"></a>

### getMessages()

> **getMessages**(`options`): `Promise`\<[`Listing`](../../models/classes/Listing.md)\<[`PrivateMessage`](../../models/classes/PrivateMessage.md)\>\>

Get private messages sent to the currently authenticated user.

#### Parameters

##### options

`Prettify`

Options for the request

#### Returns

`Promise`\<[`Listing`](../../models/classes/Listing.md)\<[`PrivateMessage`](../../models/classes/PrivateMessage.md)\>\>

---

<a id="getmoderationlog"></a>

### getModerationLog()

> **getModerationLog**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`ModAction`](../../models/interfaces/ModAction.md)\>

Get the moderation log for a subreddit.

#### Parameters

##### options

[`GetModerationLogOptions`](../../models/type-aliases/GetModerationLogOptions.md)

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`ModAction`](../../models/interfaces/ModAction.md)\>

A Listing of ModAction objects.

#### Example

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

<a id="getmoderators"></a>

### getModerators()

> **getModerators**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`User`](../../models/classes/User.md)\>

Get a list of users who are moderators for a subreddit.

#### Parameters

##### options

`GetSubredditUsersOptions`

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`User`](../../models/classes/User.md)\>

A Listing of User objects.

---

<a id="getmodnotes"></a>

### getModNotes()

> **getModNotes**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`ModNote`](../../models/classes/ModNote.md)\>

Get a list of mod notes related to a user in a subreddit.

#### Parameters

##### options

`Prettify`

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`ModNote`](../../models/classes/ModNote.md)\>

A listing of ModNote objects.

---

<a id="getmodqueue"></a>

### getModQueue()

#### Call Signature

> **getModQueue**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Comment`](../../models/classes/Comment.md)\>

Return a listing of things requiring moderator review, such as reported things and items.

##### Parameters

###### options

[`ModLogOptions`](../../models/type-aliases/ModLogOptions.md)\<`"comment"`\>

##### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Comment`](../../models/classes/Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getModQueue();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getModQueue({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getModQueue**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

Return a listing of things requiring moderator review, such as reported things and items.

##### Parameters

###### options

[`ModLogOptions`](../../models/type-aliases/ModLogOptions.md)\<`"post"`\>

##### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getModQueue();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getModQueue({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getModQueue**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md) \| [`Comment`](../../models/classes/Comment.md)\>

Return a listing of things requiring moderator review, such as reported things and items.

##### Parameters

###### options

[`ModLogOptions`](../../models/type-aliases/ModLogOptions.md)\<`"all"`\>

##### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md) \| [`Comment`](../../models/classes/Comment.md)\>

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

> **getMutedUsers**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`User`](../../models/classes/User.md)\>

Get a list of users who are muted in a subreddit.

#### Parameters

##### options

`GetSubredditUsersOptions`

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`User`](../../models/classes/User.md)\>

A listing of User objects.

---

<a id="getnewposts"></a>

### getNewPosts()

> **getNewPosts**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

Get a list of new posts from a specific subreddit.

#### Parameters

##### options

[`GetPostsOptions`](../../models/type-aliases/GetPostsOptions.md)

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

A Listing of Post objects.

#### Example

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

<a id="getpostbyid"></a>

### getPostById()

> **getPostById**(`id`): `Promise`\<[`Post`](../../models/classes/Post.md)\>

Gets a [Post](../../models/classes/Post.md) object by ID

#### Parameters

##### id

`string`

#### Returns

`Promise`\<[`Post`](../../models/classes/Post.md)\>

A Promise that resolves to a Post object.

---

<a id="getpostflairtemplates"></a>

### getPostFlairTemplates()

> **getPostFlairTemplates**(`subredditName`): `Promise`\<[`FlairTemplate`](../../models/classes/FlairTemplate.md)[]\>

Get the list of post flair templates for a subreddit.

#### Parameters

##### subredditName

`string`

The name of the subreddit to get the post flair templates for.

#### Returns

`Promise`\<[`FlairTemplate`](../../models/classes/FlairTemplate.md)[]\>

A Promise that resolves with an array of FlairTemplate objects.

---

<a id="getpostsbyuser"></a>

### getPostsByUser()

> **getPostsByUser**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

Get a list of posts from a specific user.

#### Parameters

##### options

[`GetPostsByUserOptions`](../../models/type-aliases/GetPostsByUserOptions.md)

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

A Listing of Post objects.

---

<a id="getreports"></a>

### getReports()

#### Call Signature

> **getReports**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Comment`](../../models/classes/Comment.md)\>

Return a listing of things that have been reported.

##### Parameters

###### options

[`ModLogOptions`](../../models/type-aliases/ModLogOptions.md)\<`"comment"`\>

##### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Comment`](../../models/classes/Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getReports();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getReports({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getReports**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

Return a listing of things that have been reported.

##### Parameters

###### options

[`ModLogOptions`](../../models/type-aliases/ModLogOptions.md)\<`"post"`\>

##### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getReports();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getReports({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getReports**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md) \| [`Comment`](../../models/classes/Comment.md)\>

Return a listing of things that have been reported.

##### Parameters

###### options

[`ModLogOptions`](../../models/type-aliases/ModLogOptions.md)\<`"all"`\>

##### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md) \| [`Comment`](../../models/classes/Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getReports();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getReports({ type: 'post' });
console.log('Posts: ', await listing.all());
```

---

<a id="getrisingposts"></a>

### getRisingPosts()

> **getRisingPosts**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

Get a list of hot posts from a specific subreddit.

#### Parameters

##### options

[`GetPostsOptions`](../../models/type-aliases/GetPostsOptions.md)

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

A Listing of Post objects.

#### Example

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

<a id="getsnoovatarurl"></a>

### getSnoovatarUrl()

> **getSnoovatarUrl**(`username`): `Promise`\<`undefined` \| `string`\>

Get the snoovatar URL for a given username.

#### Parameters

##### username

`string`

The username of the snoovatar to retrieve

#### Returns

`Promise`\<`undefined` \| `string`\>

A Promise that resolves to a URL of the snoovatar image if it exists.

---

<a id="getspam"></a>

### getSpam()

#### Call Signature

> **getSpam**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Comment`](../../models/classes/Comment.md)\>

Return a listing of things that have been marked as spam or otherwise removed.

##### Parameters

###### options

[`ModLogOptions`](../../models/type-aliases/ModLogOptions.md)\<`"comment"`\>

##### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Comment`](../../models/classes/Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getSpam();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getSpam({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getSpam**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

Return a listing of things that have been marked as spam or otherwise removed.

##### Parameters

###### options

[`ModLogOptions`](../../models/type-aliases/ModLogOptions.md)\<`"post"`\>

##### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getSpam();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getSpam({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getSpam**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md) \| [`Comment`](../../models/classes/Comment.md)\>

Return a listing of things that have been marked as spam or otherwise removed.

##### Parameters

###### options

[`ModLogOptions`](../../models/type-aliases/ModLogOptions.md)\<`"all"`\>

##### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md) \| [`Comment`](../../models/classes/Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getSpam();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getSpam({ type: 'post' });
console.log('Posts: ', await listing.all());
```

---

<a id="getsubredditbyid"></a>

### ~~getSubredditById()~~

> **getSubredditById**(`id`): `Promise`\<`undefined` \| [`Subreddit`](../../models/classes/Subreddit.md)\>

Gets a [Subreddit](../../models/classes/Subreddit.md) object by ID

#### Parameters

##### id

`string`

The ID (starting with t5\_) of the subreddit to retrieve. e.g. t5_2qjpg

#### Returns

`Promise`\<`undefined` \| [`Subreddit`](../../models/classes/Subreddit.md)\>

A Promise that resolves a Subreddit object.

#### Deprecated

Use [getSubredditInfoById](../../models/functions/getSubredditInfoById.md) instead.

#### Example

```ts
const memes = await reddit.getSubredditById('t5_2qjpg');
```

---

<a id="getsubredditbyname"></a>

### ~~getSubredditByName()~~

> **getSubredditByName**(`name`): `Promise`\<[`Subreddit`](../../models/classes/Subreddit.md)\>

Gets a [Subreddit](../../models/classes/Subreddit.md) object by name

#### Parameters

##### name

`string`

The name of a subreddit omitting the r/. This is case insensitive.

#### Returns

`Promise`\<[`Subreddit`](../../models/classes/Subreddit.md)\>

A Promise that resolves a Subreddit object.

#### Deprecated

Use [getSubredditInfoByName](../../models/functions/getSubredditInfoByName.md) instead.

#### Example

```ts
const askReddit = await reddit.getSubredditByName('askReddit');
```

---

<a id="getsubredditinfobyid"></a>

### getSubredditInfoById()

> **getSubredditInfoById**(`id`): `Promise`\<[`SubredditInfo`](../../models/type-aliases/SubredditInfo.md)\>

Gets a [SubredditInfo](../../models/type-aliases/SubredditInfo.md) object by ID

#### Parameters

##### id

`string`

The ID (starting with t5\_) of the subreddit to retrieve. e.g. t5_2qjpg

#### Returns

`Promise`\<[`SubredditInfo`](../../models/type-aliases/SubredditInfo.md)\>

A Promise that resolves a SubredditInfo object.

#### Example

```ts
const memes = await reddit.getSubredditInfoById('t5_2qjpg');
```

---

<a id="getsubredditinfobyname"></a>

### getSubredditInfoByName()

> **getSubredditInfoByName**(`name`): `Promise`\<[`SubredditInfo`](../../models/type-aliases/SubredditInfo.md)\>

Gets a [SubredditInfo](../../models/type-aliases/SubredditInfo.md) object by name

#### Parameters

##### name

`string`

The name of a subreddit omitting the r/. This is case insensitive.

#### Returns

`Promise`\<[`SubredditInfo`](../../models/type-aliases/SubredditInfo.md)\>

A Promise that resolves a SubredditInfo object.

#### Example

```ts
const askReddit = await reddit.getSubredditInfoByName('askReddit');
```

---

<a id="getsubredditleaderboard"></a>

### getSubredditLeaderboard()

> **getSubredditLeaderboard**(`subredditId`): `Promise`\<[`SubredditLeaderboard`](../../models/type-aliases/SubredditLeaderboard.md)\>

Returns a leaderboard for a given subreddit ID.

#### Parameters

##### subredditId

`string`

ID of the subreddit for which the leaderboard is being queried.

#### Returns

`Promise`\<[`SubredditLeaderboard`](../../models/type-aliases/SubredditLeaderboard.md)\>

Leaderboard for the given subreddit.

---

<a id="getsubredditremovalreasons"></a>

### getSubredditRemovalReasons()

> **getSubredditRemovalReasons**(`subredditName`): `Promise`\<[`RemovalReason`](../../models/type-aliases/RemovalReason.md)[]\>

Get the list of subreddit's removal reasons (ordered)

#### Parameters

##### subredditName

`string`

#### Returns

`Promise`\<[`RemovalReason`](../../models/type-aliases/RemovalReason.md)[]\>

Ordered array of Removal Reasons

#### Example

```ts
const reasons = await reddit.getSubredditRemovalReasons('askReddit');

for (let reason of reasons) {
  console.log(reason.id, reason.message, reason.title);
}
```

---

<a id="getsubredditstyles"></a>

### getSubredditStyles()

> **getSubredditStyles**(`subredditId`): `Promise`\<[`SubredditStyles`](../../models/type-aliases/SubredditStyles.md)\>

Returns the styles for a given subreddit ID.

#### Parameters

##### subredditId

`string`

ID of the subreddit from which to retrieve the styles.

#### Returns

`Promise`\<[`SubredditStyles`](../../models/type-aliases/SubredditStyles.md)\>

Styles for the given subreddit.

---

<a id="gettopposts"></a>

### getTopPosts()

> **getTopPosts**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

Get a list of controversial posts from a specific subreddit.

#### Parameters

##### options

[`GetPostsOptionsWithTimeframe`](../../models/type-aliases/GetPostsOptionsWithTimeframe.md)

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

A Listing of Post objects.

#### Example

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

<a id="getunmoderated"></a>

### getUnmoderated()

#### Call Signature

> **getUnmoderated**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Comment`](../../models/classes/Comment.md)\>

Return a listing of things that have yet to be approved/removed by a mod.

##### Parameters

###### options

[`ModLogOptions`](../../models/type-aliases/ModLogOptions.md)\<`"comment"`\>

##### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Comment`](../../models/classes/Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getUnmoderated();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getUnmoderated({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getUnmoderated**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

Return a listing of things that have yet to be approved/removed by a mod.

##### Parameters

###### options

[`ModLogOptions`](../../models/type-aliases/ModLogOptions.md)\<`"post"`\>

##### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getUnmoderated();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getUnmoderated({ type: 'post' });
console.log('Posts: ', await listing.all());
```

#### Call Signature

> **getUnmoderated**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md) \| [`Comment`](../../models/classes/Comment.md)\>

Return a listing of things that have yet to be approved/removed by a mod.

##### Parameters

###### options

[`ModLogOptions`](../../models/type-aliases/ModLogOptions.md)\<`"all"`\>

##### Returns

[`Listing`](../../models/classes/Listing.md)\<[`Post`](../../models/classes/Post.md) \| [`Comment`](../../models/classes/Comment.md)\>

##### Example

```ts
const subreddit = await reddit.getSubredditByName('mysubreddit');
let listing = await subreddit.getUnmoderated();
console.log('Posts and Comments: ', await listing.all());
listing = await subreddit.getUnmoderated({ type: 'post' });
console.log('Posts: ', await listing.all());
```

---

<a id="getuserbyid"></a>

### getUserById()

> **getUserById**(`id`): `Promise`\<`undefined` \| [`User`](../../models/classes/User.md)\>

Gets a [User](../../models/classes/User.md) object by ID

#### Parameters

##### id

`string`

The ID (starting with t2\_) of the user to retrieve. e.g. t2_1qjpg

#### Returns

`Promise`\<`undefined` \| [`User`](../../models/classes/User.md)\>

A Promise that resolves to a User object.

#### Example

```ts
const user = await reddit.getUserById('t2_1qjpg');
```

---

<a id="getuserbyusername"></a>

### getUserByUsername()

> **getUserByUsername**(`username`): `Promise`\<`undefined` \| [`User`](../../models/classes/User.md)\>

Gets a [User](../../models/classes/User.md) object by username

#### Parameters

##### username

`string`

The username of the user omitting the u/. e.g. 'devvit'

#### Returns

`Promise`\<`undefined` \| [`User`](../../models/classes/User.md)\>

A Promise that resolves to a User object or undefined if user is
not found (user doesn't exist, account suspended, etc).

#### Example

```ts
const user = await reddit.getUserByUsername('devvit');
if (user) {
  console.log(user);
}
```

---

<a id="getuserflairtemplates"></a>

### getUserFlairTemplates()

> **getUserFlairTemplates**(`subredditName`): `Promise`\<[`FlairTemplate`](../../models/classes/FlairTemplate.md)[]\>

Get the list of user flair templates for a subreddit.

#### Parameters

##### subredditName

`string`

The name of the subreddit to get the user flair templates for.

#### Returns

`Promise`\<[`FlairTemplate`](../../models/classes/FlairTemplate.md)[]\>

A Promise that resolves with an array of FlairTemplate objects.

---

<a id="getvaultbyaddress"></a>

### getVaultByAddress()

> **getVaultByAddress**(`address`): `Promise`\<[`Vault`](../../models/type-aliases/Vault.md)\>

Gets a [Vault](../../models/type-aliases/Vault.md) for the specified address.

#### Parameters

##### address

`string`

The address (starting with 0x) of the Vault.

#### Returns

`Promise`\<[`Vault`](../../models/type-aliases/Vault.md)\>

#### Example

```ts
const vault = await reddit.getVaultByAddress('0x205ee28744456bDBf180A0Fa7De51e0F116d54Ed');
```

---

<a id="getvaultbyuserid"></a>

### getVaultByUserId()

> **getVaultByUserId**(`userId`): `Promise`\<[`Vault`](../../models/type-aliases/Vault.md)\>

Gets a [Vault](../../models/type-aliases/Vault.md) for the specified user.

#### Parameters

##### userId

`string`

The ID (starting with t2\_) of the Vault owner.

#### Returns

`Promise`\<[`Vault`](../../models/type-aliases/Vault.md)\>

#### Example

```ts
const vault = await reddit.getVaultByUserId('t2_1w72');
```

---

<a id="getwidgets"></a>

### getWidgets()

> **getWidgets**(`subredditName`): `Promise`\<[`Widget`](../../models/classes/Widget.md)[]\>

Get the widgets for a subreddit.

#### Parameters

##### subredditName

`string`

The name of the subreddit to get the widgets for.

#### Returns

`Promise`\<[`Widget`](../../models/classes/Widget.md)[]\>

- An array of Widget objects.

---

<a id="getwikicontributors"></a>

### getWikiContributors()

> **getWikiContributors**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`User`](../../models/classes/User.md)\>

Get a list of users who are wiki contributors of a subreddit.

#### Parameters

##### options

`GetSubredditUsersOptions`

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`User`](../../models/classes/User.md)\>

A Listing of User objects.

---

<a id="getwikipage"></a>

### getWikiPage()

> **getWikiPage**(`subredditName`, `page`): `Promise`\<[`WikiPage`](../../models/classes/WikiPage.md)\>

Get a wiki page from a subreddit.

#### Parameters

##### subredditName

`string`

The name of the subreddit to get the wiki page from.

##### page

`string`

The name of the wiki page to get.

#### Returns

`Promise`\<[`WikiPage`](../../models/classes/WikiPage.md)\>

The requested WikiPage object.

---

<a id="getwikipagerevisions"></a>

### getWikiPageRevisions()

> **getWikiPageRevisions**(`options`): [`Listing`](../../models/classes/Listing.md)\<[`WikiPageRevision`](../../models/classes/WikiPageRevision.md)\>

Get the revisions for a wiki page.

#### Parameters

##### options

[`GetPageRevisionsOptions`](../../models/type-aliases/GetPageRevisionsOptions.md)

Options for the request

#### Returns

[`Listing`](../../models/classes/Listing.md)\<[`WikiPageRevision`](../../models/classes/WikiPageRevision.md)\>

A Listing of WikiPageRevision objects.

---

<a id="getwikipages"></a>

### getWikiPages()

> **getWikiPages**(`subredditName`): `Promise`\<`string`[]\>

Get the wiki pages for a subreddit.

#### Parameters

##### subredditName

`string`

The name of the subreddit to get the wiki pages from.

#### Returns

`Promise`\<`string`[]\>

A list of the wiki page names for the subreddit.

---

<a id="getwikipagesettings"></a>

### getWikiPageSettings()

> **getWikiPageSettings**(`subredditName`, `page`): `Promise`\<[`WikiPageSettings`](../../models/classes/WikiPageSettings.md)\>

Get the settings for a wiki page.

#### Parameters

##### subredditName

`string`

The name of the subreddit the wiki is in.

##### page

`string`

The name of the wiki page to get the settings for.

#### Returns

`Promise`\<[`WikiPageSettings`](../../models/classes/WikiPageSettings.md)\>

A WikiPageSettings object.

---

<a id="invitemoderator"></a>

### inviteModerator()

> **inviteModerator**(`options`): `Promise`\<`void`\>

Invite a user to become a moderator of a subreddit.

#### Parameters

##### options

[`InviteModeratorOptions`](../type-aliases/InviteModeratorOptions.md)

Options for the request

#### Returns

`Promise`\<`void`\>

---

<a id="markallmessagesasread"></a>

### markAllMessagesAsRead()

> **markAllMessagesAsRead**(): `Promise`\<`void`\>

Mark all private messages as read.

#### Returns

`Promise`\<`void`\>

---

<a id="muteuser"></a>

### muteUser()

> **muteUser**(`options`): `Promise`\<`void`\>

Mute a user in a subreddit. Muting a user prevents them from sending modmail.

#### Parameters

##### options

[`MuteUserOptions`](../type-aliases/MuteUserOptions.md)

Options for the request

#### Returns

`Promise`\<`void`\>

---

<a id="remove"></a>

### remove()

> **remove**(`id`, `isSpam`): `Promise`\<`void`\>

Remove a post or comment.

#### Parameters

##### id

`string`

The id of the post (t3*) or comment (t1*) to remove.

##### isSpam

`boolean`

Is the post or comment being removed because it's spam?

#### Returns

`Promise`\<`void`\>

#### Example

```ts
await reddit.remove('t3_123456', false);
await reddit.remove('t1_123456', true);
```

---

<a id="removeeditorfromwikipage"></a>

### removeEditorFromWikiPage()

> **removeEditorFromWikiPage**(`subredditName`, `page`, `username`): `Promise`\<`void`\>

Remove an editor from a wiki page.

#### Parameters

##### subredditName

`string`

The name of the subreddit the wiki is in.

##### page

`string`

The name of the wiki page to remove the editor from.

##### username

`string`

The username of the user to remove as an editor.

#### Returns

`Promise`\<`void`\>

---

<a id="removemoderator"></a>

### removeModerator()

> **removeModerator**(`username`, `subredditName`): `Promise`\<`void`\>

Remove a user as a moderator of a subreddit.

#### Parameters

##### username

`string`

The username of the user to remove as a moderator. e.g. 'spez'

##### subredditName

`string`

The name of the subreddit to remove the user as a moderator from. e.g. 'memes'

#### Returns

`Promise`\<`void`\>

---

<a id="removepostflair"></a>

### removePostFlair()

> **removePostFlair**(`subredditName`, `postId`): `Promise`\<`void`\>

Remove the flair for a post in a subreddit.

#### Parameters

##### subredditName

`string`

The name of the subreddit to remove the flair from.

##### postId

`string`

The ID of the post to remove the flair from.

#### Returns

`Promise`\<`void`\>

---

<a id="removeuser"></a>

### removeUser()

> **removeUser**(`username`, `subredditName`): `Promise`\<`void`\>

Remove a user's approval to post in a subreddit.

#### Parameters

##### username

`string`

The username of the user to remove approval from. e.g. 'spez'

##### subredditName

`string`

The name of the subreddit to remove the user's approval from. e.g. 'memes'

#### Returns

`Promise`\<`void`\>

---

<a id="removeuserflair"></a>

### removeUserFlair()

> **removeUserFlair**(`subredditName`, `username`): `Promise`\<`void`\>

Remove the flair for a user in a subreddit.

#### Parameters

##### subredditName

`string`

The name of the subreddit to remove the flair from.

##### username

`string`

The username of the user to remove the flair from.

#### Returns

`Promise`\<`void`\>

---

<a id="removewikicontributor"></a>

### removeWikiContributor()

> **removeWikiContributor**(`username`, `subredditName`): `Promise`\<`void`\>

Remove a user's wiki contributor status for a subreddit.

#### Parameters

##### username

`string`

The username of the user to remove wiki contributor status from. e.g. 'spez'

##### subredditName

`string`

The name of the subreddit to remove the user's wiki contributor status from. e.g. 'memes'

#### Returns

`Promise`\<`void`\>

---

<a id="reorderwidgets"></a>

### reorderWidgets()

> **reorderWidgets**(`subredditName`, `orderByIds`): `Promise`\<`void`\>

Reorder the widgets for a subreddit.

#### Parameters

##### subredditName

`string`

The name of the subreddit to reorder the widgets for.

##### orderByIds

`string`[]

An array of widget IDs in the order that they should be displayed.

#### Returns

`Promise`\<`void`\>

---

<a id="report"></a>

### report()

> **report**(`thing`, `options`): `Promise`\<`JsonStatus`\>

Report a Post or Comment

The report is sent to the moderators of the subreddit for review.

#### Parameters

##### thing

Post or Comment

[`Post`](../../models/classes/Post.md) | [`Comment`](../../models/classes/Comment.md)

##### options

Options

###### reason

`string`

Why the thing is reported

#### Returns

`Promise`\<`JsonStatus`\>

#### Example

```ts
await reddit.report(post, {
  reason: 'This is spam!',
});
```

---

<a id="revertwikipage"></a>

### revertWikiPage()

> **revertWikiPage**(`subredditName`, `page`, `revisionId`): `Promise`\<`void`\>

Revert a wiki page to a previous revision.

#### Parameters

##### subredditName

`string`

The name of the subreddit the wiki is in.

##### page

`string`

The name of the wiki page to revert.

##### revisionId

`string`

The ID of the revision to revert to.

#### Returns

`Promise`\<`void`\>

---

<a id="revokemoderatorinvite"></a>

### revokeModeratorInvite()

> **revokeModeratorInvite**(`username`, `subredditName`): `Promise`\<`void`\>

Revoke a moderator invite for a user to a subreddit.

#### Parameters

##### username

`string`

The username of the user to revoke the invite for. e.g. 'spez'

##### subredditName

`string`

The name of the subreddit to revoke the invite for. e.g. 'memes'

#### Returns

`Promise`\<`void`\>

---

<a id="sendprivatemessage"></a>

### sendPrivateMessage()

> **sendPrivateMessage**(`options`): `Promise`\<`void`\>

Sends a private message to a user.

#### Parameters

##### options

[`SendPrivateMessageOptions`](../../models/type-aliases/SendPrivateMessageOptions.md)

The options for sending the message.

#### Returns

`Promise`\<`void`\>

A Promise that resolves if the private message was successfully sent.

---

<a id="sendprivatemessageassubreddit"></a>

### sendPrivateMessageAsSubreddit()

> **sendPrivateMessageAsSubreddit**(`options`): `Promise`\<`void`\>

Sends a private message to a user on behalf of a subreddit.

#### Parameters

##### options

[`SendPrivateMessageAsSubredditOptions`](../../models/type-aliases/SendPrivateMessageAsSubredditOptions.md)

The options for sending the message as a subreddit.

#### Returns

`Promise`\<`void`\>

A Promise that resolves if the private message was successfully sent.

---

<a id="setmoderatorpermissions"></a>

### setModeratorPermissions()

> **setModeratorPermissions**(`username`, `subredditName`, `permissions`): `Promise`\<`void`\>

Update the permissions of a moderator of a subreddit.

#### Parameters

##### username

`string`

The username of the user to update the permissions for. e.g. 'spez'

##### subredditName

`string`

The name of the subreddit. e.g. 'memes'

##### permissions

[`ModeratorPermission`](../../models/type-aliases/ModeratorPermission.md)[]

The permissions to give the user. e.g ['posts', 'wiki']

#### Returns

`Promise`\<`void`\>

---

<a id="setpostflair"></a>

### setPostFlair()

> **setPostFlair**(`options`): `Promise`\<`void`\>

Set the flair for a post in a subreddit.

#### Parameters

##### options

[`SetPostFlairOptions`](../../models/type-aliases/SetPostFlairOptions.md)

Options for the request

#### Returns

`Promise`\<`void`\>

---

<a id="setuserflair"></a>

### setUserFlair()

> **setUserFlair**(`options`): `Promise`\<`void`\>

Set the flair for a user in a subreddit.

#### Parameters

##### options

[`SetUserFlairOptions`](../../models/type-aliases/SetUserFlairOptions.md)

Options for the request

#### Returns

`Promise`\<`void`\>

---

<a id="setuserflairbatch"></a>

### setUserFlairBatch()

> **setUserFlairBatch**(`subredditName`, `flairs`): `Promise`\<`FlairCsvResult`[]\>

Set the flair of multiple users in the same subreddit with a single API call.
Can process up to 100 entries at once.

#### Parameters

##### subredditName

`string`

The name of the subreddit to edit flairs in.

##### flairs

[`SetUserFlairBatchConfig`](../../models/type-aliases/SetUserFlairBatchConfig.md)[]

Array of user flair configuration objects. If both text and cssClass are empty for a given user the flair will be cleared.

#### Returns

`Promise`\<`FlairCsvResult`[]\>

- Array of statuses for each entry provided.

---

<a id="submitcomment"></a>

### submitComment()

> **submitComment**(`options`): `Promise`\<[`Comment`](../../models/classes/Comment.md)\>

Submit a new comment to a post or comment.

#### Parameters

##### options

[`CommentSubmissionOptions`](../../models/type-aliases/CommentSubmissionOptions.md) & `object`

You must provide either `options.text` or `options.richtext` but not both.

#### Returns

`Promise`\<[`Comment`](../../models/classes/Comment.md)\>

A Promise that resolves to a Comment object.

#### Example

```ts
import { RunAs } from '@devvit/public-api';

const comment = await reddit.submitComment({
  id: 't1_1qgif',
  text: 'Hello world!',
  runAs: RunAs.APP,
});
```

---

<a id="submitpost"></a>

### submitPost()

> **submitPost**(`options`): `Promise`\<[`Post`](../../models/classes/Post.md)\>

Submits a new post to a subreddit.

#### Parameters

##### options

[`SubmitPostOptions`](../../models/type-aliases/SubmitPostOptions.md)

Either a self post or a link post.

#### Returns

`Promise`\<[`Post`](../../models/classes/Post.md)\>

A Promise that resolves to a Post object.

#### Examples

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

By default, `submitPost()` creates a Post on behalf of the App account, but it may be called on behalf of the User making the request by setting the option `runAs: RunAs.USER`.
When using `runAs: RunAs.USER` to create an experience Post, you must specify the `userGeneratedContent` option. For example:

```ts
import { RunAs } from '@devvit/public-api';

const post = await reddit.submitPost({
 title: 'My Devvit Post',
 runAs: RunAs.USER,
 userGeneratedContent: {
   text: "hello there",
   imageUrls: ["https://styles.redditmedia.com/t5_5wa5ww/styles/communityIcon_wyopomb2xb0a1.png", "https://styles.redditmedia.com/t5_49fkib/styles/bannerBackgroundImage_5a4axis7cku61.png"]
   },
 subredditName: await reddit.getCurrentSubredditName(),
 textFallback: {
   text: 'This is a Devvit post!',
 },
 preview: (
   <vstack height="100%" width="100%" alignment="middle center">
     <text size="large">Loading...</text>
   </vstack>
 ),
});
```

---

<a id="subscribetocurrentsubreddit"></a>

### subscribeToCurrentSubreddit()

> **subscribeToCurrentSubreddit**(): `Promise`\<`void`\>

Subscribes to the subreddit in which the app is installed. No-op if the user is already subscribed.
This method will execute as the app account by default.
To subscribe on behalf of a user, please contact Reddit.

#### Returns

`Promise`\<`void`\>

---

<a id="unbanuser"></a>

### unbanUser()

> **unbanUser**(`username`, `subredditName`): `Promise`\<`void`\>

Unban a user from a subreddit.

#### Parameters

##### username

`string`

The username of the user to unban. e.g. 'spez'

##### subredditName

`string`

The name of the subreddit to unban the user from. e.g. 'memes'

#### Returns

`Promise`\<`void`\>

---

<a id="unbanwikicontributor"></a>

### unbanWikiContributor()

> **unbanWikiContributor**(`username`, `subredditName`): `Promise`\<`void`\>

#### Parameters

##### username

`string`

The username of the user to unban. e.g. 'spez'

##### subredditName

`string`

The name of the subreddit to unban the user from contributing to the wiki on. e.g. 'memes'

#### Returns

`Promise`\<`void`\>

---

<a id="unmuteuser"></a>

### unmuteUser()

> **unmuteUser**(`username`, `subredditName`): `Promise`\<`void`\>

Unmute a user in a subreddit. Unmuting a user allows them to send modmail.

#### Parameters

##### username

`string`

The username of the user to unmute. e.g. 'spez'

##### subredditName

`string`

The name of the subreddit to unmute the user in. e.g. 'memes'

#### Returns

`Promise`\<`void`\>

---

<a id="unsubscribefromcurrentsubreddit"></a>

### unsubscribeFromCurrentSubreddit()

> **unsubscribeFromCurrentSubreddit**(): `Promise`\<`void`\>

Unsubscribes from the subreddit in which the app is installed. No-op if the user isn't subscribed.
This method will execute as the app account by default.
To unsubscribe on behalf of a user, please contact Reddit.

#### Returns

`Promise`\<`void`\>

---

<a id="updatewikipage"></a>

### updateWikiPage()

> **updateWikiPage**(`options`): `Promise`\<[`WikiPage`](../../models/classes/WikiPage.md)\>

Update a wiki page.

#### Parameters

##### options

[`UpdateWikiPageOptions`](../../models/type-aliases/UpdateWikiPageOptions.md)

Options for the request

#### Returns

`Promise`\<[`WikiPage`](../../models/classes/WikiPage.md)\>

The updated WikiPage object.

---

<a id="updatewikipagesettings"></a>

### updateWikiPageSettings()

> **updateWikiPageSettings**(`options`): `Promise`\<[`WikiPageSettings`](../../models/classes/WikiPageSettings.md)\>

Update the settings for a wiki page.

#### Parameters

##### options

[`UpdatePageSettingsOptions`](../../models/type-aliases/UpdatePageSettingsOptions.md)

Options for the request

#### Returns

`Promise`\<[`WikiPageSettings`](../../models/classes/WikiPageSettings.md)\>

A WikiPageSettings object.
