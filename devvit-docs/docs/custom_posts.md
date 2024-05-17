# Overview

What is a custom post?

A custom post creates an interactive experience for your community. A custom post can be something like a fun way to welcome community members, a game, or other creative ways to enhance a subreddit’s experience.

![Custom post poll example 1](./assets/custom-posts/custom-posts-overview.png)

Developer Platform provides UI tools that let you create new content types to engage users. Custom posts provide pre-built visual components for text, images, and buttons that can be easily arranged to create unique, interactive content. Custom posts can be:

- Personal: post units can be unique to each user
- Flexible: create and define how you want posts to look
- Interactive: engage with posts directly with buttons and forms
- Stateful and dynamic: create compelling posts that remember the user’s interaction

## How it works

You can add one custom post within your project. After your project is submitted for review and approved, it can be enabled in a subreddit. Once a mod installs the project with a custom post, they can use the custom posts on their subreddits.

## What’s supported

|               | Supported                             |
| ------------- | ------------------------------------- |
| **Platform**  | Android, iOS, and web                 |
| **Surface**   | Post details page and subreddit feeds |
| **Media**     | Uploading image files                 |
| **Post type** | One custom post type per project      |

## Under the hood

This is how custom posts work.

### Definitions

Custom posts need a definition for the post type and the post loading state:

- The `addCustomPostType()` method defines the custom post type.
- The `submitPost()` method instantiates the post and defines the loading state.

The final post is auto-populated from the post template using `submitPost()`.

### Parameters

The `.addCustomPostType(customPostType: CustomPostType)` function has these parameters:

- name of the post type
- description, which is optional
- render to return the UI for the custom post

:::note
The UI is wrapped in `<blocks>`. If you don’t include them, `<blocks>` will be automatically added.
:::

**Example**

```ts
Devvit.addCustomPostType({
  name: 'My Custom Post Type',
  description: 'A big hello text.',
  render: () => {
    return (
      <blocks height="regular">
        <vstack>
          <text style="heading" size="xxlarge">
            Hello!
          </text>
          <button icon="heart" appearance="primary" />
        </vstack>
      </blocks>
    );
  },
});
```

:::note
Check out our extensive [Icon Library](blocks/icon)! These can be used in `<button>`s or on their own as `<icon>`s.
:::

The `submitPost(options: SubmitPostOptions)` function has these parameters:

- title for the name of the custom post
- subredditName to show where the post will be instantiated
- preview to provide a lightweight UI that shows while the post renders.

**Example**

```ts
await reddit.submitPost({
  title: 'My custom post',
  subredditName: currentSubreddit.name,
  preview: (
    <vstack>
      <text>Loading...</text>
    </vstack>
  ),
});
```

### Post creation flow

Once the post can be submitted and instantiated, the post needs a place for users to call it for creation. This example uses the subreddit menu.

The `.addMenuItem(menuItem: MenuItem)` function has these parameters:

- label for the text users will see
- location to indicate where the menu item will be
- onPress handler, which specifies what happens when the menu item is pressed

**Example**

```ts
Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Add a poll',
  onPress: async (_, context) => {
    const { reddit, ui } = context;
    const currentSubreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: 'My custom post',
      subredditName: currentSubreddit.name,
      preview: (
        <vstack>
          <text>Loading...</text>
        </vstack>
      ),
    });
    ui.showToast(`Submitted custom post to ${currentSubreddit.name}`);
  },
});
```

## Next steps

Now that you know what custom posts can do, you can:

- Start iterating with code in real time in the [playground](playground.md)
- Use the [project guide](custom_post_project_guide.md) to learn how to build a custom post.

You can also find components to help you build your custom posts in the Reddit Blocks gallery.
