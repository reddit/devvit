---
slug: /api
---

# Reddit API

Interacting with Reddit data is one of the funnest things you can do with devvit!

The Reddit Developer Platform implements `Devvit.Types.RedditAPI` for most of the features found in the [public Reddit API](https://www.reddit.com/dev/api). This document gives you an overview of how to use these components in your app.

# How to use Reddit API features

To use any Reddit API features, you need to first import, then instantiate, and finally invoke them.

## Import

The Reddit API is roughly organized around a set of objects with methods related to manipulating them. E.g. `Devvit.Types.RedditAPI.Flair` contains methods for dealing with flair while `Devvit.Types.RedditAPI.LinksAndComments` contains methods for working with posts (a.k.a Links or Articles) and comments.

Reddit API types can be found under `Devvit.Types.RedditAPI`. Many types will also take as input `<Type>Request` and return `<Type>Response` objects. You can import these from `@devvit/protos` which will help you find documentation on what arguments the method takes and what the return values look like.

In this example, we will use the "Flair" type to list the flair that my user has on a particular post.

```typescript
import { Devvit } from '@devvit/public-api';
import { FlairListResponse } from '@devvit/protos';
```

## Instantiate

Once you have imported the right objects, you need to create an instance of your type which you can use to make function calls. In the example below, we can use the `flair` object to get and modify flair.

```typescript
const flair = Devvit.use(Devvit.Types.RedditAPI.Flair);
```

## Invoke

For now, you will need to invoke your method within a ContextAction (i.e. in response to a user clicking on a Menu App item). To learn more about ContextActions, check out our [remind me turotial](remind_me_guide.md).

The code below will create Menu item available on posts and then use `Devvit.Types.RedditAPI.Flair.FlairList` to get a list of a user's flair on a particular post.

```typescript
import { Context, Devvit, PostContextActionEvent } from '@devvit/public-api';
import { FlairListResponse, Metadata } from '@devvit/protos';

const flair = Devvit.use(Devvit.Types.RedditAPI.Flair);

async function getFlair(event: PostContextActionEvent, metadata?: Metadata) {
  let success = true;
  let response: FlairListResponse | string;

  try {
    // The following call makes a call to https://www.reddit.com/dev/api/#GET_api_flairlist
    response = await flair.FlairList({
      limit: 10,
      subreddit: event.context.subreddit,
    });
  } catch (err: any) {
    success = false;
    response = `Error occurred: ${JSON.stringify(err)}`;
  }

  return {
    success,
    message: JSON.stringify(response),
  };
}

Devvit.addAction({
  name: 'Get flair',
  description: 'Lists out the flair on this post.',
  context: Context.POST,
  handler: getFlair,
});

export default Devvit;
```

## How to find documentation

We know the Reddit API is confusing and the documentation isn't great. We're working on building a much simpler, developer-friendly wrapper now, but until that arrives, we **strongly** recommend installing [VS Code](https://code.visualstudio.com/). This will provide auto-completion and tooltips which surface important information on vailable methods, argument types and examples.

You can also look for the corresponding methods on the [public Reddit API](https://www.reddit.com/dev/api) site. The methods used in the examples below point to the specific API endpoints used so you can see how the Types here relate to that documentation.

## Authentication

:::caution

Right now, your app will run with the identity and permissions of the user who installed the app into a particular subreddit. If the installer has the permission to modify comments on many subreddits, then your app will have the ability to modify comments on all those subreddits. In the (near) future, this will change: apps will need to be granted permissions by moderators on all subreddits

:::

The Reddit API plugin requires an authentication token, but this is automagically generated for you by the Reddit Developer Platform! There's no need to worry about creating, retrieving or managing your auth tokens.

# Reddit API Types

## Flair

Flair - [Public Reddit API Documentation](https://www.reddit.com/dev/api#section_flair)

### Global type

`Devvit.Types.RedditAPI.Flair`

### API methods

- ClearFlairTemplates(ClearFlairTemplatesRequest) returns (Empty)
- DeleteFlair(DeleteFlairRequest) returns (Empty)
- DeleteFlairTemplate(DeleteFlairTemplateRequest) returns (Empty)
- Flair(FlairRequest) returns (Empty)
- FlairTemplateOrder(FlairTemplateOrderRequest) returns (Empty)
- FlairConfig(FlairConfigRequest) returns (Empty)
- FlairCsv(FlairCsvRequest) returns (FlairCsvResponse)
- FlairList(FlairListRequest) returns (FlairListResponse)
- FlairSelector(FlairSelectorRequest) returns (FlairSelectorResponse)
- FlairTemplate(FlairTemplateRequest) returns (FlairObject)
- LinkFlair(LinkFlairRequest) returns (FlairArray)
- SelectFlair(SelectFlairRequest) returns (Empty)
- SetFlairEnabled(SetFlairEnabledRequest) returns (Empty)
- UserFlair(google.protobuf.Empty) returns (FlairArray)

**Example**

```typescript
/**
 * Retrieve the flair for the author of a specific post
 * https://www.reddit.com/dev/api/#GET_api_flairlist
 */
import { Context, Devvit, PostContextActionEvent } from '@devvit/public-api';
import { FlairListResponse, Metadata } from '@devvit/protos';

const flair = Devvit.use(Devvit.Types.RedditAPI.Flair);

async function getFlair(event: PostContextActionEvent, metadata?: Metadata) {
  let success = true;
  let response: FlairListResponse | string;

  try {
    // The following call makes a call to https://www.reddit.com/dev/api/#GET_api_flairlist
    response = await flair.FlairList({
      limit: 10,
      subreddit: event.context.subreddit,
    });
  } catch (err: any) {
    success = false;
    response = `Error occurred: ${JSON.stringify(err)}`;
  }

  return {
    success,
    message: JSON.stringify(response),
  };
}

Devvit.addAction({
  name: 'Get flair',
  description: 'Lists out the flair on this post.',
  context: Context.POST,
  handler: getFlair,
});

export default Devvit;
```

## Links & Comments

Links & Comments - [Public Reddit API Documentation](https://www.reddit.com/dev/api#section_links_and_comments)

### Global type

`Devvit.Types.RedditAPI.LinksAndComments`

### API methods

- Comment(CommentRequest) returns (RedditObject)
- Del(BasicIdRequest) returns (Empty)
- EditUserText(CommentRequest) returns (RedditObject)
- EventPostTime(EventPostTimeRequest) returns (EventPostTimeResponse)
- FollowPost(FollowPostRequest) returns (Empty)
- Hide(BasicIdRequest) returns (Empty)
- Info(InfoRequest) returns (Listing)
- Lock(BasicIdRequest) returns (Empty)
- MarkNSFW(BasicIdRequest) returns (Empty)
- MoreChildren(MoreChildrenRequest) returns (MoreChildrenResponse)
- Report(ReportRequest) returns (BasicJsonObject)
- ReportAward(ReportAwardRequest) returns (Empty)
- Save(SaveRequest) returns (Empty)
- SavedCategories(google.protobuf.Empty) returns (SavedCategoriesResponse)
- SendReplies(SendRepliesRequest) returns (.Empty)
- SetContestMode(SetContestModeRequest) returns (BasicJsonObject)
- SetSubredditSticky(SetSubredditStickyRequest) returns (BasicJsonObject)
- SetSuggestedSort(SetSuggestedSortRequest) returns (BasicJsonObject)
- Spoiler(BasicIdRequest) returns (Empty)
- StoreVisits(StoreVisitsRequest) returns (Empty)
- Submit(SubmitRequest) returns (SubmitResponse)
- Unhide(BasicIdRequest) returns (Empty)
- Unlock(BasicIdRequest) returns (Empty)
- UnmarkNSFW(BasicIdRequest) returns (Empty)
- Unsave(BasicIdRequest) returns (Empty)
- Unspoiler(BasicIdRequest) returns (Empty)
- Vote(VoteRequest) returns (Empty)

**Example**

```typescript
/**
 * Retrieve more comments on a post with hidden comments
 * https://www.reddit.com/dev/api#GET_api_morechildren
 */
import { ContextActionsBuilder, Devvit } from '@devvit/public-api';
import { MoreChildrenResponse } from '@devvit/protos';

const lc = Devvit.use(Devvit.Types.RedditAPI.LinksAndComments);

Devvit.ContextAction.onGetActions(async () => {
  return new ContextActionsBuilder()
    .action({
      actionId: 'comment-getter',
      name: 'Get more comments',
      description: 'Gets more comments.',
      post: true,
    })
    .build();
});

Devvit.ContextAction.onAction(async (action, metadata) => {
  let success = true;
  let response: MoreChildrenResponse | string;
  try {
    response = await lc.MoreChildren({ link_id: `t3_${action.post?.id}` }); // t3_ represents a post a.k.a. a "link"
  } catch (err: any) {
    response = `Error occurred: ${JSON.stringify(err)}`;
    success = false;
  }

  return {
    success,
    message: JSON.stringify(response),
  };
});

export default Devvit;
```

## Listings

Listings - [Public Reddit API Documentation](https://www.reddit.com/dev/api#section_listings)

### Global type

`Devvit.Types.RedditAPI.Listings`

### API methods

- Best(GetBestRequest) returns (Listing)
- ById(GetByIdRequest) returns (Listing)
- Comments(GetCommentsRequest) returns (Listing)
- CommentsArticle(GetCommentsArticleRequest) returns (ListingResponse)
- Duplicates(GetDuplicatesRequest) returns (ListingResponse)
- Hot(GetHotRequest) returns (Listing)
- New(GetNewRequest) returns (Listing)
- Random(GetRandomRequest) returns (ListingResponse)
- Rising(GetRisingRequest) returns (Listing)
- Sort(GetSortRequest) returns (Listing)

**Example**

```typescript
/**
 * Gets the top 10 comments for this post sorted by "Best."
 * https://www.reddit.com/dev/api#GET_best
 */
import { ContextActionsBuilder, Devvit } from '@devvit/public-api';
import { Listing } from '@devvit/protos';

const listings = Devvit.use(Devvit.Types.RedditAPI.Listings);

Devvit.ContextAction.onGetActions(async () => {
  return new ContextActionsBuilder()
    .action({
      actionId: 'best-comments',
      name: 'Gets best comments',
      description: 'Gets comments sorted by "Best".',
      post: true,
    })
    .build();
});

Devvit.ContextAction.onAction(async (action, metadata) => {
  let success = true;
  let response: Listing | string;
  try {
    response = await listings.Best({ limit: 10 });
  } catch (err: any) {
    response = `Error occurred: ${JSON.stringify(err)}`;
    success = false;
  }

  return {
    success,
    message: JSON.stringify(response),
  };
});

export default Devvit;
```

## Moderation

Moderation - [Public Reddit API Documentation](https://www.reddit.com/dev/api#section_moderation)

### Global type

`Devvit.Types.RedditAPI.Moderation`

### API methods

- AboutLog(AboutLogRequest) returns (AboutLogResponse)
- AboutLocation(AboutLocationRequest) returns (Listing)
- AboutReports(AboutLocationRequest) returns (Listing)
- AboutSpam(AboutLocationRequest) returns (Listing)
- AboutModqueue(AboutLocationRequest) returns (Listing)
- AboutUnmoderated(AboutLocationRequest) returns (Listing)
- AboutEdited(AboutLocationRequest) returns (Listing)
- AcceptModeratorInvite(AcceptModeratorInviteRequest) returns (BasicJsonObject)
- Approve(BasicModerationIdRequest) returns (Empty)
- Distinguish(DistinguishRequest) returns (JsonRedditObjects)
- IgnoreReports(BasicModerationIdRequest) returns (Empty)
- LeaveContributor(BasicModerationIdRequest) returns (Empty)
- LeaveModerator(BasicModerationIdRequest) returns (Empty)
- MuteMessageAuthor(BasicModerationIdRequest) returns (Empty)
- Remove(RemoveRequest) returns (Empty)
- ShowComment(BasicModerationIdRequest) returns (Empty)
- SnoozeReports(SnoozeReportsRequest) returns (Empty)
- UnignoreReports(BasicModerationIdRequest) returns (Empty)
- UnmuteMessageAuthor(BasicModerationIdRequest) returns (Empty)
- UnsnoozeReports(SnoozeReportsRequest) returns (Empty)
- UpdateCrowdControlLevel(UpdateCrowdControlLevelRequest) returns (Empty)
- Stylesheet(StylesheetRequest) returns (StringValue)

**Example**

```typescript
/**
 * Retrieves mod logs describing recent mod actions against type: spamlink
 * https://www.reddit.com/dev/api#GET_about_log
 */
import { Devvit, Context, SubredditContextActionEvent } from '@devvit/public-api';
import { Metadata } from '@devvit/protos';

const moderation = Devvit.use(Devvit.Types.RedditAPI.Moderation);

async function getModLogSpamLinks(event: SubredditContextActionEvent, metadata?: Metadata) {
  if (!event.subreddit.url) {
    return {
      success: false,
      message: 'Subreddit is missing url (in event.subreddit.url)',
    };
  }

  let success = true;
  let response = '';

  try {
    // Get the subreddit name from the url. event.subreddit.name is a thingId not a name
    const subreddit = event.subreddit.url.split('/')[2];
    const aboutLog = await moderation.AboutLog(
      {
        type: 'spamlink',
        subreddit,
      },
      metadata
    );

    // The response is a list of mod actions. Let's make a brief summary of them to
    // display in the context-menu's toast notification.
    if (aboutLog.data) {
      response = aboutLog.data.children
        .map((action) => {
          const { data } = action;
          if (!data) {
            return 'action is missing data';
          }

          const actionDescription = `Action: ${data.action} - Target Author: ${data.targetAuthor} - Target Title ${data.targetTitle} - Target Permalink ${data.targetPermalink} - Mod: ${data.mod} -  Details: ${data.details}`;

          return actionDescription;
        })
        .join('\n\n');
    } else {
      response = 'No data in response';
    }
  } catch (err: any) {
    response = `Error occurred: ${JSON.stringify(err)} err ${err}}`;
    success = false;
  }

  return {
    success: success,
    message: JSON.stringify(response),
  };
}

Devvit.addAction({
  name: 'Get recent spam actions',
  description: 'Queries the mod log for any actions classified as "spamlink".',
  context: Context.SUBREDDIT,
  handler: getModLogSpamLinks,
});

export default Devvit;
```

## Mod Note

Mod Note - [Public Reddit API Documentation](https://www.reddit.com/dev/api#section_modnote)

### Global type

`Devvit.Types.RedditAPI.ModNote`

### API methods

- GetNotes(GetNotesRequest) returns (ModNotesResponse)
- DeleteNotes(DeleteNotesRequest) returns (DeleteNotesResponse)
- PostNotes(PostNotesRequest) returns (PostModNotesResponse)
- RecentNotes(RecentNotesRequest) returns (ModNotesResponse)

**Example**

```typescript
/**
 * Get recent mod notes
 * Current subreddits are hardcoded (pics and aww), but could be set dynamically
 * https://www.reddit.com/dev/api#GET_api_mod_notes_recent
 */
import { ContextActionsBuilder, Devvit } from '@devvit/public-api';
import { ModNotesResponse } from '@devvit/protos';

const modnote = Devvit.use(Devvit.Types.RedditAPI.ModNote);

Devvit.ContextAction.onGetActions(async () => {
  return new ContextActionsBuilder()
    .action({
      actionId: '',
      name: 'Get recent mod notes',
      description: 'Get the most recent notes written by a moderator.',
      subreddit: true,
      moderator: true,
    })
    .build();
});

Devvit.ContextAction.onAction(async (action, metadata) => {
  let success = true;
  let response: ModNotesResponse | string;
  try {
    response = await modnote.RecentNotes({ subreddits: 'pics, aww' });
  } catch (err: any) {
    response = `Error occurred: ${JSON.stringify(err)}`;
    success = false;
  }

  return {
    success,
    message: JSON.stringify(response),
  };
});

export default Devvit;
```

## New Modmail

New Modmail - [Public Reddit API Documentation](https://www.reddit.com/dev/api#section_modmail)

### Globaltype

`Devvit.Types.RedditAPI.NewModmail`

### API methods

- BulkReadConversations(BulkReadConversationsRequest) returns (BulkReadConversationsResponse)
- GetConversations(GetConversationsRequest) returns (GetConversationsResponse)
- CreateConversation(CreateConversationRequest) returns (CreateConversationResponse)
- GetConversation(GetConversationRequest) returns (GetConversationResponse)
- CreateConversationMessage(CreateConversationMessageRequest) returns (
- CreateConversationMessageResponse)
- ApproveConversation(BasicConversationRequest) returns (ApproveConversationResponse)
- ArchiveConversation(BasicConversationRequest) returns (ArchiveConversationResponse)
- DisapproveConversation(BasicConversationRequest) returns (ApproveConversationResponse)
- UnhighlightConversation(BasicConversationRequest) returns (HighlightConversationResponse)
- HighlightConversation(BasicConversationRequest) returns (HighlightConversationResponse)
- MuteConversation(MuteConversationRequest) returns (MuteConversationResponse)
- TempBan(TempBanRequest) returns (TempBanResponse)
- UnarchiveConversation(BasicConversationRequest) returns (ArchiveConversationResponse)
- Unban(BasicConversationRequest) returns (TempBanResponse)
- UnmuteConversation(BasicConversationRequest) returns (MuteConversationResponse)
- UserConversations(BasicConversationRequest) returns (ConversationUserData)
- Read(BasicConversationsRequest) returns (Empty)
- Subreddits(google.protobuf.Empty) returns (SubredditsResponse)
- Unread(BasicConversationsRequest) returns (Empty)
- UnreadCount(google.protobuf.Empty) returns (UnreadCountResponse)

**Example**

```typescript
/**
 * Get the 10 most recent mod mail messages in "inbox"
 * https://www.reddit.com/dev/api#GET_api_mod_conversations
 */
import { ContextActionsBuilder, Devvit } from '@devvit/public-api';
import { GetConversationResponse } from '@devvit/protos';

const newmodmail = Devvit.use(Devvit.Types.RedditAPI.NewModmail);

Devvit.ContextAction.onGetActions(async () => {
  return new ContextActionsBuilder()
    .action({
      actionId: '',
      name: 'Get recent modmail',
      description: 'Get the 10 most recent mod mail messages in "inbox".',
      subreddit: true,
      moderator: true,
    })
    .build();
});

Devvit.ContextAction.onAction(async (action, metadata) => {
  let success = true;
  let response: GetConversationResponse | string;
  try {
    response = await newmodmail.GetConversation({ limit: 10, state: 'inbox' });
  } catch (err: any) {
    response = `Error occurred: ${JSON.stringify(err)}`;
    success = false;
  }

  return {
    success,
    message: JSON.stringify(response),
  };
});

export default Devvit;
```

## Private Messages

Private Messages - [Public Reddit API Documentation](https://www.reddit.com/dev/api#section_messages)

### Global type

`Devvit.Types.RedditAPI.PrivateMessages`

### API methods

- Block(GenericPrivateMessagesRequest) returns (Empty)
- CollapseMessage(GenericPrivateMessagesRequest) returns (Empty)
- Compose(ComposeRequest) returns (Empty)
- DelMsg(GenericPrivateMessagesRequest) returns (Empty)
- MessageWhere(MessageWhereRequest) returns (Listing)
- ReadAllMessages(ReadAllMessagesRequest) returns (Empty)
- ReadMessage(GenericPrivateMessagesRequest) returns (Empty)
- UnblockSubreddit(GenericPrivateMessagesRequest) returns (Empty)
- UncollapseMessage(GenericPrivateMessagesRequest) returns (Empty)
- UnreadMessage(GenericPrivateMessagesRequest) returns (Empty)

**Example**
TBD

## Subreddits

Subreddits - [Public Reddit API Documentation](https://www.reddit.com/dev/api#section_subreddits)

### Global type

`Devvit.Types.RedditAPI.Subreddits`

### API methods

- AboutWhere(AboutWhereRequest) returns (Listing)
- DeleteSrBanner(BasicSubredditRequest) returns (BasicJsonObject)
- DeleteSrHeader(BasicSubredditRequest) returns (BasicJsonObject)
- DeleteSrIcon(BasicSubredditRequest) returns (BasicJsonObject)
- DeleteSrImg(DeleteSrImgRequest) returns (BasicJsonObject)
- SearchRedditNames(BasicSearchRequest) returns (SearchRedditNamesResponse)
- SearchSubreddits(BasicSearchRequest) returns (SearchSubredditsResponse)
- SiteAdmin(SiteAdminRequest) returns (BasicJsonObject)
- SubmitText(BasicSubredditRequest) returns (SubmitTextResponse)
- SubredditAutocomplete(SubredditAutocompleteRequest) returns (SubredditAutocompleteResponse)
- SubredditStylesheet(SubredditStylesheetRequest) returns (BasicJsonObject)
- Subscribe(SubscribeRequest) returns (Empty)
- UploadSrImg(UploadSrImgRequest) returns (UploadSrImgResponse)
- SubredditPostRequirements(BasicSubredditRequest) returns (SubredditPostRequirementsResponse)
- SubredditAbout(BasicSubredditRequest) returns (SubredditAboutResponse)
- SubredditAboutEdit(SubredditAboutEditRequest) returns (SubredditAboutEditResponse)
- SubredditAboutRules(BasicSubredditRequest) returns (SubredditAboutRulesResponse)
- SubredditAboutTraffic(BasicSubredditRequest) returns (SubredditAboutTrafficResponse)
- Sidebar(BasicSubredditRequest) returns (google.protobuf.StringValue)
- Sticky(StickyRequest) returns (StickyResponse)
- SubredditsMineWhere(BasicWhereRequest) returns (Listing)
- SubredditsSearch(SubredditsSearchRequest) returns (SubredditsSearchResponse)
- SubredditsWhere(BasicWhereRequest) returns (SubredditsSearchResponse)
- UsersSearch(UsersSearchRequest) returns (UserSearchResponse)
- UsersWhere(BasicWhereRequest) returns (SubredditsSearchResponse)

**Example**
TBD

## Users

Users - [Public Reddit API Documentation](https://www.reddit.com/dev/api#section_users)

### Global type

`Devvit.Types.RedditAPI.Users`

### API methods

- BlockUser(BlockUserRequest) returns (BlockUserResponse)
- Friend(FriendRequest) returns (BasicJsonObject)
- ReportUser(ReportUserRequest) returns (Empty)
- SetPermissions(SetPermissionsRequest) returns (BasicJsonObject)
- Unfriend(UnfriendRequest) returns (Empty)
- UserDataByAccountIds(UserDataByAccountIdsRequest) returns (UserDataByAccountIdsResponse)
- UsernameAvailable(UsernameAvailableRequest) returns (BoolValue)
- UnfriendUser(GenericUsersRequest) returns (Empty)
- GetFriendInformation(GenericUsersRequest) returns (GeneralFriendResponse)
- UpdateFriendRelationship(UpdateFriendRelationshipRequest) returns (GeneralFriendResponse)
- UserTrophies(GenericUsersRequest) returns (UserTrophiesResponse)
- UserAbout(UserAboutRequest) returns (UserAboutResponse)
- UserWhere(UserWhereRequest) returns (Listing)

**Example**
TBD

## Coming soon

The Reddit API plugin is a work in progress, and the following categories will be implemented soon:

- Account
- Collections
- Emoji
- Reddit gold
- Live threads
- Multis
- Search
- Widgets
- Wiki

(Except that we don’t plan to implement Captcha or Misc, ever.)
