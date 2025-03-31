# Image uploads

Include images that are 20 MB or less in your app.

You can embed the image in a post or comment and use rich-text builder to format the text heading, paragraph, code block, and more. There are two ways to upload an image: using a template or starting from scratch.

## How to use image upoads

:::note
You can copy this [template](https://github.com/reddit/devvit/tree/main/packages/cli/src/templates/image-uploads) using image-upload.
:::

1. From the terminal, navigate to a directory where you'd like to store your code.
2. Enter the following command to create the app.

```ts
devvit new <your-app-name>
```

3. Configure `Devvit` to allow media

```ts
Devvit.configure({
  media: true,
  // other capabilities
});
```

4. Use `context.media.upload()` to upload images/gifs to your app.

```ts
await context.media.upload({
  url: 'https://media2.giphy.com/media/xTiN0CNHgoRf1Ha7CM/giphy.gif',
  type: 'gif',
});
```

You can use the code snippet below as a starting point:

<details><summary>Code example</summary>

```ts
import { Devvit, RichTextBuilder } from '@devvit/public-api';

Devvit.configure({ media: true, redditAPI: true });

Devvit.addMenuItem({
  location: 'comment',
  label: 'Reply with GIF',
  onPress: async (event, context) => {
    console.log(`Invoked action on comment ${event.targetId}`);
    try {
      const response = await context.media.upload({
        url: 'https://media2.giphy.com/media/xTiN0CNHgoRf1Ha7CM/giphy.gif',
        type: 'gif',
      });
      await context.reddit.submitComment({
        id: event.targetId, // where context menu action was invoked
        text: 'Hello World with Media',
        richtext: new RichTextBuilder()
          .image({ mediaId: response.mediaId })
          .codeBlock({}, (cb) => cb.rawText('This comment was created from a Devvit App')),
      });
    } catch (err) {
      throw new Error(`Error uploading media: ${err}`);
    }
  },
});

export default Devvit;
```

</details>

## Test your app

Use `devvit upload` to check your app in a test subreddit.
