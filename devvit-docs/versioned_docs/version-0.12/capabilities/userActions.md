# User Actions

## Overview

Typically, your app makes posts or comments with its associated [app account](../about_devvit#app-accounts). With `userActions` enabled, your app can create posts and comments on behalf of the user and submit user-generated content (UGC). This includes:

- Creating posts or comments from the [post UI](../interactive_posts.md)
- Creating posts or comments via a [form](forms.md)
- Creating posts or comments via a [menu action](./menu-actions.md)

To enable the `userActions` plugin in your app, set it to `true` in `Devvit.configure()`:

```tsx
Devvit.configure({
  redditAPI: true,
  userActions: true,
});
```

After enabling `userActions`, you can call certain Reddit APIs on behalf of the user by passing in the option `runAs: 'USER'`.
Currently, the only APIs which support this option are:

- [submitPost()](../api/redditapi/RedditAPIClient/classes/RedditAPIClient.md#submitpost)
- [submitComment()](../api/redditapi/RedditAPIClient/classes/RedditAPIClient.md#submitcomment)

If the `runAs` option is not specified, then the API will use `runAs: 'APP'` by default.

:::note
Both `redditAPI` and `userActions` must be enabled to call Reddit APIs with `runAs: 'USER'`.
:::

## Requirements

When setting the option `runAs: 'USER'`, the app version installed to the subreddit must be approved in order for the post or comment to be attributed to the user.

If the app is being playtested or if the installed app version has not yet been approved, actions will be attributed to the app account by default.

The exception to this behavior is if the app owner takes the action. User actions taken by the app owner will be attributed to the app owner's username.

## The `userGeneratedContent` option

When submitting an interactive post on behalf of the user, you must specify the option `userGeneratedContent` in addition to `runAs: 'USER'`.
The `userGeneratedContent` option represents text or images submitted by the user that may be displayed in the post.

Below is an example app that uses a form to prompt the user for their favorite color, then submits a post displaying the user's text input.

<details><summary>'Favorite Color' App Example</summary>

```tsx
import {
  Devvit,
  getCurrentSubredditName,
  getCurrentUsername,
  useForm,
  useState,
  submitPost,
} from '@devvit/public-api';

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
    const post = await submitPost({
      title: `What's your favorite color?`,
      subredditName: await getCurrentSubredditName(),
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
        const currentUsername = await getCurrentUsername();
        const currentSubreddit = await getCurrentSubredditName();

        const post = await submitPost({
          title: `u/${currentUsername}'s favorite color is...`,
          subredditName: currentSubreddit,
          preview: loadingPreview,
          runAs: 'USER',
          userGeneratedContent: { text: submittedFavColor, imageUrls: [] },
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

</details>
