[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Type Alias: SubredditSettings

> **SubredditSettings** = `object`

## Properties

<a id="acceptfollowers"></a>

### acceptFollowers

> **acceptFollowers**: `boolean`

Whether the subreddit accepts followers or not.

---

<a id="alloriginalcontent"></a>

### allOriginalContent

> **allOriginalContent**: `boolean`

Whether all content posted on the subreddit is original.

---

<a id="allowchatpostcreation"></a>

### allowChatPostCreation

> **allowChatPostCreation**: `boolean`

Whether users are allowed to create chat posts on the subreddit.

---

<a id="allowdiscovery"></a>

### allowDiscovery

> **allowDiscovery**: `boolean`

Whether the subreddit can be discovered through search.

---

<a id="allowedmediaincomments"></a>

### allowedMediaInComments

> **allowedMediaInComments**: [`CommentMediaTypes`](CommentMediaTypes.md)[]

List of allowed media types in the comments made in the subreddit.

---

<a id="allowedposttype"></a>

### allowedPostType

> **allowedPostType**: `"any"` \| `"link"` \| `"self"`

The types of post allowed in this subreddit. Either "any", "link", or "self".

---

<a id="allowgalleries"></a>

### allowGalleries

> **allowGalleries**: `boolean`

Whether the subreddit allows galleries.

---

<a id="allowimages"></a>

### allowImages

> **allowImages**: `boolean`

Whether the subreddit allows images.

---

<a id="allowpolls"></a>

### allowPolls

> **allowPolls**: `boolean`

Whether the subreddit allows polls.

---

<a id="allowpredictioncontributors"></a>

### allowPredictionContributors

> **allowPredictionContributors**: `boolean`

Whether contributors are allowed to make predictions on the subreddit.

---

<a id="allowpredictions"></a>

### allowPredictions

> **allowPredictions**: `boolean`

Whether predictions are allowed on the subreddit.

---

<a id="allowpredictionstournament"></a>

### allowPredictionsTournament

> **allowPredictionsTournament**: `boolean`

Whether prediction tournaments are allowed on the subreddit.

---

<a id="allowtalks"></a>

### allowTalks

> **allowTalks**: `boolean`

Whether talks are allowed on the subreddit.

---

<a id="allowvideogifs"></a>

### allowVideoGifs

> **allowVideoGifs**: `boolean`

Whether video GIFs are allowed on the subreddit.

---

<a id="allowvideos"></a>

### allowVideos

> **allowVideos**: `boolean`

Whether videos are allowed on the subreddit.

---

<a id="bannerbackgroundcolor"></a>

### bannerBackgroundColor?

> `optional` **bannerBackgroundColor**: `string`

a 6-digit rgb hex color of the banner e.g. `#AABBCC`,

---

<a id="bannerbackgroundimage"></a>

### bannerBackgroundImage?

> `optional` **bannerBackgroundImage**: `string`

The background image of the banner.

---

<a id="bannerimage"></a>

### bannerImage?

> `optional` **bannerImage**: `string`

The URL of the banner image.

---

<a id="chatpostenabled"></a>

### chatPostEnabled

> **chatPostEnabled**: `boolean`

Whether chat posts are enabled on the subreddit.

---

<a id="collectionsenabled"></a>

### collectionsEnabled

> **collectionsEnabled**: `boolean`

Whether collections are enabled on the subreddit.

---

<a id="communityicon"></a>

### communityIcon?

> `optional` **communityIcon**: `string`

The URL of the community icon.

---

<a id="crosspostable"></a>

### crosspostable

> **crosspostable**: `boolean`

Whether crossposts can be made to this subreddit.

---

<a id="emojisenabled"></a>

### emojisEnabled

> **emojisEnabled**: `boolean`

Whether emojis are enabled on the subreddit.

---

<a id="eventpostsenabled"></a>

### eventPostsEnabled

> **eventPostsEnabled**: `boolean`

Whether event posts are enabled on the subreddit.

---

<a id="headertitle"></a>

### headerTitle?

> `optional` **headerTitle**: `string`

The header title.

---

<a id="keycolor"></a>

### keyColor?

> `optional` **keyColor**: `string`

The 6-digit rgb hex color of the subreddit's key color, e.g. `#AABBCC`,

---

<a id="linkflairenabled"></a>

### linkFlairEnabled

> **linkFlairEnabled**: `boolean`

Whether link flairs are enabled on the subreddit.

---

<a id="mobilebannerimage"></a>

### mobileBannerImage?

> `optional` **mobileBannerImage**: `string`

Banner image used on mobile apps.

---

<a id="originalcontenttagenabled"></a>

### originalContentTagEnabled

> **originalContentTagEnabled**: `boolean`

Whether the Original Content tag is enabled.

---

<a id="postflairs"></a>

### postFlairs

> **postFlairs**: [`FlairSettings`](FlairSettings.md)

The post flair settings for the subreddit.

---

<a id="primarycolor"></a>

### primaryColor?

> `optional` **primaryColor**: `string`

The 6-digit rgb hex color of the subreddit's primary color, e.g. `#AABBCC`,

---

<a id="restrictcommenting"></a>

### restrictCommenting

> **restrictCommenting**: `boolean`

Whether commenting is restricted in the subreddit.

---

<a id="restrictposting"></a>

### restrictPosting

> **restrictPosting**: `boolean`

Whether posting is restricted in the subreddit.

---

<a id="shouldarchiveposts"></a>

### shouldArchivePosts

> **shouldArchivePosts**: `boolean`

Whether posts in the subreddit should be automatically archived after 6 months.

---

<a id="spoilersenabled"></a>

### spoilersEnabled

> **spoilersEnabled**: `boolean`

Whether the Spoiler tag is enabled.

---

<a id="url"></a>

### url

> **url**: `string`

HTTP URL to the subreddit

---

<a id="userflairs"></a>

### userFlairs

> **userFlairs**: [`FlairSettings`](FlairSettings.md)

The user flair settings for the subreddit.

---

<a id="wikienabled"></a>

### wikiEnabled

> **wikiEnabled**: `boolean`

Whether the wiki is enabled for the subreddit.
