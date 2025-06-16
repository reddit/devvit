[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Type Alias: ConversationData

> **ConversationData** = `object`

## Properties

<a id="authors"></a>

### authors

> **authors**: [`Participant`](Participant.md)[]

The authors of each message in the modmail conversation.

---

<a id="conversationtype"></a>

### conversationType?

> `optional` **conversationType**: `string`

A ConversationType specifies whether a conversation is with a subreddit
itself, with another user, or with another subreddit entirely.

- `internal` - This is a conversation with another user outside of the subreddit. The participant ID is that user's ID.
- `sr_user` - This is a Mod Discussion, internal to the subreddit. There is no other participant.
- `sr_sr` - This is a conversation is with another subreddit. The participant will have a subreddit ID.

---

<a id="id"></a>

### id?

> `optional` **id**: `string`

Conversation ID

---

<a id="isauto"></a>

### isAuto?

> `optional` **isAuto**: `boolean`

Is the conversation automatically generated e.g. from automod, u/reddit

---

<a id="ishighlighted"></a>

### isHighlighted?

> `optional` **isHighlighted**: `boolean`

Is the conversation highlighted

---

<a id="isinternal"></a>

### isInternal?

> `optional` **isInternal**: `boolean`

Is the conversation internal (i.e. mod only)

---

<a id="lastmodupdate"></a>

### lastModUpdate?

> `optional` **lastModUpdate**: `string`

The last datetime a mod from the owning subreddit made any interaction
with the conversation.

(Note that if this is a subreddit to subreddit conversation, the mods of
the participant subreddit are irrelevant and do not affect this field.)

---

<a id="lastunread"></a>

### lastUnread?

> `optional` **lastUnread**: `string`

The datetime of the last unread message within this conversation for the current viewer.

---

<a id="lastupdated"></a>

### lastUpdated?

> `optional` **lastUpdated**: `string`

The datetime of the last time the conversation was update.

---

<a id="lastuserupdate"></a>

### lastUserUpdate?

> `optional` **lastUserUpdate**: `string`

The last datetime a user made any interaction with the conversation

---

<a id="messages"></a>

### messages

> **messages**: `object`

Conversation messages

#### Index Signature

\[`id`: `string`\]: [`MessageData`](MessageData.md)

#### Example

```ts
const arrayOfMessages = Object.values(conversation.messages);
const messageById = conversation.messages[messageId];
```

---

<a id="modactions"></a>

### modActions

> **modActions**: `object`

Conversation mod actions

#### Index Signature

\[`id`: `string`\]: [`ModActionData`](ModActionData.md)

#### Example

```ts
const arrayOfModActions = Object.values(conversation.modActions);
const modActionById = conversation.modActions[modActionId];
```

---

<a id="nummessages"></a>

### numMessages?

> `optional` **numMessages**: `number`

Number of messages (not actions) in the conversation

---

<a id="participant"></a>

### participant?

> `optional` **participant**: [`Participant`](Participant.md)

Participant. Is absent for mod discussions

---

<a id="state"></a>

### state?

> `optional` **state**: [`ModMailConversationState`](../enumerations/ModMailConversationState.md)

State of the conversation

---

<a id="subject"></a>

### subject?

> `optional` **subject**: `string`

Suject of the conversation

---

<a id="subreddit"></a>

### subreddit?

> `optional` **subreddit**: `object`

Subreddit owning the modmail conversation

#### displayName?

> `optional` **displayName**: `string`

#### id?

> `optional` **id**: `string`
