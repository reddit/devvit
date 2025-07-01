[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Type Alias: GetConversationsResponse

> **GetConversationsResponse** = `object`

## Properties

<a id="conversationids"></a>

### conversationIds

> **conversationIds**: `string`[]

Array of conversation ids, ordered by the sort parameter specified in [GetConversationsRequest](GetConversationsRequest.md).

---

<a id="conversations"></a>

### conversations

> **conversations**: `object`

Conversations key-value map

#### Index Signature

\[`id`: `string`\]: [`ConversationData`](ConversationData.md)

---

<a id="viewerid"></a>

### viewerId?

> `optional` **viewerId**: `string`
