# Class: ModNote

[models](../modules/models.md).ModNote

## Table of contents

### Properties

- [createdAt](models.ModNote.md#createdat)
- [id](models.ModNote.md#id)
- [modAction](models.ModNote.md#modaction)
- [operator](models.ModNote.md#operator)
- [subreddit](models.ModNote.md#subreddit)
- [type](models.ModNote.md#type)
- [user](models.ModNote.md#user)
- [userNote](models.ModNote.md#usernote)

## Properties

### <a id="createdat" name="createdat"></a> createdAt

• **createdAt**: `Date`

---

### <a id="id" name="id"></a> id

• **id**: `string`

---

### <a id="modaction" name="modaction"></a> modAction

• `Optional` **modAction**: [`ModAction`](../interfaces/models.ModAction.md)

---

### <a id="operator" name="operator"></a> operator

• **operator**: `Object`

#### Type declaration

| Name    | Type               |
| :------ | :----------------- |
| `id?`   | \`t2\_$\{string}\` |
| `name?` | `string`           |

---

### <a id="subreddit" name="subreddit"></a> subreddit

• **subreddit**: `Object`

#### Type declaration

| Name    | Type               |
| :------ | :----------------- |
| `id?`   | \`t5\_$\{string}\` |
| `name?` | `string`           |

---

### <a id="type" name="type"></a> type

• **type**: [`ModNoteType`](../modules/models.md#modnotetype)

---

### <a id="user" name="user"></a> user

• **user**: `Object`

#### Type declaration

| Name    | Type               |
| :------ | :----------------- |
| `id?`   | \`t2\_$\{string}\` |
| `name?` | `string`           |

---

### <a id="usernote" name="usernote"></a> userNote

• `Optional` **userNote**: [`UserNote`](../modules/models.md#usernote)
