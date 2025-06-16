[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Type Alias: GetConversationsRequest

> **GetConversationsRequest** = `object`

## Properties

<a id="after"></a>

### after?

> `optional` **after**: `string`

modmail conversation id

---

<a id="limit"></a>

### limit?

> `optional` **limit**: `number`

an integer between 1 and 100 (default: 25)

---

<a id="sort"></a>

### sort?

> `optional` **sort**: `"recent"` \| `"mod"` \| `"user"` \| `"unread"`

Sort by:

- `recent` - Order by whenever anyone last updated the conversation, mod or participant
- `mod` - Order by the last time a mod updated the conversation
- `user` - Order by the last time a participant user updated the conversation
- `unread` - Order by the most recent unread message in the conversation for this mod

---

<a id="state"></a>

### state?

> `optional` **state**: [`ConversationStateFilter`](ConversationStateFilter.md)

Filter by conversation state

A conversation can be in more than one state.
For example, a conversation may be both 'highlighted' and 'inprogress'.

---

<a id="subreddits"></a>

### subreddits?

> `optional` **subreddits**: `string`[]

array of subreddit names
