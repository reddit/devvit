# User Actions

## Overview

By default, apps make posts or comments with their associated [app account](../about_devvit#app-accounts). With `userActions` enabled, your app can create posts and comments on behalf of the user and submit user-generated content (UGC). This includes:

- Creating posts or comments from the [post UI](../interactive_posts.md)
- Creating posts or comments via a [form](forms.md)
- Creating posts or comments via a [menu action](./menu-actions.md)

## Guidelines

Users should never be surprised by an app creating content on their behalf. Apps using this feature need to:

- **Be transparent.** Inform users and show them the content that will be posted on their behalf.
- **Provide user control.** Users must opt in to allow the app to post on their behalf. If opt-in is persistent, you must make it clear on how the user can opt out.

## How it works

If you’re using an unapproved app version (including for a playtest):

- `runAs: 'USER'` will operate from the app account unless the app owner takes the action
- User actions taken by the app owner will be attributed to the app owner's username.

After you [publish](../publishing.md) your app and it’s approved in app review:

- `runAs: 'USER'` will operate on behalf of the user for all users

:::note
Make sure your app follows the guidelines above in order to be approved.
:::

### Usage

To enable the `userActions` plugin in your app, set it to `true` in `Devvit.configure()`:

```tsx
Devvit.configure({
  redditAPI: true,
  userActions: true,
});
```

After enabling `userActions`, you can call certain Reddit APIs on behalf of the user by passing in the option `runAs: 'USER'`.

Currently, the only APIs that support this option are:

- [submitPost()](../api/redditapi/RedditAPIClient/classes/RedditAPIClient.md#submitpost)
- [submitComment()](../api/redditapi/RedditAPIClient/classes/RedditAPIClient.md#submitcomment)

If the `runAs` option is not specified, then the API will use `runAs: 'APP'` by default.

:::note
Both `redditAPI` and `userActions` must be enabled to call Reddit APIs with `runAs: 'USER'`.
:::

### Parameters

| **Parameters**         | **Description**                                                                                                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `runAs`                | The type of account to perform the action on behalf of, either `'USER'` or `'APP'`. Defaults to `'APP'`.                                                                                                               |
| `userGeneratedContent` | Represents text or images submitted by the user that may be displayed in the post. When calling `submitPost()` to create an interactive post with `runAs: 'USER'`, you must specify the option `userGeneratedContent`. |

Note: Apps that `submitPost()` with `runAs: 'USER'` require `userGeneratedContent` in order to be approved. This helps Reddit with safety and compliance of user generated content.

## Example

This example app uses a form to prompt the user for their favorite color and then submits a post displaying the user's text input.

```tsx
import { Devvit, useForm, useState } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  redis: true,
  userActions: true,
});

const loadingPreview = (
  <vstack height="100%" width="100%" alignment="middle center">
    <text size="large">Loading ...</text>
  </vstack>
);

Devvit.addMenuItem({
  label: 'Create favorite color post',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const post = await context.reddit.submitPost({
      title: `What's your favorite color?`,
      subredditName: await context.reddit.getCurrentSubredditName(),
      preview: loadingPreview,
      runAs: 'APP',
    });
    context.ui.showToast('Navigating to post...');
    context.ui.navigateTo(post);
  },
});

Devvit.addCustomPostType({
  name: 'Favorite color post',
  render: (context) => {
    const [favColor, _] = useState(async () => {
      const currentPostId = context.postId ? context.postId : '';
      let favColor = 'unknown';
      if (currentPostId != '') {
        const maybeFavColor = await context.redis.get(currentPostId);
        favColor = maybeFavColor ? maybeFavColor : 'unknown';
      }
      return favColor;
    });

    const favColorForm = useForm(
      {
        fields: [{ type: 'string', name: 'favColor', label: 'Favorite color' }],
      },
      async (values) => {
        // On FormSubmit, create a Post that displays the User's favorite color text input
        const submittedFavColor = values.favColor ? values.favColor : 'unknown';
        const currentUsername = await context.reddit.getCurrentUsername();
        const currentSubreddit = await context.reddit.getCurrentSubredditName();

        const post = await context.reddit.submitPost({
          title: `u/${currentUsername}'s favorite color is...`,
          subredditName: currentSubreddit,
          preview: loadingPreview,
          runAs: 'USER',
          userGeneratedContent: { text: submittedFavColor },
        });

        context.redis.set(post.id, submittedFavColor);
        context.ui.showToast(`Creating post for your favorite color...`);
        context.ui.navigateTo(post);
      }
    );

    if (favColor === 'unknown') {
      return (
        <vstack gap="medium" height="100%" alignment="middle center">
          <button
            onPress={async () => {
              context.ui.showForm(favColorForm);
            }}
          >
            What's your favorite color?
          </button>
        </vstack>
      );
    }
    return (
      <vstack gap="medium" height="100%" alignment="middle center">
        <text weight="bold" size="large">
          {favColor}
        </text>
      </vstack>
    );
  },
});

export default Devvit;
```
