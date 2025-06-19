[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: ModMailService

Class providing the methods for working with Mod Mail

## Properties

<a id="notificationsubjectprefix"></a>

### notificationSubjectPrefix

> `readonly` **notificationSubjectPrefix**: `"[notification]"` = `'[notification]'`

## Methods

<a id="approveconversation"></a>

### approveConversation()

> **approveConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

Approve the non mod user associated with a particular conversation.

#### Parameters

##### conversationId

`string`

Id of a modmail conversation

#### Returns

`Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

#### Example

```ts
await reddit.modMail.approveConversation('abcdef');
```

---

<a id="archiveconversation"></a>

### archiveConversation()

> **archiveConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md)\>

Marks a conversation as archived

#### Parameters

##### conversationId

`string`

Id of a modmail conversation

#### Returns

`Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md)\>

#### Example

```ts
await reddit.modMail.archive('abcdef');
```

---

<a id="bulkreadconversations"></a>

### bulkReadConversations()

> **bulkReadConversations**(`subreddits`, `state`): `Promise`\<`string`[]\>

Marks all conversations read for a particular conversation state within the passed list of subreddits.

#### Parameters

##### subreddits

`string`[]

Array of subreddit names

##### state

[`ConversationStateFilter`](../type-aliases/ConversationStateFilter.md)

One of the possible conversation states ('all' to read all conversations)

#### Returns

`Promise`\<`string`[]\>

conversationIds

#### Example

```ts
const conversationIds = await reddit.modMail.bulkReadConversations(
  ['askReddit', 'myAwesomeSubreddit'],
  'filtered'
);
```

---

<a id="createconversation"></a>

### createConversation()

> **createConversation**(`params`): `Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

Creates a new conversation for a particular SR.

This endpoint will create a ModmailConversation object
as well as the first ModmailMessage within the ModmailConversation object.

#### Parameters

##### params

###### body

`string`

markdown text

###### isAuthorHidden?

`boolean`

is author hidden? (default: false)

###### subject

`string`

subject of the conversation. max 100 characters

###### subredditName

`string`

subreddit name

###### to?

`null` \| `string`

a user (e.g. u/username), a subreddit (e.g. r/subreddit) or null

#### Returns

`Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

#### Note

Note on {param.to}:
The to field for this endpoint is somewhat confusing. It can be:

- A User, passed like "username" or "u/username"
- A Subreddit, passed like "r/subreddit"
- null, meaning an internal moderator discussion

In this way to is a bit of a misnomer in modmail conversations.
What it really means is the participant of the conversation who is not a mod of the subreddit.

