# Mod resources

Devvit apps are programs hosted and run on Reddit’s Developer Platform. Moderators can install an app on their subreddits to customize a community with bespoke mod tools, discussion bots, new governance tools, games, leaderboards, and more.

:::note
Some apps are for everyone in the community, while others are limited to moderators in the community. Moderation apps will often have buttons that show up in, or with, the mod shield icon.
:::

## Understanding apps

### Permissions

Apps may require certain permissions in order to work on your subreddit. These permissions are listed on the app detail pages in the [Community Apps](https://developers.reddit.com) directory.

Permissions fall in one of three categories.

| **Category**               | **Description**                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| UI                         | Permissions the app needs for the UI elements it uses.                                                              |
| User data handling         | Permissions the app needs for the way it manages user data.                                                         |
| Mod permissions (required) | Permission the app needs to create an [app account](###app-accounts) with everything permissions on your subreddit. |

You can see the permissions an app requires on the app details page, install details page, and in the CLI.

![app permissions](./assets/app_permissions.png)

### App accounts

Each app has an “app account”’ which is basically a user account for the app. The app account may take mod actions, write posts/comments, or send messages programmatically. These accounts are not human-operated or logged into.

Currently, app accounts are granted full mod permissions. In the future they will be granted more granular permissions based on the actions they need to take.

![app details](./assets/app_account_everything_permissions.png)

### Configuration settings

Some apps have settings that let you control how the app is configured to work on your subreddit. You can enable a specific setting or select options the developer provided to further customize your subreddit’s experience.

![app details](./assets/app_config_screen.png)

## How to install an app

Go to the [Apps](https://developers.reddit.com/apps) directory and select an app. This opens the app detail page. Click the red **Install** button, select the subreddit you want to add the app to, and presto! You’ve just installed an app.

![app details](./assets/app-details-5.png)

## Safety

### Data privacy

Each installation of an app has its own data storage. This means that the data used by the app cannot interact with or share data with other communities, or with other apps . If the app you are installing uses external web services, the app will come with a separate privacy agreement with the developer.

If you uninstall an app from a subreddit, your app history will be lost. Be sure you want to remove an app before clicking "uninstall," because you won't be able to retrieve the data or settings if you reinstall the app at a later date.

### App review

Admins review the source code and test functionality of every app made publicly available. Apps going through major updates or with greater security risk go through the review process for each new version.

### Reporting an app

If you believe an app is in violation of Reddit’s sitewide content policies, is creating issues, or otherwise having negative impacts to communities it’s installed in, please contact our team via r/modsupport.
