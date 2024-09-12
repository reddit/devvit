# Publishing an app

Once you [upload](./dev_guide.mdx#7upload) your app, a private version of it is added to the [Apps](https://developers.reddit.com/apps) directory. Only you will be able to see your app in the directory, and it’s available for you to use in small subreddits with fewer than 200 subscribers for testing purposes.

To use your app in larger subreddits, you’ll need to publish your app. To do this from the CLI, run:

```
devvit publish
```

Your app is automatically submitted to the Devvit team for review and approval. From the CLI, you’ll be prompted to select how you want your app to appear in the Apps directory:

- **Unlisted** means that the app is only visible to you in the directory, and you can install your app on larger subreddits that you moderate.
- **Public** means that your app is visible to all users in the Apps directory and can be installed by mods and admins across Reddit.

Don’t worry, you can change your app visibility at any time.

## App review

The Developer Platform team will review your code, read through your app README.md file, and potentially test your app. The review process typically takes one week, and you’ll be notified of your app status, which could be:

- Approved
- Approved with non-blocking feedback
- Rejected with feedback on how to get your app approved
- Rejected on the basis of a policy, guideline, or conflict with the intended behavior of our products

:::note
We recommend thoroughly playtesting your app, familiarizing yourself with Devvit guidelines, and providing a detailed app overview in your README.md to expedite the app review cycle.
:::

## Changing app visibility

After your app has been approved, you may want to change the visibility status.

### Public to unlisted

To hide your app from the public after it’s been listed, run:

```tsx
devvit upload
devvit publish --unlisted
```

:::note
This will not remove the code from the directory, and it will not remove the app from subreddits that have installed previous versions. Once an app is published and installed, that version will continue to exist until a moderator explicitly removes it.
:::

### Unlisted to public

To make your unlisted app public after it's been approved, run:

```tsx
devvit upload
devvit publish --public
```

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
