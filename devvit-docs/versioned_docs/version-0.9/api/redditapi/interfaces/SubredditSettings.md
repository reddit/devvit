# Interface: SubredditSettings

## Table of contents

### Properties

- [acceptFollowers](SubredditSettings.md#acceptfollowers)
- [allOriginalContent](SubredditSettings.md#alloriginalcontent)
- [allowChatPostCreation](SubredditSettings.md#allowchatpostcreation)
- [allowDiscovery](SubredditSettings.md#allowdiscovery)
- [allowGalleries](SubredditSettings.md#allowgalleries)
- [allowImages](SubredditSettings.md#allowimages)
- [allowPolls](SubredditSettings.md#allowpolls)
- [allowPredictionContributors](SubredditSettings.md#allowpredictioncontributors)
- [allowPredictions](SubredditSettings.md#allowpredictions)
- [allowPredictionsTournament](SubredditSettings.md#allowpredictionstournament)
- [allowTalks](SubredditSettings.md#allowtalks)
- [allowVideoGifs](SubredditSettings.md#allowvideogifs)
- [allowVideos](SubredditSettings.md#allowvideos)
- [allowedMediaInComments](SubredditSettings.md#allowedmediaincomments)
- [allowedPostType](SubredditSettings.md#allowedposttype)
- [bannerBackgroundColor](SubredditSettings.md#bannerbackgroundcolor)
- [bannerBackgroundImage](SubredditSettings.md#bannerbackgroundimage)
- [bannerImage](SubredditSettings.md#bannerimage)
- [chatPostEnabled](SubredditSettings.md#chatpostenabled)
- [collectionsEnabled](SubredditSettings.md#collectionsenabled)
- [communityIcon](SubredditSettings.md#communityicon)
- [crosspostable](SubredditSettings.md#crosspostable)
- [emojisEnabled](SubredditSettings.md#emojisenabled)
- [eventPostsEnabled](SubredditSettings.md#eventpostsenabled)
- [headerTitle](SubredditSettings.md#headertitle)
- [linkFlairEnabled](SubredditSettings.md#linkflairenabled)
- [mobileBannerImage](SubredditSettings.md#mobilebannerimage)
- [originalContentTagEnabled](SubredditSettings.md#originalcontenttagenabled)
- [postFlairs](SubredditSettings.md#postflairs)
- [restrictCommenting](SubredditSettings.md#restrictcommenting)
- [restrictPosting](SubredditSettings.md#restrictposting)
- [shouldArchivePosts](SubredditSettings.md#shouldarchiveposts)
- [spoilersEnabled](SubredditSettings.md#spoilersenabled)
- [userFlairs](SubredditSettings.md#userflairs)
- [wikiEnabled](SubredditSettings.md#wikienabled)

## Properties

### acceptFollowers

• **acceptFollowers**: `boolean`

Whether the subreddit accepts followers or not.

---

### allOriginalContent

• **allOriginalContent**: `boolean`

Whether all content posted on the subreddit is original.

---

### allowChatPostCreation

• **allowChatPostCreation**: `boolean`

Whether users are allowed to create chat posts on the subreddit.

---

### allowDiscovery

• **allowDiscovery**: `boolean`

Whether the subreddit can be discovered through search.

---

### allowGalleries

• **allowGalleries**: `boolean`

Whether the subreddit allows galleries.

---

### allowImages

• **allowImages**: `boolean`

Whether the subreddit allows images.

---

### allowPolls

• **allowPolls**: `boolean`

Whether the subreddit allows polls.

---

### allowPredictionContributors

• **allowPredictionContributors**: `boolean`

Whether contributors are allowed to make predictions on the subreddit.

---

### allowPredictions

• **allowPredictions**: `boolean`

Whether predictions are allowed on the subreddit.

---

### allowPredictionsTournament

• **allowPredictionsTournament**: `boolean`

Whether prediction tournaments are allowed on the subreddit.

---

### allowTalks

• **allowTalks**: `boolean`

Whether talks are allowed on the subreddit.

---

### allowVideoGifs

• **allowVideoGifs**: `boolean`

Whether video GIFs are allowed on the subreddit.

---

### allowVideos

• **allowVideos**: `boolean`

Whether videos are allowed on the subreddit.

---

### allowedMediaInComments

• **allowedMediaInComments**: [`CommentMediaTypes`](../README.md#commentmediatypes)[]

List of allowed media types in the comments made in the subreddit.

---

### allowedPostType

• **allowedPostType**: `"link"` \| `"self"` \| `"any"`

The types of post allowed in this subreddit. Either "any", "link", or "self".

---

### bannerBackgroundColor

• `Optional` **bannerBackgroundColor**: `string`

a 6-digit rgb hex color of the banner e.g. `#AABBCC`,

---

### bannerBackgroundImage

• `Optional` **bannerBackgroundImage**: `string`

The background image of the banner.

---

### bannerImage

• `Optional` **bannerImage**: `string`

The URL of the banner image.

---

### chatPostEnabled

• **chatPostEnabled**: `boolean`

Whether chat posts are enabled on the subreddit.

---

### collectionsEnabled

• **collectionsEnabled**: `boolean`

Whether collections are enabled on the subreddit.

---

### communityIcon

• `Optional` **communityIcon**: `string`

The URL of the community icon.

---

### crosspostable

• **crosspostable**: `boolean`

Whether crossposts can be made to this subreddit.

---

### emojisEnabled

• **emojisEnabled**: `boolean`

Whether emojis are enabled on the subreddit.

---

### eventPostsEnabled

• **eventPostsEnabled**: `boolean`

Whether event posts are enabled on the subreddit.

---

### headerTitle

• `Optional` **headerTitle**: `string`

The header title.

---

### linkFlairEnabled

• **linkFlairEnabled**: `boolean`

Whether link flairs are enabled on the subreddit.

---

### mobileBannerImage

• `Optional` **mobileBannerImage**: `string`

Banner image used on mobile apps.

---

### originalContentTagEnabled

• **originalContentTagEnabled**: `boolean`

Whether the Original Content tag is enabled.

---

### postFlairs

• **postFlairs**: [`FlairSettings`](FlairSettings.md)

The post flair settings for the subreddit.

---

### restrictCommenting

• **restrictCommenting**: `boolean`

Whether commenting is restricted in the subreddit.

---

### restrictPosting

• **restrictPosting**: `boolean`

Whether posting is restricted in the subreddit.

---

### shouldArchivePosts

• **shouldArchivePosts**: `boolean`

Whether posts in the subreddit should be automatically archived after 6 months.

---

### spoilersEnabled

• **spoilersEnabled**: `boolean`

Whether the Spoiler tag is enabled.

---

### userFlairs

• **userFlairs**: [`FlairSettings`](FlairSettings.md)

The user flair settings for the subreddit.

---

### wikiEnabled

• **wikiEnabled**: `boolean`

Whether the wiki is enabled for the subreddit.
