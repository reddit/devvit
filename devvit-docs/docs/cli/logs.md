# `devvit logs`

Streams logs for an installation within a specified subreddit

- [`devvit logs SUBREDDIT [APP]`](#devvit-logs-subreddit-app)

## `devvit logs SUBREDDIT [APP]`

Streams logs for an installation within a specified subreddit

```
USAGE
  $ devvit logs SUBREDDIT [APP] [-d <value>] [-j] [-s <value>] [--verbose]

ARGUMENTS
  SUBREDDIT  Provide the subreddit name. The "r/" prefix is optional
  APP        Provide the app name (defaults to working directory app)

FLAGS
  -d, --dateformat=<value>
      [default: MMM d HH:mm:ss] Format for rendering dates. See https://date-fns.org/v2.29.3/docs/format for format
      options

  -j, --json
      output JSON for each log line

  -s, --since=<value>
      [default: 0m] when to start the logs from. example "15s", "2w1d" "30m"
      Supported format:
      s: seconds
      m: minutes
      h: hours
      d: days
      w: weeks

  --verbose

DESCRIPTION
  Streams logs for an installation within a specified subreddit

EXAMPLES
  $ devvit logs <subreddit> [app]

  $ devvit logs r/myTestSubreddit

  $ devvit logs myOtherTestSubreddit my-app
```
