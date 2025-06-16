[**@devvit/public-api v0.11.18-dev**](../../../../README.md)

---

# Variable: CommentReport

> **CommentReport**: `object`

## Type declaration

<a id="type"></a>

### $type

> **$type**: `"devvit.events.v1alpha.CommentReport"`

<a id="create"></a>

### create()

#### Parameters

##### base?

###### comment?

\{ `author`: `string`; `body`: `string`; `collapsedBecauseCrowdControl`: `boolean`; `createdAt`: `number`; `deleted`: `boolean`; `downvotes`: `number`; `elementTypes`: `string`[]; `gilded`: `boolean`; `hasMedia`: `boolean`; `id`: `string`; `languageCode`: `string`; `lastModifiedAt`: `number`; `numReports`: `number`; `parentId`: `string`; `permalink`: `string`; `postId`: `string`; `score`: `number`; `spam`: `boolean`; `subredditId`: `string`; `upvotes`: `number`; \}

###### comment.author?

`string`

###### comment.body?

`string`

###### comment.collapsedBecauseCrowdControl?

`boolean`

###### comment.createdAt?

`number`

###### comment.deleted?

`boolean`

###### comment.downvotes?

`number`

###### comment.elementTypes?

`string`[]

###### comment.gilded?

`boolean`

###### comment.hasMedia?

`boolean`

###### comment.id?

`string`

###### comment.languageCode?

`string`

###### comment.lastModifiedAt?

`number`

###### comment.numReports?

`number`

###### comment.parentId?

`string`

###### comment.permalink?

`string`

###### comment.postId?

`string`

###### comment.score?

`number`

###### comment.spam?

`boolean`

###### comment.subredditId?

`string`

###### comment.upvotes?

`number`

###### reason?

`string`

###### subreddit?

\{ `id`: `string`; `name`: `string`; `nsfw`: `boolean`; `permalink`: `string`; `quarantined`: `boolean`; `rating`: `SubredditRating`; `spam`: `boolean`; `subscribersCount`: `number`; `topics`: `string`[]; `type`: `SubredditType`; \}

###### subreddit.id?

`string`

###### subreddit.name?

`string`

###### subreddit.nsfw?

`boolean`

###### subreddit.permalink?

`string`

###### subreddit.quarantined?

`boolean`

###### subreddit.rating?

`SubredditRating`

###### subreddit.spam?

`boolean`

###### subreddit.subscribersCount?

`number`

###### subreddit.topics?

`string`[]

###### subreddit.type?

`SubredditType`

#### Returns

[`CommentReport`](../interfaces/CommentReport.md)

<a id="decode"></a>

### decode()

#### Parameters

##### input

`Uint8Array`\<`ArrayBufferLike`\> | `Reader`

##### length?

`number`

#### Returns

[`CommentReport`](../interfaces/CommentReport.md)

<a id="encode"></a>

### encode()

#### Parameters

##### message

[`CommentReport`](../interfaces/CommentReport.md)

##### writer?

`Writer`

#### Returns

`Writer`

<a id="fromjson"></a>

### fromJSON()

#### Parameters

##### object

`any`

#### Returns

[`CommentReport`](../interfaces/CommentReport.md)

<a id="frompartial"></a>

### fromPartial()

#### Parameters

##### object

###### comment?

\{ `author`: `string`; `body`: `string`; `collapsedBecauseCrowdControl`: `boolean`; `createdAt`: `number`; `deleted`: `boolean`; `downvotes`: `number`; `elementTypes`: `string`[]; `gilded`: `boolean`; `hasMedia`: `boolean`; `id`: `string`; `languageCode`: `string`; `lastModifiedAt`: `number`; `numReports`: `number`; `parentId`: `string`; `permalink`: `string`; `postId`: `string`; `score`: `number`; `spam`: `boolean`; `subredditId`: `string`; `upvotes`: `number`; \}

###### comment.author?

`string`

###### comment.body?

`string`

###### comment.collapsedBecauseCrowdControl?

`boolean`

###### comment.createdAt?

`number`

###### comment.deleted?

`boolean`

###### comment.downvotes?

`number`

###### comment.elementTypes?

`string`[]

###### comment.gilded?

`boolean`

###### comment.hasMedia?

`boolean`

###### comment.id?

`string`

###### comment.languageCode?

`string`

###### comment.lastModifiedAt?

`number`

###### comment.numReports?

`number`

###### comment.parentId?

`string`

###### comment.permalink?

`string`

###### comment.postId?

`string`

###### comment.score?

`number`

###### comment.spam?

`boolean`

###### comment.subredditId?

`string`

###### comment.upvotes?

`number`

###### reason?

`string`

###### subreddit?

\{ `id`: `string`; `name`: `string`; `nsfw`: `boolean`; `permalink`: `string`; `quarantined`: `boolean`; `rating`: `SubredditRating`; `spam`: `boolean`; `subscribersCount`: `number`; `topics`: `string`[]; `type`: `SubredditType`; \}

###### subreddit.id?

`string`

###### subreddit.name?

`string`

###### subreddit.nsfw?

`boolean`

###### subreddit.permalink?

`string`

###### subreddit.quarantined?

`boolean`

###### subreddit.rating?

`SubredditRating`

###### subreddit.spam?

`boolean`

###### subreddit.subscribersCount?

`number`

###### subreddit.topics?

`string`[]

###### subreddit.type?

`SubredditType`

#### Returns

[`CommentReport`](../interfaces/CommentReport.md)

<a id="tojson"></a>

### toJSON()

#### Parameters

##### message

[`CommentReport`](../interfaces/CommentReport.md)

#### Returns

`unknown`
