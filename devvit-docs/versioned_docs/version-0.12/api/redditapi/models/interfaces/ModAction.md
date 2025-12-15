[**@devvit/public-api v0.12.6-dev**](../../README.md)

---

# Interface: ModAction

## Properties

<a id="createdat"></a>

### createdAt

> **createdAt**: `Date`

When the action took place.

---

<a id="description"></a>

### description?

> `optional` **description**: `string`

The string "Page modmail-stats edited: Daily update of the
modmail-stats (Wed Jul 02 2025 08:05:47 UTC+0200 (Europe/Amsterdam))" is
made up of `description` and `details`. The "Page modmail-stats edited" is
the "description".

---

<a id="details"></a>

### details?

> `optional` **details**: `string`

The string "Page modmail-stats edited: Daily update of the
modmail-stats (Wed Jul 02 2025 08:05:47 UTC+0200 (Europe/Amsterdam))" is
made up of `description` and `details`. The "Daily update of the
modmail-stats (Wed Jul 02 2025 08:05:47 UTC+0200 (Europe/Amsterdam))" is
the "details".

---

<a id="id"></a>

### id

> **id**: `string`

A string like `"ModAction_1b1af634-5b87-11f0-a4f1-4ddd27626cc4"`
identifying the ModAction.

---

<a id="moderatorid"></a>

### moderatorId

> **moderatorId**: `string`

The t2\_ id of the moderator.

---

<a id="moderatorname"></a>

### moderatorName

> **moderatorName**: `string`

The username of the moderator.

---

<a id="subredditid"></a>

### subredditId

> **subredditId**: `string`

The ID of the subreddit the action took place.

---

<a id="subredditname"></a>

### subredditName

> **subredditName**: `string`

The name of the subreddit the action took place.

---

<a id="target"></a>

### target?

> `optional` **target**: [`ModActionTarget`](../type-aliases/ModActionTarget.md)

Some context of the affected item of the modaction.

---

<a id="type"></a>

### type

> **type**: [`ModActionType`](../type-aliases/ModActionType.md)

The type of the action. Think of what happened.
