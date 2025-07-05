[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: Post

## Accessors

<a id="approved"></a>

### approved

#### Get Signature

> **get** **approved**(): `boolean`

##### Returns

`boolean`

---

<a id="approvedatutc"></a>

### approvedAtUtc

#### Get Signature

> **get** **approvedAtUtc**(): `number`

##### Returns

`number`

---

<a id="archived"></a>

### archived

#### Get Signature

> **get** **archived**(): `boolean`

##### Returns

`boolean`

---

<a id="authorid"></a>

### authorId

#### Get Signature

> **get** **authorId**(): `undefined` \| `` `t2_${string}` ``

##### Returns

`undefined` \| `` `t2_${string}` ``

---

<a id="authorname"></a>

### authorName

#### Get Signature

> **get** **authorName**(): `string`

##### Returns

`string`

---

<a id="bannedatutc"></a>

### bannedAtUtc

#### Get Signature

> **get** **bannedAtUtc**(): `number`

##### Returns

`number`

---

<a id="body"></a>

### body

#### Get Signature

> **get** **body**(): `undefined` \| `string`

##### Returns

`undefined` \| `string`

---

<a id="bodyhtml"></a>

### bodyHtml

#### Get Signature

> **get** **bodyHtml**(): `undefined` \| `string`

##### Returns

`undefined` \| `string`

---

<a id="comments"></a>

### comments

#### Get Signature

> **get** **comments**(): [`Listing`](Listing.md)\<[`Comment`](Comment.md)\>

##### Returns

[`Listing`](Listing.md)\<[`Comment`](Comment.md)\>

---

<a id="createdat"></a>

### createdAt

#### Get Signature

> **get** **createdAt**(): `Date`

##### Returns

`Date`

---

<a id="distinguishedby"></a>

### distinguishedBy

#### Get Signature

> **get** **distinguishedBy**(): `undefined` \| `string`

##### Returns

`undefined` \| `string`

---

<a id="edited"></a>

### edited

#### Get Signature

> **get** **edited**(): `boolean`

##### Returns

`boolean`

---

<a id="flair"></a>

### flair

#### Get Signature

> **get** **flair**(): `undefined` \| [`LinkFlair`](../type-aliases/LinkFlair.md)

##### Returns

`undefined` \| [`LinkFlair`](../type-aliases/LinkFlair.md)

---

<a id="gallery"></a>

### gallery

#### Get Signature

> **get** **gallery**(): [`GalleryMedia`](../type-aliases/GalleryMedia.md)[]

Get the media in the post. Empty if the post doesn't have any media.

##### Returns

[`GalleryMedia`](../type-aliases/GalleryMedia.md)[]

---

<a id="hidden"></a>

### hidden

#### Get Signature

> **get** **hidden**(): `boolean`

##### Returns

`boolean`

---

<a id="id"></a>

### id

#### Get Signature

> **get** **id**(): `` `t3_${string}` ``

##### Returns

`` `t3_${string}` ``

---

<a id="ignoringreports"></a>

### ignoringReports

#### Get Signature

> **get** **ignoringReports**(): `boolean`

##### Returns

`boolean`

---

<a id="locked"></a>

### locked

#### Get Signature

> **get** **locked**(): `boolean`

##### Returns

`boolean`

---

<a id="modreportreasons"></a>

### modReportReasons

#### Get Signature

> **get** **modReportReasons**(): `string`[]

##### Returns

`string`[]

---

<a id="nsfw"></a>

### nsfw

#### Get Signature

> **get** **nsfw**(): `boolean`

##### Returns

`boolean`

---

<a id="numberofcomments"></a>

### numberOfComments

#### Get Signature

> **get** **numberOfComments**(): `number`

##### Returns

`number`

---

<a id="numberofreports"></a>

### numberOfReports

#### Get Signature

> **get** **numberOfReports**(): `number`

##### Returns

`number`

---

<a id="permalink"></a>

### permalink

#### Get Signature

> **get** **permalink**(): `string`

##### Returns

`string`

---

<a id="quarantined"></a>

### quarantined

#### Get Signature

> **get** **quarantined**(): `boolean`

##### Returns

`boolean`

---

<a id="removed"></a>

### removed

#### Get Signature

> **get** **removed**(): `boolean`

##### Returns

`boolean`

---

<a id="removedby"></a>

### removedBy

#### Get Signature

> **get** **removedBy**(): `undefined` \| `string`

Who removed this object (username)

##### Returns

`undefined` \| `string`

---

<a id="removedbycategory"></a>

### removedByCategory

#### Get Signature

> **get** **removedByCategory**(): `undefined` \| `string`

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

##### Returns

`undefined` \| `string`

---

<a id="score"></a>

### score

#### Get Signature

> **get** **score**(): `number`

##### Returns

`number`

---

<a id="securemedia"></a>

### secureMedia

#### Get Signature

> **get** **secureMedia**(): `undefined` \| [`SecureMedia`](../type-aliases/SecureMedia.md)

##### Returns

`undefined` \| [`SecureMedia`](../type-aliases/SecureMedia.md)

---

<a id="spam"></a>

### spam

#### Get Signature

> **get** **spam**(): `boolean`

##### Returns

`boolean`

---

<a id="spoiler"></a>

### spoiler

#### Get Signature

> **get** **spoiler**(): `boolean`

##### Returns

`boolean`

---

<a id="stickied"></a>

### stickied

#### Get Signature

> **get** **stickied**(): `boolean`

##### Returns

`boolean`

---

<a id="subredditid"></a>

### subredditId

#### Get Signature

> **get** **subredditId**(): `` `t5_${string}` ``

##### Returns

`` `t5_${string}` ``

---

<a id="subredditname"></a>

### subredditName

#### Get Signature

> **get** **subredditName**(): `string`

##### Returns

`string`

---

<a id="thumbnail"></a>

### thumbnail

#### Get Signature

> **get** **thumbnail**(): `undefined` \| \{ `height`: `number`; `url`: `string`; `width`: `number`; \}

##### Returns

`undefined` \| \{ `height`: `number`; `url`: `string`; `width`: `number`; \}

---

<a id="title"></a>

### title

#### Get Signature

> **get** **title**(): `string`

##### Returns

`string`

---

<a id="url"></a>

### url

#### Get Signature

> **get** **url**(): `string`

##### Returns

`string`

---

<a id="userreportreasons"></a>

### userReportReasons

#### Get Signature

> **get** **userReportReasons**(): `string`[]

##### Returns

`string`[]

## Methods

<a id="addcomment"></a>

### addComment()

> **addComment**(`options`): `Promise`\<[`Comment`](Comment.md)\>

#### Parameters

##### options

[`CommentSubmissionOptions`](../type-aliases/CommentSubmissionOptions.md)

#### Returns

`Promise`\<[`Comment`](Comment.md)\>

---

<a id="addremovalnote"></a>

### addRemovalNote()

> **addRemovalNote**(`options`): `Promise`\<`void`\>

Add a mod note for why the post was removed

#### Parameters

##### options

###### modNote?

`string`

the reason for removal (maximum 100 characters) (optional)

###### reasonId

`string`

id of a Removal Reason - you can leave this as an empty string if you don't have one

#### Returns

`Promise`\<`void`\>

---

<a id="approve"></a>

### approve()

> **approve**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="crosspost"></a>

### crosspost()

> **crosspost**(`options`): `Promise`\<`Post`\>

#### Parameters

##### options

`Omit`\<[`CrosspostOptions`](../type-aliases/CrosspostOptions.md), `"postId"`\>

#### Returns

`Promise`\<`Post`\>

---

<a id="delete"></a>

### delete()

> **delete**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="distinguish"></a>

### distinguish()

> **distinguish**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="distinguishasadmin"></a>

### distinguishAsAdmin()

> **distinguishAsAdmin**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="edit"></a>

### edit()

> **edit**(`options`): `Promise`\<`void`\>

#### Parameters

##### options

[`PostTextOptions`](../type-aliases/PostTextOptions.md)

#### Returns

`Promise`\<`void`\>

---

<a id="getauthor"></a>

### getAuthor()

> **getAuthor**(): `Promise`\<`undefined` \| [`User`](User.md)\>

#### Returns

`Promise`\<`undefined` \| [`User`](User.md)\>

---

<a id="getenrichedthumbnail"></a>

### getEnrichedThumbnail()

> **getEnrichedThumbnail**(): `Promise`\<`undefined` \| [`EnrichedThumbnail`](../type-aliases/EnrichedThumbnail.md)\>

Get a thumbnail that contains a preview image and also contains a blurred preview for
NSFW images. The thumbnail returned has higher resolution than Post.thumbnail.
Returns undefined if the post doesn't have a thumbnail

#### Returns

`Promise`\<`undefined` \| [`EnrichedThumbnail`](../type-aliases/EnrichedThumbnail.md)\>

#### Throws

Throws an error if the thumbnail could not be fetched

#### Example

```ts
// from a menu action, form, scheduler, trigger, custom post click event, etc
const post = await context.reddit.getPostById(context.postId);
const enrichedThumbnail = await post.getEnrichedThumbnail();
```

---

<a id="hide"></a>

### hide()

> **hide**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="ignorereports"></a>

### ignoreReports()

> **ignoreReports**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="isapproved"></a>

### isApproved()

> **isApproved**(): `boolean`

#### Returns

`boolean`

---

<a id="isarchived"></a>

### isArchived()

> **isArchived**(): `boolean`

#### Returns

`boolean`

---

<a id="isdistinguishedby"></a>

### isDistinguishedBy()

> **isDistinguishedBy**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

---

<a id="isedited"></a>

### isEdited()

> **isEdited**(): `boolean`

#### Returns

`boolean`

---

<a id="ishidden"></a>

### isHidden()

> **isHidden**(): `boolean`

#### Returns

`boolean`

---

<a id="isignoringreports"></a>

### isIgnoringReports()

> **isIgnoringReports**(): `boolean`

#### Returns

`boolean`

---

<a id="islocked"></a>

### isLocked()

> **isLocked**(): `boolean`

#### Returns

`boolean`

---

<a id="isnsfw"></a>

### isNsfw()

> **isNsfw**(): `boolean`

#### Returns

`boolean`

---

<a id="isquarantined"></a>

### isQuarantined()

> **isQuarantined**(): `boolean`

#### Returns

`boolean`

---

<a id="isremoved"></a>

### isRemoved()

> **isRemoved**(): `boolean`

#### Returns

`boolean`

---

<a id="isspam"></a>

### isSpam()

> **isSpam**(): `boolean`

#### Returns

`boolean`

---

<a id="isspoiler"></a>

### isSpoiler()

> **isSpoiler**(): `boolean`

#### Returns

`boolean`

---

<a id="isstickied"></a>

### isStickied()

> **isStickied**(): `boolean`

#### Returns

`boolean`

---

<a id="lock"></a>

### lock()

> **lock**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="markasnsfw"></a>

### markAsNsfw()

> **markAsNsfw**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="markasspoiler"></a>

### markAsSpoiler()

> **markAsSpoiler**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="remove"></a>

### remove()

> **remove**(`isSpam`): `Promise`\<`void`\>

#### Parameters

##### isSpam

`boolean` = `false`

#### Returns

`Promise`\<`void`\>

---

<a id="setcustompostpreview"></a>

### setCustomPostPreview()

> **setCustomPostPreview**(`ui`): `Promise`\<`void`\>

Set a lightweight UI that shows while the custom post renders

#### Parameters

##### ui

`ComponentFunction`

A JSX component function that returns a simple ui to be rendered.

#### Returns

`Promise`\<`void`\>

#### Throws

Throws an error if the preview could not be set.

#### Example

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

<a id="setsuggestedcommentsort"></a>

### setSuggestedCommentSort()

> **setSuggestedCommentSort**(`suggestedSort`): `Promise`\<`void`\>

Set the suggested sort for comments on a Post.

#### Parameters

##### suggestedSort

[`PostSuggestedCommentSort`](../type-aliases/PostSuggestedCommentSort.md)

#### Returns

`Promise`\<`void`\>

#### Throws

Throws an error if the suggested sort could not be set.

#### Example

```ts
const post = await reddit.getPostById(context.postId);
await post.setSuggestedCommentSort('NEW');
```

---

<a id="settextfallback"></a>

### setTextFallback()

> **setTextFallback**(`options`): `Promise`\<`void`\>

Set a text fallback for the custom post

#### Parameters

##### options

[`CustomPostTextFallbackOptions`](../type-aliases/CustomPostTextFallbackOptions.md)

A text or a richtext to render in a fallback

#### Returns

`Promise`\<`void`\>

#### Throws

Throws an error if the fallback could not be set.

#### Example

```ts
// from a menu action, form, scheduler, trigger, custom post click event, etc
const newTextFallback = { text: 'This is an updated text fallback' };
const post = await context.reddit.getPostById(context.postId);
await post.setTextFallback(newTextFallback);
```

---

<a id="sticky"></a>

### sticky()

> **sticky**(`position`?): `Promise`\<`void`\>

#### Parameters

##### position?

`1` | `2` | `3` | `4`

#### Returns

`Promise`\<`void`\>

---

<a id="tojson"></a>

### toJSON()

> **toJSON**(): `Pick`\<`Post`, `"spoiler"` \| `"subredditName"` \| `"flair"` \| `"id"` \| `"score"` \| `"title"` \| `"subredditId"` \| `"url"` \| `"body"` \| `"archived"` \| `"nsfw"` \| `"quarantined"` \| `"spam"` \| `"createdAt"` \| `"permalink"` \| `"authorId"` \| `"authorName"` \| `"bodyHtml"` \| `"thumbnail"` \| `"numberOfComments"` \| `"numberOfReports"` \| `"approved"` \| `"stickied"` \| `"removed"` \| `"removedBy"` \| `"removedByCategory"` \| `"edited"` \| `"locked"` \| `"hidden"` \| `"ignoringReports"` \| `"distinguishedBy"` \| `"secureMedia"` \| `"userReportReasons"` \| `"modReportReasons"`\>

#### Returns

`Pick`\<`Post`, `"spoiler"` \| `"subredditName"` \| `"flair"` \| `"id"` \| `"score"` \| `"title"` \| `"subredditId"` \| `"url"` \| `"body"` \| `"archived"` \| `"nsfw"` \| `"quarantined"` \| `"spam"` \| `"createdAt"` \| `"permalink"` \| `"authorId"` \| `"authorName"` \| `"bodyHtml"` \| `"thumbnail"` \| `"numberOfComments"` \| `"numberOfReports"` \| `"approved"` \| `"stickied"` \| `"removed"` \| `"removedBy"` \| `"removedByCategory"` \| `"edited"` \| `"locked"` \| `"hidden"` \| `"ignoringReports"` \| `"distinguishedBy"` \| `"secureMedia"` \| `"userReportReasons"` \| `"modReportReasons"`\>

---

<a id="undistinguish"></a>

### undistinguish()

> **undistinguish**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="unhide"></a>

### unhide()

> **unhide**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="unignorereports"></a>

### unignoreReports()

> **unignoreReports**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="unlock"></a>

### unlock()

> **unlock**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="unmarkasnsfw"></a>

### unmarkAsNsfw()

> **unmarkAsNsfw**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="unmarkasspoiler"></a>

### unmarkAsSpoiler()

> **unmarkAsSpoiler**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="unsticky"></a>

### unsticky()

> **unsticky**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
