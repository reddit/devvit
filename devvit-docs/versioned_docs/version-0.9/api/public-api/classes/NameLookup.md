# Class: NameLookup

Provides a way to convert `t2_` and `t5_` IDs into the names of those users and subreddits
respectively. This is useful for both displaying data to the user, and interacting with
some Reddit API calls that require the name of an object instead of its ID.

## Table of contents

### Constructors

- [constructor](NameLookup.md#constructor)

### Methods

- [get](NameLookup.md#get)
- [getAll](NameLookup.md#getall)

## Constructors

### constructor

• **new NameLookup**(`users?`, `linksAndComments?`)

Creates a new NameLookup object. Note that the args are entirely optional.

#### Parameters

| Name               | Type               | Description                                                       |
| :----------------- | :----------------- | :---------------------------------------------------------------- |
| `users`            | `Users`            | Defaults to `Devvit.use(Devvit.Types.RedditAPI.Users)`            |
| `linksAndComments` | `LinksAndComments` | Defaults to `Devvit.use(Devvit.Types.RedditAPI.LinksAndComments)` |

## Methods

### get

▸ **get**(`id`): `Promise`\< `string`\>

Gets the name for one thing ID. If you have multiple IDs you need to look up at the same time,
please use [getAll](NameLookup.md#getall) instead.

#### Parameters

| Name | Type     | Description         |
| :--- | :------- | :------------------ |
| `id` | `string` | A `t2_` or `t5_` ID |

#### Returns

`Promise`\< `string`\>

The name of the thing you asked about.

---

### getAll

▸ **getAll**(`ids`): `Promise`\< `Record`\< `string`, `string`\>\>

Gets the names for multiple things. This groups the IDs together so that we make as few API
calls as possible.

#### Parameters

| Name  | Type       | Description                               |
| :---- | :--------- | :---------------------------------------- |
| `ids` | `string`[] | An array of `t2_` or `t5_` IDs to look up |

#### Returns

`Promise`\< `Record`\< `string`, `string`\>\>

An object where the keys are the IDs provided, and the values are the names. It is
possible for an ID to be omitted from the return value; if this happens, it means the
given ID doesn't exist.
