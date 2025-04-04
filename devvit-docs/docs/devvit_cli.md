# Devvit CLI

The Devvit CLI enables you to create, upload, and manage your apps. It's the bridge between your codebase and Reddit.

:::note
We collect usage metrics when you use the Devvit CLI. For more information, see [Reddit’s Developer Terms](https://www.redditinc.com/policies/developer-terms) and the [Reddit Privacy Policy](https://www.reddit.com/policies/privacy-policy). You can opt out at any time by using the `devvit metrics off` command.
:::

## devvit create icons

Bundles all `SVG` files in the `/assets` folder into a new file (`src/icons.ts` by default). Enabling you to import local SVG assets in your app code.

#### Usage

```bash
$ devvit create icons [output-file]
```

#### Optional Argument

- `output-file`

  Path to the output file. Defaults to `src/icons.ts`.

#### Generating the SVG bundle file

```bash
$ devvit create icons

$ devvit create icons "src/my-icons.ts"
```

#### Using the SVG files in app code

```tsx
import { Devvit } from '@devvit/public-api';
import Icons from './my-icons.ts';

Devvit.addCustomPostType({
  name: 'my-custom-post',
  render: (_context) => {
    return (
      <blocks>
        <image url={Icons['my-image.svg']} imageHeight="32px" imageWidth="32px" />
      </blocks>
    );
  },
});

export default Devvit;
```

## devvit help

Display help for devvit

#### Usage

```bash
$ devvit help
```

## devvit install

Install an app from the Apps directory to a subreddit that you moderate. You can specify a version to install or default to @latest (the latest version).

#### Usage

```bash
$ devvit install <subreddit> [app-name]@[version]
```

#### Required Arguments

- `subreddit`

  Name of the installation subreddit. The "r/" prefix is optional.

#### Optional Arguments

- `app-name`

  Name of the app to install (defaults to current project).

- `version`

  Specify the desired version (defaults to latest).

#### Examples

```bash
$ devvit install r/mySubreddit

$ devvit install mySubreddit my-app

$ devvit install r/mySubreddit my-app@1.2.3

$ devvit install r/mySubreddit @1.2.3
```

## devvit list apps

To see a list of apps you've published

#### Usage

```bash
$ devvit list apps
```

## devvit list installs

To see a list of all apps currently installed on a specified subreddit.

If no subreddit is specified, you'll get a list of all apps installed by you.

#### Usage

```bash
$ devvit list installs [subreddit]
```

#### Optional argument

- `subreddit`

  Name of the subreddit to look up installations for. The "r/" prefix is optional.

#### Examples

```bash
$ devvit list installs

$ devvit list installs mySubreddit

$ devvit list installs r/mySubreddit
```

## devvit login

Login to Devvit with your Reddit account in the browser.

#### Usage

```bash
$ devvit login [--copy-paste]
```

#### Optional argument

- `--copy-paste`

  If present, user will copy-paste code from the browser instead of the localhost.

## devvit logout

Logs the current user out of Devvit.

#### Usage

```bash
$ devvit logout
```

## devvit logs

Stream logs for an installation within a specified subreddit. You can see 5,000 logs or up to 7 days of log events.

#### Usage

```bash
$ devvit logs <subreddit> [app-name] [-d <value>] [-j] [-s <value>] [--verbose]
```

#### Required arguments

- `subreddit`

  The subreddit name. The "r/" prefix is optional.

- `app-name`

  The app name (defaults to working directory app).

#### Optional arguments

- `-d <value>, --dateformat <value>`

  Specify the format for rendering dates. Defaults to `MMM d HH:mm:ss` (Jan 15 18:30:03). See more about format options [here](https://date-fns.org/v2.29.3/docs/format).

- `-j, --json`

  Output JSON for each log line

- `-s <value>, --since <value>`

  Specify how far back you want the log streaming to start. Defaults to a `0m` (now) if omitted.

  Supported format:

  - `s` seconds
  - `m` minutes
  - `h` hours
  - `d` days
  - `w` weeks

  For example `15s`, `2w1d`, or `30m`.

- `--verbose`

  Displays the log levels and timestamps when the logs were created.

#### Examples

```bash
$ devvit logs r/mySubreddit

$ devvit logs mySubreddit my-app

$ devvit logs mySubreddit my-app --since 15s

$ devvit logs mySubreddit my-app --verbose
```

## devvit new

Create a new app.

#### Usage

```bash
$ devvit new [directory-name] [-t <value>] [--here]
```

#### Optional arguments

- `directory-name`

  Directory name for your new app project. This creates a new directory for your app code. If no name is entered, you will be prompted to choose one.

- `--template <value>`

  Template name or pen URL. If no template is entered, you will be prompted to choose one.

- `--here`

  Generate the project here and not in a subdirectory.

#### Examples

```bash
$ devvit new

$ devvit new tic-tac-toe

$ devvit new tic-tac-toe --template blocks-post

$ devvit new --here
```

## devvit playtest

Installs your app to your test subreddit and starts a playtest session where a new version is installed whenever you save changes to your app code, and logs are continuously streamed. Press `ctrl+c` to end the playtest session. Once ended, the latest installed version will remain unless you revert to a previous version using [`devvit install`](#devvit-install). For more information, see the [playtest page](playtest.md).

#### Usage

```bash
$ devvit playtest <subreddit> [--verbose]
```

#### Required argument

- `subreddit`

  Name of a test subreddit with less than 200 subscribers that you moderate. The "r/" prefix is optional.

#### Optional argument

- `--verbose`

## devvit settings list

List settings for your app. These settings exist at the global app-scope and are available to all instances of your app.

#### Usage

```bash
$ devvit settings list
```

## devvit settings set

Create and update settings for your app. These settings will be added at the global app-scope.

#### Usage

```bash
$ devvit settings set <my-setting>
```

#### Example

```bash
$ devvit settings set my-feature-flag
```

## devvit uninstall

Uninstall an app from a specified subreddit.

#### Usage

```bash
$ devvit uninstall <subreddit> [app-name]
```

#### Required argument

- `subreddit`

  Name of the subreddit. The "r/" prefix is optional. Requires moderator permissions in the subreddit.

- `app-name`

  Name of the app (defaults to the working directory app).

#### Examples

```bash
$ devvit uninstall r/mySubreddit

$ devvit uninstall mySubreddit

$ devvit uninstall mySubreddit my-app
```

## devvit update app

Update @devvit project dependencies to the currently installed CLI's version

#### Usage

```bash
$ devvit update app
```

## devvit upload

Upload an app to the App directory. By default the app is private and visible only to you.

#### Usage

```bash
$ devvit upload [--bump major|minor|patch|prerelease] [--copyPaste]
```

#### Optional arguments

- `--bump <option>`

  Type of version bump (major|minor|patch|prerelease)

- `--copyPaste`

  Copy-paste the auth code instead of opening a browser

## devvit version

Get the version of the locally installed Devvit CLI.

#### Usage

```bash
$ devvit version
```

## devvit whoami

Display the currently logged in Reddit user.

#### Usage

```bash
$ devvit whoami
```
