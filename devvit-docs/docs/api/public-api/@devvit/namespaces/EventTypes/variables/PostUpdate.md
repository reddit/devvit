[**@devvit/public-api v0.11.18-dev**](../../../../README.md)

---

# Variable: PostUpdate

> **PostUpdate**: `object`

## Type declaration

<a id="type"></a>

### $type

> **$type**: `"devvit.events.v1alpha.PostUpdate"`

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

###### post?

\{ `authorFlair`: \{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}; `authorId`: `string`; `createdAt`: `number`; `crosspostParentId`: `string`; `crowdControlLevel`: `CrowdControlLevel`; `deleted`: `boolean`; `distinguished`: `DistinguishType`; `downvotes`: `number`; `galleryImages`: `string`[]; `gildings`: `number`; `id`: `string`; `ignoreReports`: `boolean`; `isApproved`: `boolean`; `isArchived`: `boolean`; `isGallery`: `boolean`; `isImage`: `boolean`; `isLocked`: `boolean`; `isMeta`: `boolean`; `isMultiMedia`: `boolean`; `isPoll`: `boolean`; `isPromoted`: `boolean`; `isSelf`: `boolean`; `isSpoiler`: `boolean`; `isSticky`: `boolean`; `isVideo`: `boolean`; `languageCode`: `string`; `linkFlair`: \{ `backgroundColor`: `string`; `cssClass`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; \}; `media`: \{ `oembed`: \{ `authorName`: `string`; `authorUrl`: `string`; `description`: `string`; `height`: `number`; `html`: `string`; `providerName`: `string`; `providerUrl`: `string`; `thumbnailHeight`: `number`; `thumbnailUrl`: `string`; `thumbnailWidth`: `number`; `title`: `string`; `type`: `string`; `version`: `string`; `width`: `number`; \}; `redditVideo`: \{ `bitrateKbps`: `number`; `dashUrl`: `string`; `duration`: `number`; `fallbackUrl`: `string`; `height`: `number`; `hlsUrl`: `string`; `isGif`: `boolean`; `scrubberMediaUrl`: `string`; `transcodingStatus`: `string`; `width`: `number`; \}; `type`: `string`; \}; `nsfw`: `boolean`; `numComments`: `number`; `numReports`: `number`; `permalink`: `string`; `score`: `number`; `selftext`: `string`; `spam`: `boolean`; `subredditId`: `string`; `thumbnail`: `string`; `title`: `string`; `type`: `string`; `unlisted`: `boolean`; `updatedAt`: `number`; `upvotes`: `number`; `url`: `string`; \}

###### post.authorFlair?

\{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}

###### post.authorFlair.backgroundColor?

`string`

###### post.authorFlair.cssClass?

`string`

###### post.authorFlair.enabled?

`boolean`

###### post.authorFlair.subredditId?

`string`

###### post.authorFlair.templateId?

`string`

###### post.authorFlair.text?

`string`

###### post.authorFlair.textColor?

`string`

###### post.authorFlair.userId?

`string`

###### post.authorId?

`string`

###### post.createdAt?

`number`

###### post.crosspostParentId?

`string`

###### post.crowdControlLevel?

`CrowdControlLevel`

###### post.deleted?

`boolean`

###### post.distinguished?

`DistinguishType`

###### post.downvotes?

`number`

###### post.galleryImages?

`string`[]

###### post.gildings?

`number`

###### post.id?

`string`

###### post.ignoreReports?

`boolean`

###### post.isApproved?

`boolean`

###### post.isArchived?

`boolean`

###### post.isGallery?

`boolean`

###### post.isImage?

`boolean`

Indicates if the post contains a single image rather than a gallery of multiple images, which is indicated by the is_gallery field.

###### post.isLocked?

`boolean`

###### post.isMeta?

`boolean`

###### post.isMultiMedia?

`boolean`

###### post.isPoll?

`boolean`

###### post.isPromoted?

`boolean`

###### post.isSelf?

`boolean`

###### post.isSpoiler?

`boolean`

###### post.isSticky?

`boolean`

###### post.isVideo?

