# Class: ModMailService

[models](../modules/models.md).ModMailService

Class providing the methods for working with Mod Mail

## Table of contents

### Properties

- [notificationSubjectPrefix](models.ModMailService.md#notificationsubjectprefix)

### Methods

- [approveConversation](models.ModMailService.md#approveconversation)
- [archiveConversation](models.ModMailService.md#archiveconversation)
- [bulkReadConversations](models.ModMailService.md#bulkreadconversations)
- [createConversation](models.ModMailService.md#createconversation)
- [createModDiscussionConversation](models.ModMailService.md#createmoddiscussionconversation)
- [createModInboxConversation](models.ModMailService.md#createmodinboxconversation)
- [createModNotification](models.ModMailService.md#createmodnotification)
- [disapproveConversation](models.ModMailService.md#disapproveconversation)
- [getConversation](models.ModMailService.md#getconversation)
- [getConversations](models.ModMailService.md#getconversations)
- [getSubreddits](models.ModMailService.md#getsubreddits)
- [getUnreadCount](models.ModMailService.md#getunreadcount)
- [getUserConversations](models.ModMailService.md#getuserconversations)
- [highlightConversation](models.ModMailService.md#highlightconversation)
- [muteConversation](models.ModMailService.md#muteconversation)
- [readConversations](models.ModMailService.md#readconversations)
- [reply](models.ModMailService.md#reply)
- [tempBanConversation](models.ModMailService.md#tempbanconversation)
- [unarchiveConversation](models.ModMailService.md#unarchiveconversation)
- [unbanConversation](models.ModMailService.md#unbanconversation)
- [unhighlightConversation](models.ModMailService.md#unhighlightconversation)
- [unmuteConversation](models.ModMailService.md#unmuteconversation)
- [unreadConversations](models.ModMailService.md#unreadconversations)

## Properties

### <a id="notificationsubjectprefix" name="notificationsubjectprefix"></a> notificationSubjectPrefix

• `Readonly` **notificationSubjectPrefix**: `"[notification]"`

## Methods

### <a id="approveconversation" name="approveconversation"></a> approveConversation

▸ **approveConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

Approve the non mod user associated with a particular conversation.

#### Parameters

| Name             | Type     | Description                  |
| :--------------- | :------- | :--------------------------- |
| `conversationId` | `string` | Id of a modmail conversation |

#### Returns

`Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

**`Example`**

```ts
await reddit.modMail.approveConversation('abcdef');
```

---

### <a id="archiveconversation" name="archiveconversation"></a> archiveConversation

▸ **archiveConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse)\>

Marks a conversation as archived

#### Parameters

| Name             | Type     | Description                  |
| :--------------- | :------- | :--------------------------- |
| `conversationId` | `string` | Id of a modmail conversation |

#### Returns

`Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse)\>

**`Example`**

```ts
await reddit.modMail.archive('abcdef');
```

---

### <a id="bulkreadconversations" name="bulkreadconversations"></a> bulkReadConversations

▸ **bulkReadConversations**(`subreddits`, `state`): `Promise`\<`string`[]\>

Marks all conversations read for a particular conversation state within the passed list of subreddits.

#### Parameters

| Name         | Type                                                                      | Description                                                               |
| :----------- | :------------------------------------------------------------------------ | :------------------------------------------------------------------------ |
| `subreddits` | `string`[]                                                                | Array of subreddit names                                                  |
| `state`      | [`ConversationStateFilter`](../modules/models.md#conversationstatefilter) | One of the possible conversation states ('all' to read all conversations) |

#### Returns

`Promise`\<`string`[]\>

conversationIds

**`Example`**

```ts
const conversationIds = await reddit.modMail.bulkReadConversations(
  ['askReddit', 'myAwesomeSubreddit'],
  'filtered'
);
```

---

### <a id="createconversation" name="createconversation"></a> createConversation

▸ **createConversation**(`params`): `Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

Creates a new conversation for a particular SR.

This endpoint will create a ModmailConversation object
as well as the first ModmailMessage within the ModmailConversation object.

#### Parameters

| Name                     | Type               | Description                                                      |
| :----------------------- | :----------------- | :--------------------------------------------------------------- |
| `params`                 | `Object`           | -                                                                |
| `params.body`            | `string`           | markdown text                                                    |
| `params.isAuthorHidden?` | `boolean`          | is author hidden? (default: false)                               |
| `params.subject`         | `string`           | subject of the conversation. max 100 characters                  |
| `params.subredditName`   | `string`           | subreddit name                                                   |
| `params.to?`             | `null` \| `string` | a user (e.g. u/username), a subreddit (e.g. r/subreddit) or null |

#### Returns

`Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

**`Note`**

Note on {param.to}:
The to field for this endpoint is somewhat confusing. It can be:

- A User, passed like "username" or "u/username"
- A Subreddit, passed like "r/subreddit"
- null, meaning an internal moderator discussion

In this way to is a bit of a misnomer in modmail conversations.
What it really means is the participant of the conversation who is not a mod of the subreddit.

If you plan to send a message to the app-account or a moderator of the subreddit, use [ModMailService.createModDiscussionConversation](models.ModMailService.md#createmoddiscussionconversation), [ModMailService.createModInboxConversation](models.ModMailService.md#createmodinboxconversation), or [ModMailService.createModNotification](models.ModMailService.md#createmodnotification) instead.
Otherwise, messages sent to the app-account or moderator will automatically be routed to Mod Discussions.

**`Example`**

```ts
const { conversation, messages, modActions } = await reddit.modMail.createConversation({
  subredditName: 'askReddit',
  subject: 'Test conversation',
  body: 'Lorem ipsum sit amet',
  to: null,
});
```

---

### <a id="createmoddiscussionconversation" name="createmoddiscussionconversation"></a> createModDiscussionConversation

▸ **createModDiscussionConversation**(`params`): `Promise`\<`string`\>

Creates a conversation in Mod Discussions with the moderators of the given subredditId.

Note: The app must be installed in the subreddit in order to create a conversation in Mod Discussions.

#### Parameters

| Name                  | Type     |
| :-------------------- | :------- |
| `params`              | `Object` |
| `params.bodyMarkdown` | `string` |
| `params.subject`      | `string` |
| `params.subredditId`  | `string` |

#### Returns

`Promise`\<`string`\>

A Promise that resolves a string representing the conversationId of the message.

**`Example`**

```ts
const conversationId = await reddit.modMail.createModDiscussionConversation({
  subject: 'Test conversation',
  bodyMarkdown: '**Hello there** \n\n _Have a great day!_',
  subredditId: context.subredditId,
});
```

---

### <a id="createmodinboxconversation" name="createmodinboxconversation"></a> createModInboxConversation

▸ **createModInboxConversation**(`params`): `Promise`\<`string`\>

Creates a conversation in the Modmail Inbox with the moderators of the given subredditId.

#### Parameters

| Name                  | Type     |
| :-------------------- | :------- |
| `params`              | `Object` |
| `params.bodyMarkdown` | `string` |
| `params.subject`      | `string` |
| `params.subredditId`  | `string` |

#### Returns

`Promise`\<`string`\>

A Promise that resolves a string representing the conversationId of the message.

**`Example`**

```ts
const conversationId = await reddit.modMail.createModInboxConversation({
  subject: 'Test conversation',
  bodyMarkdown: '**Hello there** \n\n _Have a great day!_',
  subredditId: context.subredditId,
});
```

---

### <a id="createmodnotification" name="createmodnotification"></a> createModNotification

▸ **createModNotification**(`params`): `Promise`\<`string`\>

Creates a notification in the Modmail Inbox.
This function is different from [ModMailService.createModInboxConversation](models.ModMailService.md#createmodinboxconversation) in that the conversation also appears in the "Notifications" section of Modmail.

#### Parameters

| Name                  | Type     |
| :-------------------- | :------- |
| `params`              | `Object` |
| `params.bodyMarkdown` | `string` |
| `params.subject`      | `string` |
| `params.subredditId`  | `string` |

#### Returns

`Promise`\<`string`\>

A Promise that resolves a string representing the conversationId of the message.

**`Example`**

```ts
const conversationId = await reddit.modMail.createModNotification({
  subject: 'Test notification',
  bodyMarkdown: '**Hello there** \n\n _This is a notification!_',
  subredditId: context.subredditId,
});
```

---

### <a id="disapproveconversation" name="disapproveconversation"></a> disapproveConversation

▸ **disapproveConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

Disapprove the non mod user associated with a particular conversation.

#### Parameters

| Name             | Type     | Description                  |
| :--------------- | :------- | :--------------------------- |
| `conversationId` | `string` | Id of a modmail conversation |

#### Returns

`Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

**`Example`**

```ts
await reddit.modMail.disapproveConversation('abcdef');
```

---

### <a id="getconversation" name="getconversation"></a> getConversation

▸ **getConversation**(`params`): `Promise`\<[`GetConversationResponse`](../modules/models.md#getconversationresponse)\>

Returns all messages, mod actions and conversation metadata for a given conversation id

#### Parameters

| Name                    | Type      | Description               |
| :---------------------- | :-------- | :------------------------ |
| `params`                | `Object`  | -                         |
| `params.conversationId` | `string`  | a modmail conversation id |
| `params.markRead?`      | `boolean` | mark read?                |

#### Returns

`Promise`\<[`GetConversationResponse`](../modules/models.md#getconversationresponse)\>

**`Example`**

```ts
const { conversation, messages, modActions, user } = await reddit.modMail.getConversation({
  conversationId: 'abcdef',
  markRead: true,
});
```

---

### <a id="getconversations" name="getconversations"></a> getConversations

▸ **getConversations**(`params`): `Promise`\<[`GetConversationsResponse`](../modules/models.md#getconversationsresponse)\>

Get conversations for a logged in user or subreddits

#### Parameters

| Name     | Type                                                                      |
| :------- | :------------------------------------------------------------------------ |
| `params` | [`GetConversationsRequest`](../modules/models.md#getconversationsrequest) |

#### Returns

`Promise`\<[`GetConversationsResponse`](../modules/models.md#getconversationsresponse)\>

**`Example`**

```ts
const { viewerId, conversations } = await reddit.modMail.getConversations({
  after: 'abcdef',
  limit: 42,
});

const arrayOfConversations = Object.values(conversations);
```

---

### <a id="getsubreddits" name="getsubreddits"></a> getSubreddits

▸ **getSubreddits**(): `Promise`\<\{ `[key: string]`: [`SubredditData`](../modules/models.md#subredditdata); }\>

Returns a list of Subreddits that the user moderates with mail permission

#### Returns

`Promise`\<\{ `[key: string]`: [`SubredditData`](../modules/models.md#subredditdata); }\>

**`Example`**

```ts
const subredditsData = await reddit.modMail.getSubreddits();

for (const subreddit of Object.values(subreddits)) {
  console.log(subreddit.id);
  console.log(subreddit.name);
}
```

---

### <a id="getunreadcount" name="getunreadcount"></a> getUnreadCount

▸ **getUnreadCount**(): `Promise`\<[`UnreadCountResponse`](../modules/models.md#unreadcountresponse)\>

Endpoint to retrieve the unread conversation count by conversation state.

#### Returns

`Promise`\<[`UnreadCountResponse`](../modules/models.md#unreadcountresponse)\>

**`Example`**

```ts
const response = await reddit.modMail.getUnreadCount();

console.log(response.highlighted);
console.log(response.new);
```

---

### <a id="getuserconversations" name="getuserconversations"></a> getUserConversations

▸ **getUserConversations**(`conversationId`): `Promise`\<[`ConversationUserData`](../modules/models.md#conversationuserdata)\>

Returns recent posts, comments and modmail conversations for a given user.

#### Parameters

| Name             | Type     | Description                  |
| :--------------- | :------- | :--------------------------- |
| `conversationId` | `string` | Id of a modmail conversation |

#### Returns

`Promise`\<[`ConversationUserData`](../modules/models.md#conversationuserdata)\>

**`Example`**

```ts
const data = await reddit.modMail.getUserConversations('abcdef');

console.log(data.recentComments);
console.log(data.recentPosts);
```

---

### <a id="highlightconversation" name="highlightconversation"></a> highlightConversation

▸ **highlightConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse)\>

Marks a conversation as highlighted.

#### Parameters

| Name             | Type     | Description                  |
| :--------------- | :------- | :--------------------------- |
| `conversationId` | `string` | Id of a modmail conversation |

#### Returns

`Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse)\>

**`Example`**

```ts
await reddit.modMail.highlightConversation('abcdef');
```

---

### <a id="muteconversation" name="muteconversation"></a> muteConversation

▸ **muteConversation**(`params`): `Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

Marks a conversation as read for the user.

#### Parameters

| Name                    | Type                   | Description                                                                                 |
| :---------------------- | :--------------------- | :------------------------------------------------------------------------------------------ |
| `params`                | `Object`               | -                                                                                           |
| `params.conversationId` | `string`               | Id of a modmail conversation                                                                |
| `params.numHours`       | `72` \| `168` \| `672` | For how many hours the conversation needs to be muted. Must be one of 72, 168, or 672 hours |

#### Returns

`Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

**`Example`**

```ts
await reddit.modMail.muteConversation({ conversationId: 'abcdef', numHours: 72 });
```

---

### <a id="readconversations" name="readconversations"></a> readConversations

▸ **readConversations**(`conversationIds`): `Promise`\<`void`\>

Marks a conversations as read for the user.

#### Parameters

| Name              | Type       | Description     |
| :---------------- | :--------- | :-------------- |
| `conversationIds` | `string`[] | An array of ids |

#### Returns

`Promise`\<`void`\>

**`Example`**

```ts
await reddit.modMail.readConversations(['abcdef', 'qwerty']);
```

---

### <a id="reply" name="reply"></a> reply

▸ **reply**(`params`): `Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

Creates a new message for a particular conversation.

#### Parameters

| Name                     | Type      | Description                           |
| :----------------------- | :-------- | :------------------------------------ |
| `params`                 | `Object`  | -                                     |
| `params.body`            | `string`  | markdown text                         |
| `params.conversationId`  | `string`  | Id of a modmail conversation          |
| `params.isAuthorHidden?` | `boolean` | is author hidden? (default: false)    |
| `params.isInternal?`     | `boolean` | is internal message? (default: false) |

#### Returns

`Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

**`Example`**

```ts
await reddit.modMail.reply({
  body: 'Lorem ipsum sit amet',
  conversationId: 'abcdef',
});
```

---

### <a id="tempbanconversation" name="tempbanconversation"></a> tempBanConversation

▸ **tempBanConversation**(`params`): `Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

Temporary ban (switch from permanent to temporary ban) the non mod user associated with a particular conversation.

#### Parameters

| Name                    | Type     | Description               |
| :---------------------- | :------- | :------------------------ |
| `params`                | `Object` | -                         |
| `params.conversationId` | `string` | a modmail conversation id |
| `params.duration`       | `number` | duration in days, max 999 |

#### Returns

`Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

**`Example`**

```ts
await reddit.modMail.tempBanConversation({ conversationId: 'abcdef', duration: 42 });
```

---

### <a id="unarchiveconversation" name="unarchiveconversation"></a> unarchiveConversation

▸ **unarchiveConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse)\>

Marks conversation as unarchived.

#### Parameters

| Name             | Type     | Description                  |
| :--------------- | :------- | :--------------------------- |
| `conversationId` | `string` | Id of a modmail conversation |

#### Returns

`Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse)\>

**`Example`**

```ts
await reddit.modMail.unarchiveConversation('abcdef');
```

---

### <a id="unbanconversation" name="unbanconversation"></a> unbanConversation

▸ **unbanConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

Unban the non mod user associated with a particular conversation.

#### Parameters

| Name             | Type     | Description               |
| :--------------- | :------- | :------------------------ |
| `conversationId` | `string` | a modmail conversation id |

#### Returns

`Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

**`Example`**

```ts
await reddit.modMail.unbanConversation('abcdef');
```

---

### <a id="unhighlightconversation" name="unhighlightconversation"></a> unhighlightConversation

▸ **unhighlightConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse)\>

Removes a highlight from a conversation.

#### Parameters

| Name             | Type     | Description                  |
| :--------------- | :------- | :--------------------------- |
| `conversationId` | `string` | Id of a modmail conversation |

#### Returns

`Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse)\>

**`Example`**

```ts
await reddit.modMail.unhighlightConversation('abcdef');
```

---

### <a id="unmuteconversation" name="unmuteconversation"></a> unmuteConversation

▸ **unmuteConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

Unmutes the non mod user associated with a particular conversation.

#### Parameters

| Name             | Type     | Description                  |
| :--------------- | :------- | :--------------------------- |
| `conversationId` | `string` | Id of a modmail conversation |

#### Returns

`Promise`\<[`ConversationResponse`](../modules/models.md#conversationresponse) & [`WithUserData`](../modules/models.md#withuserdata)\>

**`Example`**

```ts
await reddit.modMail.unmuteConversation('abcdef');
```

---

### <a id="unreadconversations" name="unreadconversations"></a> unreadConversations

▸ **unreadConversations**(`conversationIds`): `Promise`\<`void`\>

Marks conversations as unread for the user.

#### Parameters

| Name              | Type       | Description     |
| :---------------- | :--------- | :-------------- |
| `conversationIds` | `string`[] | An array of ids |

#### Returns

`Promise`\<`void`\>

**`Example`**

```ts
await reddit.modMail.unreadConversations(['abcdef', 'qwerty']);
```
