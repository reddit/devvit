[**@devvit/public-api v0.11.18-dev**](../../../../README.md)

---

# Variable: SubredditSubscribe

> **SubredditSubscribe**: `object`

## Type declaration

<a id="type"></a>

### $type

> **$type**: `"devvit.events.v1alpha.SubredditSubscribe"`

<a id="create"></a>

### create()

#### Parameters

##### base?

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

###### subscriber?

\{ `banned`: `boolean`; `description`: `string`; `flair`: \{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}; `iconImage`: `string`; `id`: `string`; `isGold`: `boolean`; `karma`: `number`; `name`: `string`; `snoovatarImage`: `string`; `spam`: `boolean`; `suspended`: `boolean`; `url`: `string`; \}

###### subscriber.banned?

`boolean`

###### subscriber.description?

`string`

###### subscriber.flair?

\{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}

###### subscriber.flair.backgroundColor?

`string`

###### subscriber.flair.cssClass?

`string`

###### subscriber.flair.enabled?

`boolean`

###### subscriber.flair.subredditId?

`string`

###### subscriber.flair.templateId?

`string`

###### subscriber.flair.text?

`string`

###### subscriber.flair.textColor?

`string`

###### subscriber.flair.userId?

`string`

###### subscriber.iconImage?

`string`

###### subscriber.id?

`string`

###### subscriber.isGold?

`boolean`

###### subscriber.karma?

`number`

###### subscriber.name?

`string`

###### subscriber.snoovatarImage?

`string`

###### subscriber.spam?

`boolean`

###### subscriber.suspended?

`boolean`

###### subscriber.url?

`string`

#### Returns

[`SubredditSubscribe`](../interfaces/SubredditSubscribe.md)

<a id="decode"></a>

### decode()

#### Parameters

##### input

`Uint8Array`\<`ArrayBufferLike`\> | `Reader`

##### length?

`number`

#### Returns

[`SubredditSubscribe`](../interfaces/SubredditSubscribe.md)

<a id="encode"></a>

### encode()

#### Parameters

##### message

[`SubredditSubscribe`](../interfaces/SubredditSubscribe.md)

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

[`SubredditSubscribe`](../interfaces/SubredditSubscribe.md)

<a id="frompartial"></a>

### fromPartial()

#### Parameters

##### object

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

###### subscriber?

\{ `banned`: `boolean`; `description`: `string`; `flair`: \{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}; `iconImage`: `string`; `id`: `string`; `isGold`: `boolean`; `karma`: `number`; `name`: `string`; `snoovatarImage`: `string`; `spam`: `boolean`; `suspended`: `boolean`; `url`: `string`; \}

###### subscriber.banned?

`boolean`

###### subscriber.description?

`string`

###### subscriber.flair?

\{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}

###### subscriber.flair.backgroundColor?

`string`

###### subscriber.flair.cssClass?

`string`

###### subscriber.flair.enabled?

`boolean`

###### subscriber.flair.subredditId?

`string`

###### subscriber.flair.templateId?

`string`

###### subscriber.flair.text?

`string`

###### subscriber.flair.textColor?

`string`

###### subscriber.flair.userId?

`string`

###### subscriber.iconImage?

`string`

###### subscriber.id?

`string`

###### subscriber.isGold?

`boolean`

###### subscriber.karma?

`number`

###### subscriber.name?

`string`

###### subscriber.snoovatarImage?

`string`

###### subscriber.spam?

`boolean`

###### subscriber.suspended?

`boolean`

###### subscriber.url?

`string`

#### Returns

[`SubredditSubscribe`](../interfaces/SubredditSubscribe.md)

<a id="tojson"></a>

### toJSON()

#### Parameters

##### message

[`SubredditSubscribe`](../interfaces/SubredditSubscribe.md)

#### Returns

`unknown`
