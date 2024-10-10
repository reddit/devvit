# Class: SubredditInfo

[models](../modules/models.md).SubredditInfo

A class representing information about a Subreddit.

## Table of contents

### Accessors

- [id](models.SubredditInfo.md#id)
- [name](models.SubredditInfo.md#name)
- [createdAt](models.SubredditInfo.md#createdAt)
- [type](models.SubredditInfo.md#type)
- [title](models.SubredditInfo.md#title)
- [description](models.SubredditInfo.md#description)
- [detectedLanguage](models.SubredditInfo.md#detectedLanguage)
- [subscribersCount](models.SubredditInfo.md#subscribersCount)
- [activeCount](models.SubredditInfo.md#activeCount)
- [isNsfw](models.SubredditInfo.md#isNsfw)
- [isQuarantined](models.SubredditInfo.md#isQuarantined)
- [isDiscoveryAllowed](models.SubredditInfo.md#isDiscoveryAllowed)
- [isPredictionContributorsAllowed](models.SubredditInfo.md#isPredictionContributorsAllowed)
- [isPredictionAllowed](models.SubredditInfo.md#isPredictionAllowed)
- [isPredictionsTournamentAllowed](models.SubredditInfo.md#isPredictionsTournamentAllowed)
- [isChatPostCreationAllowed](models.SubredditInfo.md#isChatPostCreationAllowed)
- [isChatPostFeatureEnabled](models.SubredditInfo.md#isChatPostFeatureEnabled)
- [isCrosspostingAllowed](models.SubredditInfo.md#isCrosspostingAllowed)
- [isEmojisEnabled](models.SubredditInfo.md#isEmojisEnabled)
- [isCommentingRestricted](models.SubredditInfo.md#isCommentingRestricted)
- [isPostingRestricted](models.SubredditInfo.md#isPostingRestricted)
- [isArchivePostsEnabled](models.SubredditInfo.md#isArchivePostsEnabled)
- [isSpoilerAvailable](models.SubredditInfo.md#isSpoilerAvailable)
- [allAllowedPostTypes](models.SubredditInfo.md#allAllowedPostTypes)
- [allowedPostCapabilities](models.SubredditInfo.md#allowedPostCapabilities)
- [allowedMediaInComments](models.SubredditInfo.md#allowedMediaInComments)
- [authorFlairSettings](models.SubredditInfo.md#authorFlairSettings)
- [postFlairSettings](models.SubredditInfo.md#postFlairSettings)
- [wikiSettings](models.SubredditInfo.md#wikiSettings)

## Accessors

### <a id="id" name="id"></a> id

• `get` **id**(): \`t5\_$\{string}\`

#### Returns

`t5_${string}`

---

### <a id="name" name="name"></a> name

• `get` **name**(): `string`

#### Returns

`string`

---

### <a id="createdAt" name="createdAt"></a> createdAt

• `get` **createdAt**(): `Date`

#### Returns

`Date`

---

### <a id="type" name="type"></a> type

• `get` **type**(): [`SubredditType`](../modules/models.md#subreddittype)

#### Returns

[`SubredditType`](../modules/models.md#subreddittype)

---

### <a id="title" name="title"></a> title

• `get` **title**(): `string`

#### Returns

`string`

---

### <a id="description" name="description"></a> description

• `get` **description**(): [`SubredditDescription`](../modules/models.md#subredditdescription)

#### Returns

[`SubredditDescription`](../modules/models.md#subredditdescription)

---

### <a id="detectedLanguage" name="detectedLanguage"></a> detectedLanguage

• `get` **detectedLanguage**(): `string`

#### Returns

`string`

---

### <a id="subscribersCount" name="subscribersCount"></a> subscribersCount

• `get` **subscribersCount**(): `number`

#### Returns

`number`

---

### <a id="activeCount" name="activeCount"></a> activeCount

• `get` **activeCount**(): `number`

#### Returns

`number`

---

### <a id="isNsfw" name="isNsfw"></a> isNsfw

• `get` **isNsfw**(): `boolean`

#### Returns

`boolean`

---

### <a id="isQuarantined" name="isQuarantined"></a> isQuarantined

• `get` **isQuarantined**(): `boolean`

#### Returns

`boolean`

---

### <a id="isDiscoveryAllowed" name="isDiscoveryAllowed"></a> isDiscoveryAllowed

• `get` **isDiscoveryAllowed**(): `boolean`

#### Returns

`boolean`

---

### <a id="isPredictionContributorsAllowed" name="isPredictionContributorsAllowed"></a> isPredictionContributorsAllowed

• `get` **isPredictionContributorsAllowed**(): `boolean`

#### Returns

`boolean`

---

### <a id="isPredictionAllowed" name="isPredictionAllowed"></a> isPredictionAllowed

• `get` **isPredictionAllowed**(): `boolean`

#### Returns

`boolean`

---

### <a id="isPredictionsTournamentAllowed" name="isPredictionsTournamentAllowed"></a> isPredictionsTournamentAllowed

• `get` **isPredictionsTournamentAllowed**(): `boolean`

#### Returns

`boolean`

---

### <a id="isChatPostCreationAllowed" name="isChatPostCreationAllowed"></a> isChatPostCreationAllowed

• `get` **isChatPostCreationAllowed**(): `boolean`

#### Returns

`boolean`

---

### <a id="isChatPostFeatureEnabled" name="isChatPostFeatureEnabled"></a> isChatPostFeatureEnabled

• `get` **isChatPostFeatureEnabled**(): `boolean`

#### Returns

`boolean`

---

### <a id="isCrosspostingAllowed" name="isCrosspostingAllowed"></a> isCrosspostingAllowed

• `get` **isCrosspostingAllowed**(): `boolean`

#### Returns

`boolean`

---

### <a id="isEmojisEnabled" name="isEmojisEnabled"></a> isEmojisEnabled

• `get` **isEmojisEnabled**(): `boolean`

#### Returns

`boolean`

---

### <a id="isCommentingRestricted" name="isCommentingRestricted"></a> isCommentingRestricted

• `get` **isCommentingRestricted**(): `boolean`

#### Returns

`boolean`

---

### <a id="isPostingRestricted" name="isPostingRestricted"></a> isPostingRestricted

• `get` **isPostingRestricted**(): `boolean`

#### Returns

`boolean`

---

### <a id="isArchivePostsEnabled" name="isArchivePostsEnabled"></a> isArchivePostsEnabled

• `get` **isArchivePostsEnabled**(): `boolean`

#### Returns

`boolean`

---

### <a id="isSpoilerAvailable" name="isSpoilerAvailable"></a> isSpoilerAvailable

• `get` **isSpoilerAvailable**(): `boolean`

#### Returns

`boolean`

---

### <a id="allAllowedPostTypes" name="allAllowedPostTypes"></a> allAllowedPostTypes

• `get` **allAllowedPostTypes**(): [`PostType[]`](../modules/models.md#posttype)

#### Returns

[`PostType[]`](../modules/models.md#posttype)

---

### <a id="allowedPostCapabilities" name="allowedPostCapabilities"></a> allowedPostCapabilities

• `get` **allowedPostCapabilities**(): [`PostCapabilities[]`](../modules/models.md#postcapabilities)

#### Returns

[`PostCapabilities[]`](../modules/models.md#postcapabilities)

---

### <a id="allowedMediaInComments" name="allowedMediaInComments"></a> allowedMediaInComments

• `get` **allowedMediaInComments**(): [`CommentMediaTypes[]`](../modules/models.md#commentmediatypes)

#### Returns

[`CommentMediaTypes[]`](../modules/models.md#commentmediatypes)

---

### <a id="authorFlairSettings" name="authorFlairSettings"></a> authorFlairSettings

• `get` **authorFlairSettings**(): [`AuthorFlairSettings`](../modules/models.md#authorflairsettings)

#### Returns

[`AuthorFlairSettings`](../modules/models.md#authorflairsettings)

---

### <a id="postFlairSettings" name="postFlairSettings"></a> postFlairSettings

• `get` **postFlairSettings**(): [`PostFlairSettings`](../modules/models.md#postflairsettings)

#### Returns

[`PostFlairSettings`](../modules/models.md#postflairsettings)

---

### <a id="wikiSettings" name="wikiSettings"></a> wikiSettings

• `get` **wikiSettings**(): [`SubredditWikiSettings`](../modules/models.md#subredditwikisettings)

#### Returns

[`SubredditWikiSettings`](../modules/models.md#subredditwikisettings)
