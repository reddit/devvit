# Devvit CLI

## devvit install

Install an app or experience from the Apps directory to a subreddit that you moderate. You can specify a version to install or default to the latest version.

**Usage**

```tsx
$ devvit install SUBREDDIT [APPWITHVERSION]
```

**Arguments**

```tsx
SUBREDDIT        Name of the installation subreddit. The "r/" prefix is optional.
APPWITHVERSION   Name of the app and version (defaults to latest).
```

**Examples**

```tsx
$ devvit install <subreddit> [app-name][@version]

$ devvit install r/MyTestSubreddit

$ devvit install MyOtherTestSubreddit my-app

$ devvit install r/SomeOtherSubreddit my-app@1.2.3

$ devvit install r/AnotherSubreddit @1.2.3
```

## devvit list

To see a list of apps you've published:

**Usage**

```tsx
$ devvit list apps
```

To see a list of all apps currently installed on a specified subreddit (if no subreddit is specified, you'll get a list of all apps installed by you):

**Usage**

```tsx
$ devvit list installs [SUBREDDIT]
```

**Arguments**

```tsx
SUBREDDIT     Name of the installation subreddit. The "r/" prefix is optional.
```

## devvit login

Login to Devvit via reddit.com.

**Usage**

```tsx
$ devvit login [--copy-paste]
```

**Flags**

```tsx
--copy-paste   If present, user will copy-paste code from the browser instead of the localhost.
```

## devvit logout

Log out of Devvit via reddit.com.

**Usage**

```tsx
$ devvit logout
```

## devvit logs

Stream logs for an installation within a specified subreddit.

**Usage**

```tsx
$ devvit logs SUBREDDIT [APP] [-d <value>] [-j] [-s <value>] [--verbose]
```

**Arguments**

```tsx
SUBREDDIT  The subreddit name. The "r/" prefix is optional.
APP        The app name (defaults to working directory app).
```

**Flags**

```tsx
-d, --dateformat=<value>
    [default: MMM d HH:mm:ss] Format for rendering dates. See https://date-fns.org/v2.29.3/docs/format for format options.

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

```

**Examples**

```tsx
$ devvit logs <subreddit> [app]

$ devvit logs r/myTestSubreddit

$ devvit logs myOtherTestSubreddit my-app
```

## devvit new

Create a new app.

**Usage**

```tsx
$ devvit new [APPNAME] [--here] [-t <value>]
```

**Arguments**

```tsx
APPNAME   Name of the app. This creates a new directory for your app code. If no name is entered, you will be prompted to choose one.
```

**Flags**

```tsx
-t, --template=<value>  Template name or pen URL.
--here                  Flag to generate the project here and not in a subdirectory.
```

## devvit playtest

Install your app to a test subreddit and start a playtest session.

**Usage**

```tsx
$ devvit playtest SUBREDDIT [--verbose]
```

**Arguments**

```tsx
SUBREDDIT  Name of a test subreddit with <50 subscribers that you moderate. The "r/" prefix is optional.
```

**Flags**

```tsx
--verbose;
```

## devvit uninstall

Uninstall an app from a specified subreddit.

**Usage**

```tsx
$ devvit uninstall SUBREDDIT [APP]
```

**Arguments**

```tsx
SUBREDDIT      Name of the subreddit. The "r/" prefix is optional.
APP            Name of the app (defaults to the working directory).
```

**Examples**

```tsx
$ devvit uninstall <subreddit> [app]

$ devvit uninstall r/myTestSubreddit

$ devvit uninstall myOtherTestSubreddit my-app
```

## devvit upload

Upload an app to the App directory (app is private and visible only to you).

**Usage**

```tsx
$ devvit upload [--bump major|minor|patch|prerelease] [--copyPaste]
```

**Flags**

```tsx
--bump=<option>  Type of version bump (major|minor|patch|prerelease)
                  <options: major|minor|patch|prerelease>
--copyPaste      Copy-paste the auth code instead of opening a browser
```

## devvit version

Get the version of the locally installed Devvit CLI.

**Usage**

```tsx
$ devvit version
```

## devvit whoami

Display the currently logged in reddit.com user.

**Usage**

```tsx
$ devvit whoami
```
