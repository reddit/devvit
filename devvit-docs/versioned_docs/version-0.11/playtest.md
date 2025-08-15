# Playtest

You can use playtest to see how your app works on Reddit.

Code changes you save during the playtest will automatically update your app on the playtest subreddit. This lets you see your app updates in real time and creates logs using real data.

## Start a playtest

1. Run `devvit upload` to add your app to the Apps directory. This automatically creates a playtest subreddit for you.
2. Run `devvit playtest` to start your app on your default subreddit.
3. The CLI will return the playtest subreddit link for your app.

## Playtest on an alternate subreddit

If you want to use an alternate subreddit (must have fewer than 200 subscribers) for your playtest, you can do this a couple of different ways:

- Run `devvit playtest [subreddit_name]`, or
- Set a default subreddit in one of these fields:
  - DEVVIT_SUBREDDIT environment variable
  - dev.subreddit field in devvit.json

If you set a default subreddit in your app, the `devvit playtest` command will use the default instead of the auto-generated subreddit.

## How do I find my playtest subreddit name?

Run `devvit playtest`. The CLI will output a link to your playtest subreddit

## About playtest subreddits

All playtest subreddits must have fewer than 200 subscribers.

The auto-generated playtest subreddit is created for you by u/devvit-dev-bot. This subreddit:

- Is private
- Makes you a moderator
- Has your app pre-installed
- Allows reddit admins to join your subreddit

:::note
If you need help, run `devvit playtest —-help` for additional information.
:::

## View logs

Playtest continuously streams logs for your app installation. This will show in the output of your terminal where the playtest is running. Check out [logs](./debug.md) to learn more.

## Connect to client-side logs

To enable client-side logs, add the`?playtest=<app_name>` query parameter to your subreddit URL (e.g. http://reddit.com/r/devvit?playtest=pixelary-game). This allows client side logs to stream into Devvit playtest logs and live reloads your browser when there are changes.

:::note
This url is also shown in your terminal when you start a playtest.
:::

## End a playtest

Press Ctrl + C to exit the playtest.

Exiting the playtest does not uninstall the playtest version or revert your app back to a previous version. The playtest version you just tested will remain installed on the test subreddit.

## Revert your app

If you want to revert back to the latest non-playtest version of the app, run the following command from within your project directory:

```bash
$ devvit install <subreddit>
```

If you want to revert to a different version of your pre-playtest app, you can specify which version using the `install` command. Entering app name is optional if you are running this command from within your project directory.

```bash
$ devvit install <subreddit> [@version]
```

## Upload your app

If you’re satisfied with your playtest app and want to upload an installable version, run:

```bash
$ devvit upload
```

This will automatically bump your app version to the next patch release. For example, if your playtest version is 0.0.1.6, the upload command will remove the playtest version increment and change your app version to 0.0.2.

Once you [publish your app](./publishing) to the Apps Directory, it will be available for users to install.