`boolean`

###### post.languageCode?

`string`

###### post.linkFlair?

\{ `backgroundColor`: `string`; `cssClass`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; \}

###### post.linkFlair.backgroundColor?

`string`

###### post.linkFlair.cssClass?

`string`

###### post.linkFlair.templateId?

`string`

###### post.linkFlair.text?

`string`

###### post.linkFlair.textColor?

`string`

###### post.media?

\{ `oembed`: \{ `authorName`: `string`; `authorUrl`: `string`; `description`: `string`; `height`: `number`; `html`: `string`; `providerName`: `string`; `providerUrl`: `string`; `thumbnailHeight`: `number`; `thumbnailUrl`: `string`; `thumbnailWidth`: `number`; `title`: `string`; `type`: `string`; `version`: `string`; `width`: `number`; \}; `redditVideo`: \{ `bitrateKbps`: `number`; `dashUrl`: `string`; `duration`: `number`; `fallbackUrl`: `string`; `height`: `number`; `hlsUrl`: `string`; `isGif`: `boolean`; `scrubberMediaUrl`: `string`; `transcodingStatus`: `string`; `width`: `number`; \}; `type`: `string`; \}

###### post.media.oembed?

\{ `authorName`: `string`; `authorUrl`: `string`; `description`: `string`; `height`: `number`; `html`: `string`; `providerName`: `string`; `providerUrl`: `string`; `thumbnailHeight`: `number`; `thumbnailUrl`: `string`; `thumbnailWidth`: `number`; `title`: `string`; `type`: `string`; `version`: `string`; `width`: `number`; \}

###### post.media.oembed.authorName?

`string`

###### post.media.oembed.authorUrl?

`string`

###### post.media.oembed.description?

`string`

###### post.media.oembed.height?

`number`

###### post.media.oembed.html?

`string`

###### post.media.oembed.providerName?

`string`

###### post.media.oembed.providerUrl?

`string`

###### post.media.oembed.thumbnailHeight?

`number`

###### post.media.oembed.thumbnailUrl?

`string`

###### post.media.oembed.thumbnailWidth?

`number`

###### post.media.oembed.title?

`string`

###### post.media.oembed.type?

`string`

###### post.media.oembed.version?

`string`

###### post.media.oembed.width?

`number`

###### post.media.redditVideo?

\{ `bitrateKbps`: `number`; `dashUrl`: `string`; `duration`: `number`; `fallbackUrl`: `string`; `height`: `number`; `hlsUrl`: `string`; `isGif`: `boolean`; `scrubberMediaUrl`: `string`; `transcodingStatus`: `string`; `width`: `number`; \}

###### post.media.redditVideo.bitrateKbps?

`number`

###### post.media.redditVideo.dashUrl?

`string`

###### post.media.redditVideo.duration?

`number`

###### post.media.redditVideo.fallbackUrl?

`string`

###### post.media.redditVideo.height?

`number`

###### post.media.redditVideo.hlsUrl?

`string`

###### post.media.redditVideo.isGif?

`boolean`

###### post.media.redditVideo.scrubberMediaUrl?

`string`

###### post.media.redditVideo.transcodingStatus?

`string`

###### post.media.redditVideo.width?

`number`

###### post.media.type?

`string`

###### post.nsfw?

`boolean`

###### post.numComments?

`number`

###### post.numReports?

`number`

###### post.permalink?

`string`

###### post.score?

`number`

###### post.selftext?

`string`

rename to text?

###### post.spam?

`boolean`

###### post.subredditId?

`string`

###### post.thumbnail?

`string`

###### post.title?

`string`

###### post.type?

`string`

###### post.unlisted?

`boolean`

###### post.updatedAt?

`number`

###### post.upvotes?

`number`

###### post.url?

`string`

###### previousBody?

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

[`PostUpdate`](../interfaces/PostUpdate.md)

<a id="decode"></a>

### decode()

#### Parameters

##### input

`Uint8Array`\<`ArrayBufferLike`\> | `Reader`

##### length?

`number`

#### Returns

