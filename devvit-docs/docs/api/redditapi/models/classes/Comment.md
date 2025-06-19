[**@devvit/public-api v0.11.18-dev**](../../README.md)

---

# Class: Comment

## Accessors

<a id="approved"></a>

### approved

#### Get Signature

> **get** **approved**(): `boolean`

##### Returns

`boolean`

---

<a id="approvedatutc"></a>

### approvedAtUtc

#### Get Signature

> **get** **approvedAtUtc**(): `number`

##### Returns

`number`

---

<a id="authorid"></a>

### authorId

#### Get Signature

> **get** **authorId**(): `undefined` \| `` `t2_${string}` ``

##### Returns

`undefined` \| `` `t2_${string}` ``

---

<a id="authorname"></a>

### authorName

#### Get Signature

> **get** **authorName**(): `string`

##### Returns

`string`

---

<a id="bannedatutc"></a>

### bannedAtUtc

#### Get Signature

> **get** **bannedAtUtc**(): `number`

##### Returns

`number`

---

<a id="body"></a>

### body

#### Get Signature

> **get** **body**(): `string`

##### Returns

`string`

---

<a id="collapsedbecausecrowdcontrol"></a>

### collapsedBecauseCrowdControl

#### Get Signature

> **get** **collapsedBecauseCrowdControl**(): `boolean`

##### Returns

`boolean`

---

<a id="createdat"></a>

### createdAt

#### Get Signature

> **get** **createdAt**(): `Date`

##### Returns

`Date`

---

<a id="distinguishedby"></a>

### distinguishedBy

#### Get Signature

> **get** **distinguishedBy**(): `undefined` \| `string`

##### Returns

`undefined` \| `string`

---

<a id="edited"></a>

### edited

#### Get Signature

> **get** **edited**(): `boolean`

##### Returns

`boolean`

---

<a id="id"></a>

### id

#### Get Signature

> **get** **id**(): `` `t1_${string}` ``

##### Returns

`` `t1_${string}` ``

---

<a id="ignoringreports"></a>

### ignoringReports

#### Get Signature

> **get** **ignoringReports**(): `boolean`

##### Returns

`boolean`

---

<a id="locked"></a>

### locked

#### Get Signature

> **get** **locked**(): `boolean`

##### Returns

`boolean`

---

<a id="modreportreasons"></a>

### modReportReasons

#### Get Signature

> **get** **modReportReasons**(): `string`[]

##### Returns

`string`[]

---

<a id="numreports"></a>

### numReports

#### Get Signature

> **get** **numReports**(): `number`

##### Returns

`number`

---

<a id="parentid"></a>

### parentId

#### Get Signature

> **get** **parentId**(): `` `t1_${string}` `` \| `` `t3_${string}` ``

##### Returns

`` `t1_${string}` `` \| `` `t3_${string}` ``

---

<a id="permalink"></a>

### permalink

#### Get Signature

> **get** **permalink**(): `string`

##### Returns

`string`

---

<a id="postid"></a>

### postId

#### Get Signature

> **get** **postId**(): `` `t3_${string}` ``

##### Returns

`` `t3_${string}` ``

---

<a id="removed"></a>

### removed

#### Get Signature

> **get** **removed**(): `boolean`

##### Returns

`boolean`

---

<a id="replies"></a>

### replies

#### Get Signature

> **get** **replies**(): [`Listing`](Listing.md)\<`Comment`\>

##### Returns

[`Listing`](Listing.md)\<`Comment`\>

---

<a id="score"></a>

### score

#### Get Signature

> **get** **score**(): `number`

##### Returns

`number`

---

<a id="spam"></a>

### spam

#### Get Signature

> **get** **spam**(): `boolean`

##### Returns

`boolean`

---

<a id="stickied"></a>

### stickied

#### Get Signature

> **get** **stickied**(): `boolean`

##### Returns

`boolean`

---

<a id="subredditid"></a>

### subredditId

#### Get Signature

> **get** **subredditId**(): `` `t5_${string}` ``

##### Returns

`` `t5_${string}` ``

---

<a id="subredditname"></a>

### subredditName

#### Get Signature

> **get** **subredditName**(): `string`

##### Returns

`string`

---

<a id="url"></a>

### url

#### Get Signature

> **get** **url**(): `string`

##### Returns

`string`

---

<a id="userreportreasons"></a>

### userReportReasons

#### Get Signature

> **get** **userReportReasons**(): `string`[]

##### Returns

`string`[]

## Methods

<a id="addremovalnote"></a>

### addRemovalNote()

> **addRemovalNote**(`options`): `Promise`\<`void`\>

