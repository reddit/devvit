# `devvit logs`

Streams logs for an installation

- [`devvit logs SUBREDDIT`](#devvit-logs-appname-subreddit)

## `devvit logs SUBREDDIT`

Streams logs for an installation

```
USAGE
  $ devvit logs SUBREDDIT [APPNAME] [-d <value>] [-j] [-s <value>]

ARGUMENTS
  APPNAME    app name
  SUBREDDIT  subreddit name

FLAGS
  -d, --dateformat=<value>
      [default: MMM d HH:mm:ss] Format for rendering dates. See https://date-fns.org/v2.29.3/docs/format for format
      options

  -j, --json
      output JSON for each log line

  -s, --since=<value>
      [default: 0m] when to start the logs from. example "15s", "2w1d" "30m"
      Supported format:
      w: weeks
      d: days
      h: hours
      m: minutes
      s: seconds

DESCRIPTION
  Streams logs for an installation
```
