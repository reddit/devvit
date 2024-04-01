# @devvit/public-api - v0.9.0

## Table of contents

### Namespaces

- [Devvit](modules/Devvit.md)

### Enumerations

- [Context](enums/Context.md)
- [UserContext](enums/UserContext.md)

### Classes

- [ConfigFormBuilder](classes/ConfigFormBuilder.md)
- [ContextActionsBuilder](classes/ContextActionsBuilder.md)
- [Devvit](classes/Devvit-1.md)
- [KeyValueStorage](classes/KeyValueStorage.md)
- [Log](classes/Log.md)
- [NameLookup](classes/NameLookup.md)
- [RichTextBuilder](classes/RichTextBuilder.md)
- [UserConfig](classes/UserConfig.md)

### Type Aliases

- [ActionOptions](README.md#actionoptions)
- [BaseContextAction](README.md#basecontextaction)
- [BaseContextActionEvent](README.md#basecontextactionevent)
- [CommentContextAction](README.md#commentcontextaction)
- [CommentContextActionEvent](README.md#commentcontextactionevent)
- [ContextAction](README.md#contextaction)
- [ContextActionEvent](README.md#contextactionevent)
- [Header](README.md#header)
- [MultiContextAction](README.md#multicontextaction)
- [PostContextAction](README.md#postcontextaction)
- [PostContextActionEvent](README.md#postcontextactionevent)
- [SchedulerEvent](README.md#schedulerevent)
- [SchedulerHandler](README.md#schedulerhandler)
- [SubredditContextAction](README.md#subredditcontextaction)
- [SubredditContextActionEvent](README.md#subredditcontextactionevent)

### Variables

- [Header](README.md#header-1)

### Functions

- [getFromMetadata](README.md#getfrommetadata)

## Type Aliases

### ActionOptions

Ƭ **ActionOptions**: `Omit`\< `ContextActionDescription`, `"contexts"` \| `"users"`\> & `Partial`\< `ContextActionAllowedContexts`\> & `Partial`\< `ContextActionAllowedUsers`\>

---

### BaseContextAction

Ƭ **BaseContextAction**: `Object`

#### Type declaration

| Name           | Type                                  |
| :------------- | :------------------------------------ |
| `description`  | `string`                              |
| `name`         | `string`                              |
| `userContext?` | [`UserContext`](enums/UserContext.md) |
| `userInput?`   | `ConfigForm`                          |

---

### BaseContextActionEvent

Ƭ **BaseContextActionEvent**: `Object`

#### Type declaration

| Name        | Type                        |
| :---------- | :-------------------------- |
| `userInput` | `ConfigForm` \| `undefined` |

---

### CommentContextAction

Ƭ **CommentContextAction**: [`BaseContextAction`](README.md#basecontextaction) & \{ `context`: [`COMMENT`](enums/Context.md#comment) ; `handler`: (`event`: [`CommentContextActionEvent`](README.md#commentcontextactionevent), `metadata?`: `Metadata`) => `Promise`\< `ContextActionResponse`\> }

---

### CommentContextActionEvent

Ƭ **CommentContextActionEvent**: [`BaseContextActionEvent`](README.md#basecontextactionevent) & \{ `comment`: `RedditObject` ; `context`: [`COMMENT`](enums/Context.md#comment) }

---

### ContextAction

Ƭ **ContextAction**: [`PostContextAction`](README.md#postcontextaction) \| [`CommentContextAction`](README.md#commentcontextaction) \| [`SubredditContextAction`](README.md#subredditcontextaction)

---

### ContextActionEvent

Ƭ **ContextActionEvent**: [`PostContextActionEvent`](README.md#postcontextactionevent) \| [`CommentContextActionEvent`](README.md#commentcontextactionevent) \| [`SubredditContextActionEvent`](README.md#subredditcontextactionevent)

---

### Header

Ƭ **Header**: typeof [`Header`](README.md#header-1)[keyof typeof [`Header`](README.md#header-1)]

---

### MultiContextAction

Ƭ **MultiContextAction**: [`BaseContextAction`](README.md#basecontextaction) & \{ `context`: [`Context`](enums/Context.md)[] ; `handler`: (`event`: [`ContextActionEvent`](README.md#contextactionevent), `metadata?`: `Metadata`) => `Promise`\< `ContextActionResponse`\> }

---

### PostContextAction

Ƭ **PostContextAction**: [`BaseContextAction`](README.md#basecontextaction) & \{ `context`: [`POST`](enums/Context.md#post) ; `handler`: (`event`: [`PostContextActionEvent`](README.md#postcontextactionevent), `metadata?`: `Metadata`) => `Promise`\< `ContextActionResponse`\> }

---

### PostContextActionEvent

Ƭ **PostContextActionEvent**: [`BaseContextActionEvent`](README.md#basecontextactionevent) & \{ `context`: [`POST`](enums/Context.md#post) ; `post`: `RedditObject` }

---

### SchedulerEvent

Ƭ **SchedulerEvent**: `Object`

#### Type declaration

| Name                | Type                                                         |
| :------------------ | :----------------------------------------------------------- |
| `context`           | \{ `subreddit`: `string` ; `user`: `string` \| `undefined` } |
| `context.subreddit` | `string`                                                     |
| `context.user`      | `string` \| `undefined`                                      |
| `data`              | `ScheduledAction`[``"data"``]                                |

---

### SchedulerHandler

Ƭ **SchedulerHandler**: `Object`

#### Type declaration

| Name      | Type                                                                                                     |
| :-------- | :------------------------------------------------------------------------------------------------------- |
| `handler` | (`event`: [`SchedulerEvent`](README.md#schedulerevent), `metadata?`: `Metadata`) => `Promise`\< `void`\> |
| `type`    | `string`                                                                                                 |

---

### SubredditContextAction

Ƭ **SubredditContextAction**: [`BaseContextAction`](README.md#basecontextaction) & \{ `context`: [`SUBREDDIT`](enums/Context.md#subreddit) ; `handler`: (`event`: [`SubredditContextActionEvent`](README.md#subredditcontextactionevent), `metadata?`: `Metadata`) => `Promise`\< `ContextActionResponse`\> }

---

### SubredditContextActionEvent

Ƭ **SubredditContextActionEvent**: [`BaseContextActionEvent`](README.md#basecontextactionevent) & \{ `context`: [`SUBREDDIT`](enums/Context.md#subreddit) ; `subreddit`: `SubredditObject` }

## Variables

### Header

• `Const` **Header**: `Readonly`\< \{ `Actor`: `"devvit-actor"` ; `App`: `"devvit-app"` ; `AppUser`: `"devvit-app-user"` ; `Caller`: `"devvit-caller"` ; `CallerPortID`: `"devvit-caller-port-id"` ; `Canary`: `"devvit-canary"` ; `Installation`: `"devvit-installation"` ; `ModPermissions`: `"devvit-mod-permissions"` ; `R2Auth`: `"devvit-sec-authorization"` ; `R2Host`: `"devvit-r2-host"` ; `RemoteHostname`: `"devvit-remote-hostname"` ; `StreamID`: `"devvit-stream-id"` ; `Subreddit`: `"devvit-subreddit"` ; `TraceID`: `"devvit-trace-id"` ; `User`: `"devvit-user"` ; `Version`: `"devvit-version"` }\>

Metadata header key. Every system header should start with "devvit-".

Synchronize to headers.md.

## Functions

### getFromMetadata

▸ **getFromMetadata**(`key`, `metadata`): `string` \| `undefined`

Gets a value from metadata

#### Parameters

| Name       | Type                      |
| :--------- | :------------------------ |
| `key`      | `string`                  |
| `metadata` | `undefined` \| `Metadata` |

#### Returns

`string` \| `undefined`
