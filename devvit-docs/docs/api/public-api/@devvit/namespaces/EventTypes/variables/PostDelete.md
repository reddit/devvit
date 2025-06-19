[**@devvit/public-api v0.11.18-dev**](../../../../README.md)

---

# Variable: PostDelete

> **PostDelete**: `object`

## Type declaration

<a id="type"></a>

### $type

> **$type**: `"devvit.events.v1alpha.PostDelete"`

<a id="create"></a>

### create()

#### Parameters

##### base?

###### author?

\{ `banned`: `boolean`; `description`: `string`; `flair`: \{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}; `iconImage`: `string`; `id`: `string`; `isGold`: `boolean`; `karma`: `number`; `name`: `string`; `snoovatarImage`: `string`; `spam`: `boolean`; `suspended`: `boolean`; `url`: `string`; \}

###### author.banned?

`boolean`

###### author.description?

`string`

###### author.flair?

\{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}

###### author.flair.backgroundColor?

`string`

###### author.flair.cssClass?

`string`

###### author.flair.enabled?

`boolean`

###### author.flair.subredditId?

`string`

###### author.flair.templateId?

`string`

###### author.flair.text?

`string`

###### author.flair.textColor?

`string`

###### author.flair.userId?

`string`

###### author.iconImage?

`string`

###### author.id?

`string`

###### author.isGold?

`boolean`

###### author.karma?

`number`

###### author.name?

`string`

###### author.snoovatarImage?

`string`

###### author.spam?

`boolean`

###### author.suspended?

`boolean`

###### author.url?

`string`

###### createdAt?

`Date`

###### deletedAt?

`Date`

###### postId?

`string`

###### reason?

[`DeletionReason`](../../../../enumerations/DeletionReason.md)

###### source?

[`EventSource`](../../../../enumerations/EventSource.md)

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

[`PostDelete`](../interfaces/PostDelete.md)

<a id="decode"></a>

### decode()

#### Parameters

##### input

`Uint8Array`\<`ArrayBufferLike`\> | `Reader`

##### length?

`number`

#### Returns

[`PostDelete`](../interfaces/PostDelete.md)

<a id="encode"></a>

### encode()

#### Parameters

##### message

[`PostDelete`](../interfaces/PostDelete.md)

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

[`PostDelete`](../interfaces/PostDelete.md)

<a id="frompartial"></a>

### fromPartial()

#### Parameters

##### object

###### author?

\{ `banned`: `boolean`; `description`: `string`; `flair`: \{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}; `iconImage`: `string`; `id`: `string`; `isGold`: `boolean`; `karma`: `number`; `name`: `string`; `snoovatarImage`: `string`; `spam`: `boolean`; `suspended`: `boolean`; `url`: `string`; \}

###### author.banned?

`boolean`

###### author.description?

`string`

###### author.flair?

\{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}

###### author.flair.backgroundColor?

`string`

###### author.flair.cssClass?

`string`

###### author.flair.enabled?

`boolean`

###### author.flair.subredditId?

`string`

###### author.flair.templateId?

`string`

###### author.flair.text?

`string`

###### author.flair.textColor?

`string`

###### author.flair.userId?

`string`

###### author.iconImage?

`string`

###### author.id?

`string`

###### author.isGold?

`boolean`

###### author.karma?

`number`

###### author.name?

`string`

###### author.snoovatarImage?

`string`

###### author.spam?

`boolean`

###### author.suspended?

`boolean`

###### author.url?

`string`

###### createdAt?

`Date`

###### deletedAt?

`Date`

###### postId?

`string`

###### reason?

[`DeletionReason`](../../../../enumerations/DeletionReason.md)

###### source?

[`EventSource`](../../../../enumerations/EventSource.md)

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

[`PostDelete`](../interfaces/PostDelete.md)

<a id="tojson"></a>

### toJSON()

#### Parameters

##### message

[`PostDelete`](../interfaces/PostDelete.md)

#### Returns

`unknown`