[`PostUpdate`](../interfaces/PostUpdate.md)

<a id="encode"></a>

### encode()

#### Parameters

##### message

[`PostUpdate`](../interfaces/PostUpdate.md)

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

[`PostUpdate`](../interfaces/PostUpdate.md)

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

###### post?

\{ `authorFlair`: \{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}; `authorId`: `string`; `createdAt`: `number`; `crosspostParentId`: `string`; `crowdControlLevel`: `CrowdControlLevel`; `deleted`: `boolean`; `distinguished`: `DistinguishType`; `downvotes`: `number`; `galleryImages`: `string`[]; `gildings`: `number`; `id`: `string`; `ignoreReports`: `boolean`; `isApproved`: `boolean`; `isArchived`: `boolean`; `isGallery`: `boolean`; `isImage`: `boolean`; `isLocked`: `boolean`; `isMeta`: `boolean`; `isMultiMedia`: `boolean`; `isPoll`: `boolean`; `isPromoted`: `boolean`; `isSelf`: `boolean`; `isSpoiler`: `boolean`; `isSticky`: `boolean`; `isVideo`: `boolean`; `languageCode`: `string`; `linkFlair`: \{ `backgroundColor`: `string`; `cssClass`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; \}; `media`: \{ `oembed`: \{ `authorName`: `string`; `authorUrl`: `string`; `description`: `string`; `height`: `number`; `html`: `string`; `providerName`: `string`; `providerUrl`: `string`; `thumbnailHeight`: `number`; `thumbnailUrl`: `string`; `thumbnailWidth`: `number`; `title`: `string`; `type`: `string`; `version`: `string`; `width`: `number`; \}; `redditVideo`: \{ `bitrateKbps`: `number`; `dashUrl`: `string`; `duration`: `number`; `fallbackUrl`: `string`; `height`: `number`; `hlsUrl`: `string`; `isGif`: `boolean`; `scrubberMediaUrl`: `string`; `transcodingStatus`: `string`; `width`: `number`; \}; `type`: `string`; \}; `nsfw`: `boolean`; `numComments`: `number`; `numReports`: `number`; `permalink`: `string`; `score`: `number`; `selftext`: `string`; `spam`: `boolean`; `subredditId`: `string`; `thumbnail`: `string`; `title`: `string`; `type`: `string`; `unlisted`: `boolean`; `updatedAt`: `number`; `upvotes`: `number`; `url`: `string`; \}

###### post.authorFlair?

\{ `backgroundColor`: `string`; `cssClass`: `string`; `enabled`: `boolean`; `subredditId`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; `userId`: `string`; \}

###### post.authorFlair.backgroundColor?

`string`

###### post.authorFlair.cssClass?

`string`

###### post.authorFlair.enabled?

`boolean`

###### post.authorFlair.subredditId?

`string`

###### post.authorFlair.templateId?

`string`

###### post.authorFlair.text?

`string`

###### post.authorFlair.textColor?

`string`

###### post.authorFlair.userId?

`string`

###### post.authorId?

`string`

###### post.createdAt?

`number`

###### post.crosspostParentId?

`string`

###### post.crowdControlLevel?

`CrowdControlLevel`

###### post.deleted?

`boolean`

###### post.distinguished?

`DistinguishType`

###### post.downvotes?

`number`

###### post.galleryImages?

`string`[]

###### post.gildings?

`number`

###### post.id?

`string`

###### post.ignoreReports?

`boolean`

###### post.isApproved?

`boolean`

###### post.isArchived?

`boolean`

###### post.isGallery?

`boolean`

###### post.isImage?

`boolean`

Indicates if the post contains a single image rather than a gallery of multiple images, which is indicated by the is_gallery field.

###### post.isLocked?

`boolean`

###### post.isMeta?

`boolean`

###### post.isMultiMedia?

`boolean`

###### post.isPoll?

`boolean`

###### post.isPromoted?

`boolean`

###### post.isSelf?

`boolean`

###### post.isSpoiler?

`boolean`

###### post.isSticky?

`boolean`

###### post.isVideo?

`boolean`

###### post.languageCode?

