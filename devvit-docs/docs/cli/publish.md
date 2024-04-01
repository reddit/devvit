# `devvit publish`

Publish any previously uploaded version of an app. In this state, only the app owner can find or install the app to a subreddit which they moderate.

- [`devvit publish [APPWITHVERSION]`](#devvit-publish-appwithversion)

## `devvit publish [APPWITHVERSION]`

Publish any previously uploaded version of an app. In this state, only the app owner can find or install the app to a subreddit which they moderate.

```
USAGE
  $ devvit publish [APPWITHVERSION]

ARGUMENTS
  APPWITHVERSION  App to install (defaults to working directory app) and version (defaults to latest)

DESCRIPTION
  Publish any previously uploaded version of an app. In this state, only the app owner can find or install the app to a
  subreddit which they moderate.

EXAMPLES
  $ devvit publish

  $ devvit publish [app-name][@version]

  $ devvit publish my-app

  $ devvit publish my-app@1.2.3
```
