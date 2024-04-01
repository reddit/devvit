# `devvit playtest`

Installs your app to your test subreddit and starts a playtest session where a new version is installed whenever you save changes to your app code, and logs are continuously streamed

- [`devvit playtest SUBREDDIT`](#devvit-playtest-subreddit)

## `devvit playtest SUBREDDIT`

Installs your app to your test subreddit and starts a playtest session where a new version is installed whenever you save changes to your app code, and logs are continuously streamed

```
USAGE
  $ devvit playtest SUBREDDIT [--verbose]

ARGUMENTS
  SUBREDDIT  Provide the name of a small test subreddit with <50 members. The "r/" prefix is optional

FLAGS
  --verbose

DESCRIPTION
  Installs your app to your test subreddit and starts a playtest session where a new version is installed whenever you
  save changes to your app code, and logs are continuously streamed

EXAMPLES
  $ devvit playtest <subreddit>

  $ devvit playtest r/myTestSubreddit

  $ devvit playtest myOtherTestSubreddit
```
