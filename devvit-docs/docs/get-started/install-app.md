# Install your app

You can install an app into a subreddit you moderate ('everything' permissions) using either [`devvit install`](../devvit_cli.md) or through the [Developer Portal](https://developers.reddit.com).

## Install with CLI

Once you’ve uploaded your app, you can install it on a small subreddit that you moderate (less than 200 subscribers) by running the following command from the project folder.

```bash
 $ devvit install <subreddit-name>
```

## Install with Portal

To add an app to your subreddit, find it in the [Developer Portal](https://developers.reddit.com). Click on the app info card to get to the _App Details Page_, and click "Install".

![app details page on the developer portal](../assets/app-details.png)

This will give you a list of subreddits that will allow you to add the app. Generally, you can only add an app to subreddits that you moderate.

Select a subreddit to install the app.

![subreddit selector modal](../assets/app-details-install-modal.png)

:::note
If the **Install** button is not active, you are not the moderator of an eligible subreddit. Try creating a new test subreddit with fewer than 200 members.
:::
