[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Type Alias: GetUserFlairBySubredditResponse

> **GetUserFlairBySubredditResponse** = `object`

## Properties

<a id="next"></a>

### next?

> `optional` **next**: `string`

The user id of the last user flair in this slice. Its presence indicates
that there are more items that can be fetched. Pass this into the "after" parameter
in the next call to get the next slice of data

---

<a id="prev"></a>

### prev?

> `optional` **prev**: `string`

The user id of the first user flair in this slice. Its presence indicates
that there are items before this item that can be fetched. Pass this into the "before" parameter
in the next call to get the previous slice of data

---

<a id="users"></a>

### users

> **users**: [`UserFlair`](UserFlair.md)[]

The list of user flair