If you plan to send a message to the app-account or a moderator of the subreddit, use [ModMailService.createModDiscussionConversation](#createmoddiscussionconversation), [ModMailService.createModInboxConversation](#createmodinboxconversation), or [ModMailService.createModNotification](#createmodnotification) instead.
Otherwise, messages sent to the app-account or moderator will automatically be routed to Mod Discussions.

#### Example

```ts
const { conversation, messages, modActions } = await reddit.modMail.createConversation({
  subredditName: 'askReddit',
  subject: 'Test conversation',
  body: 'Lorem ipsum sit amet',
  to: null,
});
```

---

<a id="createmoddiscussionconversation"></a>

### createModDiscussionConversation()

> **createModDiscussionConversation**(`params`): `Promise`\<`string`\>

Creates a conversation in Mod Discussions with the moderators of the given subredditId.

Note: The app must be installed in the subreddit in order to create a conversation in Mod Discussions.

#### Parameters

##### params

###### bodyMarkdown

`string`

###### subject

`string`

###### subredditId

`string`

#### Returns

`Promise`\<`string`\>

A Promise that resolves a string representing the conversationId of the message.

#### Example

```ts
const conversationId = await reddit.modMail.createModDiscussionConversation({
  subject: 'Test conversation',
  bodyMarkdown: '**Hello there** \n\n _Have a great day!_',
  subredditId: context.subredditId,
});
```

---

<a id="createmodinboxconversation"></a>

### createModInboxConversation()

> **createModInboxConversation**(`params`): `Promise`\<`string`\>

Creates a conversation in the Modmail Inbox with the moderators of the given subredditId.

#### Parameters

##### params

###### bodyMarkdown

`string`

###### subject

`string`

###### subredditId

`string`

#### Returns

`Promise`\<`string`\>

A Promise that resolves a string representing the conversationId of the message.

#### Example

```ts
const conversationId = await reddit.modMail.createModInboxConversation({
  subject: 'Test conversation',
  bodyMarkdown: '**Hello there** \n\n _Have a great day!_',
  subredditId: context.subredditId,
});
```

---

<a id="createmodnotification"></a>

### createModNotification()

> **createModNotification**(`params`): `Promise`\<`string`\>

Creates a notification in the Modmail Inbox.
This function is different from [ModMailService.createModInboxConversation](#createmodinboxconversation) in that the conversation also appears in the "Notifications" section of Modmail.

#### Parameters

##### params

###### bodyMarkdown

`string`

###### subject

`string`

###### subredditId

`string`

#### Returns

`Promise`\<`string`\>

A Promise that resolves a string representing the conversationId of the message.

#### Example

```ts
const conversationId = await reddit.modMail.createModNotification({
  subject: 'Test notification',
  bodyMarkdown: '**Hello there** \n\n _This is a notification!_',
  subredditId: context.subredditId,
});
```

---

<a id="disapproveconversation"></a>

### disapproveConversation()

> **disapproveConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

Disapprove the non mod user associated with a particular conversation.

#### Parameters

##### conversationId

`string`

Id of a modmail conversation

#### Returns

`Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

#### Example

```ts
await reddit.modMail.disapproveConversation('abcdef');
```

---

<a id="getconversation"></a>

### getConversation()

> **getConversation**(`params`): `Promise`\<[`GetConversationResponse`](../type-aliases/GetConversationResponse.md)\>

Returns all messages, mod actions and conversation metadata for a given conversation id

#### Parameters

##### params

###### conversationId

`string`

a modmail conversation id

###### markRead?

`boolean`

mark read?

#### Returns

`Promise`\<[`GetConversationResponse`](../type-aliases/GetConversationResponse.md)\>

#### Example

```ts
const { conversation, messages, modActions, user } = await reddit.modMail.getConversation({
  conversationId: 'abcdef',
  markRead: true,
});
```

---

<a id="getconversations"></a>

### getConversations()

> **getConversations**(`params`): `Promise`\<[`GetConversationsResponse`](../type-aliases/GetConversationsResponse.md)\>

Get conversations for a logged in user or subreddits

#### Parameters

##### params

[`GetConversationsRequest`](../type-aliases/GetConversationsRequest.md)

#### Returns

`Promise`\<[`GetConversationsResponse`](../type-aliases/GetConversationsResponse.md)\>

#### Example

```ts
const { viewerId, conversations } = await reddit.modMail.getConversations({
  after: 'abcdef',
  limit: 42,
});

const arrayOfConversations = Object.values(conversations);
```

---

<a id="getsubreddits"></a>

### getSubreddits()

> **getSubreddits**(): `Promise`\<\{\}\>

Returns a list of Subreddits that the user moderates with mail permission

#### Returns

`Promise`\<\{\}\>

#### Example

```ts
const subredditsData = await reddit.modMail.getSubreddits();

for (const subreddit of Object.values(subreddits)) {
  console.log(subreddit.id);
  console.log(subreddit.name);
}
```

---

<a id="getunreadcount"></a>

### getUnreadCount()

> **getUnreadCount**(): `Promise`\<[`UnreadCountResponse`](../type-aliases/UnreadCountResponse.md)\>

Endpoint to retrieve the unread conversation count by conversation state.

#### Returns

`Promise`\<[`UnreadCountResponse`](../type-aliases/UnreadCountResponse.md)\>

#### Example

```ts
const response = await reddit.modMail.getUnreadCount();

console.log(response.highlighted);
console.log(response.new);
```

---

<a id="getuserconversations"></a>

### getUserConversations()

> **getUserConversations**(`conversationId`): `Promise`\<[`ConversationUserData`](../type-aliases/ConversationUserData.md)\>

Returns recent posts, comments and modmail conversations for a given user.

#### Parameters

##### conversationId

`string`

Id of a modmail conversation

#### Returns

`Promise`\<[`ConversationUserData`](../type-aliases/ConversationUserData.md)\>

#### Example

```ts
const data = await reddit.modMail.getUserConversations('abcdef');

console.log(data.recentComments);
console.log(data.recentPosts);
```

---

<a id="highlightconversation"></a>

### highlightConversation()

> **highlightConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md)\>

Marks a conversation as highlighted.

#### Parameters

##### conversationId

`string`

Id of a modmail conversation

#### Returns

`Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md)\>

#### Example

```ts
await reddit.modMail.highlightConversation('abcdef');
```

---

<a id="muteconversation"></a>

### muteConversation()

> **muteConversation**(`params`): `Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

Marks a conversation as read for the user.

#### Parameters

##### params

###### conversationId

`string`

Id of a modmail conversation

###### numHours

`72` \| `168` \| `672`

For how many hours the conversation needs to be muted. Must be one of 72, 168, or 672 hours

#### Returns

`Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

#### Example

```ts
await reddit.modMail.muteConversation({ conversationId: 'abcdef', numHours: 72 });
```

---

<a id="readconversations"></a>

### readConversations()

> **readConversations**(`conversationIds`): `Promise`\<`void`\>

Marks a conversations as read for the user.

#### Parameters

##### conversationIds

`string`[]

An array of ids

#### Returns

`Promise`\<`void`\>

#### Example

```ts
await reddit.modMail.readConversations(['abcdef', 'qwerty']);
```

---

<a id="reply"></a>

### reply()

> **reply**(`params`): `Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

Creates a new message for a particular conversation.

#### Parameters

##### params

###### body

`string`

markdown text

###### conversationId

`string`

Id of a modmail conversation

###### isAuthorHidden?

`boolean`

is author hidden? (default: false)

###### isInternal?

`boolean`

is internal message? (default: false)

#### Returns

`Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

#### Example

```ts
await reddit.modMail.reply({
  body: 'Lorem ipsum sit amet',
  conversationId: 'abcdef',
});
```

---

<a id="tempbanconversation"></a>

### tempBanConversation()

> **tempBanConversation**(`params`): `Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

Temporary ban (switch from permanent to temporary ban) the non mod user associated with a particular conversation.

#### Parameters

##### params

###### conversationId

`string`

a modmail conversation id

###### duration

`number`

duration in days, max 999

#### Returns

`Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

#### Example

```ts
await reddit.modMail.tempBanConversation({ conversationId: 'abcdef', duration: 42 });
```

---

<a id="unarchiveconversation"></a>

### unarchiveConversation()

> **unarchiveConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md)\>

