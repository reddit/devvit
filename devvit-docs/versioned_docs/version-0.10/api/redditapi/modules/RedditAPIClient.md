# Module: RedditAPIClient

## Table of contents

### Classes

- [RedditAPIClient](../classes/RedditAPIClient.RedditAPIClient.md)

### Type Aliases

- [InviteModeratorOptions](RedditAPIClient.md#invitemoderatoroptions)
- [MuteUserOptions](RedditAPIClient.md#muteuseroptions)

## Type Aliases

### <a id="invitemoderatoroptions" name="invitemoderatoroptions"></a> InviteModeratorOptions

Ƭ **InviteModeratorOptions**: `Object`

#### Type declaration

| Name            | Type                                                     | Description                                              |
| :-------------- | :------------------------------------------------------- | :------------------------------------------------------- |
| `permissions?`  | [`ModeratorPermission`](models.md#moderatorpermission)[] | The permissions to grant the user                        |
| `subredditName` | `string`                                                 | The name of the subreddit to invite the user to moderate |
| `username`      | `string`                                                 | The name of the user to invite as a moderator            |

---

### <a id="muteuseroptions" name="muteuseroptions"></a> MuteUserOptions

Ƭ **MuteUserOptions**: `Object`

#### Type declaration

| Name            | Type     | Description                                      |
| :-------------- | :------- | :----------------------------------------------- |
| `note?`         | `string` | A mod note on why the user was muted. (optional) |
| `subredditName` | `string` | The name of the subreddit to mute the user in    |
| `username`      | `string` | The name of the user to mute                     |
