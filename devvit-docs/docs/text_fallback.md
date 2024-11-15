# Text fallback for older platforms

Some surfaces (like old.reddit) don’t render interactive posts. To remedy this, use textFallback to ensure that you can specify the text for the instances when Devvit cannot render your post. You can do this with a text string or in rich text.

## Use a text string

```tsx
const post = await reddit.submitPost({
  title: 'Devvit post with text fallback',
  subredditName: subreddit.name,
  textFallback: { text: 'This is a text fallback' },
  preview: (
    <vstack height="100%" width="100%" alignment="middle center">
      <text size="large">View me in old.reddit!</text>
    </vstack>
  ),
});
```

**Example**

![text string fallback](./assets/fallback_text_string.png)

## Use a text string with markdown

```tsx
const post = await reddit.submitPost({
  title: 'Devvit post with markdown text fallback',
  subredditName: subreddit.name,
  textFallback: {
    text: '**[Check out the developer platform docs](https://developers.reddit.com/docs/)**',
  },
  preview: (
    <vstack height="100%" width="100%" alignment="middle center">
      <text size="large">View me in old.reddit!</text>
    </vstack>
  ),
});
```

**Example**

![text string fallback](./assets/fallback_markdown.png)

## Use rich text

```tsx
const textFallbackRichtext = new RichTextBuilder()
  .heading({ level: 1 }, (h) => {
    h.rawText('Yay for text fallbacks!');
  })
  .codeBlock({}, (cb) => cb.rawText('This post was created via the Devvit API.'));

const post = await reddit.submitPost({
  title: 'Devvit post with richtext fallback',
  subredditName: subreddit.name,
  textFallback: { richtext: textFallbackRichtext },
  preview: (
    <vstack height="100%" width="100%" alignment="middle center">
      <text size="large">View me in old.reddit!</text>
    </vstack>
  ),
});
```

**Example**

![text string fallback](./assets/fallback_richtext.png)

## Update a post’s text fallback

The post author can edit and update text fallback content after it’s been created. To do this, call post.setTextFallback with the desired fallback content.

```tsx
// from a menu action, form, scheduler, trigger, custom post click event, etc
const newTextFallback = { text: 'This is an updated text fallback' };
const post = await context.reddit.getPostById(context.postId);
await post.setTextFallback(newTextFallback);
```
