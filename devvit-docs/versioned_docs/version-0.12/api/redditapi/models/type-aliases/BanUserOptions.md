[**@devvit/public-api v0.12.1-dev**](../../README.md)

---

# Type Alias: BanUserOptions

> **BanUserOptions** = `object`

## Properties

<a id="context"></a>

### context?

> `optional` **context**: `string`

The id of the post or comment you want to cite as rule breaking.

---

<a id="duration"></a>

### duration?

> `optional` **duration**: `number`

The duration of the ban, in days. Use 0 for permanent; otherwise, it must be in the range of 1 to 999.

---

<a id="message"></a>

### message?

> `optional` **message**: `string`

The message to display to the user. (The "Note from the moderators:" in the ban message modmail.)

---

<a id="note"></a>

### note?

> `optional` **note**: `string`

The reason to show in the modlog, and the UI's user notes. This isn't show to the user, just other moderators.

---

<a id="reason"></a>

### reason?

> `optional` **reason**: `string`

The reason for the ban. This shows up in the Banned Users Menu.

---

<a id="subredditname"></a>

### subredditName

> **subredditName**: `string`

The name of the subreddit you want to ban the user from.

---

<a id="username"></a>

### username

> **username**: `string`

The username of the user you want to ban.
