# Redis Data Schema

## `user-guess-counter:${postId}`

A sorted set for tracking how many guesses each user has made on a drawing.

- Member: `username` (string)
- Score: `guesses` (number)

### Queries:

## `guess-comments:${postId}`

A hashmap with guesses and an array of commentIds that have made that guess.

- Field: `guess` (string) What what guessed in lower case
- Value: Stringified array of commentIds for this guess

## `pixels:${this.scoresKeyTag}`

A sorted set for holding the point balance for players.

- Member: `username` (string)
- Score: `pixels` (number)

The tag is can be changed to have new and/or multiple concurrent point balanances. The current tag is `default`.

## `guesses:${postId}`

A sorted set for tracking how many times each unique guess has been made.

- Member: `guess` (string) What was guessed in lowercase
- Score: `guessCount` (number) How many times was this guessed?

### Queries:

- `redis.zRange(key, 0, -1)` to get counts for all words, and to calculate the total number of guesses for a post.

## `post-${postId}`

A hashmap for storing the basic post data.

- `postId` (string)
- `authorUsername` (string)
- `data` (number[])
- `date` (number)
- `word` (string)
- `dictionaryName` (string)
- `postType` (string)

### Queries:

- `redis.hGetAll` to get full post data object
- `redis.hInctBy` to increment solves/skips counters
- `redis.hAdd` to update `expired` field

## `user-drawings:${username}`

A sorted set for tracking all drawings submitted by a user.

- Member: `postId` (string)
- Score: `date` (number)

### Queries:

- `redis.zAdd` to append.
- `redis.zRange(key, 0, -1)` when viewing "my drawings". We can paginate

## `word-drawings:${word}`

A sorted set for tracking all drawings submitted by a user.

- Member: `postId` (string)
- Score: `date` (number)

### Queries:

- `redis.zAdd` to append.
- No consumption yet

## `game-settings`

A hashmap for storing game settings:

- `subredditName`
- `selectedDictionary`: Defaults to `main`

### Queries:

- `redis.hGetAll` to get all settings
- `redis.hSet` to set

## `dictionary:${dictionaryName}`

A stringified list of words.

Can have hundreds of words.

### Queries:

- `redis.get` for getting current dictionary name
- `redis.set` for setting current dictionary name

## `dictionaries`

Sorted set with all registered dictionaries and when they were last changed.

- Member: `dictionaryName`
- Score: current epoch

## `users:${username}`

A hashmap for user settings

- `autoComment` (boolean)
- `levelRank` (number)
- `levelName` (string)

## `solved:${postId}`

A sorted set tracking those that have solved the drawing

- Member: `username` (string)
- Score: `date` (number)

### Queries:

- `redis.zAdd` to add a user
- `redis.zScore` to check if current user has solved
- `redis.zCard` for number of solves

## `skipped:${postId}`

A sorted set tracking those that have skipped the drawing

- Member: `username` (string)
- Score: `date` (number)

### Queries:

- `redis.zAdd` to add a user
- `redis.zScore` to check if current user has skipped
- `redis.zCard` for number of solved

## `word-selection-events`

A sorted set for tracking events related to word selection

- Member: stringified event object
- Score: Epoch time + 3 random digits

```
{
    userId: string;
    postId: string;
    options: { word: string; dictionaryName: string }[];
    word: string | null;
}
```

## Queries:

- `redis.zAdd` to add new event
