# `devvit update`

Update @devvit project dependencies to the currently installed CLI's version

- [`devvit update APPSLUGWITHVERSION SUBREDDIT`](#devvit-update-appslugwithversion-subreddit)
- [`devvit update app`](#devvit-update-app)
- [`devvit update install APPSLUGWITHVERSION SUBREDDIT`](#devvit-update-install-appslugwithversion-subreddit)

## `devvit update APPSLUGWITHVERSION SUBREDDIT`

Upgrade an installation to a later version of the same app

```
USAGE
  $ devvit update APPSLUGWITHVERSION SUBREDDIT

ARGUMENTS
  APPSLUGWITHVERSION  The slug of the app you want to install, and what version of that app to install (default @latest)
  SUBREDDIT           Install to the given subreddit. The "r/" prefix is optional

DESCRIPTION
  Upgrade an installation to a later version of the same app

ALIASES
  $ devvit update
```

## `devvit update app`

Update @devvit project dependencies to the currently installed CLI's version

```
USAGE
  $ devvit update app [-f]

FLAGS
  -f, --force  Force update @devvit package versions without safety prompt

DESCRIPTION
  Update @devvit project dependencies to the currently installed CLI's version

EXAMPLES
  $ devvit update app
```

## `devvit update install APPSLUGWITHVERSION SUBREDDIT`

Upgrade an installation to a later version of the same app

```
USAGE
  $ devvit update install APPSLUGWITHVERSION SUBREDDIT

ARGUMENTS
  APPSLUGWITHVERSION  The slug of the app you want to install, and what version of that app to install (default @latest)
  SUBREDDIT           Install to the given subreddit. The "r/" prefix is optional

DESCRIPTION
  Upgrade an installation to a later version of the same app

ALIASES
  $ devvit update
```
