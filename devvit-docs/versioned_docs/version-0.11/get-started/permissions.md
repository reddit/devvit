# App permissions

App permissions help users understand how your app will interact with a subreddit and users.

If your app accesses user data or interacts with the UI, that information is listed in the [Developer Portal](https://developers.reddit.com) and in the CLI on installation. Permissions fall into one of three categories.

| **Category**                         | **Description**                                                                                              | **Capabilities involved**                                                                                                                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UI**                               | Permissions your app needs for the UI elements it uses.                                                      | Menu actions, custom posts, or asset use all require UI permissions.                                                                                                                  |
| **User data handling**               | Permissions your app needs for the way it manages user data.                                                 | The specific permissions your app requires will depend on the capabilities you’ve used: app settings, key value store, HTTP fetch, media, Redis, Reddit API, scheduler, and triggers. |
| **Moderator permissions** (required) | Permission your app needs to create a mod account with _everything_ permissions on the installing subreddit. | This permission is required for every app.                                                                                                                                            |

Here’s an example of the permissions displayed on the app detail page in the Developer Portal.

![app permissions](../assets/capabilities/app_permissions.png)
