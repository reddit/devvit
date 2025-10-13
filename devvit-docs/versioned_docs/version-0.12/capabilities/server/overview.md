# Overview

Devvit offers a wide variety of features that help you integrate your app with Reddit's APIs, scale your app free of charge using Reddit's backend, and more. The features in this section are executed on the server side. They can be imported in both [Devvit Web](../devvit-web/devvit_web_overview.mdx) and [Devvit Blocks](../blocks/overview.md) applications, as well as Mod Tools.

Below is a brief explanation of all features in this section:

## [HTTP fetch](./http-fetch.mdx)

Allows you to make HTTP requests to external servers, subject to a review of the specific domains you are requesting from.

## [Media uploads](./media-uploads.mdx)

Allows you to build apps where the end user can upload custom images to Reddit's CDN. Uploaded media is subject to the same safety checks as every other media content uploaded to Reddit, ensuring community safety.

## [Reddit API](./reddit-api.mdx)

Allows you to query information from Reddit such as comments, posts and upvotes. Limited to installation scope of the application.

## [Scalable storage (Redis)](./redis.mdx)

Allows you to store app data in a scalable database, free of charge. Limited to the installation scope of the application.

## [Scheduler](./scheduler.md)

Allows you to run automated server-side tasks on a schedule, for example, checking for updates every hour.

## [Secrets storage](./settings-and-secrets.mdx)

Allows you to build an app where the moderator can store secret keys in a safe and scalable way. For example, if your app needs the installing moderator to provide their own keys to an external API.

## [Triggers](./triggers)

Allows you to run automated server-side tasks when certain events happen on Reddit, for example: when a new post is created, or when a new comment is created.

## [User actions](./userActions.md)

Allows you to execute some actions, like posting or commenting, on behalf of the user. This means that these new posts or comments will not show up as created by the app, but by the user that is currently using the app. Access to this feature is subject to review by Admins.

## [Text fallback](./text_fallback.mdx)

Allows you to specify how your interactive post is displayed on platforms that don't support Devvit, for example old.reddit.com

## [Cache helper](./cache-helper.mdx)

Allows you to cache fetch requests on the server side, reducing the number of requests made to external APIs and improving performance.
