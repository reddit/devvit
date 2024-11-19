# Overview

Interactive posts allows you to build apps like [live scoreboards](./showcase/apps.mdx#livescores), [polls](./showcase/playgrounds.mdx#polls), or [community games](./community_games.md) on reddit. This guide will help you understand how to build them effectively.

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
- `web-view-post` to create an interactive post that utilizes webviews [experimental]

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

:::note
Webviews is an experimental feature and currently only works reliably on web.
:::

[Webviews](./webviews.md) lets you use standard web technologies:

- ✅ HTML, CSS, JavaScript
- ✅ Rich multimedia support
- ✅ Advanced animations
- ⚠️ Currently experimental, best on desktop

Perfect for: Games, complex visualizations, rich interactions

You can find some webview example games [here](./webviews.md#examples)

### Should I use blocks or webviews?

Webviews provide more control over app functionality and styling. While webviews is experimental, it offers a more familiar way to build interactive web elements. Developers less familiar with web development may be better off using the blocks framework, which offers Reddit UI components and simplified app architecture. You should use either a webview component or blocks when presenting a UI. Mixing webviews and blocks in the same UI is not recommended; however, you must build a preview of your app using blocks.

## Creating an Interactive Post

### 1. Define Your Post Type with `addCustomPostType`

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
```

### 2. Create Post Submission with `submitPost`

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

## Advanced Features

### Customize the post preview

After your app has been created, you can use `setCustomPostPreview` to update your post preview and customize the loading screen with actual content.

For example, if your post has information about a future event, you could set the preview/loading screen to say how many days away the event is.

```ts
// creation of the post
const daysAwayFromEvent = 3; // would actually be done by checking the date diff, but just hardcoding for this example
const post = await reddit.submitPost({
  title: 'A Countdown post',
  subredditName: subreddit.name,
  preview: (
    <zstack height="100%" width="100%" alignment="center middle">
      <text>The event will start in {daysAwayFromEvent} days</text>
    </zstack>
  ),
});
```

Then you'd create a scheduler to run when the days away count changes:

```ts
Devvit.addSchedulerJob({
  name: 'UpdatePostPreview',
  onRun: async (event, context) => {
    const { reddit } = context;
    const { postId } = event.data!;

    if (!postId) {
      console.error('No post ID provided');
      return;
    }

    const post = await reddit.getPostById(postId);
    const daysAwayFromEvent = 2; // would actually be done by checking the date diff, but just hardcoding for this example
    const newPreview = (
      <vstack height="100%" width="100%" alignment="center middle">
        <text>The event will start in {daysAwayFromEvent} days</text>
      </vstack>
    );

    await post.setCustomPostPreview(() => newPreview);
  },
});
```

How you customize your loading screen is up to you!

## Next steps

Now that you know what interactive posts can do, you can:

- Check out our [webviews](webviews.md) doc if you're already familiar with web development
- Try blocks, using this tutorial to [build an interactive post](interactive_post.md).
- Start iterating with code in real time in the [playground](playground.md)
