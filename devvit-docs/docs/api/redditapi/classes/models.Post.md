# Class: Post

[models](../modules/models.md).Post

## Table of contents

### Accessors

- [approved](models.Post.md#approved)
- [approvedAtUtc](models.Post.md#approvedatutc)
- [archived](models.Post.md#archived)
- [authorId](models.Post.md#authorid)
- [authorName](models.Post.md#authorname)
- [bannedAtUtc](models.Post.md#bannedatutc)
- [body](models.Post.md#body)
- [bodyHtml](models.Post.md#bodyhtml)
- [comments](models.Post.md#comments)
- [createdAt](models.Post.md#createdat)
- [distinguishedBy](models.Post.md#distinguishedby)
- [edited](models.Post.md#edited)
- [flair](models.Post.md#flair)
- [hidden](models.Post.md#hidden)
- [id](models.Post.md#id)
- [ignoringReports](models.Post.md#ignoringreports)
- [locked](models.Post.md#locked)
- [modReportReasons](models.Post.md#modreportreasons)
- [nsfw](models.Post.md#nsfw)
- [numberOfComments](models.Post.md#numberofcomments)
- [numberOfReports](models.Post.md#numberofreports)
- [permalink](models.Post.md#permalink)
- [quarantined](models.Post.md#quarantined)
- [removed](models.Post.md#removed)
- [removedBy](models.Post.md#removedby)
- [removedByCategory](models.Post.md#removedbycategory)
- [score](models.Post.md#score)
- [secureMedia](models.Post.md#securemedia)
- [spam](models.Post.md#spam)
- [spoiler](models.Post.md#spoiler)
- [stickied](models.Post.md#stickied)
- [subredditId](models.Post.md#subredditid)
- [subredditName](models.Post.md#subredditname)
- [thumbnail](models.Post.md#thumbnail)
- [title](models.Post.md#title)
- [url](models.Post.md#url)
- [userReportReasons](models.Post.md#userreportreasons)

### Methods

- [addComment](models.Post.md#addcomment)
- [addRemovalNote](models.Post.md#addremovalnote)
- [approve](models.Post.md#approve)
- [crosspost](models.Post.md#crosspost)
- [delete](models.Post.md#delete)
- [distinguish](models.Post.md#distinguish)
- [distinguishAsAdmin](models.Post.md#distinguishasadmin)
- [edit](models.Post.md#edit)
- [getAuthor](models.Post.md#getauthor)
- [getEnrichedThumbnail](models.Post.md#getenrichedthumbnail)
- [hide](models.Post.md#hide)
- [ignoreReports](models.Post.md#ignorereports)
- [isApproved](models.Post.md#isapproved)
- [isArchived](models.Post.md#isarchived)
- [isDistinguishedBy](models.Post.md#isdistinguishedby)
- [isEdited](models.Post.md#isedited)
- [isHidden](models.Post.md#ishidden)
- [isIgnoringReports](models.Post.md#isignoringreports)
- [isLocked](models.Post.md#islocked)
- [isNsfw](models.Post.md#isnsfw)
- [isQuarantined](models.Post.md#isquarantined)
- [isRemoved](models.Post.md#isremoved)
- [isSpam](models.Post.md#isspam)
- [isSpoiler](models.Post.md#isspoiler)
- [isStickied](models.Post.md#isstickied)
- [lock](models.Post.md#lock)
- [markAsNsfw](models.Post.md#markasnsfw)
- [markAsSpoiler](models.Post.md#markasspoiler)
- [remove](models.Post.md#remove)
- [setCustomPostPreview](models.Post.md#setcustompostpreview)
- [setSuggestedCommentSort](models.Post.md#setsuggestedcommentsort)
- [setTextFallback](models.Post.md#settextfallback)
- [sticky](models.Post.md#sticky)
- [toJSON](models.Post.md#tojson)
- [undistinguish](models.Post.md#undistinguish)
- [unhide](models.Post.md#unhide)
- [unignoreReports](models.Post.md#unignorereports)
- [unlock](models.Post.md#unlock)
- [unmarkAsNsfw](models.Post.md#unmarkasnsfw)
- [unmarkAsSpoiler](models.Post.md#unmarkasspoiler)
- [unsticky](models.Post.md#unsticky)

## Accessors

### <a id="approved" name="approved"></a> approved

• `get` **approved**(): `boolean`

#### Returns

`boolean`

---

### <a id="approvedatutc" name="approvedatutc"></a> approvedAtUtc

• `get` **approvedAtUtc**(): `number`

#### Returns

`number`

---

### <a id="archived" name="archived"></a> archived

• `get` **archived**(): `boolean`

#### Returns

`boolean`

---

### <a id="authorid" name="authorid"></a> authorId

• `get` **authorId**(): `undefined` \| \`t2\_$\{string}\`

#### Returns

`undefined` \| \`t2\_$\{string}\`

---

### <a id="authorname" name="authorname"></a> authorName

• `get` **authorName**(): `string`

#### Returns

`string`

---

### <a id="bannedatutc" name="bannedatutc"></a> bannedAtUtc

• `get` **bannedAtUtc**(): `number`

#### Returns

`number`

---

### <a id="body" name="body"></a> body

• `get` **body**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

---

### <a id="bodyhtml" name="bodyhtml"></a> bodyHtml

• `get` **bodyHtml**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

---

### <a id="comments" name="comments"></a> comments

• `get` **comments**(): [`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

#### Returns

[`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

---

### <a id="createdat" name="createdat"></a> createdAt

• `get` **createdAt**(): `Date`

#### Returns

`Date`

---

### <a id="distinguishedby" name="distinguishedby"></a> distinguishedBy

• `get` **distinguishedBy**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

---

### <a id="edited" name="edited"></a> edited

• `get` **edited**(): `boolean`

#### Returns

`boolean`

---

### <a id="flair" name="flair"></a> flair

• `get` **flair**(): `undefined` \| [`LinkFlair`](../modules/models.md#linkflair)

#### Returns

`undefined` \| [`LinkFlair`](../modules/models.md#linkflair)

---

### <a id="hidden" name="hidden"></a> hidden

• `get` **hidden**(): `boolean`

#### Returns

`boolean`

---

### <a id="id" name="id"></a> id

• `get` **id**(): \`t3\_$\{string}\`

#### Returns

\`t3\_$\{string}\`

---

### <a id="ignoringreports" name="ignoringreports"></a> ignoringReports

• `get` **ignoringReports**(): `boolean`

#### Returns

`boolean`

---

### <a id="locked" name="locked"></a> locked

• `get` **locked**(): `boolean`

#### Returns

`boolean`

---

### <a id="modreportreasons" name="modreportreasons"></a> modReportReasons

• `get` **modReportReasons**(): `string`[]

#### Returns

`string`[]

---

### <a id="nsfw" name="nsfw"></a> nsfw

• `get` **nsfw**(): `boolean`

#### Returns

`boolean`

---

### <a id="numberofcomments" name="numberofcomments"></a> numberOfComments

• `get` **numberOfComments**(): `number`

#### Returns

`number`

---

### <a id="numberofreports" name="numberofreports"></a> numberOfReports

• `get` **numberOfReports**(): `number`

#### Returns

`number`

---

### <a id="permalink" name="permalink"></a> permalink

• `get` **permalink**(): `string`

#### Returns

`string`

---

### <a id="quarantined" name="quarantined"></a> quarantined

• `get` **quarantined**(): `boolean`

#### Returns

`boolean`

---

### <a id="removed" name="removed"></a> removed

• `get` **removed**(): `boolean`

#### Returns

`boolean`

---

### <a id="removedby" name="removedby"></a> removedBy

• `get` **removedBy**(): `undefined` \| `string`

Who removed this object (username)

#### Returns

`undefined` \| `string`

---

### <a id="removedbycategory" name="removedbycategory"></a> removedByCategory

• `get` **removedByCategory**(): `undefined` \| `string`

who/what removed this object. It will return one of the following:

- "anti_evil_ops": object is removed by a aeops member
- "author": object is removed by author of the post
- "automod_filtered": object is filtered by automod
- "community_ops": object is removed by a community team member
- "content_takedown": object is removed due to content violation
- "copyright_takedown": object is removed due to copyright violation
- "deleted": object is deleted
- "moderator": object is removed by a mod of the sub
- "reddit": object is removed by anyone else
- undefined: object is not removed

#### Returns

`undefined` \| `string`

---

### <a id="score" name="score"></a> score

• `get` **score**(): `number`

#### Returns

`number`

---

### <a id="securemedia" name="securemedia"></a> secureMedia

• `get` **secureMedia**(): `undefined` \| [`SecureMedia`](../modules/models.md#securemedia)

#### Returns

`undefined` \| [`SecureMedia`](../modules/models.md#securemedia)

---

### <a id="spam" name="spam"></a> spam

• `get` **spam**(): `boolean`

#### Returns

`boolean`

---

### <a id="spoiler" name="spoiler"></a> spoiler

• `get` **spoiler**(): `boolean`

#### Returns

`boolean`

---

### <a id="stickied" name="stickied"></a> stickied

• `get` **stickied**(): `boolean`

#### Returns

`boolean`

---

### <a id="subredditid" name="subredditid"></a> subredditId

• `get` **subredditId**(): \`t5\_$\{string}\`

#### Returns

\`t5\_$\{string}\`

---

### <a id="subredditname" name="subredditname"></a> subredditName

• `get` **subredditName**(): `string`

#### Returns

`string`

---

### <a id="thumbnail" name="thumbnail"></a> thumbnail

• `get` **thumbnail**(): `undefined` \| \{ `height`: `number` ; `url`: `string` ; `width`: `number` }

#### Returns

`undefined` \| \{ `height`: `number` ; `url`: `string` ; `width`: `number` }

---

### <a id="title" name="title"></a> title

• `get` **title**(): `string`

#### Returns

`string`

---

### <a id="url" name="url"></a> url

• `get` **url**(): `string`

#### Returns

`string`

---

### <a id="userreportreasons" name="userreportreasons"></a> userReportReasons

• `get` **userReportReasons**(): `string`[]

#### Returns

`string`[]

## Methods

### <a id="addcomment" name="addcomment"></a> addComment

▸ **addComment**(`options`): `Promise`\<[`Comment`](models.Comment.md)\>

#### Parameters

| Name      | Type                                                                        |
| :-------- | :-------------------------------------------------------------------------- |
| `options` | [`CommentSubmissionOptions`](../modules/models.md#commentsubmissionoptions) |

#### Returns

`Promise`\<[`Comment`](models.Comment.md)\>

---

### <a id="addremovalnote" name="addremovalnote"></a> addRemovalNote

▸ **addRemovalNote**(`options`): `Promise`\<`void`\>

Add a mod note for why the post was removed

#### Parameters

| Name               | Type     | Description                                                                          |
| :----------------- | :------- | :----------------------------------------------------------------------------------- |
| `options`          | `Object` | -                                                                                    |
| `options.modNote?` | `string` | the reason for removal (maximum 100 characters) (optional)                           |
| `options.reasonId` | `string` | id of a Removal Reason - you can leave this as an empty string if you don't have one |

#### Returns

`Promise`\<`void`\>

---

### <a id="approve" name="approve"></a> approve

▸ **approve**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="crosspost" name="crosspost"></a> crosspost

▸ **crosspost**(`options`): `Promise`\<[`Post`](models.Post.md)\>

#### Parameters

| Name      | Type                                                                              |
| :-------- | :-------------------------------------------------------------------------------- |
| `options` | `Omit`\<[`CrosspostOptions`](../modules/models.md#crosspostoptions), `"postId"`\> |

#### Returns

`Promise`\<[`Post`](models.Post.md)\>

---

### <a id="delete" name="delete"></a> delete

▸ **delete**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="distinguish" name="distinguish"></a> distinguish

▸ **distinguish**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="distinguishasadmin" name="distinguishasadmin"></a> distinguishAsAdmin

▸ **distinguishAsAdmin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="edit" name="edit"></a> edit

▸ **edit**(`options`): `Promise`\<`void`\>

#### Parameters

| Name      | Type                                                      |
| :-------- | :-------------------------------------------------------- |
| `options` | [`PostTextOptions`](../modules/models.md#posttextoptions) |

#### Returns

`Promise`\<`void`\>

---

### <a id="getauthor" name="getauthor"></a> getAuthor

▸ **getAuthor**(): `Promise`\<`undefined` \| [`User`](models.User.md)\>

#### Returns

`Promise`\<`undefined` \| [`User`](models.User.md)\>

---

### <a id="getenrichedthumbnail" name="getenrichedthumbnail"></a> getEnrichedThumbnail

▸ **getEnrichedThumbnail**(): `Promise`\<`undefined` \| [`EnrichedThumbnail`](../modules/models.md#enrichedthumbnail)\>

Get a thumbnail that contains a preview image and also contains a blurred preview for
NSFW images. The thumbnail returned has higher resolution than Post.thumbnail.
Returns undefined if the post doesn't have a thumbnail

#### Returns

`Promise`\<`undefined` \| [`EnrichedThumbnail`](../modules/models.md#enrichedthumbnail)\>

**`Throws`**

Throws an error if the thumbnail could not be fetched

**`Example`**

```ts
// from a menu action, form, scheduler, trigger, custom post click event, etc
const post = await context.reddit.getPostById(context.postId);
const enrichedThumbnail = await post.getEnrichedThumbnail();
```

---

### <a id="hide" name="hide"></a> hide

▸ **hide**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="ignorereports" name="ignorereports"></a> ignoreReports

▸ **ignoreReports**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="isapproved" name="isapproved"></a> isApproved

▸ **isApproved**(): `boolean`

#### Returns

`boolean`

---

### <a id="isarchived" name="isarchived"></a> isArchived

▸ **isArchived**(): `boolean`

#### Returns

`boolean`

---

### <a id="isdistinguishedby" name="isdistinguishedby"></a> isDistinguishedBy

▸ **isDistinguishedBy**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

---

### <a id="isedited" name="isedited"></a> isEdited

▸ **isEdited**(): `boolean`

#### Returns

`boolean`

---

### <a id="ishidden" name="ishidden"></a> isHidden

▸ **isHidden**(): `boolean`

#### Returns

`boolean`

---

### <a id="isignoringreports" name="isignoringreports"></a> isIgnoringReports

▸ **isIgnoringReports**(): `boolean`

#### Returns

`boolean`

---

### <a id="islocked" name="islocked"></a> isLocked

▸ **isLocked**(): `boolean`

#### Returns

`boolean`

---

### <a id="isnsfw" name="isnsfw"></a> isNsfw

▸ **isNsfw**(): `boolean`

#### Returns

`boolean`

---

### <a id="isquarantined" name="isquarantined"></a> isQuarantined

▸ **isQuarantined**(): `boolean`

#### Returns

`boolean`

---

### <a id="isremoved" name="isremoved"></a> isRemoved

▸ **isRemoved**(): `boolean`

#### Returns

`boolean`

---

### <a id="isspam" name="isspam"></a> isSpam

▸ **isSpam**(): `boolean`

#### Returns

`boolean`

---

### <a id="isspoiler" name="isspoiler"></a> isSpoiler

▸ **isSpoiler**(): `boolean`

#### Returns

`boolean`

---

### <a id="isstickied" name="isstickied"></a> isStickied

▸ **isStickied**(): `boolean`

#### Returns

`boolean`

---

### <a id="lock" name="lock"></a> lock

▸ **lock**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="markasnsfw" name="markasnsfw"></a> markAsNsfw

▸ **markAsNsfw**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="markasspoiler" name="markasspoiler"></a> markAsSpoiler

▸ **markAsSpoiler**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="remove" name="remove"></a> remove

▸ **remove**(`isSpam?`): `Promise`\<`void`\>

#### Parameters

| Name     | Type      | Default value |
| :------- | :-------- | :------------ |
| `isSpam` | `boolean` | `false`       |

#### Returns

`Promise`\<`void`\>

---

### <a id="setcustompostpreview" name="setcustompostpreview"></a> setCustomPostPreview

▸ **setCustomPostPreview**(`ui`): `Promise`\<`void`\>

Set a lightweight UI that shows while the custom post renders

#### Parameters

| Name | Type                | Description                                                       |
| :--- | :------------------ | :---------------------------------------------------------------- |
| `ui` | `ComponentFunction` | A JSX component function that returns a simple ui to be rendered. |

#### Returns

`Promise`\<`void`\>

**`Throws`**

Throws an error if the preview could not be set.

**`Example`**

```ts
const preview = (
  <vstack height="100%" width="100%" alignment="middle center">
    <text size="large">An updated preview!</text>
  </vstack>
);
const post = await reddit.getPostById(context.postId);
await post.setCustomPostPreview(() => preview);
```

---

### <a id="setsuggestedcommentsort" name="setsuggestedcommentsort"></a> setSuggestedCommentSort

▸ **setSuggestedCommentSort**(`suggestedSort`): `Promise`\<`void`\>

Set the suggested sort for comments on a Post.

#### Parameters

| Name            | Type                                                                        |
| :-------------- | :-------------------------------------------------------------------------- |
| `suggestedSort` | [`PostSuggestedCommentSort`](../modules/models.md#postsuggestedcommentsort) |

#### Returns

`Promise`\<`void`\>

**`Throws`**

Throws an error if the suggested sort could not be set.

**`Example`**

```ts
const post = await reddit.getPostById(context.postId);
await post.setSuggestedCommentSort('NEW');
```

---

### <a id="settextfallback" name="settextfallback"></a> setTextFallback

▸ **setTextFallback**(`options`): `Promise`\<`void`\>

Set a text fallback for the custom post

#### Parameters

| Name      | Type                                                                                  | Description                                  |
| :-------- | :------------------------------------------------------------------------------------ | :------------------------------------------- |
| `options` | [`CustomPostTextFallbackOptions`](../modules/models.md#customposttextfallbackoptions) | A text or a richtext to render in a fallback |

#### Returns

`Promise`\<`void`\>

**`Throws`**

Throws an error if the fallback could not be set.

**`Example`**

```ts
// from a menu action, form, scheduler, trigger, custom post click event, etc
const newTextFallback = { text: 'This is an updated text fallback' };
const post = await context.reddit.getPostById(context.postId);
await post.setTextFallback(newTextFallback);
```

---

### <a id="sticky" name="sticky"></a> sticky

▸ **sticky**(`position?`): `Promise`\<`void`\>

#### Parameters

| Name        | Type                     |
| :---------- | :----------------------- |
| `position?` | `1` \| `3` \| `4` \| `2` |

#### Returns

`Promise`\<`void`\>

---

### <a id="tojson" name="tojson"></a> toJSON

▸ **toJSON**(): `Pick`\<[`Post`](models.Post.md), `"spoiler"` \| `"subredditName"` \| `"flair"` \| `"id"` \| `"score"` \| `"title"` \| `"subredditId"` \| `"url"` \| `"body"` \| `"archived"` \| `"nsfw"` \| `"quarantined"` \| `"spam"` \| `"permalink"` \| `"authorId"` \| `"authorName"` \| `"bodyHtml"` \| `"thumbnail"` \| `"numberOfComments"` \| `"numberOfReports"` \| `"createdAt"` \| `"approved"` \| `"stickied"` \| `"removed"` \| `"removedBy"` \| `"removedByCategory"` \| `"edited"` \| `"locked"` \| `"hidden"` \| `"ignoringReports"` \| `"distinguishedBy"` \| `"secureMedia"` \| `"userReportReasons"` \| `"modReportReasons"`\>

#### Returns

`Pick`\<[`Post`](models.Post.md), `"spoiler"` \| `"subredditName"` \| `"flair"` \| `"id"` \| `"score"` \| `"title"` \| `"subredditId"` \| `"url"` \| `"body"` \| `"archived"` \| `"nsfw"` \| `"quarantined"` \| `"spam"` \| `"permalink"` \| `"authorId"` \| `"authorName"` \| `"bodyHtml"` \| `"thumbnail"` \| `"numberOfComments"` \| `"numberOfReports"` \| `"createdAt"` \| `"approved"` \| `"stickied"` \| `"removed"` \| `"removedBy"` \| `"removedByCategory"` \| `"edited"` \| `"locked"` \| `"hidden"` \| `"ignoringReports"` \| `"distinguishedBy"` \| `"secureMedia"` \| `"userReportReasons"` \| `"modReportReasons"`\>

---

### <a id="undistinguish" name="undistinguish"></a> undistinguish

▸ **undistinguish**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="unhide" name="unhide"></a> unhide

▸ **unhide**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="unignorereports" name="unignorereports"></a> unignoreReports

▸ **unignoreReports**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="unlock" name="unlock"></a> unlock

▸ **unlock**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="unmarkasnsfw" name="unmarkasnsfw"></a> unmarkAsNsfw

▸ **unmarkAsNsfw**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="unmarkasspoiler" name="unmarkasspoiler"></a> unmarkAsSpoiler

▸ **unmarkAsSpoiler**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="unsticky" name="unsticky"></a> unsticky

▸ **unsticky**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
