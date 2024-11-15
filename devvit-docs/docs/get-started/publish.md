# Publish your app

Publish your app and install it in a subreddit.

Once you’ve [uploaded](./upload.md) your app to the [Developer Portal](https://developers.reddit.com), you can publish your app to make it available to other users. When you publish an updated app, subreddits using your app will remain on the prior version until the moderator chooses to upgrade to the updated version. If your app is listed publicly, the new version will be available after it has been reviewed.

To publish your app navigate to the project directory and run:

```bash
$ devvit publish
```

Apps that use [interactive posts](/docs/interactive_post.md), or are NSFW must go through the review process before they can be published. Apps that use the [`http fetch`](/docs/capabilities/http-fetch.md) capability must provide _terms & conditions_ and a _privacy policy_ before they can be published. Links to these documents can be added on the App Details Page in the Developer Portal.

After you’ve published your app, here’s what happens. You can now install your app to any sub you moderate. Your app is published on the Developer Portal, but it is only visible to you.

:::note
The `devvit publish` command automatically requests a review from the Developer Platform team, and any app that violates our code of conduct will be disabled by our admin team.
:::

## Make app public

If you want your app to be publicly listed in the Developer Portal, you’ll need to submit an [app review form](https://docs.google.com/forms/d/e/1FAIpQLSdEyE5vrqOBlojue_mkrV25RiiHv_sxe-xqtcdzCMBTWmoROA/viewform). Once approved, your app will be publicly listed for everyone to see, and it can be installed by any mod in any subreddit.
