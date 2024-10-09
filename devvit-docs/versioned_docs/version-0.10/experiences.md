# Overview

Interactive experiences, like [live scoreboards](./showcase/apps.mdx#livescores), [polls](./showcase/playgrounds.mdx#polls), or [games](./showcase/apps.mdx#bingo), are pretty simple to build.

## What’s supported

|               | Supported                             |
| ------------- | ------------------------------------- |
| **Platform**  | Android, iOS, and web                 |
| **Surface**   | Post details page and subreddit feeds |
| **Media**     | Uploading image files                 |
| **Post type** | One custom post type per project      |

## Templates

Devvit provides two experience post templates:

- `experience-post` to create an experience with blocks.
- `experience-post-pro` to create an experience with blocks and a folder structure scaffolding.

You can also create your own experience post from scratch.

### Definitions

An experience post requires two definitions:

- `addCustomPostType()` defines the experience post type.
- `submitPost()` instantiates the post and defines the loading state.

The final post is auto-populated from the post template using `submitPost()`.

### Parameters

The `.addCustomPostType(customPostType: CustomPostType)` function contains:

- name of the post type
- an optional description
- render to return the UI for the experience post

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

- title for the name of the experience post
- subredditName to show where the post will be instantiated
- preview to provide a lightweight UI that shows while the post renders

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

### Experience creation flow

Once the experience post has been submitted and instantiated, it needs a place for users to call it for creation. This example uses the subreddit menu.

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
    const currentSubreddit = await context.reddit.getCurrentSubreddit();
    await context.reddit.submitPost({
      title: 'My custom post',
      subredditName: currentSubreddit.name,
      preview: (
        <vstack>
          <text>Loading...</text>
        </vstack>
      ),
    });
    context.ui.showToast(`Submitted custom post to ${currentSubreddit.name}`);
  },
});
```

## Next steps

Now that you know what experience posts can do, you can:

- See how easy it is to [build an experience](experience_post.md).
- Start iterating with code in real time in the [playground](playground.md)
- Find components to help you build your experiences in the [blocks](/docs/blocks/overview.mdx) gallery.
