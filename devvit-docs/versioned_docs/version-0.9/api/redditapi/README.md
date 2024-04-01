# @devvit/public-api - v0.9.0

## Table of contents

### Enumerations

- [FlairType](enums/FlairType.md)
- [WikiPagePermissionLevel](enums/WikiPagePermissionLevel.md)

### Classes

- [ButtonWidget](classes/ButtonWidget.md)
- [CalendarWidget](classes/CalendarWidget.md)
- [Comment](classes/Comment.md)
- [CommunityListWidget](classes/CommunityListWidget.md)
- [CustomWidget](classes/CustomWidget.md)
- [Flair](classes/Flair.md)
- [FlairTemplate](classes/FlairTemplate.md)
- [ImageWidget](classes/ImageWidget.md)
- [Listing](classes/Listing.md)
- [ModNote](classes/ModNote.md)
- [Post](classes/Post.md)
- [PostFlairWidget](classes/PostFlairWidget.md)
- [PrivateMessage](classes/PrivateMessage.md)
- [RedditAPIClient](classes/RedditAPIClient.md)
- [Subreddit](classes/Subreddit.md)
- [TextAreaWidget](classes/TextAreaWidget.md)
- [User](classes/User.md)
- [Widget](classes/Widget.md)
- [WikiPage](classes/WikiPage.md)
- [WikiPageRevision](classes/WikiPageRevision.md)
- [WikiPageSettings](classes/WikiPageSettings.md)

### Interfaces

- [BanUserOptions](interfaces/BanUserOptions.md)
- [BanWikiContributorOptions](interfaces/BanWikiContributorOptions.md)
- [CreateFlairTemplateOptions](interfaces/CreateFlairTemplateOptions.md)
- [CreateRelationshipOptions](interfaces/CreateRelationshipOptions.md)
- [CreateWikiPageOptions](interfaces/CreateWikiPageOptions.md)
- [CrosspostOptions](interfaces/CrosspostOptions.md)
- [EditFlairTemplateOptions](interfaces/EditFlairTemplateOptions.md)
- [FlairSettings](interfaces/FlairSettings.md)
- [GetCommentsByUserOptions](interfaces/GetCommentsByUserOptions.md)
- [GetCommentsOptions](interfaces/GetCommentsOptions.md)
- [GetHotPostsOptions](interfaces/GetHotPostsOptions.md)
- [GetModerationLogOptions](interfaces/GetModerationLogOptions.md)
- [GetPageRevisionsOptions](interfaces/GetPageRevisionsOptions.md)
- [GetPostsByUserOptions](interfaces/GetPostsByUserOptions.md)
- [GetPostsOptions](interfaces/GetPostsOptions.md)
- [GetPostsOptionsWithTimeframe](interfaces/GetPostsOptionsWithTimeframe.md)
- [GetSortedPostsOptions](interfaces/GetSortedPostsOptions.md)
- [GetSubredditUsersByTypeOptions](interfaces/GetSubredditUsersByTypeOptions.md)
- [InternalSetPostFlairOptions](interfaces/InternalSetPostFlairOptions.md)
- [InviteModeratorOptions](interfaces/InviteModeratorOptions.md)
- [ListingFetchOptions](interfaces/ListingFetchOptions.md)
- [ListingFetchResponse](interfaces/ListingFetchResponse.md)
- [ModAction](interfaces/ModAction.md)
- [ModActionTarget](interfaces/ModActionTarget.md)
- [MoreObject](interfaces/MoreObject.md)
- [MuteUserOptions](interfaces/MuteUserOptions.md)
- [RemoveRelationshipOptions](interfaces/RemoveRelationshipOptions.md)
- [SendPrivateMessageAsSubredditOptions](interfaces/SendPrivateMessageAsSubredditOptions.md)
- [SendPrivateMessageOptions](interfaces/SendPrivateMessageOptions.md)
- [SetFlairOptions](interfaces/SetFlairOptions.md)
- [SetPostFlairOptions](interfaces/SetPostFlairOptions.md)
- [SetUserFlairOptions](interfaces/SetUserFlairOptions.md)
- [SubmitLinkOptions](interfaces/SubmitLinkOptions.md)
- [SubredditSettings](interfaces/SubredditSettings.md)
- [UpdatePageSettingsOptions](interfaces/UpdatePageSettingsOptions.md)
- [UpdateWikiPageOptions](interfaces/UpdateWikiPageOptions.md)
- [UserNote](interfaces/UserNote.md)

### Type Aliases