Add a mod note for why the comment was removed

#### Parameters

##### options

###### modNote?

`string`

the reason for removal (maximum 100 characters) (optional)

###### reasonId

`string`

id of a Removal Reason - you can leave this as an empty string if you don't have one

#### Returns

`Promise`\<`void`\>

---

<a id="approve"></a>

### approve()

> **approve**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="delete"></a>

### delete()

> **delete**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="distinguish"></a>

### distinguish()

> **distinguish**(`makeSticky`): `Promise`\<`void`\>

#### Parameters

##### makeSticky

`boolean` = `false`

#### Returns

`Promise`\<`void`\>

---

<a id="distinguishasadmin"></a>

### distinguishAsAdmin()

> **distinguishAsAdmin**(`makeSticky`): `Promise`\<`void`\>

#### Parameters

##### makeSticky

`boolean` = `false`

#### Returns

`Promise`\<`void`\>

---

<a id="edit"></a>

### edit()

> **edit**(`options`): `Promise`\<`Comment`\>

#### Parameters

##### options

[`CommentSubmissionOptions`](../type-aliases/CommentSubmissionOptions.md)

#### Returns

`Promise`\<`Comment`\>

---

<a id="getauthor"></a>

### getAuthor()

> **getAuthor**(): `Promise`\<`undefined` \| [`User`](User.md)\>

#### Returns

`Promise`\<`undefined` \| [`User`](User.md)\>

---

<a id="ignorereports"></a>

### ignoreReports()

> **ignoreReports**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="isapproved"></a>

### isApproved()

> **isApproved**(): `boolean`

#### Returns

`boolean`

---

<a id="isdistinguished"></a>

### isDistinguished()

> **isDistinguished**(): `boolean`

#### Returns

`boolean`

---

<a id="isedited"></a>

### isEdited()

> **isEdited**(): `boolean`

#### Returns

`boolean`

---

<a id="isignoringreports"></a>

### isIgnoringReports()

> **isIgnoringReports**(): `boolean`

#### Returns

`boolean`

---

<a id="islocked"></a>

### isLocked()

> **isLocked**(): `boolean`

#### Returns

`boolean`

---

<a id="isremoved"></a>

### isRemoved()

> **isRemoved**(): `boolean`

#### Returns

`boolean`

---

<a id="isspam"></a>

### isSpam()

> **isSpam**(): `boolean`

#### Returns

`boolean`

---

<a id="isstickied"></a>

### isStickied()

> **isStickied**(): `boolean`

#### Returns

`boolean`

---

<a id="lock"></a>

### lock()

> **lock**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="remove"></a>

### remove()

> **remove**(`isSpam`): `Promise`\<`void`\>

#### Parameters

##### isSpam

`boolean` = `false`

#### Returns

`Promise`\<`void`\>

---

<a id="reply"></a>

### reply()

> **reply**(`options`): `Promise`\<`Comment`\>

#### Parameters

##### options

[`CommentSubmissionOptions`](../type-aliases/CommentSubmissionOptions.md)

#### Returns

`Promise`\<`Comment`\>

---

<a id="tojson"></a>

### toJSON()

> **toJSON**(): `Pick`\<`Comment`, `"subredditName"` \| `"id"` \| `"score"` \| `"subredditId"` \| `"postId"` \| `"url"` \| `"body"` \| `"spam"` \| `"parentId"` \| `"createdAt"` \| `"permalink"` \| `"authorName"` \| `"approved"` \| `"stickied"` \| `"removed"` \| `"edited"` \| `"locked"` \| `"ignoringReports"` \| `"distinguishedBy"` \| `"userReportReasons"` \| `"modReportReasons"` \| `"replies"` \| `"numReports"` \| `"collapsedBecauseCrowdControl"`\>

#### Returns

`Pick`\<`Comment`, `"subredditName"` \| `"id"` \| `"score"` \| `"subredditId"` \| `"postId"` \| `"url"` \| `"body"` \| `"spam"` \| `"parentId"` \| `"createdAt"` \| `"permalink"` \| `"authorName"` \| `"approved"` \| `"stickied"` \| `"removed"` \| `"edited"` \| `"locked"` \| `"ignoringReports"` \| `"distinguishedBy"` \| `"userReportReasons"` \| `"modReportReasons"` \| `"replies"` \| `"numReports"` \| `"collapsedBecauseCrowdControl"`\>

---

<a id="undistinguish"></a>

### undistinguish()

> **undistinguish**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="unignorereports"></a>

### unignoreReports()

> **unignoreReports**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

---

<a id="unlock"></a>

### unlock()

> **unlock**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
