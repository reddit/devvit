# Manage

You can manage your apps and installations from your app page in “My Apps”.

## Update your app

To edit the app name and description, select “Edit app details” from your app page.

Use `devvit upload` to [release](release.md) a new version of your app.

When you publish an updated app, subreddits using your app will remain on the prior version until the moderator chooses to upgrade to the updated version If your app is listed publicly, the new version will be available after it has been reviewed.

## Upgrade your subreddit to a newer version of an app

Currently, apps on a subreddit need to be manually updated when a new version is published. Go to your "app details" page in developers.reddit.com and locate the subreddit you want to update. Select “Install” and then “Upgrade” to get the latest version of the app.

## Remove an app from your subreddit

**Uninstall from the portal**

- Find your app on [developers.reddit.com](https://developers.reddit.com/).
- Click on the app info card to get to the app details page (e.g. `developers.reddit.com/apps/your-app-name`)
- Under the **Communities** section, you will see a list of all subreddits your app is installed on
- If you have permissions to uninstall the app, you can click the trash can icon to the right of a community name to uninstall the app from that community.

![Uninstall](assets/manage_uninstall.png)

**Uninstall using the CLI**  
To find a list of installations, run `$ devvit list installs`.

```
$ devvit list installs
loading...... done

 App Name          Installed Subreddits
 ───────────────── ────────────────────
 test-app-one    r/testsub1 (v0.0.1)

 test-app-two    r/testsub2 (v0.0.3)

$ devvit uninstall test-app-one --subreddit r/testsub1
```

To uninstall an app, run `$ devvit uninstall [app-name] --subreddit [subreddit-name]`.

## Remove your app from the directory after it is published

If your app is published, you can remove it from the Developer Portal. This will not remove the code from the directory, and it will not remove the app from subreddits that have installed previous versions. Once an app is published and installed, that version will continue to exist until a moderator explicitly removes it.

**Hide from the directory UI**  
Go to the [Developer Portal](https://developers.reddit.com) and find your app. From the "App Details" page, scroll to the "Developer Settings" and toggle the "Available" option off. Note that you will not see this option for apps that have only been uploaded, but not published