- [AddWidgetData](README.md#addwidgetdata)
- [AllowableFlairContent](README.md#allowableflaircontent)
- [CommentMediaTypes](README.md#commentmediatypes)
- [CommentSort](README.md#commentsort)
- [CommentSubmissionOptions](README.md#commentsubmissionoptions)
- [CommonSubmitPostOptions](README.md#commonsubmitpostoptions)
- [CreateModNoteOptions](README.md#createmodnoteoptions)
- [EditCommentOptions](README.md#editcommentoptions)
- [FlairBackgroundColor](README.md#flairbackgroundcolor)
- [FlairTextColor](README.md#flairtextcolor)
- [GetModNotesOptions](README.md#getmodnotesoptions)
- [ModActionType](README.md#modactiontype)
- [ModNoteType](README.md#modnotetype)
- [ModeratorPermission](README.md#moderatorpermission)
- [PostTextOptions](README.md#posttextoptions)
- [RelationshipType](README.md#relationshiptype)
- [ReplyToCommentOptions](README.md#replytocommentoptions)
- [SubmitCustomPostOptions](README.md#submitcustompostoptions)
- [SubmitPostOptions](README.md#submitpostoptions)
- [SubmitSelfPostOptions](README.md#submitselfpostoptions)
- [SubredditType](README.md#subreddittype)
- [UserNoteLabel](README.md#usernotelabel)

### Functions

- [getModerationLog](README.md#getmoderationlog)

## Type Aliases

### AddWidgetData

Ƭ **AddWidgetData**: `AddImageWidgetRequest` & \{ `type`: `"image"` } \| `AddCalendarWidgetRequest` & \{ `type`: `"calendar"` } \| `AddTextAreaWidgetRequest` & \{ `type`: `"textarea"` } \| `AddButtonWidgetRequest` & \{ `type`: `"button"` } \| `AddCommunityListWidgetRequest` & \{ `type`: `"community-list"` } \| `AddPostFlairWidgetRequest` & \{ `type`: `"post-flair"` } \| `AddCustomWidgetRequest` & \{ `type`: `"custom"` }

---

### AllowableFlairContent

Ƭ **AllowableFlairContent**: `"all"` \| `"emoji"` \| `"text"`

---

### CommentMediaTypes

Ƭ **CommentMediaTypes**: `"giphy"` \| `"static"` \| `"animated"`

---

### CommentSort

Ƭ **CommentSort**: `"confidence"` \| `"top"` \| `"new"` \| `"controversial"` \| `"old"` \| `"random"` \| `"qa"` \| `"live"`

---

### CommentSubmissionOptions

Ƭ **CommentSubmissionOptions**: \{ `text`: `string` } \| \{ `richtext`: `object` \| `string` \| `RichTextBuilder` }

---

### CommonSubmitPostOptions

Ƭ **CommonSubmitPostOptions**: `Object`

#### Type declaration

| Name           | Type      |
| :------------- | :-------- |
| `flairId?`     | `string`  |
| `flairText?`   | `string`  |
| `nsfw?`        | `boolean` |
| `sendreplies?` | `boolean` |
| `spoiler?`     | `boolean` |
| `title`        | `string`  |

---

### CreateModNoteOptions

Ƭ **CreateModNoteOptions**: `Prettify`\< `PostNotesRequest` & \{ `label`: [`UserNoteLabel`](README.md#usernotelabel) ; `redditId`: `T1ID` \| `T3ID` }\>

---

### EditCommentOptions

Ƭ **EditCommentOptions**: [`CommentSubmissionOptions`](README.md#commentsubmissionoptions)

---

### FlairBackgroundColor

Ƭ **FlairBackgroundColor**: \`#$\{string}\` \| `"transparent"`

---

### FlairTextColor

Ƭ **FlairTextColor**: `"light"` \| `"dark"`

---

### GetModNotesOptions

Ƭ **GetModNotesOptions**: `Prettify`\< `Pick`\< `GetNotesRequest`, `"subreddit"` \| `"user"`\> & \{ `filter?`: [`ModNoteType`](README.md#modnotetype) } & `Pick`\< [`ListingFetchOptions`](interfaces/ListingFetchOptions.md), `"limit"` \| `"before"`\>\>

---

### ModActionType

Ƭ **ModActionType**: `"banuser"` \| `"unbanuser"` \| `"spamlink"` \| `"removelink"` \| `"approvelink"` \| `"spamcomment"` \| `"removecomment"` \| `"approvecomment"` \| `"addmoderator"` \| `"showcomment"` \| `"invitemoderator"` \| `"uninvitemoderator"` \| `"acceptmoderatorinvite"` \| `"removemoderator"` \| `"addcontributor"` \| `"removecontributor"` \| `"editsettings"` \| `"editflair"` \| `"distinguish"` \| `"marknsfw"` \| `"wikibanned"` \| `"wikicontributor"` \| `"wikiunbanned"` \| `"wikipagelisted"` \| `"removewikicontributor"` \| `"wikirevise"` \| `"wikipermlevel"` \| `"ignorereports"` \| `"unignorereports"` \| `"setpermissions"` \| `"setsuggestedsort"` \| `"sticky"` \| `"unsticky"` \| `"setcontestmode"` \| `"unsetcontestmode"` \| `"lock"` \| `"unlock"` \| `"muteuser"` \| `"unmuteuser"` \| `"createrule"` \| `"editrule"` \| `"reorderrules"` \| `"deleterule"` \| `"spoiler"` \| `"unspoiler"` \| `"modmail_enrollment"` \| `"community_styling"` \| `"community_widgets"` \| `"markoriginalcontent"` \| `"collections"` \| `"events"` \| `"hidden_award"` \| `"add_community_topics"` \| `"remove_community_topics"` \| `"create_scheduled_post"` \| `"edit_scheduled_post"` \| `"delete_scheduled_post"` \| `"submit_scheduled_post"` \| `"edit_post_requirements"` \| `"invitesubscriber"` \| `"submit_content_rating_survey"` \| `"adjust_post_crowd_control_level"` \| `"enable_post_crowd_control_filter"` \| `"disable_post_crowd_control_filter"` \| `"deleteoverriddenclassification"` \| `"overrideclassification"` \| `"reordermoderators"` \| `"snoozereports"` \| `"unsnoozereports"` \| `"addnote"` \| `"deletenote"` \| `"addremovalreason"` \| `"createremovalreason"` \| `"updateremovalreason"` \| `"deleteremovalreason"` \| `"dev_platform_app_changed"` \| `"dev_platform_app_disabled"` \| `"dev_platform_app_enabled"` \| `"dev_platform_app_installed"` \| `"dev_platform_app_uninstalled"`

---

### ModNoteType

Ƭ **ModNoteType**: `"NOTE"` \| `"APPROVAL"` \| `"REMOVAL"` \| `"BAN"` \| `"MUTE"` \| `"INVITE"` \| `"SPAM"` \| `"CONTENT_CHANGE"` \| `"MOD_ACTION"` \| `"ALL"`

---

### ModeratorPermission

Ƭ **ModeratorPermission**: `"all"` \| `"wiki"` \| `"posts"` \| `"access"` \| `"mail"` \| `"config"` \| `"flair"` \| `"chat_operator"` \| `"chat_config"`

---

### PostTextOptions

Ƭ **PostTextOptions**: \{ `text`: `string` } \| \{ `richtext`: `object` \| `string` \| `RichTextBuilder` }

---

### RelationshipType

Ƭ **RelationshipType**: `"moderator_invite"` \| `"contributor"` \| `"banned"` \| `"muted"` \| `"wikibanned"` \| `"wikicontributor"`

---

### ReplyToCommentOptions

Ƭ **ReplyToCommentOptions**: [`CommentSubmissionOptions`](README.md#commentsubmissionoptions)

---

### SubmitCustomPostOptions

Ƭ **SubmitCustomPostOptions**: [`CommonSubmitPostOptions`](README.md#commonsubmitpostoptions) & \{ `preview`: `Block` }

---

### SubmitPostOptions

Ƭ **SubmitPostOptions**: [`SubmitLinkOptions`](interfaces/SubmitLinkOptions.md) \| [`SubmitSelfPostOptions`](README.md#submitselfpostoptions) \| [`SubmitCustomPostOptions`](README.md#submitcustompostoptions) & \{ `subredditName`: `string` }

---

### SubmitSelfPostOptions

Ƭ **SubmitSelfPostOptions**: [`PostTextOptions`](README.md#posttextoptions) & [`CommonSubmitPostOptions`](README.md#commonsubmitpostoptions)

---

### SubredditType

Ƭ **SubredditType**: `"public"` \| `"private"` \| `"restricted"` \| `"employees_only"` \| `"gold_restricted"` \| `"archived"`

---

### UserNoteLabel

Ƭ **UserNoteLabel**: `"BOT_BAN"` \| `"PERMA_BAN"` \| `"BAN"` \| `"ABUSE_WARNING"` \| `"SPAM_WARNING"` \| `"SPAM_WATCH"` \| `"SOLID_CONTRIBUTOR"` \| `"HELPFUL_USER"`

## Functions

### getModerationLog

▸ **getModerationLog**(`options`, `metadata?`): [`Listing`](classes/Listing.md)\< [`ModAction`](interfaces/ModAction.md)\>

#### Parameters

| Name        | Type                                                               |
| :---------- | :----------------------------------------------------------------- |
| `options`   | [`GetModerationLogOptions`](interfaces/GetModerationLogOptions.md) |
| `metadata?` | `Metadata`                                                         |

#### Returns

[`Listing`](classes/Listing.md)\< [`ModAction`](interfaces/ModAction.md)\>
