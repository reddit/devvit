[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: TxClientLike

> **TxClientLike** = `object`

## Methods

<a id="del"></a>

### del()

> **del**(...`keys`): `Promise`\<`TxClientLike`\>

Removes the specified keys. A key is ignored if it does not exist.
https://redis.io/commands/del/

#### Parameters

##### keys

...`string`[]

#### Returns

`Promise`\<`TxClientLike`\>

#### Arg

keys

#### Example

```ts
async function delExample(context: Devvit.Context) {
  await context.redis.set('quantity', '5');
  await context.redis.del('quantity');
}
```

---

<a id="discard"></a>

### discard()

> **discard**(): `Promise`\<`void`\>

Flushes all previously queued commands in a transaction and restores the connection state to normal.
If WATCH was used, DISCARD unwatches all keys watched by the connection. https://redis.io/docs/latest/commands/discard/

#### Returns

`Promise`\<`void`\>

#### Example

```ts
async function discardExample(context: Devvit.Context) {
  await context.redis.set('price', '25');

  const txn = await context.redis.watch('price');

  await txn.multi(); // Begin a transaction
  await txn.incrBy('price', 5);
  await txn.discard(); // Discard the commands in the transaction
}
```

---

<a id="exec"></a>

### exec()

> **exec**(): `Promise`\<`any`[]\>

Executes all previously queued commands in a transaction and
restores the connection state to normal. https://redis.io/commands/exec/

#### Returns

`Promise`\<`any`[]\>

array, each element being the reply to each of the commands in the atomic transaction.

#### Example

```ts
async function execExample(context: Devvit.Context) {
  await context.redis.set('karma', '32');

  const txn = await context.redis.watch('quantity');

  await txn.multi(); // Begin a transaction
  await txn.incrBy('karma', 10);
  await txn.exec(); // Execute the commands in the transaction
}
```

---

<a id="expire"></a>

### expire()

> **expire**(`key`, `seconds`): `Promise`\<`TxClientLike`\>

Set a timeout on key.
https://redis.io/commands/expire/

#### Parameters

##### key

`string`

##### seconds

`number`

#### Returns

`Promise`\<`TxClientLike`\>

#### Arg

key

#### Arg

seconds

#### Example

```ts
async function expireExample(context: Devvit.Context) {
  await context.redis.set('product', 'milk');
  await context.redis.expire('product', 60); // Set the product to expire in 60 seconds
}
```

---

<a id="expiretime"></a>

### expireTime()

> **expireTime**(`key`): `Promise`\<`TxClientLike`\>

Returns the absolute Unix timestamp in seconds at which the given key will expire
https://redis.io/commands/expiretime/

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`TxClientLike`\>

expiration Unix timestamp in seconds, or a negative value in order to signal an error

#### Arg

key

#### Example

```ts
async function expireTimeExample(context: Devvit.Context) {
  await context.redis.set('product', 'milk');
  const expireTime: number = await context.redis.expireTime('product');
  console.log('Expire time: ' + expireTime);
}
```

---

<a id="get"></a>

### get()

> **get**(`key`): `Promise`\<`TxClientLike`\>

Get the value of key. If the key does not exist the special value nil is returned.
https://redis.io/commands/get/

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`TxClientLike`\>

value of key or null when key does not exist.

#### Arg

key

#### Example

```ts
async function getExample(context: Devvit.Context) {
  await context.redis.set('quantity', '5');
  const quantity: string | undefined = await context.redis.get('quantity');
  console.log('Quantity: ' + quantity);
}
```

---

<a id="getrange"></a>

### getRange()

> **getRange**(`key`, `start`, `end`): `Promise`\<`TxClientLike`\>

Returns the substring of the string value stored at key, determined by
the offsets start and end (both are inclusive).
https://redis.io/commands/getrange/

#### Parameters

##### key

`string`

##### start

`number`

##### end

`number`

#### Returns

`Promise`\<`TxClientLike`\>

substring determined by offsets [start, end]

#### Arg

key

#### Arg

start

#### Arg

end

#### Example

```ts
async function getRangeExample(context: Devvit.Context) {
  await context.redis.set('word', 'tacocat');
  const range: string = await context.redis.getRange('word', 0, 3);
  console.log('Range from index 0 to 3: ' + range);
}
```

---

<a id="hdel"></a>

### ~~hdel()~~

> **hdel**(`key`, `fields`): `Promise`\<`TxClientLike`\>

Removes the specified fields from the hash stored at key.
https://redis.io/commands/hdel/

#### Parameters

##### key

`string`

##### fields

`string`[]

#### Returns

`Promise`\<`TxClientLike`\>

number of fields that were removed from the hash

#### Deprecated

Use [TxClientLike.hDel](#hdel-2) instead.

#### Arg

key

#### Arg

fields

---

<a id="hdel-2"></a>

### hDel()

> **hDel**(`key`, `fields`): `Promise`\<`TxClientLike`\>

Removes the specified fields from the hash stored at key.
https://redis.io/commands/hdel/

#### Parameters

##### key

`string`

##### fields

`string`[]

#### Returns

`Promise`\<`TxClientLike`\>

number of fields that were removed from the hash

#### Arg

key

#### Arg

fields

#### Example

```ts
async function hDelExample(context: Devvit.Context) {
  await context.redis.hSet('fruits', { apple: '5', orange: '7', kiwi: '9' });
  const numFieldsRemoved = await context.redis.hDel('fruits', ['apple', 'kiwi']);
  console.log('Number of fields removed: ' + numFieldsRemoved);
}
```

---

<a id="hget"></a>

### ~~hget()~~

> **hget**(`key`, `field`): `Promise`\<`TxClientLike`\>

Returns the value associated with field in the hash stored at key.
https://redis.io/commands/hget

#### Parameters

##### key

`string`

##### field

`string`

#### Returns

`Promise`\<`TxClientLike`\>

value associated with field

#### Deprecated

Use [TxClientLike.hGet](#hget-2) instead.

#### Arg

key

#### Arg

field

---

<a id="hget-2"></a>

### hGet()

> **hGet**(`key`, `field`): `Promise`\<`TxClientLike`\>

Returns the value associated with field in the hash stored at key.
https://redis.io/commands/hget

#### Parameters

##### key

`string`

##### field

`string`

#### Returns

`Promise`\<`TxClientLike`\>

value associated with field

#### Arg

key

#### Arg

field

#### Example

```ts
async function hGetExample(context: Devvit.Context) {
  await context.redis.hSet('fruits', { apple: '5', orange: '7', kiwi: '9' });
  const result: string | undefined = await context.redis.hGet('fruits', 'orange');
  console.log('Value of orange: ' + result);
}
```

---

<a id="hgetall"></a>

### ~~hgetall()~~

> **hgetall**(`key`): `Promise`\<`TxClientLike`\>

Returns all fields and values of the hash stored at key
https://redis.io/commands/hgetall

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`TxClientLike`\>

a map of fields and their values stored in the hash,

#### Deprecated

Use [TxClientLike.hGetAll](#hgetall-2) instead.

#### Arg

key

---

<a id="hgetall-2"></a>

### hGetAll()

> **hGetAll**(`key`): `Promise`\<`TxClientLike`\>

Returns all fields and values of the hash stored at key
https://redis.io/commands/hgetall

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`TxClientLike`\>

a map of fields and their values stored in the hash,

#### Arg

key

#### Example

```
async function hGetAllExample(context: Devvit.Context) {
 await context.redis.hSet("groceryList", {
  "eggs": "12",
  "apples": "3",
  "milk": "1"
 });

 const record : Record<string, string> | undefined = await context.redis.hGetAll("groceryList");

 if (record != undefined) {
  console.log("Eggs: " + record.eggs + ", Apples: " + record.apples + ", Milk: " + record.milk);
 }
}
```

---

<a id="hincrby"></a>

### ~~hincrby()~~

> **hincrby**(`key`, `field`, `value`): `Promise`\<`TxClientLike`\>

Increments the number stored at field in the hash stored at key by increment.
https://redis.io/commands/hincrby/

#### Parameters

##### key

`string`

##### field

`string`

##### value

`number`

#### Returns

`Promise`\<`TxClientLike`\>

value of key after the increment

#### Deprecated

Use [TxClientLike.hIncrBy](#hincrby-2) instead.

#### Arg

key

#### Arg

field

#### Arg

value

---

<a id="hincrby-2"></a>

### hIncrBy()

> **hIncrBy**(`key`, `field`, `value`): `Promise`\<`TxClientLike`\>

Increments the number stored at field in the hash stored at key by increment.
https://redis.io/commands/hincrby/

#### Parameters

##### key

`string`

##### field

`string`

##### value

`number`

#### Returns

`Promise`\<`TxClientLike`\>

value of key after the increment

#### Arg

key

#### Arg

field

#### Arg

value

#### Example

```ts
async function hIncrByExample(context: Devvit.Context) {
  await context.redis.hSet('user123', { karma: '100' });
  await context.redis.hIncrBy('user123', 'karma', 5);
}
```

---

<a id="hkeys"></a>

### ~~hkeys()~~

> **hkeys**(`key`): `Promise`\<`TxClientLike`\>

Returns all field names in the hash stored at key.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`TxClientLike`\>

#### Deprecated

Use [TxClientLike.hKeys](#hkeys-2) instead.

#### Arg

key

---

<a id="hkeys-2"></a>

### hKeys()

> **hKeys**(`key`): `Promise`\<`TxClientLike`\>

Returns all field names in the hash stored at key.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`TxClientLike`\>

#### Arg

key

#### Example

```ts
async function hKeysExample(context: Devvit.Context) {
  await context.redis.hSet('prices', {
    chair: '48',
    desk: '95',
    whiteboard: '23',
  });
  const keys: string[] = await context.redis.hKeys('prices');
  console.log('Keys: ' + keys);
}
```

---

<a id="hlen"></a>

### ~~hlen()~~

> **hlen**(`key`): `Promise`\<`TxClientLike`\>

Returns the number of fields contained in the hash stored at key.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`TxClientLike`\>

the number of fields in the hash, or 0 when the key does not exist.

#### Deprecated

Use [TxClientLike.hLen](#hlen-2) instead.

#### Arg

key

---

<a id="hlen-2"></a>

### hLen()

> **hLen**(`key`): `Promise`\<`TxClientLike`\>

Returns the number of fields contained in the hash stored at key.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`TxClientLike`\>

the number of fields in the hash, or 0 when the key does not exist.

#### Arg

key

#### Example

```ts
async function hLenExample(context: Devvit.Context) {
  await context.redis.hSet('supplies', {
    paperclips: '25',
    pencils: '10',
    erasers: '5',
    pens: '7',
  });
  const numberOfFields: number = await context.redis.hLen('supplies');
  console.log('Number of fields: ' + numberOfFields);
}
```

---

<a id="hmget"></a>

### hMGet()

> **hMGet**(`key`, `fields`): `Promise`\<`TxClientLike`\>

Returns the values associated with fields in the hash stored at key.
https://redis.io/commands/hmget

#### Parameters

##### key

`string`

##### fields

`string`[]

#### Returns

`Promise`\<`TxClientLike`\>

values associated with each field in the order they appear in fields

#### Arg

key

#### Arg

fields

#### Example

```ts
async function hMGetExample(context: Devvit.Context) {
  await context.redis.hSet('fruits', { apple: '5', orange: '7', kiwi: '9' });
  const result: string[] | undefined = await context.redis.hMGet('fruits', [
    'orange',
    'grape',
    'apple',
  ]);
  console.log('Value of fields: ' + result); // "Value of fields: ["7", undefined, "5"]
}
```

---

<a id="hscan"></a>

### ~~hscan()~~

> **hscan**(`key`, `cursor`, `pattern`?, `count`?): `Promise`\<`TxClientLike`\>

Iterates fields of Hash types and their associated values.

#### Parameters

##### key

`string`

##### cursor

`number`

##### pattern?

`string`

##### count?

`number`

#### Returns

`Promise`\<`TxClientLike`\>

#### Deprecated

Use [TxClientLike.hScan](#hscan-2) instead.

#### Arg

key

#### Arg

cursor

#### Arg

pattern

#### Arg

count

---

<a id="hscan-2"></a>

### hScan()

> **hScan**(`key`, `cursor`, `pattern`?, `count`?): `Promise`\<`TxClientLike`\>

Iterates fields of Hash types and their associated values.

#### Parameters

##### key

`string`

##### cursor

`number`

##### pattern?

`string`

##### count?

`number`

#### Returns

`Promise`\<`TxClientLike`\>

#### Arg

key

#### Arg

cursor

#### Arg

pattern

#### Arg

count

#### Example

```ts
async function hScanExample(context: Devvit.Context) {
  await context.redis.hSet('userInfo', {
    name: 'Bob',
    startDate: '01-05-20',
    totalAwards: '12',
  });

  const hScanResponse = await context.redis.hScan('userInfo', 0);

  hScanResponse.fieldValues.forEach((x) => {
    console.log("Field: '" + x.field + "', Value: '" + x.value + "'");
  });
}
```

---

<a id="hset"></a>

### ~~hset()~~

> **hset**(`key`, `fieldValues`): `Promise`\<`TxClientLike`\>

Sets the specified fields to their respective values in the hash stored at key.
https://redis.io/commands/hset

#### Parameters

##### key

`string`

##### fieldValues

#### Returns

`Promise`\<`TxClientLike`\>

number of fields that were added

#### Deprecated

Use [TxClientLike.hSet](#hset-2) instead.

#### Arg

key

#### Arg

fieldValues

---

<a id="hset-2"></a>

### hSet()

> **hSet**(`key`, `fieldValues`): `Promise`\<`TxClientLike`\>

Sets the specified fields to their respective values in the hash stored at key.
https://redis.io/commands/hset

#### Parameters

##### key

`string`

##### fieldValues

#### Returns

`Promise`\<`TxClientLike`\>

number of fields that were added

#### Arg

key

#### Arg

fieldValues

#### Example

```ts
async function hSetExample(context: Devvit.Context) {
  const numFieldsAdded = await context.redis.hSet('fruits', { apple: '5', orange: '7', kiwi: '9' });
  console.log('Number of fields added: ' + numFieldsAdded);
}
```

---

<a id="incrby"></a>

### incrBy()

> **incrBy**(`key`, `value`): `Promise`\<`TxClientLike`\>

Increments the number stored at key by increment.
https://redis.io/commands/incrby/

#### Parameters

##### key

`string`

##### value

`number`

#### Returns

`Promise`\<`TxClientLike`\>

#### Arg

key

#### Arg

value

#### Example

```ts
async function incrByExample(context: Devvit.Context) {
  await context.redis.set('totalPoints', '53');
  const updatedPoints: number = await context.redis.incrBy('totalPoints', 100);
  console.log('Updated points: ' + updatedPoints);
}
```

---

<a id="mget"></a>

### ~~mget()~~

> **mget**(`keys`): `Promise`\<`TxClientLike`\>

Returns the values of all specified keys.
https://redis.io/commands/mget/

#### Parameters

##### keys

`string`[]

#### Returns

`Promise`\<`TxClientLike`\>

list of values at the specified keys

#### Deprecated

Use [TxClientLike.mGet](#mget-2) instead.

#### Arg

keys

---

<a id="mget-2"></a>

### mGet()

> **mGet**(`keys`): `Promise`\<`TxClientLike`\>

Returns the values of all specified keys.
https://redis.io/commands/mget/

#### Parameters

##### keys

`string`[]

#### Returns

`Promise`\<`TxClientLike`\>

list of values at the specified keys

#### Arg

keys

#### Example

```ts
async function mGetExample(context: Devvit.Context) {
  await context.redis.mSet({ name: 'Zeek', occupation: 'Developer' });
  const result: (string | null)[] = await context.redis.mGet(['name', 'occupation']);
  result.forEach((x) => {
    console.log(x);
  });
}
```

---

<a id="mset"></a>

### ~~mset()~~

> **mset**(`keyValues`): `Promise`\<`TxClientLike`\>

Sets the given keys to their respective values.
https://redis.io/commands/mset/

#### Parameters

##### keyValues

#### Returns

`Promise`\<`TxClientLike`\>

#### Deprecated

Use [TxClientLike.mSet](#mset-2) instead.

#### Arg

keyValues

---

<a id="mset-2"></a>

### mSet()

> **mSet**(`keyValues`): `Promise`\<`TxClientLike`\>

Sets the given keys to their respective values.
https://redis.io/commands/mset/

#### Parameters

##### keyValues

#### Returns

`Promise`\<`TxClientLike`\>

#### Arg

keyValues

#### Example

```ts
async function mSetExample(context: Devvit.Context) {
  await context.redis.mSet({ name: 'Zeek', occupation: 'Developer' });
}
```

---

<a id="multi"></a>

### multi()

> **multi**(): `Promise`\<`void`\>

Marks the start of a transaction block. Subsequent commands will be
queued for atomic execution using EXEC. https://redis.io/commands/multi/

#### Returns

`Promise`\<`void`\>

#### Example

```ts
async function multiExample(context: Devvit.Context) {
  await context.redis.set('karma', '32');

  const txn = await context.redis.watch('quantity');

  await txn.multi(); // Begin a transaction
  await txn.incrBy('karma', 10);
  await txn.exec(); // Execute the commands in the transaction
}
```

---

<a id="set"></a>

### set()

> **set**(`key`, `value`, `options`?): `Promise`\<`TxClientLike`\>

Set key to hold the string value. If key already holds a value, it is overwritten
https://redis.io/commands/set/

#### Parameters

##### key

`string`

##### value

`string`

##### options?

[`SetOptions`](SetOptions.md)

#### Returns

`Promise`\<`TxClientLike`\>

#### Arg

key

#### Arg

value

#### Arg

options

#### Example

```ts
async function setExample(context: Devvit.Context) {
  await context.redis.set('quantity', '5');
}
```

---

<a id="setrange"></a>

### setRange()

> **setRange**(`key`, `offset`, `value`): `Promise`\<`TxClientLike`\>

Overwrites part of the string stored at key, starting at the
specified offset, for the entire length of value.
https://redis.io/commands/setrange/

#### Parameters

##### key

`string`

##### offset

`number`

##### value

`string`

#### Returns

`Promise`\<`TxClientLike`\>

length of the string after it was modified by the command

#### Arg

key

#### Arg

offset

#### Example

```ts
async function setRangeExample(context: Devvit.Context) {
  await context.redis.set('word', 'tacocat');
  await context.redis.setRange('word', 0, 'blue');
}
```

---

<a id="strlen"></a>

### ~~strlen()~~

> **strlen**(`key`): `Promise`\<`TxClientLike`\>

Returns the length of the string value stored at key.
An error is returned when key holds a non-string value.
https://redis.io/commands/strlen/

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`TxClientLike`\>

length of the string stored at key

#### Deprecated

Use [TxClientLike.strLen](#strlen-2) instead.

#### Arg

key

---

<a id="strlen-2"></a>

### strLen()

> **strLen**(`key`): `Promise`\<`TxClientLike`\>

Returns the length of the string value stored at key.
An error is returned when key holds a non-string value.
https://redis.io/commands/strlen/

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`TxClientLike`\>

length of the string stored at key

#### Arg

key

#### Example

```ts
async function strLenExample(context: Devvit.Context) {
  await context.redis.set('word', 'tacocat');
  const length: number = await context.redis.strLen('word');
  console.log('Length of word: ' + length);
}
```

---

<a id="type"></a>

### type()

> **type**(`key`): `Promise`\<`TxClientLike`\>

Returns the string representation of the type of the value stored at key
https://redis.io/commands/type/

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`TxClientLike`\>

string representation of the type

#### Arg

key

#### Example

```ts
async function typeExample(context: Devvit.Context) {
  await context.redis.set('quantity', '5');
  const type: string = await context.redis.type('quantity');
  console.log('Key type: ' + type);
}
```

---

<a id="unwatch"></a>

### unwatch()

> **unwatch**(): `Promise`\<`TxClientLike`\>

Flushes all the previously watched keys for a transaction.
If you call EXEC or DISCARD, there's no need to manually call UNWATCH.
https://redis.io/commands/unwatch/

#### Returns

`Promise`\<`TxClientLike`\>

#### Example

```ts
async function unwatchExample(context: Devvit.Context) {
  await context.redis.set('gold', '50');

  const txn = await context.redis.watch('gold');

  await txn.multi(); // Begin a transaction
  await txn.incrBy('gold', 30);
  await txn.unwatch(); // Unwatch "gold"

  // Now that "gold" has been unwatched, we can increment its value
  // outside the transaction without canceling the transaction
  await context.redis.incrBy('gold', -20);

  await txn.exec(); // Execute the commands in the transaction

  console.log('Gold value: ' + (await context.redis.get('gold'))); // The value of 'gold' should be 50 + 30 - 20 = 60
}
```

---

<a id="watch"></a>

### watch()

> **watch**(...`keys`): `Promise`\<`TxClientLike`\>

Marks the given keys to be watched for conditional execution of a transaction.
https://redis.io/commands/watch/

#### Parameters

##### keys

...`string`[]

#### Returns

`Promise`\<`TxClientLike`\>

#### Arg

keys - given keys to be watched

#### Example

```ts
async function watchExample(context: Devvit.Context) {
  await context.redis.set('karma', '32');

  const txn = await context.redis.watch('quantity');

  await txn.multi(); // Begin a transaction
  await txn.incrBy('karma', 10);
  await txn.exec(); // Execute the commands in the transaction
}
```

---

<a id="zadd"></a>

### zAdd()

> **zAdd**(`key`, ...`members`): `Promise`\<`TxClientLike`\>

Adds all the specified members with the specified scores to the sorted set stored at key.
https://redis.io/commands/zadd/

#### Parameters

##### key

`string`

##### members

...[`ZMember`](ZMember.md)[]

#### Returns

`Promise`\<`TxClientLike`\>

number of elements added to the sorted set

#### Arg

key

#### Example

```ts
async function zAddExample(context: Devvit.Context) {
  const numMembersAdded: number = await context.redis.zAdd(
    'leaderboard',
    { member: 'louis', score: 37 },
    { member: 'fernando', score: 10 },
    { member: 'caesar', score: 20 },
    { member: 'alexander', score: 25 }
  );
  console.log('Number of members added: ' + numMembersAdded);
}
```

---

<a id="zcard"></a>

### zCard()

> **zCard**(`key`): `Promise`\<`TxClientLike`\>

Returns the cardinality (number of elements) of the sorted set stored at key.
https://redis.io/commands/zcard/

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`TxClientLike`\>

cardinality of the sorted set

#### Arg

key

#### Example

```ts
async function zCardExample(context: Devvit.Context) {
  await context.redis.zAdd(
    'leaderboard',
    { member: 'louis', score: 37 },
    { member: 'fernando', score: 10 },
    { member: 'caesar', score: 20 },
    { member: 'alexander', score: 25 }
  );
  const cardinality: number = await context.redis.zCard('leaderboard');
  console.log('Cardinality: ' + cardinality);
}
```

---

<a id="zincrby"></a>

### zIncrBy()

> **zIncrBy**(`key`, `member`, `value`): `Promise`\<`TxClientLike`\>

Increments the score of member in the sorted set stored at key by value
https://redis.io/commands/zincrby/

#### Parameters

##### key

`string`

##### member

`string`

##### value

`number`

#### Returns

`Promise`\<`TxClientLike`\>

the new score of member as a double precision floating point number

#### Arg

key

#### Arg

member

#### Arg

value

#### Example

```ts
async function zIncrByExample(context: Devvit.Context) {
  await context.redis.zAdd(
    'animals',
    { member: 'zebra', score: 92 },
    { member: 'cat', score: 100 },
    { member: 'dog', score: 95 },
    { member: 'elephant', score: 97 }
  );
  const updatedScore: number = await context.redis.zIncrBy('animals', 'dog', 10);
  console.log("Dog's updated score: " + updatedScore);
}
```

---

<a id="zrange"></a>

### zRange()

> **zRange**(`key`, `start`, `stop`, `options`?): `Promise`\<`TxClientLike`\>

Returns the specified range of elements in the sorted set stored at key.
https://redis.io/commands/zrange/

When using `by: 'lex'`, the start and stop inputs will be prepended with `[` by default, unless they already begin with `[`, `(` or are one of the special values `+` or `-`.

#### Parameters

##### key

`string`

##### start

`string` | `number`

##### stop

`string` | `number`

##### options?

[`ZRangeOptions`](ZRangeOptions.md)

#### Returns

`Promise`\<`TxClientLike`\>

list of elements in the specified range

#### Arg

key

#### Arg

start

#### Arg

stop

#### Arg

options

#### Example

```ts
async function zRangeExample(context: Devvit.Context) {
  await context.redis.zAdd(
    'leaderboard',
    { member: 'louis', score: 37 },
    { member: 'fernando', score: 10 },
    { member: 'caesar', score: 20 },
    { member: 'alexander', score: 25 }
  );

  // View elements with scores between 0 and 30 inclusive, sorted by score
  const scores: { member: string; score: number }[] = await context.redis.zRange(
    'leaderboard',
    0,
    30,
    { by: 'score' }
  );

  scores.forEach((x) => {
    console.log('Member: ' + x.member, ', Score: ' + x.score);
  });
}
```

---

<a id="zrank"></a>

### zRank()

> **zRank**(`key`, `member`): `Promise`\<`TxClientLike`\>

Returns the rank of member in the sorted set stored at key
https://redis.io/commands/zrank/

#### Parameters

##### key

`string`

##### member

`string`

#### Returns

`Promise`\<`TxClientLike`\>

rank of the member. The rank (or index) is 0-based
which means that the member with the lowest score has rank 0

#### Arg

key

#### Arg

member

#### Example

```ts
async function zRankExample(context: Devvit.Context) {
  await context.redis.zAdd(
    'animals',
    { member: 'zebra', score: 92 },
    { member: 'cat', score: 100 },
    { member: 'dog', score: 95 },
    { member: 'elephant', score: 97 }
  );
  const rank: number = await context.redis.zRank('animals', 'dog');
  console.log("Dog's rank: " + rank);
}
```

---

<a id="zrem"></a>

### zRem()

> **zRem**(`key`, `members`): `Promise`\<`TxClientLike`\>

Removes the specified members from the sorted set stored at key.
https://redis.io/commands/zrem/

#### Parameters

##### key

`string`

##### members

`string`[]

#### Returns

`Promise`\<`TxClientLike`\>

number of members removed from the sorted set

#### Arg

key

#### Arg

members

#### Example

```ts
async function zRemExample(context: Devvit.Context) {
  await context.redis.zAdd(
    'leaderboard',
    { member: 'louis', score: 37 },
    { member: 'fernando', score: 10 },
    { member: 'caesar', score: 20 },
    { member: 'alexander', score: 25 }
  );
  const numberOfMembersRemoved: number = await context.redis.zRem('leaderboard', [
    'fernando',
    'alexander',
  ]);
  console.log('Number of members removed: ' + numberOfMembersRemoved);
}
```

---

<a id="zremrangebylex"></a>

### zRemRangeByLex()

> **zRemRangeByLex**(`key`, `min`, `max`): `Promise`\<`TxClientLike`\>

removes all elements in the sorted set stored at key between the
lexicographical range specified by min and max
https://redis.io/commands/zremrangebylex/

#### Parameters

##### key

`string`

##### min

`string`

##### max

`string`

#### Returns

`Promise`\<`TxClientLike`\>

number of members removed from the sorted set

#### Arg

key

#### Arg

min

#### Arg

max

#### Example

```ts
async function zRemRangeByLexExample(context: Devvit.Context) {
  await context.redis.zAdd(
    'fruits',
    { member: 'kiwi', score: 0 },
    { member: 'mango', score: 0 },
    { member: 'banana', score: 0 },
    { member: 'orange', score: 0 },
    { member: 'apple', score: 0 }
  );

  // Remove fruits alphabetically ordered between 'kiwi' inclusive and 'orange' exclusive
  // Note: The symbols '[' and '(' indicate inclusive or exclusive, respectively. These must be included in the call to zRemRangeByLex().
  const numFieldsRemoved: number = await context.redis.zRemRangeByLex('fruits', '[kiwi', '(orange');
  console.log('Number of fields removed: ' + numFieldsRemoved);
}
```

---

<a id="zremrangebyrank"></a>

### zRemRangeByRank()

> **zRemRangeByRank**(`key`, `start`, `stop`): `Promise`\<`TxClientLike`\>

Removes all elements in the sorted set stored at key with rank between start and stop.
https://redis.io/commands/zremrangebyrank/

#### Parameters

##### key

`string`

##### start

`number`

##### stop

`number`

#### Returns

`Promise`\<`TxClientLike`\>

number of members removed from the sorted set

#### Arg

key

#### Arg

start

#### Arg

stop

#### Example

```
async function zRemRangeByRankExample(context: Devvit.Context) {
 await context.redis.zAdd("fruits",
   {member: "kiwi", score: 10},
   {member: "mango", score: 20},
   {member: "banana", score: 30},
   {member: "orange", score: 40},
   {member: "apple", score: 50},
 );

 // Remove fruits ranked 1 through 3 inclusive
 const numFieldsRemoved : number = await context.redis.zRemRangeByRank("fruits", 1, 3);
 console.log("Number of fields removed: " + numFieldsRemoved);
}
```

---

<a id="zremrangebyscore"></a>

### zRemRangeByScore()

> **zRemRangeByScore**(`key`, `min`, `max`): `Promise`\<`TxClientLike`\>

Removes all elements in the sorted set stored at key with a score between min and max
https://redis.io/commands/zremrangebyscore/

#### Parameters

##### key

`string`

##### min

`number`

##### max

`number`

#### Returns

`Promise`\<`TxClientLike`\>

number of members removed from the sorted set

#### Arg

key

#### Arg

min

#### Arg

max

#### Example

```ts
async function zRemRangeByScoreExample(context: Devvit.Context) {
  await context.redis.zAdd(
    'fruits',
    { member: 'kiwi', score: 10 },
    { member: 'mango', score: 20 },
    { member: 'banana', score: 30 },
    { member: 'orange', score: 40 },
    { member: 'apple', score: 50 }
  );
  // Remove fruits scored between 30 and 50 inclusive
  const numFieldsRemoved: number = await context.redis.zRemRangeByScore('fruits', 30, 50);
  console.log('Number of fields removed: ' + numFieldsRemoved);
}
```

---

<a id="zscan"></a>

### zScan()

> **zScan**(`key`, `cursor`, `pattern`?, `count`?): `Promise`\<`TxClientLike`\>

Iterates elements of Sorted Set types and their associated scores.

#### Parameters

##### key

`string`

##### cursor

`number`

##### pattern?

`string`

##### count?

`number`

#### Returns

`Promise`\<`TxClientLike`\>

#### Arg

key

#### Arg

cursor

#### Arg

pattern

#### Arg

count

#### Example

```ts
async function zScanExample(context: Devvit.Context) {
  await context.redis.zAdd(
    'fruits',
    { member: 'kiwi', score: 0 },
    { member: 'mango', score: 0 },
    { member: 'banana', score: 0 },
    { member: 'orange', score: 0 },
    { member: 'apple', score: 0 }
  );
  const zScanResponse = await context.redis.zScan('fruits', 0);
  console.log('zScanResponse: ' + JSON.stringify(zScanResponse));
}
```

---

<a id="zscore"></a>

### zScore()

> **zScore**(`key`, `member`): `Promise`\<`TxClientLike`\>

Returns the score of member in the sorted set at key.
https://redis.io/commands/zscore/

#### Parameters

##### key

`string`

##### member

`string`

#### Returns

`Promise`\<`TxClientLike`\>

the score of the member (a double-precision floating point number).

#### Arg

key

#### Arg

member

#### Example

```ts
async function zScoreExample(context: Devvit.Context) {
  await context.redis.zAdd(
    'leaderboard',
    { member: 'louis', score: 37 },
    { member: 'fernando', score: 10 },
    { member: 'caesar', score: 20 },
    { member: 'alexander', score: 25 }
  );
  const score: number | undefined = await context.redis.zScore('leaderboard', 'caesar');
  if (score !== undefined) {
    console.log("Caesar's score: " + score);
  }
}
```
