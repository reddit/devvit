# Class: Comment

## Table of contents

### Constructors

- [constructor](Comment.md#constructor)

### Accessors

- [approved](Comment.md#approved)
- [authorName](Comment.md#authorname)
- [body](Comment.md#body)
- [collapsedBecauseCrowdControl](Comment.md#collapsedbecausecrowdcontrol)
- [createdAt](Comment.md#createdat)
- [distinguishedBy](Comment.md#distinguishedby)
- [edited](Comment.md#edited)
- [id](Comment.md#id)
- [locked](Comment.md#locked)
- [numReports](Comment.md#numreports)
- [parentId](Comment.md#parentid)
- [postId](Comment.md#postid)
- [removed](Comment.md#removed)
- [replies](Comment.md#replies)
- [score](Comment.md#score)
- [spam](Comment.md#spam)
- [stickied](Comment.md#stickied)

### Methods

- [approve](Comment.md#approve)
- [delete](Comment.md#delete)
- [distinguish](Comment.md#distinguish)
- [distinguishAsAdmin](Comment.md#distinguishasadmin)
- [edit](Comment.md#edit)
- [isApproved](Comment.md#isapproved)
- [isDistinguished](Comment.md#isdistinguished)
- [isEdited](Comment.md#isedited)
- [isLocked](Comment.md#islocked)
- [isRemoved](Comment.md#isremoved)
- [isSpam](Comment.md#isspam)
- [isStickied](Comment.md#isstickied)
- [lock](Comment.md#lock)
- [remove](Comment.md#remove)
- [reply](Comment.md#reply)
- [toJSON](Comment.md#tojson)
- [undistinguish](Comment.md#undistinguish)
- [unlock](Comment.md#unlock)
- [approve](Comment.md#approve-1)
- [delete](Comment.md#delete-1)
- [distinguish](Comment.md#distinguish-1)
- [edit](Comment.md#edit-1)
- [getById](Comment.md#getbyid)
- [getComments](Comment.md#getcomments)
- [getCommentsByUser](Comment.md#getcommentsbyuser)
- [lock](Comment.md#lock-1)
- [remove](Comment.md#remove-1)
- [submit](Comment.md#submit)
- [undistinguish](Comment.md#undistinguish-1)
- [unlock](Comment.md#unlock-1)

## Constructors

### constructor

• **new Comment**(`data`, `metadata?`)

#### Parameters

| Name        | Type                        |
| :---------- | :-------------------------- |
| `data`      | `RedditObject` \| `Comment` |
| `metadata?` | `Metadata`                  |

## Accessors

### approved

• `get` **approved**(): `boolean`

#### Returns

`boolean`

---

### authorName

• `get` **authorName**(): `string`

#### Returns

`string`

---

### body

• `get` **body**(): `string`

#### Returns

`string`

---

### collapsedBecauseCrowdControl

• `get` **collapsedBecauseCrowdControl**(): `boolean`

#### Returns

`boolean`

---

### createdAt

• `get` **createdAt**(): `Date`

#### Returns

`Date`

---

### distinguishedBy

• `get` **distinguishedBy**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

---

### edited

• `get` **edited**(): `boolean`

#### Returns

`boolean`

---

### id

• `get` **id**(): \`t1\_$\{string}\`

#### Returns

\`t1\_$\{string}\`

---

### locked

• `get` **locked**(): `boolean`

#### Returns

`boolean`

---

### numReports

• `get` **numReports**(): `number`

#### Returns

`number`

---

### parentId

• `get` **parentId**(): \`t1\_$\{string}\` \| \`t3\_$\{string}\`

#### Returns

\`t1\_$\{string}\` \| \`t3\_$\{string}\`

---

### postId

• `get` **postId**(): \`t3\_$\{string}\`

#### Returns

\`t3\_$\{string}\`

---

### removed

• `get` **removed**(): `boolean`

#### Returns

`boolean`

---

### replies

• `get` **replies**(): [`Listing`](Listing.md)\< [`Comment`](Comment.md)\>

#### Returns

[`Listing`](Listing.md)\< [`Comment`](Comment.md)\>

---

### score

• `get` **score**(): `number`

#### Returns

`number`

---

### spam

• `get` **spam**(): `boolean`

#### Returns

`boolean`

---

### stickied

• `get` **stickied**(): `boolean`

#### Returns

`boolean`

## Methods

### approve

▸ **approve**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### delete

▸ **delete**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### distinguish

▸ **distinguish**(`makeSticky?`): `Promise`\< `void`\>

#### Parameters

| Name         | Type      | Default value |
| :----------- | :-------- | :------------ |
| `makeSticky` | `boolean` | `false`       |

#### Returns

`Promise`\< `void`\>

---

### distinguishAsAdmin

▸ **distinguishAsAdmin**(`makeSticky?`): `Promise`\< `void`\>

#### Parameters

| Name         | Type      | Default value |
| :----------- | :-------- | :------------ |
| `makeSticky` | `boolean` | `false`       |

#### Returns

`Promise`\< `void`\>

---

### edit

▸ **edit**(`options`): `Promise`\< [`Comment`](Comment.md)\>

#### Parameters

| Name      | Type                                                                |
| :-------- | :------------------------------------------------------------------ |
| `options` | [`CommentSubmissionOptions`](../README.md#commentsubmissionoptions) |

#### Returns

`Promise`\< [`Comment`](Comment.md)\>

---

### isApproved

▸ **isApproved**(): `boolean`

#### Returns

`boolean`

---

### isDistinguished

▸ **isDistinguished**(): `boolean`

#### Returns

`boolean`

---

### isEdited

▸ **isEdited**(): `boolean`

#### Returns

`boolean`

---

### isLocked

▸ **isLocked**(): `boolean`

#### Returns

`boolean`

---

### isRemoved

▸ **isRemoved**(): `boolean`

#### Returns

`boolean`

---

### isSpam

▸ **isSpam**(): `boolean`

#### Returns

`boolean`

---

### isStickied

▸ **isStickied**(): `boolean`

#### Returns

`boolean`

---

### lock

▸ **lock**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### remove

▸ **remove**(`isSpam?`): `Promise`\< `void`\>

#### Parameters

| Name     | Type      | Default value |
| :------- | :-------- | :------------ |
| `isSpam` | `boolean` | `false`       |

#### Returns

`Promise`\< `void`\>

---

### reply

▸ **reply**(`options`): `Promise`\< [`Comment`](Comment.md)\>

#### Parameters

| Name      | Type                                                                |
| :-------- | :------------------------------------------------------------------ |
| `options` | [`CommentSubmissionOptions`](../README.md#commentsubmissionoptions) |

#### Returns

`Promise`\< [`Comment`](Comment.md)\>

---

### toJSON

▸ **toJSON**(): `Object`

#### Returns

`Object`

| Name                           | Type                                                |
| :----------------------------- | :-------------------------------------------------- |
| `approved`                     | `boolean`                                           |
| `authorName`                   | `string`                                            |
| `body`                         | `string`                                            |
| `collapsedBecauseCrowdControl` | `boolean`                                           |
| `createdAt`                    | `Date`                                              |
| `distinguishedBy`              | `undefined` \| `string`                             |
| `edited`                       | `boolean`                                           |
| `id`                           | \`t1\_$\{string}\`                                  |
| `locked`                       | `boolean`                                           |
| `numReports`                   | `number`                                            |
| `parentId`                     | \`t1\_$\{string}\` \| \`t3\_$\{string}\`            |
| `postId`                       | \`t3\_$\{string}\`                                  |
| `removed`                      | `boolean`                                           |
| `replies`                      | [`Listing`](Listing.md)\< [`Comment`](Comment.md)\> |
| `score`                        | `number`                                            |
| `spam`                         | `boolean`                                           |
| `stickied`                     | `boolean`                                           |

---

### undistinguish

▸ **undistinguish**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### unlock

▸ **unlock**(): `Promise`\< `void`\>

#### Returns

`Promise`\< `void`\>

---

### approve

▸ `Static` **approve**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t1\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### delete

▸ `Static` **delete**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t1\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### distinguish

▸ `Static` **distinguish**(`id`, `sticky`, `asAdmin`, `metadata?`): `Promise`\< \{ `distinguishedBy`: `undefined` \| `string` = comment.distinguished; `stickied`: `boolean` }\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t1\_$\{string}\` |
| `sticky`    | `boolean`          |
| `asAdmin`   | `boolean`          |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< \{ `distinguishedBy`: `undefined` \| `string` = comment.distinguished; `stickied`: `boolean` }\>

---

### edit

▸ `Static` **edit**(`options`, `metadata?`): `Promise`\< [`Comment`](Comment.md)\>

#### Parameters

| Name        | Type       |
| :---------- | :--------- |
| `options`   | `Object`   |
| `metadata?` | `Metadata` |

#### Returns

`Promise`\< [`Comment`](Comment.md)\>

---

### getById

▸ `Static` **getById**(`id`, `metadata?`): `Promise`\< [`Comment`](Comment.md)\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t1\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< [`Comment`](Comment.md)\>

---

### getComments

▸ `Static` **getComments**(`options`, `metadata?`): [`Listing`](Listing.md)\< [`Comment`](Comment.md)\>

#### Parameters

| Name        | Type                                                        |
| :---------- | :---------------------------------------------------------- |
| `options`   | [`GetCommentsOptions`](../interfaces/GetCommentsOptions.md) |
| `metadata?` | `Metadata`                                                  |

#### Returns

[`Listing`](Listing.md)\< [`Comment`](Comment.md)\>

---

### getCommentsByUser

▸ `Static` **getCommentsByUser**(`options`, `metadata?`): [`Listing`](Listing.md)\< [`Comment`](Comment.md)\>

#### Parameters

| Name        | Type                                                                    |
| :---------- | :---------------------------------------------------------------------- |
| `options`   | [`GetCommentsByUserOptions`](../interfaces/GetCommentsByUserOptions.md) |
| `metadata?` | `Metadata`                                                              |

#### Returns

[`Listing`](Listing.md)\< [`Comment`](Comment.md)\>

---

### lock

▸ `Static` **lock**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t1\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>

---

### remove

▸ `Static` **remove**(`id`, `isSpam?`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               | Default value |
| :---------- | :----------------- | :------------ |
| `id`        | \`t1\_$\{string}\` | `undefined`   |
| `isSpam`    | `boolean`          | `false`       |
| `metadata?` | `Metadata`         | `undefined`   |

#### Returns

`Promise`\< `void`\>

---

### submit

▸ `Static` **submit**(`options`, `metadata?`): `Promise`\< [`Comment`](Comment.md)\>

#### Parameters

| Name        | Type       |
| :---------- | :--------- |
| `options`   | `Object`   |
| `metadata?` | `Metadata` |

#### Returns

`Promise`\< [`Comment`](Comment.md)\>

---

### undistinguish

▸ `Static` **undistinguish**(`id`, `metadata?`): `Promise`\< \{ `distinguishedBy`: `undefined` \| `string` = comment.distinguished; `stickied`: `boolean` }\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t1\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< \{ `distinguishedBy`: `undefined` \| `string` = comment.distinguished; `stickied`: `boolean` }\>

---

### unlock

▸ `Static` **unlock**(`id`, `metadata?`): `Promise`\< `void`\>

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `id`        | \`t1\_$\{string}\` |
| `metadata?` | `Metadata`         |

#### Returns

`Promise`\< `void`\>
