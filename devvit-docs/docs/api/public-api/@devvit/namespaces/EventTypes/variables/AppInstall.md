[**@devvit/public-api v0.11.18-dev**](../../../../README.md)

---

# Variable: AppInstall

> **AppInstall**: `object`

## Type declaration

<a id="type"></a>

### $type

> **$type**: `"devvit.events.v1alpha.AppInstall"`

<a id="create"></a>

### create()

#### Parameters

##### base?

###### installer?

\{ `banned`: `boolean`; `description`: `string`; `flair`: \{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}; `iconImage`: `string`; `id`: `string`; `isGold`: `boolean`; `karma`: `number`; `name`: `string`; `snoovatarImage`: `string`; `spam`: `boolean`; `suspended`: `boolean`; `url`: `string`; \}

###### installer.banned?

`boolean`

###### installer.description?

`string`

###### installer.flair?

\{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}

###### installer.flair.backgroundColor?

`string`

###### installer.flair.cssClass?

`string`

###### installer.flair.enabled?

`boolean`

###### installer.flair.subredditId?

`string`

###### installer.flair.templateId?

`string`

###### installer.flair.text?

`string`

###### installer.flair.textColor?

`string`

###### installer.flair.userId?

`string`

###### installer.iconImage?

`string`

###### installer.id?

`string`

###### installer.isGold?

`boolean`

###### installer.karma?

`number`

###### installer.name?

`string`

###### installer.snoovatarImage?

`string`

###### installer.spam?

`boolean`

###### installer.suspended?

`boolean`

###### installer.url?

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

[`AppInstall`](../interfaces/AppInstall.md)

<a id="decode"></a>

### decode()

#### Parameters

##### input

`Uint8Array`\<`ArrayBufferLike`\> | `Reader`

##### length?

`number`

#### Returns

[`AppInstall`](../interfaces/AppInstall.md)

<a id="encode"></a>

### encode()

#### Parameters

##### message

[`AppInstall`](../interfaces/AppInstall.md)

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

[`AppInstall`](../interfaces/AppInstall.md)

<a id="frompartial"></a>

### fromPartial()

#### Parameters

##### object

###### installer?

\{ `banned`: `boolean`; `description`: `string`; `flair`: \{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}; `iconImage`: `string`; `id`: `string`; `isGold`: `boolean`; `karma`: `number`; `name`: `string`; `snoovatarImage`: `string`; `spam`: `boolean`; `suspended`: `boolean`; `url`: `string`; \}

###### installer.banned?

`boolean`

###### installer.description?

`string`

###### installer.flair?

\{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}

###### installer.flair.backgroundColor?

`string`

###### installer.flair.cssClass?

`string`

###### installer.flair.enabled?

`boolean`

###### installer.flair.subredditId?

`string`

###### installer.flair.templateId?

`string`

###### installer.flair.text?

`string`

###### installer.flair.textColor?

`string`

###### installer.flair.userId?

`string`

###### installer.iconImage?

`string`

###### installer.id?

`string`

###### installer.isGold?

`boolean`

###### installer.karma?

`number`

###### installer.name?

`string`

###### installer.snoovatarImage?

`string`

###### installer.spam?

`boolean`

###### installer.suspended?

`boolean`

###### installer.url?

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

[`AppInstall`](../interfaces/AppInstall.md)

<a id="tojson"></a>

### toJSON()

#### Parameters

##### message

[`AppInstall`](../interfaces/AppInstall.md)

#### Returns

`unknown`