Marks conversation as unarchived.

#### Parameters

##### conversationId

`string`

Id of a modmail conversation

#### Returns

`Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md)\>

#### Example

```ts
await reddit.modMail.unarchiveConversation('abcdef');
```

---

<a id="unbanconversation"></a>

### unbanConversation()

> **unbanConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

Unban the non mod user associated with a particular conversation.

#### Parameters

##### conversationId

`string`

a modmail conversation id

#### Returns

`Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

#### Example

```ts
await reddit.modMail.unbanConversation('abcdef');
```

---

<a id="unhighlightconversation"></a>

### unhighlightConversation()

> **unhighlightConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md)\>

Removes a highlight from a conversation.

#### Parameters

##### conversationId

`string`

Id of a modmail conversation

#### Returns

`Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md)\>

#### Example

```ts
await reddit.modMail.unhighlightConversation('abcdef');
```

---

<a id="unmuteconversation"></a>

### unmuteConversation()

> **unmuteConversation**(`conversationId`): `Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

Unmutes the non mod user associated with a particular conversation.

#### Parameters

##### conversationId

`string`

Id of a modmail conversation

#### Returns

`Promise`\<[`ConversationResponse`](../type-aliases/ConversationResponse.md) & [`WithUserData`](../type-aliases/WithUserData.md)\>

#### Example

```ts
await reddit.modMail.unmuteConversation('abcdef');
```

---

<a id="unreadconversations"></a>

### unreadConversations()

> **unreadConversations**(`conversationIds`): `Promise`\<`void`\>

Marks conversations as unread for the user.

#### Parameters

##### conversationIds

`string`[]

An array of ids

#### Returns

`Promise`\<`void`\>

#### Example

```ts
await reddit.modMail.unreadConversations(['abcdef', 'qwerty']);
```
