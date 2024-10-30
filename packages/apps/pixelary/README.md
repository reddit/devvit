# Pixelary

A competitive async MMO pixel drawing and guessing game built on the Reddit Developer Platform.

This app demonstrates how to:

- Use Reddit Blocks to create an interactive post (i.e. a canvas with a clickable color pallate that can be used to draw).

- Use Redis to create a leaderboard.

- Use Devvit forms to capture user input (in this case, guesses as to what the picture is).

- Use useInterval to crete a countdown timer.

- Use assets like GIFs within an interactive post.

## Prerequisites

Pixelary relies on post flairs. Please enable post flair in mod tools before you install the game.

## Redis Data Schema

### `user-guess-counter:${postId}`

A sorted set for tracking how many guesses each user has made on a drawing.

- Member: `username` (string)
- Score: `guesses` (number)

#### Queries:

### `guess-comments:${postId}`

A hashmap with guesses and an array of commentIds that have made that guess.

- Field: `guess` (string) What what guessed in lower case
- Value: Stringified array of commentIds for this guess

### `pixels:${this.scoresKeyTag}`

A sorted set for holding the point balance for players.

- Member: `username` (string)
- Score: `pixels` (number)

The tag is can be changed to have new and/or multiple concurrent point balanances. The current tag is `default`.

### `guesses:${postId}`

A sorted set for tracking how many times each unique guess has been made.

- Member: `guess` (string) What was guessed in lowercase
- Score: `guessCount` (number) How many times was this guessed?

#### Queries:

- `redis.zRange(key, 0, -1)` to get counts for all words, and to calculate the total number of guesses for a post.

### `post-${postId}`

A hashmap for storing the basic post data.

- `postId` (string)
- `authorUsername` (string)
- `data` (number[])
- `date` (number)
- `word` (string)
- `dictionaryName` (string)
- `expired` (boolean)
- `postType` (string)

#### Queries:

- `redis.hGetAll` to get full post data object
- `redis.hInctBy` to increment solves/skips counters
- `redis.hAdd` to update `expired` field

### `user-drawings:${username}`

A sorted set for tracking all drawings submitted by a user.

- Member: `postId` (string)
- Score: `date` (number)

#### Queries:

- `redis.zAdd` to append.
- `redis.zRange(key, 0, -1)` when viewing "my drawings". We can paginate

### `word-drawings:${word}`

A sorted set for tracking all drawings submitted by a user.

- Member: `postId` (string)
- Score: `date` (number)

#### Queries:

- `redis.zAdd` to append.
- No consumption yet

### `game-settings`

A hashmap for storing game settings:

- `activeFlairId`
- `endedFlairId`
- `selectedDictionary`: Defaults to `main`

#### Queries:

- `redis.hGetAll` to get all settings
- `redis.hSet` to set

### `dictionary:${dictionaryName}`

A stringified list of words.

Can have hundreds of words.

#### Queries:

- `redis.get` for getting current dictionary name
- `redis.set` for setting current dictionary name

### `users:${username}`

A hashmap for user settings

- `autoComment` (boolean)
- `levelRank` (number)
- `levelName` (string)

### `solved:${postId}`

A sorted set tracking those that have solved the drawing

- Member: `username` (string)
- Score: `date` (number)

#### Queries:

- `redis.zAdd` to add a user
- `redis.zScore` to check if current user has solved
- `redis.zCard` for number of solves

### `skipped:${postId}`

A sorted set tracking those that have skipped the drawing

- Member: `username` (string)
- Score: `date` (number)

#### Queries:

- `redis.zAdd` to add a user
- `redis.zScore` to check if current user has skipped
- `redis.zCard` for number of solved

## Links

- [r/Pixelary community](https://www.reddit.com/r/Pixelary/)
- [App details page](https://developers.reddit.com/apps/pixelary-game/)
- [Source code](https://github.com/reddit/devvit/tree/main/packages/apps/pixelary)
