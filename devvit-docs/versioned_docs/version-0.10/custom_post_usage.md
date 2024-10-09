# Using custom posts

Want to know more about custom posts? You’re in the right place. This page will help you understand the technical details that go into making a custom post, including:

- Definitions
- Parameters
- Post creation flow

## Definitions

Custom posts need a definition for the post type and the post loading state:

- The `addCustomPostType()` method defines the custom post type.
- The `submitPost()` method instantiates the post and defines the loading state.

The final post is auto-populated from the post template using `submitPost()`.

## Parameters

The `.addCustomPostType(customPostType: CustomPostType)` function has these parameters:

- name of the post type
- description, which is optional
- render to return the UI for the custom post.

:::note
The UI is wrapped in `<blocks>`. If you don’t include them, `<blocks>` will be automatically added.
:::

**Example**

```tsx
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

```tsx
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

## Post creation flow

Once the post can be submitted and instantiated, the post needs a place for users to call it for creation. This example uses the subreddit menu.

The `.addMenuItem(menuItem: MenuItem)` function has these parameters:

- label for the text users will see
- location to indicate where the menu item will be
- onPress handler, which specifies what happens when the menu item is pressed

**Example**

```tsx
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
