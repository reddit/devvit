# Publishing an app

Once you [upload](./dev_guide.mdx#7upload) your app, a private version of it is added to the [Apps](https://developers.reddit.com/apps) directory. Only you will be able to see your app in the directory, and it’s available for you to use in small subreddits with fewer than 200 subscribers for testing purposes.

To use your app in larger subreddits, you’ll need to publish your app. To do this from the CLI, run:

```
devvit publish
```

This will let you install your app on any subreddit you moderate. However, other users will not be able to see your app in the Apps directory or install it in their own communities.

:::note
Experience posts or apps that use HTTP fetch cannot use devvit publish.
:::

## Listing your app

To make your app visible in the App directory and publicly available for mods and admins to download, you’ll need an [app review](https://docs.google.com/forms/d/e/1FAIpQLSdEyE5vrqOBlojue_mkrV25RiiHv_sxe-xqtcdzCMBTWmoROA/viewform).

If you published your app from the CLI, it will be automatically reviewed by the Developer Platform team. If you didn’t publish your app via the CLI, you can submit an [app review form](https://docs.google.com/forms/d/e/1FAIpQLSdEyE5vrqOBlojue_mkrV25RiiHv_sxe-xqtcdzCMBTWmoROA/viewform).

:::note
We recommend thoroughly playtesting your app, familiarizing yourself with Devvit guidelines, and providing a detailed app overview in your README.md to expedite the app review cycle.
:::

## App review

The Developer Platform team will review your code, read through your app README.md file, and potentially test your app. The review process typically takes one week, and you’ll be notified of your app status, which could be:

- Approved
- Approved with non-blocking feedback
- Rejected with feedback on how to get your app approved
- Rejected on the basis of a policy, guideline, or conflict with the intended behavior of our products

Our guidelines are evolving, which can impact the status of previously reviewed apps.

## Unlisiting your app

If you want to hide your app from the public after it's been listed, follow these steps.

1. Go to [Apps directory](https://developers.reddit.com/apps) and find your app.
2. From the "App Details" page, scroll to the "Developer Settings".
3. Toggle the "Available" option off.

:::note
This will not remove the code from the directory, and it will not remove the app from subreddits that have installed previous versions. Once an app is published and installed, that version will continue to exist until a moderator explicitly removes it.
:::

## Promotion

If you need help finding the right place on Reddit for your app, reach out to our team. In some cases we may be able to:

1. Provide guidance on the right home(s) for your app
2. Help you coordinate with subreddit moderators
3. Connect you with users that would be interested in your app
4. Run playtests for your app, provide feedback, and improve your app
5. Provide other materials, like visual assets, to help you market your app
6. Give guidance on how to grow a subreddit

We cannot help facilitate the success of all apps, but we will provide guidance whenever possible. Reach out to one of our support channels to chat with our team.

:::note
Make sure you don’t break subreddit rules or sitewide content policies when promoting your app on Reddit.
:::
