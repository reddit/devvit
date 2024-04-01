# Publish

## Upload your app

To upload your app to the [Community App Directory](https://developers.reddit.com):

1. Navigate to the directory where your app is located.
2. Run `devvit upload`.
3. At the prompt, confirm the creation of your app.
4. Add a description of your app that is at least 15 characters. You can always change your description later.
5. Indicate if your app is Not Safe For Work (NSFW). The default is "no", so you can hit enter for this step.
6. Make sure that you’re in the appropriate directory. In our example, you should be in the yourredditusername-hello-world directory.

```text
yourredditusername-hello-world # <- you should be here before uploading
├── actors
│   └── custom-actions
│       ├── main.ts
│       ├── node_modules
│       ├── package.json
│       └── tsconfig.json
├── devvit.yaml
├── node_modules

```

7. Enter `devvit upload`.

You should see something like this:

```text

Publishing new version "1.0.0.0" to Reddit...... Success!

```

## Publish your app

Publishing your app will make it discoverable to other users with permissions to install apps on developers.reddit.com. It is not yet possible for you to publish your own app. To publish your app, please [contact us](https://reddit.com/message/compose/?to=/r/Devvit).

:::note

Publishing a new version does not automatically upgrade existing installations of your app.

:::

## Add your app to a subreddit

To add an app to your subreddit, find it on developers.reddit.com. Click on the app info card to get to the app details page, and click "Install".

![Post](./assets/install-app-button.png)

This will give you a list of subreddits that will allow you to add the app. Generally, you can only add an app to subreddits that you moderate.

Select a subreddit to install the app.

![Post](./assets/communities-install-list.png)

## Update your subreddit app version

Currently, apps on a subreddit need to be manually updated when a new version is published.

1. Go to your "app details" page in developers.reddit.com and locate the subreddit you want to update.
2. If a new version of the app is available, an "Upgrade" button will be visible. Click this to update your app.
