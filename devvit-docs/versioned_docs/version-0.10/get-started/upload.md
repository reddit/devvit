# Upload your app

After you’ve created your app, you’re ready to upload it to the [Developer Portal](https://developers.reddit.com).

This is a preview version of your app, and only you will be able to see it in the Developer Portal. Don’t worry, this is a private version that only you can see. You’ll need to [publish](./publish.md) your app to make it publicly available.

Navigate to project directory and run the command:

```bash
$ devvit upload
```

- At the prompt, give your app a name.

  App names must be unique and between 3-16 characters in length, all lowercase, can't start with numerals, and include only a-z, 0-9 or '-'.

- Indicate if your app is Not Safe For Work (NSFW). The default is "no", so you can hit enter for this step.

You should see something like this:

```bash
> Uploading new version "1.0.0" to Reddit...... Success!
```

When you upload a new app, an [app account](./app-accounts.md) is automatically created just for your app.

## Editing your app details

To edit your app name and description, select “Edit app details” from your app page.

Note that when you upload an updated app, subreddits using your app will remain on the prior version until the moderator chooses to upgrade to the updated version. If your app is listed publicly, the new version will be available after it has been reviewed.

## Errors

If your build fails, the affected version of your app will not be able to be installed until it is fixed. As the app developer, you will see a notification in the App details section telling you which version failed.

![app failed build error](../assets/app_failed_build_error.png)

You can install a previous version using the CLI:

```bash
$ devvit install <subreddit> <app-name@version>
```

Moderators will always see the most recent successfully built version of the app. The installation process should not be affected.
