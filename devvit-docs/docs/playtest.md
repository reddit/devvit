# Playtest

Playtest lets you test your app while it's still in development. Playtest installs your app to a test subreddit and uploads a new version whenever you save changes to your app code. You can see your app changes and logs in real time using real data.

One caveat: your test subreddit cannot have more than 50 subscribers. Once installed, your playtest app will be visible to other users on the subreddit.

## Start a playtest

1. Run `devvit upload` to upload your app to the Apps directory.
2. Open a terminal and enter this command from the root of your project.

```bash
$ devvit playtest <test subreddit name>
```

Once you start a playtest session, a new pre-release version of your app is automatically created and installed on your test subreddit. The pre-release version has a fourth decimal place, so if your current app is 0.0.1, the first pre-release version will be 0.0.1.1.

The pre-release version is updated and uploaded to your test subreddit every time you save your app code. You'll be prompted to visit your subreddit URL like `https://www.reddit.com/r/<test subreddit name>/?playtest=<app name>`. If you have an interactive post and your URL includes a `playtest=<app name>` or `playtest` query parameter, it will automatically refresh when the new version has been installed. If not, you’ll need to refresh your subreddit to see the updated app. This may take a couple of seconds, so be patient.

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

Once you [publish your app](./dev_guide.mdx/#9publish) to the Apps Directory, it will be available for users to install.
