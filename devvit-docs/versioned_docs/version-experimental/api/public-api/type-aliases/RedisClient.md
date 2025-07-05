[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: RedisClient

> **RedisClient** = `object`

## Properties

<a id="global"></a>

### global

> **global**: `Omit`\<`RedisClient`, `"global"`\>

Allows read/write operations to global keys in Redis
Global redis enables apps to persist and access state across subreddit installations

## Methods

<a id="bitfield"></a>

### bitfield()

> **bitfield**(`key`, ...`cmds`): `Promise`\<`number`[]\>

Performs operations on a redis string treating it as an array of bits.
Operations available:

- get <encoding> <offset> -- Returns the specified bit field.
- set <encoding> <offset> <value> -- Sets the specified bit field and returns its old value.
- incrBy <encoding> <offset> <increment> -- Increments or decrements (if a negative increment is given) the specified bit field and returns the new value.
- overflow [wrap|sat|fail] -- Alters the overflow behavior of subsequent set's and incrBy's until the next overflow command
  https://redis.io/docs/latest/commands/bitfield/

#### Parameters

##### key

`string`

##### cmds

\[\] | [`BitfieldCommand`](BitfieldCommand.md) | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"get"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"set"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"incrBy"`, `` `i${number}` `` \| `` `u${number}` ``, `BitfieldOffset`, `number` \| `` `${number}` ``, ...(string \| number)\[\]\] | \[`"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, `"overflow"`, `"wrap"` \| `"sat"` \| `"fail"`, ...(string \| number)\[\]\]

#### Returns

`Promise`\<`number`[]\>

an array with the result of each command, in order

#### Arg

key the redis key containing the string to operate on

#### Arg

cmds the commands to perform on the string

#### Example

```ts
async function bitfieldExample(context: Devvit.Context) {
  const fooResults: number[] = await context.redis.bitfield(
    'foo',
    'incrBy',
    'i5',
    100,
    1,
    'get',
    'u4',
    0
  );
  console.log('fooResults: ' + fooResults); // [1, 0]

  const barResults: number[] = await context.redis.bitfield(
    'bar',
    'set',
    'u2',
    0,
    3,
    'get',
    'u2',
    0,
    'incrBy',
    'u2',
    0,
    1,
    'overflow',
    'sat',
    'get',
    'u2',
    0,
    'set',
    'u2',
    0,
    3,
    'incrBy',
    'u2',
    0,
    1
  );
  console.log('barResults: ' + barResults); // [0, 3, 0, 0, 3, 3]
}
```

---

<a id="del"></a>

### del()

> **del**(...`keys`): `Promise`\<`void`\>

Removes the specified keys. A key is ignored if it does not exist.
https://redis.io/commands/del/

#### Parameters

##### keys

...`string`[]

#### Returns

`Promise`\<`void`\>

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

<a id="exists"></a>

### exists()

> **exists**(...`keys`): `Promise`\<`number`\>

Returns number of given keys that exists
https://redis.io/commands/exists/

#### Parameters

##### keys

...`string`[]

#### Returns

`Promise`\<`number`\>

number of keys in the list of keys that exist (note: double counts if an existing key is passed twice)

#### Arg

keys Keys to check for existence

#### Example

```ts
async function existsExample(context: Devvit.Context) {
  const exists: number = await context.redis.exists('someKey');
  console.log('Exists: ' + exists); // 0

  await context.redis.set('someKey', 'someValue');
  const exists2: number = await context.redis.exists('someKey', 'someOtherKey');
  console.log('Exists2: ' + exists2); // 1

  await context.redis.set('someOtherKey', 'someOtherValue');
  const exists3: number = await context.redis.exists('someKey', 'someKey', 'someOtherKey');
  console.log('Exists3: ' + exists3); // 3, since "someKey" is counted twice
}
```

---

<a id="expire"></a>

### expire()

> **expire**(`key`, `seconds`): `Promise`\<`void`\>

Set a timeout on key.
https://redis.io/commands/expire/

#### Parameters

##### key

`string`

##### seconds

`number`

#### Returns

`Promise`\<`void`\>

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

> **expireTime**(`key`): `Promise`\<`number`\>

Returns the absolute Unix timestamp in seconds at which the given key will expire
https://redis.io/commands/expiretime/

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`number`\>

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

> **get**(`key`): `Promise`\<`undefined` \| `string`\>

Get the value of key. If the key does not exist the special value nil is returned.
An exception will be raised if the value of key is not a valid utf-8 encoding.
https://redis.io/commands/get/

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`undefined` \| `string`\>

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

<a id="getbuffer"></a>

### getBuffer()

> **getBuffer**(`key`): `Promise`\<`undefined` \| `Buffer`\>

Get the value of key and return it as a buffer.
Use getBytes instead of get if you need to tolerate values that are not valid utf-8.
If the key does not exist the special value nil is returned.
https://redis.io/commands/get/

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`undefined` \| `Buffer`\>

value of key or null when key does not exist.

#### Arg

key

#### Example

```ts
async function getExample(context: Devvit.Context) {
  await context.redis.bitfield('nonutf8', 'set', 'u8', '0', '192');
  const buf: string | undefined = await context.redis.getBuffer('nonutf8');
  console.log('Bytes: ' + JSON.stringify(buf));
}
```

---

<a id="getrange"></a>

### getRange()

> **getRange**(`key`, `start`, `end`): `Promise`\<`string`\>

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

`Promise`\<`string`\>

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

> **hdel**(`key`, `fields`): `Promise`\<`number`\>

Removes the specified fields from the hash stored at key.
https://redis.io/commands/hdel/

#### Parameters

##### key

`string`

##### fields

`string`[]

#### Returns

`Promise`\<`number`\>

number of fields that were removed from the hash

#### Deprecated

Use [RedisClient.hDel](#hdel-2) instead.

#### Arg

key

#### Arg

fields

---

<a id="hdel-2"></a>

### hDel()

> **hDel**(`key`, `fields`): `Promise`\<`number`\>

Removes the specified fields from the hash stored at key.
https://redis.io/commands/hdel/

#### Parameters

##### key

`string`

##### fields

`string`[]

#### Returns

`Promise`\<`number`\>

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

> **hget**(`key`, `field`): `Promise`\<`undefined` \| `string`\>

Returns the value associated with field in the hash stored at key.
https://redis.io/commands/hget

#### Parameters

##### key

`string`

##### field

`string`

#### Returns

`Promise`\<`undefined` \| `string`\>

value associated with field

#### Deprecated

Use [RedisClient.hGet](#hget-2) instead.

#### Arg

key

#### Arg

field

---

<a id="hget-2"></a>

### hGet()

> **hGet**(`key`, `field`): `Promise`\<`undefined` \| `string`\>

Returns the value associated with field in the hash stored at key.
https://redis.io/commands/hget

#### Parameters

##### key

`string`

##### field

`string`

#### Returns

`Promise`\<`undefined` \| `string`\>

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

> **hgetall**(`key`): `Promise`\<`Record`\<`string`, `string`\>\>

Returns all fields and values of the hash stored at key
https://redis.io/commands/hgetall

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`Record`\<`string`, `string`\>\>

a map of fields and their values stored in the hash,

#### Deprecated

Use [RedisClient.hGetAll](#hgetall-2) instead.

#### Arg

key

---

<a id="hgetall-2"></a>

### hGetAll()

> **hGetAll**(`key`): `Promise`\<`Record`\<`string`, `string`\>\>

Returns all fields and values of the hash stored at key
https://redis.io/commands/hgetall

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`Record`\<`string`, `string`\>\>

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

 const record : Record<string, string> = await context.redis.hGetAll("groceryList");

 if (record.eggs !== undefined) {
  console.log(`Eggs: ${record.eggs}`);
 }
}
```

---

<a id="hincrby"></a>

### ~~hincrby()~~

> **hincrby**(`key`, `field`, `value`): `Promise`\<`number`\>

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

`Promise`\<`number`\>

value of key after the increment

#### Deprecated

Use [RedisClient.hIncrBy](#hincrby-2) instead.

#### Arg

key

#### Arg

field

#### Arg

value

---

<a id="hincrby-2"></a>

### hIncrBy()

> **hIncrBy**(`key`, `field`, `value`): `Promise`\<`number`\>

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

`Promise`\<`number`\>

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

> **hkeys**(`key`): `Promise`\<`string`[]\>

Returns all field names in the hash stored at key.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`string`[]\>

#### Deprecated

Use [RedisClient.hKeys](#hkeys-2) instead.

#### Arg

key

---

<a id="hkeys-2"></a>

### hKeys()

> **hKeys**(`key`): `Promise`\<`string`[]\>

Returns all field names in the hash stored at key.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`string`[]\>

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

> **hlen**(`key`): `Promise`\<`number`\>

Returns the number of fields contained in the hash stored at key.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`number`\>

the number of fields in the hash, or 0 when the key does not exist.

#### Deprecated

Use [RedisClient.hLen](#hlen-2) instead.

#### Arg

key

---

<a id="hlen-2"></a>

### hLen()

> **hLen**(`key`): `Promise`\<`number`\>

Returns the number of fields contained in the hash stored at key.

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`number`\>

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

> **hMGet**(`key`, `fields`): `Promise`\<(`null` \| `string`)[]\>

Returns the values associated with fields in the hash stored at key.
https://redis.io/commands/hmget

#### Parameters

##### key

`string`

##### fields

`string`[]

#### Returns

`Promise`\<(`null` \| `string`)[]\>

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

> **hscan**(`key`, `cursor`, `pattern`?, `count`?): `Promise`\<`HScanResponse`\>

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

`Promise`\<`HScanResponse`\>

#### Deprecated

Use [RedisClient.hScan](#hscan-2) instead.

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

> **hScan**(`key`, `cursor`, `pattern`?, `count`?): `Promise`\<`HScanResponse`\>

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

`Promise`\<`HScanResponse`\>

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

> **hset**(`key`, `fieldValues`): `Promise`\<`number`\>

Sets the specified fields to their respective values in the hash stored at key.
https://redis.io/commands/hset

#### Parameters

##### key

`string`

##### fieldValues

#### Returns

`Promise`\<`number`\>

number of fields that were added

#### Deprecated

Use [RedisClient.hSet](#hset-2) instead.

#### Arg

key

#### Arg

fieldValues

---

<a id="hset-2"></a>

### hSet()

> **hSet**(`key`, `fieldValues`): `Promise`\<`number`\>

Sets the specified fields to their respective values in the hash stored at key.
https://redis.io/commands/hset

#### Parameters

##### key

`string`

##### fieldValues

#### Returns

`Promise`\<`number`\>

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

<a id="hsetnx"></a>

### hSetNX()

> **hSetNX**(`key`, `field`, `value`): `Promise`\<`number`\>

Sets field in the hash stored at key to value, only if field does not yet exist.
https://redis.io/commands/hsetnx/

#### Parameters

##### key

`string`

##### field

`string`

##### value

`string`

#### Returns

`Promise`\<`number`\>

1 if field is a new field in the hash and value was set, 0 if field already exists in the hash and no operation was performed.

#### Example

```ts
async function hSetNXExample(context: Devvit.Context) {
  const result: number = await context.redis.hSetNX('myhash', 'field1', 'value1');
  console.log('HSETNX result: ' + result);
}
```

---

<a id="incrby"></a>

### incrBy()

> **incrBy**(`key`, `value`): `Promise`\<`number`\>

Increments the number stored at key by increment.
https://redis.io/commands/incrby/

#### Parameters

##### key

`string`

##### value

`number`

#### Returns

`Promise`\<`number`\>

value of key after the increment

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

> **mget**(`keys`): `Promise`\<(`null` \| `string`)[]\>

Returns the values of all specified keys.
https://redis.io/commands/mget/

#### Parameters

##### keys

`string`[]

#### Returns

`Promise`\<(`null` \| `string`)[]\>

list of values at the specified keys

#### Deprecated

Use [RedisClient.mGet](#mget-2) instead.

#### Arg

keys

---

<a id="mget-2"></a>

### mGet()

> **mGet**(`keys`): `Promise`\<(`null` \| `string`)[]\>

Returns the values of all specified keys.
https://redis.io/commands/mget/

#### Parameters

##### keys

`string`[]

#### Returns

`Promise`\<(`null` \| `string`)[]\>

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

> **mset**(`keyValues`): `Promise`\<`void`\>

Sets the given keys to their respective values.
https://redis.io/commands/mset/

#### Parameters

##### keyValues

#### Returns

`Promise`\<`void`\>

#### Deprecated

Use [RedisClient.mSet](#mset-2) instead.

#### Arg

keyValues

---

<a id="mset-2"></a>

### mSet()

> **mSet**(`keyValues`): `Promise`\<`void`\>

Sets the given keys to their respective values.
https://redis.io/commands/mset/

#### Parameters

##### keyValues

#### Returns

`Promise`\<`void`\>

#### Arg

keyValues

#### Example

```ts
async function mSetExample(context: Devvit.Context) {
  await context.redis.mSet({ name: 'Zeek', occupation: 'Developer' });
}
```

---

<a id="rename"></a>

### rename()

> **rename**(`key`, `newKey`): `Promise`\<`string`\>

Renames key to newKey. It returns an error when key does not exist.
https://redis.io/commands/rename/

#### Parameters

##### key

`string`

##### newKey

`string`

#### Returns

`Promise`\<`string`\>

string returns "OK" if the key was renamed successfully

#### Arg

key key to be renamed

#### Arg

newKey new key name

#### Example

```ts
async function renameExample(context: Devvit.Context) {
  await context.redis.set('quantity', '5');
  await context.redis.rename('quantity', 'amount');
  const value: string = await context.redis.get('amount');
  console.log('Value: ' + value);
}
```

---

<a id="set"></a>

### set()

> **set**(`key`, `value`, `options`?): `Promise`\<`string`\>

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

`Promise`\<`string`\>

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

> **setRange**(`key`, `offset`, `value`): `Promise`\<`number`\>

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

`Promise`\<`number`\>

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

> **strlen**(`key`): `Promise`\<`number`\>

Returns the length of the string value stored at key.
An error is returned when key holds a non-string value.
https://redis.io/commands/strlen/

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`number`\>

length of the string stored at key

#### Deprecated

Use [RedisClient.strLen](#strlen-2) instead.

#### Arg

key

---

<a id="strlen-2"></a>

### strLen()

> **strLen**(`key`): `Promise`\<`number`\>

Returns the length of the string value stored at key.
An error is returned when key holds a non-string value.
https://redis.io/commands/strlen/

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`number`\>

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

> **type**(`key`): `Promise`\<`string`\>

Returns the string representation of the type of the value stored at key
https://redis.io/commands/type/

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`string`\>

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

<a id="watch"></a>

### watch()

> **watch**(...`keys`): `Promise`\<[`TxClientLike`](TxClientLike.md)\>

Marks the given keys to be watched for conditional execution of a transaction.
https://redis.io/commands/watch/

#### Parameters

##### keys

...`string`[]

#### Returns

`Promise`\<[`TxClientLike`](TxClientLike.md)\>

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

> **zAdd**(`key`, ...`members`): `Promise`\<`number`\>

Adds all the specified members with the specified scores to the sorted set stored at key.
https://redis.io/commands/zadd/

#### Parameters

##### key

`string`

##### members

...[`ZMember`](ZMember.md)[]

#### Returns

`Promise`\<`number`\>

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

> **zCard**(`key`): `Promise`\<`number`\>

Returns the cardinality (number of elements) of the sorted set stored at key.
https://redis.io/commands/zcard/

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`number`\>

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

> **zIncrBy**(`key`, `member`, `value`): `Promise`\<`number`\>

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

`Promise`\<`number`\>

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

> **zRange**(`key`, `start`, `stop`, `options`?): `Promise`\<`object`[]\>

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

`Promise`\<`object`[]\>

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

> **zRank**(`key`, `member`): `Promise`\<`undefined` \| `number`\>

Returns the rank of member in the sorted set stored at key
https://redis.io/commands/zrank/

#### Parameters

##### key

`string`

##### member

`string`

#### Returns

`Promise`\<`undefined` \| `number`\>

rank of the member if opts is undefined or opts.withScore = false,
or returns { rank, score } of the member if opts.withScore = true. The rank (or index)
is 0-based which means that the member with the lowest score has rank 0

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
  const rank: number | undefined = await context.redis.zRank('animals', 'dog');
  if (rank !== undefined) {
    console.log("Dog's rank: " + rank);
  }
}
```

---

<a id="zrem"></a>

### zRem()

> **zRem**(`key`, `members`): `Promise`\<`number`\>

Removes the specified members from the sorted set stored at key.
https://redis.io/commands/zrem/

#### Parameters

##### key

`string`

##### members

`string`[]

#### Returns

`Promise`\<`number`\>

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

> **zRemRangeByLex**(`key`, `min`, `max`): `Promise`\<`number`\>

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

`Promise`\<`number`\>

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

> **zRemRangeByRank**(`key`, `start`, `stop`): `Promise`\<`number`\>

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

`Promise`\<`number`\>

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

> **zRemRangeByScore**(`key`, `min`, `max`): `Promise`\<`number`\>

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

`Promise`\<`number`\>

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

> **zScan**(`key`, `cursor`, `pattern`?, `count`?): `Promise`\<`ZScanResponse`\>

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

`Promise`\<`ZScanResponse`\>

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

> **zScore**(`key`, `member`): `Promise`\<`undefined` \| `number`\>

Returns the score of member in the sorted set at key.
https://redis.io/commands/zscore/

#### Parameters

##### key

`string`

##### member

`string`

#### Returns

`Promise`\<`undefined` \| `number`\>

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
  const score: number = await context.redis.zScore('leaderboard', 'caesar');
  console.log("Caesar's score: " + score);
}
```
