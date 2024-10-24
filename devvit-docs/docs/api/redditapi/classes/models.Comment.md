# Class: Comment

[models](../modules/models.md).Comment

## Table of contents

### Accessors

- [approved](models.Comment.md#approved)
- [approvedAtUtc](models.Comment.md#approvedatutc)
- [authorId](models.Comment.md#authorid)
- [authorName](models.Comment.md#authorname)
- [bannedAtUtc](models.Comment.md#bannedatutc)
- [body](models.Comment.md#body)
- [collapsedBecauseCrowdControl](models.Comment.md#collapsedbecausecrowdcontrol)
- [createdAt](models.Comment.md#createdat)
- [distinguishedBy](models.Comment.md#distinguishedby)
- [edited](models.Comment.md#edited)
- [id](models.Comment.md#id)
- [ignoringReports](models.Comment.md#ignoringreports)
- [locked](models.Comment.md#locked)
- [modReportReasons](models.Comment.md#modreportreasons)
- [numReports](models.Comment.md#numreports)
- [parentId](models.Comment.md#parentid)
- [permalink](models.Comment.md#permalink)
- [postId](models.Comment.md#postid)
- [removed](models.Comment.md#removed)
- [replies](models.Comment.md#replies)
- [score](models.Comment.md#score)
- [spam](models.Comment.md#spam)
- [stickied](models.Comment.md#stickied)
- [subredditId](models.Comment.md#subredditid)
- [subredditName](models.Comment.md#subredditname)
- [url](models.Comment.md#url)
- [userReportReasons](models.Comment.md#userreportreasons)

### Methods

- [addRemovalNote](models.Comment.md#addremovalnote)
- [approve](models.Comment.md#approve)
- [delete](models.Comment.md#delete)
- [distinguish](models.Comment.md#distinguish)
- [distinguishAsAdmin](models.Comment.md#distinguishasadmin)
- [edit](models.Comment.md#edit)
- [getAuthor](models.Comment.md#getauthor)
- [ignoreReports](models.Comment.md#ignorereports)
- [isApproved](models.Comment.md#isapproved)
- [isDistinguished](models.Comment.md#isdistinguished)
- [isEdited](models.Comment.md#isedited)
- [isIgnoringReports](models.Comment.md#isignoringreports)
- [isLocked](models.Comment.md#islocked)
- [isRemoved](models.Comment.md#isremoved)
- [isSpam](models.Comment.md#isspam)
- [isStickied](models.Comment.md#isstickied)
- [lock](models.Comment.md#lock)
- [remove](models.Comment.md#remove)
- [reply](models.Comment.md#reply)
- [toJSON](models.Comment.md#tojson)
- [undistinguish](models.Comment.md#undistinguish)
- [unignoreReports](models.Comment.md#unignorereports)
- [unlock](models.Comment.md#unlock)

## Accessors

### <a id="approved" name="approved"></a> approved

• `get` **approved**(): `boolean`

#### Returns

`boolean`

---

### <a id="approvedatutc" name="approvedatutc"></a> approvedAtUtc

• `get` **approvedAtUtc**(): `number`

#### Returns

`number`

---

### <a id="authorid" name="authorid"></a> authorId

• `get` **authorId**(): `undefined` \| \`t2\_$\{string}\`

#### Returns

`undefined` \| \`t2\_$\{string}\`

---

### <a id="authorname" name="authorname"></a> authorName

• `get` **authorName**(): `string`

#### Returns

`string`

---

### <a id="bannedatutc" name="bannedatutc"></a> bannedAtUtc

• `get` **bannedAtUtc**(): `number`

#### Returns

`number`

---

### <a id="body" name="body"></a> body

• `get` **body**(): `string`

#### Returns

`string`

---

### <a id="collapsedbecausecrowdcontrol" name="collapsedbecausecrowdcontrol"></a> collapsedBecauseCrowdControl

• `get` **collapsedBecauseCrowdControl**(): `boolean`

#### Returns

`boolean`

---

### <a id="createdat" name="createdat"></a> createdAt

• `get` **createdAt**(): `Date`

#### Returns

`Date`

---

### <a id="distinguishedby" name="distinguishedby"></a> distinguishedBy

• `get` **distinguishedBy**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

---

### <a id="edited" name="edited"></a> edited

• `get` **edited**(): `boolean`

#### Returns

`boolean`

---

### <a id="id" name="id"></a> id

• `get` **id**(): \`t1\_$\{string}\`

#### Returns

\`t1\_$\{string}\`

---

### <a id="ignoringreports" name="ignoringreports"></a> ignoringReports

• `get` **ignoringReports**(): `boolean`

#### Returns

`boolean`

---

### <a id="locked" name="locked"></a> locked

• `get` **locked**(): `boolean`

#### Returns

`boolean`

---

### <a id="modreportreasons" name="modreportreasons"></a> modReportReasons

• `get` **modReportReasons**(): `string`[]

#### Returns

`string`[]

---

### <a id="numreports" name="numreports"></a> numReports

• `get` **numReports**(): `number`

#### Returns

`number`

---

### <a id="parentid" name="parentid"></a> parentId

• `get` **parentId**(): \`t1\_$\{string}\` \| \`t3\_$\{string}\`

#### Returns

\`t1\_$\{string}\` \| \`t3\_$\{string}\`

---

### <a id="permalink" name="permalink"></a> permalink

• `get` **permalink**(): `string`

#### Returns

`string`

---

### <a id="postid" name="postid"></a> postId

• `get` **postId**(): \`t3\_$\{string}\`

#### Returns

\`t3\_$\{string}\`

---

### <a id="removed" name="removed"></a> removed

• `get` **removed**(): `boolean`

#### Returns

`boolean`

---

### <a id="replies" name="replies"></a> replies

• `get` **replies**(): [`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

#### Returns

[`Listing`](models.Listing.md)\<[`Comment`](models.Comment.md)\>

---

### <a id="score" name="score"></a> score

• `get` **score**(): `number`

#### Returns

`number`

---

### <a id="spam" name="spam"></a> spam

• `get` **spam**(): `boolean`

#### Returns

`boolean`

---

### <a id="stickied" name="stickied"></a> stickied

• `get` **stickied**(): `boolean`

#### Returns

`boolean`

---

### <a id="subredditid" name="subredditid"></a> subredditId

• `get` **subredditId**(): \`t5\_$\{string}\`

#### Returns

\`t5\_$\{string}\`

---

### <a id="subredditname" name="subredditname"></a> subredditName

• `get` **subredditName**(): `string`

#### Returns

`string`

---

### <a id="url" name="url"></a> url

• `get` **url**(): `string`

#### Returns

`string`

---

### <a id="userreportreasons" name="userreportreasons"></a> userReportReasons

• `get` **userReportReasons**(): `string`[]

#### Returns

`string`[]

## Methods

### <a id="addremovalnote" name="addremovalnote"></a> addRemovalNote

▸ **addRemovalNote**(`options`): `Promise`\<`void`\>

Add a mod note for why the comment was removed

#### Parameters

| Name               | Type     | Description                                                                          |
| :----------------- | :------- | :----------------------------------------------------------------------------------- |
| `options`          | `Object` | -                                                                                    |
| `options.modNote?` | `string` | the reason for removal (maximum 100 characters) (optional)                           |
| `options.reasonId` | `string` | id of a Removal Reason - you can leave this as an empty string if you don't have one |

#### Returns

`Promise`\<`void`\>

---

### <a id="approve" name="approve"></a> approve

▸ **approve**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="delete" name="delete"></a> delete

▸ **delete**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="distinguish" name="distinguish"></a> distinguish

▸ **distinguish**(`makeSticky?`): `Promise`\<`void`\>

#### Parameters

| Name         | Type      | Default value |
| :----------- | :-------- | :------------ |
| `makeSticky` | `boolean` | `false`       |

#### Returns

`Promise`\<`void`\>

---

### <a id="distinguishasadmin" name="distinguishasadmin"></a> distinguishAsAdmin

▸ **distinguishAsAdmin**(`makeSticky?`): `Promise`\<`void`\>

#### Parameters

| Name         | Type      | Default value |
| :----------- | :-------- | :------------ |
| `makeSticky` | `boolean` | `false`       |

#### Returns

`Promise`\<`void`\>

---

### <a id="edit" name="edit"></a> edit

▸ **edit**(`options`): `Promise`\<[`Comment`](models.Comment.md)\>

#### Parameters

| Name      | Type                                                                        |
| :-------- | :-------------------------------------------------------------------------- |
| `options` | [`CommentSubmissionOptions`](../modules/models.md#commentsubmissionoptions) |

#### Returns

`Promise`\<[`Comment`](models.Comment.md)\>

---

### <a id="getauthor" name="getauthor"></a> getAuthor

▸ **getAuthor**(): `Promise`\<`undefined` \| [`User`](models.User.md)\>

#### Returns

`Promise`\<`undefined` \| [`User`](models.User.md)\>

---

### <a id="ignorereports" name="ignorereports"></a> ignoreReports

▸ **ignoreReports**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="isapproved" name="isapproved"></a> isApproved

▸ **isApproved**(): `boolean`

#### Returns

`boolean`

---

### <a id="isdistinguished" name="isdistinguished"></a> isDistinguished

▸ **isDistinguished**(): `boolean`

#### Returns

`boolean`

---

### <a id="isedited" name="isedited"></a> isEdited

▸ **isEdited**(): `boolean`

#### Returns

`boolean`

---

### <a id="isignoringreports" name="isignoringreports"></a> isIgnoringReports

▸ **isIgnoringReports**(): `boolean`

#### Returns

`boolean`

---

### <a id="islocked" name="islocked"></a> isLocked

▸ **isLocked**(): `boolean`

#### Returns

`boolean`

---

### <a id="isremoved" name="isremoved"></a> isRemoved

▸ **isRemoved**(): `boolean`

#### Returns

`boolean`

---

### <a id="isspam" name="isspam"></a> isSpam

▸ **isSpam**(): `boolean`

#### Returns

`boolean`

---

### <a id="isstickied" name="isstickied"></a> isStickied

▸ **isStickied**(): `boolean`

#### Returns

`boolean`

---

### <a id="lock" name="lock"></a> lock

▸ **lock**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="remove" name="remove"></a> remove

▸ **remove**(`isSpam?`): `Promise`\<`void`\>

#### Parameters

| Name     | Type      | Default value |
| :------- | :-------- | :------------ |
| `isSpam` | `boolean` | `false`       |

#### Returns

`Promise`\<`void`\>

---

### <a id="reply" name="reply"></a> reply

▸ **reply**(`options`): `Promise`\<[`Comment`](models.Comment.md)\>

#### Parameters

| Name      | Type                                                                        |
| :-------- | :-------------------------------------------------------------------------- |
| `options` | [`CommentSubmissionOptions`](../modules/models.md#commentsubmissionoptions) |

#### Returns

`Promise`\<[`Comment`](models.Comment.md)\>

---

### <a id="tojson" name="tojson"></a> toJSON

▸ **toJSON**(): `Pick`\<[`Comment`](models.Comment.md), `"subredditName"` \| `"id"` \| `"score"` \| `"subredditId"` \| `"postId"` \| `"url"` \| `"body"` \| `"spam"` \| `"replies"` \| `"permalink"` \| `"authorName"` \| `"createdAt"` \| `"approved"` \| `"stickied"` \| `"removed"` \| `"edited"` \| `"locked"` \| `"ignoringReports"` \| `"distinguishedBy"` \| `"userReportReasons"` \| `"modReportReasons"` \| `"parentId"` \| `"numReports"` \| `"collapsedBecauseCrowdControl"`\>

#### Returns

`Pick`\<[`Comment`](models.Comment.md), `"subredditName"` \| `"id"` \| `"score"` \| `"subredditId"` \| `"postId"` \| `"url"` \| `"body"` \| `"spam"` \| `"replies"` \| `"permalink"` \| `"authorName"` \| `"createdAt"` \| `"approved"` \| `"stickied"` \| `"removed"` \| `"edited"` \| `"locked"` \| `"ignoringReports"` \| `"distinguishedBy"` \| `"userReportReasons"` \| `"modReportReasons"` \| `"parentId"` \| `"numReports"` \| `"collapsedBecauseCrowdControl"`\>

---

### <a id="undistinguish" name="undistinguish"></a> undistinguish

▸ **undistinguish**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="unignorereports" name="unignorereports"></a> unignoreReports

▸ **unignoreReports**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

### <a id="unlock" name="unlock"></a> unlock

▸ **unlock**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
