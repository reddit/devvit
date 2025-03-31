# Overview

Interactive posts allow you to build apps like [live scoreboards](./showcase/apps.mdx#livescores), [polls](./showcase/playgrounds.mdx#polls), or [community games](./community_games.md) on Reddit. This guide will help you understand how to build them effectively.

## What’s supported

|               | Supported                             |
| ------------- | ------------------------------------- |
| **Platform**  | Android, iOS, and web                 |
| **Surface**   | Post details page and subreddit feeds |
| **Media**     | Uploading image files                 |
| **Post type** | One custom post type per project      |

## Templates

Devvit provides two interactive post templates:

- `blocks-post` to create an interactive post with blocks.
- `web-view-post` to create an interactive post that uses web views.

You can also create your own interactive post from scratch.

### Devvit blocks

[Blocks](./blocks/overview.mdx) is a Reddit native declarative UI framework that provides:

- ✅ Reddit-styled components
- ✅ Cross-platform compatibility
- ✅ Optimized for performance
- ✅ Simple, declarative syntax

Perfect for: Polls, scoreboards, simple & fast interactive games

You can see code examples of apps built with blocks [here](./showcase/apps.mdx) or in our [playground](https://developers.reddit.com/play).

### Webviews

[Webviews](./webviews.md) lets you use standard web technologies:

- ✅ HTML, CSS, JavaScript
- ✅ Rich multimedia support
- ✅ Advanced animations

Perfect for: Games, complex visualizations, rich interactions

You can find some webview example games [here](./webviews.md#examples)

# Should I use blocks or webviews?

Here’s a comparison between the two:

| Feature                                    | Webviews | Blocks |
| ------------------------------------------ | -------- | ------ |
| Uses Reddit design system                  | ❌       | ✅     |
| Optimized for in-feed experience           | ❌       | ✅     |
| Rich multimedia (animations, video, audio) | ✅       | ❌     |
| Advanced gestures                          | ✅       | ❌     |

**Choose blocks if you:**

- Want a Reddit-native look and feel
- Prefer a simpler, more constrained API
- Need optimal feed performance

**Choose webviews if you:**

- Are experienced with web development
- Need rich multimedia or advanced interactions
- Want full control over styling and behavior

## Creating an interactive post

### 1. Define your post type with `addCustomPostType`

The `.addCustomPostType(customPostType: CustomPostType)` function contains:

- name of the post type
- an optional description
- render to return the UI for the interactive post using:
  - [blocks](./blocks/overview.mdx), or
  - the [webviews](webviews.md) component, which looks for files in the project’s `webroot/` directory

:::note
The UI is wrapped in `<blocks>`. If you don’t include them, `<blocks>` will be automatically added.
:::

```ts
// blocks
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

// webviews
Devvit.addCustomPostType({
 name: 'My Custom Post Type',
 description: 'A big hello text.',
 render: () => {
   return (
     <blocks height="regular">
       <webview page="index.html">
     </blocks>
   );
 },
});

```

### 2. Add a menu item to create your post

Once the interactive post has been submitted and instantiated, it needs a place for users to call it for creation. This example uses the subreddit menu.

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

### 3. Create post submission with `submitPost`

The `submitPost(options: SubmitPostOptions)` function has these parameters:

- title for the name of the interactive post
- subredditName to show where the post will be instantiated
- preview to provide a lightweight UI that shows while the post renders (required)

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

## Next steps

Now that you know what interactive posts can do, you can:

- Try blocks, using our [quickstart to build an interactive post](./quickstart.mdx).
  - Read our [blocks overview](./blocks/overview.mdx)
- Check out our [webviews](webviews.md) doc if you're already familiar with web development
- Start iterating with code in real time in the [playground](playground.md)
