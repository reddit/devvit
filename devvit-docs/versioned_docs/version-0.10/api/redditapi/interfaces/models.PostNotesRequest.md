# Interface: PostNotesRequest

[models](../modules/models.md).PostNotesRequest

## Table of contents

### Properties

- [subreddit](models.PostNotesRequest.md#subreddit)
- [label](models.PostNotesRequest.md#label)
- [note](models.PostNotesRequest.md#note)
- [redditId](models.PostNotesRequest.md#redditId)
- [user](models.PostNotesRequest.md#user)

## Properties

### <a id="subreddit" name="subreddit"></a> subreddit

The subreddit name.

• **subreddit**: `string`

---

### <a id="label" name="label"></a> label

(Optional) one of (BOT_BAN, PERMA_BAN, BAN, ABUSE_WARNING, SPAM_WARNING, SPAM_WATCH, SOLID_CONTRIBUTOR, HELPFUL_USER). See [UserNoteLabel](../modules/models.md#usernotelabel).

• `Optional` **label**: `string`

---

### <a id="note" name="note"></a> note

Content of the note, should be a string with a maximum character limit of 250.

• **note**: `string`

---

### <a id="redditId" name="redditId"></a> redditId

(Optional) a fullname of a comment or post (should have either a t1 or t3 prefix).

• `Optional` **redditId**: `string`

---

### <a id="user" name="user"></a> user

The account username.

• **user**: `string`
