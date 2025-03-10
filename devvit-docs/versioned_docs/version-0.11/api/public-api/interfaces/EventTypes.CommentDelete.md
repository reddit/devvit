# Interface: CommentDelete

[EventTypes](../modules/EventTypes.md).CommentDelete

## Table of contents

### Properties

- [author](EventTypes.CommentDelete.md#author)
- [commentId](EventTypes.CommentDelete.md#commentid)
- [createdAt](EventTypes.CommentDelete.md#createdat)
- [deletedAt](EventTypes.CommentDelete.md#deletedat)
- [parentId](EventTypes.CommentDelete.md#parentid)
- [postId](EventTypes.CommentDelete.md#postid)
- [reason](EventTypes.CommentDelete.md#reason)
- [source](EventTypes.CommentDelete.md#source)
- [subreddit](EventTypes.CommentDelete.md#subreddit)

## Properties

### <a id="author" name="author"></a> author

• `Optional` **author**: `UserV2`

---

### <a id="commentid" name="commentid"></a> commentId

• **commentId**: `string`

---

### <a id="createdat" name="createdat"></a> createdAt

• `Optional` **createdAt**: `Date`

---

### <a id="deletedat" name="deletedat"></a> deletedAt

• `Optional` **deletedAt**: `Date`

---

### <a id="parentid" name="parentid"></a> parentId

• **parentId**: `string`

---

### <a id="postid" name="postid"></a> postId

• **postId**: `string`

---

### <a id="reason" name="reason"></a> reason

• **reason**: [`DeletionReason`](../enums/DeletionReason.md)

---

### <a id="source" name="source"></a> source

• **source**: [`EventSource`](../enums/EventSource.md)

---

### <a id="subreddit" name="subreddit"></a> subreddit

• `Optional` **subreddit**: `SubredditV2`
