# User actions

User actions allow your app to perform certain actions—such as creating posts, comments, or subscribing to subreddits—on behalf of the user, rather than the app account. This enables stronger user engagement while ensuring user control and transparency.

---

## What are user actions?

By default, apps make posts or comments using their associated app account. With user actions enabled, your app can:

- Create posts or comments on behalf of the user (from the post UI, a form, or a menu action)
- Subscribe the user to the current subreddit

---

## Guidelines

To ensure a positive user experience and compliance with Reddit policies:

- **Be transparent:** Inform users and show them the content that will be posted on their behalf.
- **Provide user control:** Users must opt in to allow the app to post on their behalf. If opt-in is persistent, make it clear how users can opt out.

:::note
Apps using user actions must follow these guidelines to be approved.
:::

---

## How it works

- **Unapproved/playtest apps:**
  - `runAs: 'USER'` will operate from the app account unless the app owner takes the action.
  - User actions taken by the app owner will be attributed to the app owner's username.
- **Approved apps:**
  - After publishing and approval, `runAs: 'USER'` will operate on behalf of the user for all users.

---

## Enabling user actions

To enable user actions, add the required permissions to your `devvit.json`:

```json title="devvit.json"
"permissions": {
  "reddit": {
    "asUser": [
      "SUBMIT_POST",
      "SUBMIT_COMMENT",
      "SUBSCRIBE_TO_SUBREDDIT"
    ]
  }
}
```

After enabling, you can call certain Reddit APIs on behalf of the user by passing the option `runAs: 'USER'`.

Currently, the following APIs support this option:

- [submitPost()](../../api/redditapi/RedditAPIClient/classes/RedditAPIClient.md#submitpost)
- [submitComment()](../../api/redditapi/RedditAPIClient/classes/RedditAPIClient.md#submitcomment)

If `runAs` is not specified, the API will use `runAs: 'APP'` by default.

---

## Parameters

| Parameter              | Description                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `runAs`                | The type of account to perform the action on behalf of: `'USER'` or `'APP'`. Defaults to `'APP'`.                        |
| `userGeneratedContent` | Text or images submitted by the user. Required for `submitPost()` with `runAs: 'USER'` for safety and compliance review. |

:::note
Apps that use `submitPost()` with `runAs: 'USER'` require `userGeneratedContent` to be approved by Reddit.
:::

---

## Example: Submit a post as the user

This example uses a form to prompt the user for input and then submits a post as the user.

```tsx title="server/index.ts"
import { reddit } from '@devvit/web/server';

// ...

router.post('/internal/post-create', async (_req, res) => {
  const { subredditName } = context;
  if (!subredditName) {
    res.status(400).json({ status: 'error', message: 'subredditName is required' });
    return;
  }

  reddit.submitPost({
    runAs: 'USER',
    userGeneratedContent: {
      text: "Hello there! This is a new post from the user's account",
    },
    subredditName,
    title: 'Post Title'
     entry: 'default',
  });

  res.json({ status: 'success', message: `Post created in subreddit ${subredditName}` });
});
```

---

## Example: Subscribe to subreddit

The subscribe API does not take a `runAs` parameter; it subscribes as the user by default (if specified in `devvit.json` and approved).

```ts
import { reddit } from '@devvit/web/server';

await reddit.subscribeToCurrentSubreddit();
```

:::note
There is no API to check if the user is already subscribed to the subreddit. You may want to store the subscription state in Redis to provide contextually aware UI.
:::

---

## Best practices

- Always inform users before posting or commenting on their behalf.
- Require explicit user opt-in for all user actions.
- Use `userGeneratedContent` for all user-submitted posts.
- Store user consent and subscription state if needed for your app's UX.
- Follow Reddit's safety and compliance guidelines for user-generated content.