`string`

###### post.linkFlair?

\{ `backgroundColor`: `string`; `cssClass`: `string`; `templateId`: `string`; `text`: `string`; `textColor`: `string`; \}

###### post.linkFlair.backgroundColor?

`string`

###### post.linkFlair.cssClass?

`string`

###### post.linkFlair.templateId?

`string`

###### post.linkFlair.text?

`string`

###### post.linkFlair.textColor?

`string`

###### post.media?

\{ `oembed`: \{ `authorName`: `string`; `authorUrl`: `string`; `description`: `string`; `height`: `number`; `html`: `string`; `providerName`: `string`; `providerUrl`: `string`; `thumbnailHeight`: `number`; `thumbnailUrl`: `string`; `thumbnailWidth`: `number`; `title`: `string`; `type`: `string`; `version`: `string`; `width`: `number`; \}; `redditVideo`: \{ `bitrateKbps`: `number`; `dashUrl`: `string`; `duration`: `number`; `fallbackUrl`: `string`; `height`: `number`; `hlsUrl`: `string`; `isGif`: `boolean`; `scrubberMediaUrl`: `string`; `transcodingStatus`: `string`; `width`: `number`; \}; `type`: `string`; \}

###### post.media.oembed?

\{ `authorName`: `string`; `authorUrl`: `string`; `description`: `string`; `height`: `number`; `html`: `string`; `providerName`: `string`; `providerUrl`: `string`; `thumbnailHeight`: `number`; `thumbnailUrl`: `string`; `thumbnailWidth`: `number`; `title`: `string`; `type`: `string`; `version`: `string`; `width`: `number`; \}

###### post.media.oembed.authorName?

`string`

###### post.media.oembed.authorUrl?

`string`

###### post.media.oembed.description?

`string`

###### post.media.oembed.height?

`number`

###### post.media.oembed.html?

`string`

###### post.media.oembed.providerName?

`string`

###### post.media.oembed.providerUrl?

`string`

###### post.media.oembed.thumbnailHeight?

`number`

###### post.media.oembed.thumbnailUrl?

`string`

###### post.media.oembed.thumbnailWidth?

`number`

###### post.media.oembed.title?

`string`

###### post.media.oembed.type?

`string`

###### post.media.oembed.version?

`string`

###### post.media.oembed.width?

`number`

###### post.media.redditVideo?

\{ `bitrateKbps`: `number`; `dashUrl`: `string`; `duration`: `number`; `fallbackUrl`: `string`; `height`: `number`; `hlsUrl`: `string`; `isGif`: `boolean`; `scrubberMediaUrl`: `string`; `transcodingStatus`: `string`; `width`: `number`; \}

###### post.media.redditVideo.bitrateKbps?

`number`

###### post.media.redditVideo.dashUrl?

`string`

###### post.media.redditVideo.duration?

`number`

###### post.media.redditVideo.fallbackUrl?

`string`

###### post.media.redditVideo.height?

`number`

###### post.media.redditVideo.hlsUrl?

`string`

###### post.media.redditVideo.isGif?

`boolean`

###### post.media.redditVideo.scrubberMediaUrl?

`string`

###### post.media.redditVideo.transcodingStatus?

`string`

###### post.media.redditVideo.width?

`number`

###### post.media.type?

`string`

###### post.nsfw?

`boolean`

###### post.numComments?

`number`

###### post.numReports?

`number`

###### post.permalink?

`string`

###### post.score?

`number`

###### post.selftext?

`string`

rename to text?

###### post.spam?

`boolean`

###### post.subredditId?

`string`

###### post.thumbnail?

`string`

###### post.title?

`string`

###### post.type?

`string`

###### post.unlisted?

`boolean`

###### post.updatedAt?

`number`

###### post.upvotes?

`number`

###### post.url?

`string`

###### previousBody?

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

[`PostUpdate`](../interfaces/PostUpdate.md)

<a id="tojson"></a>

### toJSON()

#### Parameters

##### message

[`PostUpdate`](../interfaces/PostUpdate.md)

#### Returns

`unknown`
