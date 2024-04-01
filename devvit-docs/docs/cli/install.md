# `devvit install`

Install an app from the Developer Portal to a subreddit that you moderate. Specify the version you want to install, or default to @latest

- [`devvit install SUBREDDIT [APPWITHVERSION]`](#devvit-install-subreddit-appwithversion)

## `devvit install SUBREDDIT [APPWITHVERSION]`

Install an app from the Developer Portal to a subreddit that you moderate. Specify the version you want to install, or default to @latest

```
USAGE
  $ devvit install SUBREDDIT [APPWITHVERSION]

ARGUMENTS
  SUBREDDIT       Provide the name of the subreddit where you want to install. The "r/" prefix is optional
  APPWITHVERSION  Provide the name of the app you want to install (defaults to working directory app) and version
                  (defaults to latest)

DESCRIPTION
  Install an app from the Developer Portal to a subreddit that you moderate. Specify the version you want to install, or
  default to @latest

EXAMPLES
  $ devvit install <subreddit> [app-name][@version]

  $ devvit install r/MyTestSubreddit

  $ devvit install MyOtherTestSubreddit my-app

  $ devvit install r/SomeOtherSubreddit my-app@1.2.3

  $ devvit install r/AnotherSubreddit @1.2.3
```
