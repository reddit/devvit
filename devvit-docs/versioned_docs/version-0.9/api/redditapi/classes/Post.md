# Class: Post

## Table of contents

### Constructors

- [constructor](Post.md#constructor)

### Accessors

- [approved](Post.md#approved)
- [archived](Post.md#archived)
- [authorId](Post.md#authorid)
- [authorName](Post.md#authorname)
- [body](Post.md#body)
- [comments](Post.md#comments)
- [createdAt](Post.md#createdat)
- [distinguishedBy](Post.md#distinguishedby)
- [edited](Post.md#edited)
- [hidden](Post.md#hidden)
- [id](Post.md#id)
- [ignoringReports](Post.md#ignoringreports)
- [locked](Post.md#locked)
- [nsfw](Post.md#nsfw)
- [numberOfComments](Post.md#numberofcomments)
- [numberOfReports](Post.md#numberofreports)
- [permalink](Post.md#permalink)
- [quarantined](Post.md#quarantined)
- [removed](Post.md#removed)
- [score](Post.md#score)
- [spam](Post.md#spam)
- [spoiler](Post.md#spoiler)
- [stickied](Post.md#stickied)
- [subredditId](Post.md#subredditid)
- [subredditName](Post.md#subredditname)
- [thumbnail](Post.md#thumbnail)
- [title](Post.md#title)
- [url](Post.md#url)

### Methods

- [addComment](Post.md#addcomment)
- [approve](Post.md#approve)
- [crosspost](Post.md#crosspost)
- [delete](Post.md#delete)
- [distinguish](Post.md#distinguish)
- [distinguishAsAdmin](Post.md#distinguishasadmin)
- [edit](Post.md#edit)
- [getAuthor](Post.md#getauthor)
- [hide](Post.md#hide)
- [ignoreReports](Post.md#ignorereports)
- [isApproved](Post.md#isapproved)
- [isArchived](Post.md#isarchived)
- [isDistinguishedBy](Post.md#isdistinguishedby)
- [isEdited](Post.md#isedited)
- [isHidden](Post.md#ishidden)
- [isIgnoringReports](Post.md#isignoringreports)
- [isLocked](Post.md#islocked)
- [isNsfw](Post.md#isnsfw)
- [isQuarantined](Post.md#isquarantined)
- [isRemoved](Post.md#isremoved)
- [isSpam](Post.md#isspam)
- [isSpoiler](Post.md#isspoiler)
- [isStickied](Post.md#isstickied)
- [lock](Post.md#lock)
- [markAsNsfw](Post.md#markasnsfw)
- [markAsSpoiler](Post.md#markasspoiler)
- [remove](Post.md#remove)
- [sticky](Post.md#sticky)
- [toJSON](Post.md#tojson)
- [undistinguish](Post.md#undistinguish)
- [unhide](Post.md#unhide)
- [unignoreReports](Post.md#unignorereports)
- [unlock](Post.md#unlock)
- [unmarkAsNsfw](Post.md#unmarkasnsfw)
- [unmarkAsSpoiler](Post.md#unmarkasspoiler)
- [unsticky](Post.md#unsticky)
- [approve](Post.md#approve-1)
- [crosspost](Post.md#crosspost-1)
- [delete](Post.md#delete-1)
- [distinguish](Post.md#distinguish-1)
- [edit](Post.md#edit-1)
- [getById](Post.md#getbyid)
- [getControversialPosts](Post.md#getcontroversialposts)
- [getHotPosts](Post.md#gethotposts)
- [getNewPosts](Post.md#getnewposts)
- [getPostsByUser](Post.md#getpostsbyuser)
- [getRisingPosts](Post.md#getrisingposts)
- [getSortedPosts](Post.md#getsortedposts)
- [getTopPosts](Post.md#gettopposts)
- [hide](Post.md#hide-1)
- [ignoreReports](Post.md#ignorereports-1)
- [lock](Post.md#lock-1)
- [markAsNsfw](Post.md#markasnsfw-1)
- [markAsSpoiler](Post.md#markasspoiler-1)
- [remove](Post.md#remove-1)
- [sticky](Post.md#sticky-1)
- [submit](Post.md#submit)
- [undistinguish](Post.md#undistinguish-1)
- [unhide](Post.md#unhide-1)
- [unignoreReports](Post.md#unignorereports-1)
- [unlock](Post.md#unlock-1)
- [unmarkAsNsfw](Post.md#unmarkasnsfw-1)
- [unmarkAsSpoiler](Post.md#unmarkasspoiler-1)
- [unsticky](Post.md#unsticky-1)

## Constructors

### constructor

• **new Post**(`data`, `metadata?`)

#### Parameters

| Name        | Type           |
| :---------- | :------------- |
| `data`      | `RedditObject` |
| `metadata?` | `Metadata`     |

## Accessors

### approved

• `get` **approved**(): `boolean`

#### Returns

`boolean`

---

### archived

• `get` **archived**(): `boolean`

#### Returns

`boolean`

---

### authorId

• `get` **authorId**(): \`t2\_$\{string}\`

#### Returns

\`t2\_$\{string}\`

---

### authorName

• `get` **authorName**(): `string`

#### Returns

`string`

---

### body

• `get` **body**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

---

### comments

• `get` **comments**(): [`Listing`](Listing.md)\< [`Comment`](Comment.md)\>

#### Returns

[`Listing`](Listing.md)\< [`Comment`](Comment.md)\>

---

### createdAt

• `get` **createdAt**(): `Date`

#### Returns

`Date`

---

### distinguishedBy

• `get` **distinguishedBy**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

---

### edited

• `get` **edited**(): `boolean`

#### Returns

`boolean`

---

### hidden

• `get` **hidden**(): `boolean`

#### Returns

`boolean`

---

### id

• `get` **id**(): \`t3\_$\{string}\`

#### Returns

\`t3\_$\{string}\`

---

### ignoringReports

• `get` **ignoringReports**(): `boolean`

#### Returns

`boolean`

---

### locked

• `get` **locked**(): `boolean`

#### Returns

`boolean`

---

### nsfw

• `get` **nsfw**(): `boolean`

#### Returns

`boolean`

---

### numberOfComments

• `get` **numberOfComments**(): `number`

#### Returns

`number`

---

### numberOfReports

• `get` **numberOfReports**(): `number`

#### Returns

`number`

---

### permalink

• `get` **permalink**(): `string`

#### Returns

`string`

---

### quarantined

• `get` **quarantined**(): `boolean`

#### Returns

`boolean`

---

### removed

• `get` **removed**(): `boolean`

#### Returns

`boolean`

---

### score

• `get` **score**(): `number`

#### Returns

`number`

---

### spam

• `get` **spam**(): `boolean`

#### Returns

`boolean`

---

### spoiler

• `get` **spoiler**(): `boolean`

#### Returns

`boolean`

---

### stickied

• `get` **stickied**(): `boolean`

#### Returns

`boolean`

---

### subredditId

• `get` **subredditId**(): \`t5\_$\{string}\`

#### Returns

\`t5\_$\{string}\`

---

### subredditName

• `get` **subredditName**(): `string`

#### Returns

`string`

---

### thumbnail

• `get` **thumbnail**(): `undefined` \| \{ `height`: `number` ; `url`: `string` ; `width`: `number` }

#### Returns

`undefined` \| \{ `height`: `number` ; `url`: `string` ; `width`: `number` }

---

### title

• `get` **title**(): `string`

#### Returns

`string`

---

### url

• `get` **url**(): `string`

#### Returns

`string`

## Methods

### addComment

▸ **addComment**(`options`): `Promise`\< [`Comment`](Comment.md)\>

#### Parameters

| Name      | Type                                                                |
| :-------- | :------------------------------------------------------------------ |
| `options` | [`CommentSubmissionOptions`](../README.md#commentsubmissionoptions) |

#### Returns

`Promise`\< [`Comment`](Comment.md)\>

---

### approve

▸ **approve**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### crosspost

▸ **crosspost**(`options`): `Promise`\< [`Post`](Post.md)\>

#### Parameters

| Name      | Type                                                                           |
| :-------- | :----------------------------------------------------------------------------- |
| `options` | `Omit`\< [`CrosspostOptions`](../interfaces/CrosspostOptions.md), `"postId"`\> |

#### Returns

`Promise`\< [`Post`](Post.md)\>

---

### delete

▸ **delete**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### distinguish

▸ **distinguish**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### distinguishAsAdmin

▸ **distinguishAsAdmin**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### edit

▸ **edit**(`options`): `Promise`\< `void`\>

#### Parameters

| Name      | Type                                              |
| :-------- | :------------------------------------------------ |
| `options` | [`PostTextOptions`](../README.md#posttextoptions) |

#### Returns

`Promise`\< `void`\>

---

### getAuthor

▸ **getAuthor**(): `Promise`\< [`User`](User.md)\>

#### Returns

`Promise`\< [`User`](User.md)\>

---

### hide

▸ **hide**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### ignoreReports

▸ **ignoreReports**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### isApproved

▸ **isApproved**(): `boolean`

#### Returns

`boolean`

---

### isArchived

▸ **isArchived**(): `boolean`

#### Returns

`boolean`

---

### isDistinguishedBy

▸ **isDistinguishedBy**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

---

### isEdited

▸ **isEdited**(): `boolean`

#### Returns

`boolean`

---

### isHidden

▸ **isHidden**(): `boolean`

#### Returns

`boolean`

---

### isIgnoringReports

▸ **isIgnoringReports**(): `boolean`

#### Returns

`boolean`

---

### isLocked

▸ **isLocked**(): `boolean`

#### Returns

`boolean`

---

### isNsfw

▸ **isNsfw**(): `boolean`

#### Returns

`boolean`

---

### isQuarantined

▸ **isQuarantined**(): `boolean`

#### Returns

`boolean`

---

### isRemoved

▸ **isRemoved**(): `boolean`

#### Returns

`boolean`

---

### isSpam

▸ **isSpam**(): `boolean`

#### Returns

`boolean`

---

### isSpoiler

▸ **isSpoiler**(): `boolean`

#### Returns

`boolean`

---

### isStickied

▸ **isStickied**(): `boolean`

#### Returns

`boolean`

---

### lock

▸ **lock**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### markAsNsfw

▸ **markAsNsfw**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### markAsSpoiler

▸ **markAsSpoiler**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### remove

▸ **remove**(`isSpam?`): `Promise`\< `void`\>

#### Parameters

| Name     | Type      | Default value |
| :------- | :-------- | :------------ |
| `isSpam` | `boolean` | `false`       |

#### Returns

`Promise`\< `void`\>

---

### sticky

▸ **sticky**(`position?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type                     |
| :---------- | :----------------------- |
| `position?` | `2` \| `1` \| `3` \| `4` |

#### Returns

`Promise`\< `void`\>

---

### toJSON

▸ **toJSON**(): `Object`

#### Returns

`Object`

| Name               | Type                                                                         |
| :----------------- | :--------------------------------------------------------------------------- |
| `approved`         | `boolean`                                                                    |
| `archived`         | `boolean`                                                                    |
| `authorId`         | \`t2\_$\{string}\`                                                           |
| `authorName`       | `string`                                                                     |
| `body`             | `undefined` \| `string`                                                      |
| `createdAt`        | `Date`                                                                       |
| `distinguishedBy`  | `undefined` \| `string`                                                      |
| `edited`           | `boolean`                                                                    |
| `hidden`           | `boolean`                                                                    |
| `id`               | \`t3\_$\{string}\`                                                           |
| `ignoringReports`  | `boolean`                                                                    |
| `locked`           | `boolean`                                                                    |
| `nsfw`             | `boolean`                                                                    |
| `numberOfComments` | `number`                                                                     |
| `numberOfReports`  | `number`                                                                     |
| `permalink`        | `string`                                                                     |
| `quarantined`      | `boolean`                                                                    |
| `removed`          | `boolean`                                                                    |
| `score`            | `number`                                                                     |
| `spam`             | `boolean`                                                                    |
| `spoiler`          | `boolean`                                                                    |
| `stickied`         | `boolean`                                                                    |
| `subredditId`      | \`t5\_$\{string}\`                                                           |
| `subredditName`    | `string`                                                                     |
| `thumbnail`        | `undefined` \| \{ `height`: `number` ; `url`: `string` ; `width`: `number` } |
| `title`            | `string`                                                                     |
| `url`              | `string`                                                                     |

---

### undistinguish

▸ **undistinguish**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### unhide

▸ **unhide**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### unignoreReports

▸ **unignoreReports**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### unlock

▸ **unlock**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### unmarkAsNsfw

▸ **unmarkAsNsfw**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### unmarkAsSpoiler

▸ **unmarkAsSpoiler**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### unsticky

▸ **unsticky**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### approve

▸ `Static` **approve**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### crosspost

▸ `Static` **crosspost**(`options`, `metadata?`): `Promise`\< [`Post`](Post.md)\>

#### Parameters

| Name        | Type                                                    |
| :---------- | :------------------------------------------------------ |
| `options`   | [`CrosspostOptions`](../interfaces/CrosspostOptions.md) |
| `metadata?` | `Metadata`                                              |

#### Returns

`Promise`\< [`Post`](Post.md)\>

---

### delete

▸ `Static` **delete**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### distinguish

▸ `Static` **distinguish**(`id`, `asAdmin`, `metadata?`): `Promise`\< \{ `distinguishedBy`: `undefined` \| `string` = post.distinguished }\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `asAdmin`   | `boolean`          |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< \{ `distinguishedBy`: `undefined` \| `string` = post.distinguished }\>

---

### edit

▸ `Static` **edit**(`options`, `metadata?`): `Promise`\< [`Post`](Post.md)\>

#### Parameters

| Name        | Type       |
| :---------- | :--------- |
| `options`   | `Object`   |
| `metadata?` | `Metadata` |

#### Returns

`Promise`\< [`Post`](Post.md)\>

---

### getById

▸ `Static` **getById**(`id`, `metadata?`): `Promise`\< [`Post`](Post.md)\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< [`Post`](Post.md)\>

---

### getControversialPosts

▸ `Static` **getControversialPosts**(`options?`, `metadata?`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

#### Parameters

| Name        | Type                                                                            |
| :---------- | :------------------------------------------------------------------------------ |
| `options`   | [`GetPostsOptionsWithTimeframe`](../interfaces/GetPostsOptionsWithTimeframe.md) |
| `metadata?` | `Metadata`                                                                      |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

---

### getHotPosts

▸ `Static` **getHotPosts**(`options?`, `metadata?`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

#### Parameters

| Name        | Type                                                        |
| :---------- | :---------------------------------------------------------- |
| `options`   | [`GetHotPostsOptions`](../interfaces/GetHotPostsOptions.md) |
| `metadata?` | `Metadata`                                                  |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

---

### getNewPosts

▸ `Static` **getNewPosts**(`options`, `metadata?`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

#### Parameters

| Name        | Type                                                  |
| :---------- | :---------------------------------------------------- |
| `options`   | [`GetPostsOptions`](../interfaces/GetPostsOptions.md) |
| `metadata?` | `Metadata`                                            |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

---

### getPostsByUser

▸ `Static` **getPostsByUser**(`options`, `metadata?`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

#### Parameters

| Name        | Type                                                              |
| :---------- | :---------------------------------------------------------------- |
| `options`   | [`GetPostsByUserOptions`](../interfaces/GetPostsByUserOptions.md) |
| `metadata?` | `Metadata`                                                        |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

---

### getRisingPosts

▸ `Static` **getRisingPosts**(`options`, `metadata?`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

#### Parameters

| Name        | Type                                                  |
| :---------- | :---------------------------------------------------- |
| `options`   | [`GetPostsOptions`](../interfaces/GetPostsOptions.md) |
| `metadata?` | `Metadata`                                            |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

---

### getSortedPosts

▸ `Static` **getSortedPosts**(`options`, `metadata?`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

#### Parameters

| Name        | Type                                                              |
| :---------- | :---------------------------------------------------------------- |
| `options`   | [`GetSortedPostsOptions`](../interfaces/GetSortedPostsOptions.md) |
| `metadata?` | `Metadata`                                                        |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

---

### getTopPosts

▸ `Static` **getTopPosts**(`options?`, `metadata?`): [`Listing`](Listing.md)\< [`Post`](Post.md)\>

#### Parameters

| Name        | Type                                                                            |
| :---------- | :------------------------------------------------------------------------------ |
| `options`   | [`GetPostsOptionsWithTimeframe`](../interfaces/GetPostsOptionsWithTimeframe.md) |
| `metadata?` | `Metadata`                                                                      |

#### Returns

[`Listing`](Listing.md)\< [`Post`](Post.md)\>

---

### hide

▸ `Static` **hide**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### ignoreReports

▸ `Static` **ignoreReports**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### lock

▸ `Static` **lock**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### markAsNsfw

▸ `Static` **markAsNsfw**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### markAsSpoiler

▸ `Static` **markAsSpoiler**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### remove

▸ `Static` **remove**(`id`, `isSpam?`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               | Default value |
| :---------- | :----------------- | :------------ |
| `id`        | \`t3\_$\{string}\` | `undefined`   |
| `isSpam`    | `boolean`          | `false`       |
| `metadata?` | `Metadata`         | `undefined`   |

#### Returns

`Promise`\< `void`\>

---

### sticky

▸ `Static` **sticky**(`id`, `position?`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type                     |
| :---------- | :----------------------- |
| `id`        | \`t3\_$\{string}\`       |
| `position?` | `2` \| `1` \| `3` \| `4` |
| `metadata?` | `Metadata`               |

#### Returns

`Promise`\< `void`\>

---

### submit

▸ `Static` **submit**(`options`, `metadata?`): `Promise`\< [`Post`](Post.md)\>

#### Parameters

| Name        | Type                                                  |
| :---------- | :---------------------------------------------------- |
| `options`   | [`SubmitPostOptions`](../README.md#submitpostoptions) |
| `metadata?` | `Metadata`                                            |

#### Returns

`Promise`\< [`Post`](Post.md)\>

---

### undistinguish

▸ `Static` **undistinguish**(`id`, `metadata?`): `Promise`\< \{ `distinguishedBy`: `undefined` \| `string` = post.distinguished }\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< \{ `distinguishedBy`: `undefined` \| `string` = post.distinguished }\>

---

### unhide

▸ `Static` **unhide**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### unignoreReports

▸ `Static` **unignoreReports**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### unlock

▸ `Static` **unlock**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### unmarkAsNsfw

▸ `Static` **unmarkAsNsfw**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### unmarkAsSpoiler

▸ `Static` **unmarkAsSpoiler**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### unsticky

▸ `Static` **unsticky**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t3\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>
