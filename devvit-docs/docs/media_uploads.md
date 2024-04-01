# Image uploads

Include images that are 20 MB or less in your app.

You can embed the image in a post or comment and use rich-text builder to format the text heading, paragraph, code block, and more.

There are two ways to upload images:

- Use a template
- Start from scratch

## Use a template

Using a template is the easiest way to upload your image. You can use a simple template or dive into a more complex template depending on your needs and comfort level.

### Easy

Use the simple `image-uploads` template to create a new app.

1. From the terminal, navigate to a directory where you'd like to store your code.
2. Enter the following command to create the app.

```ts
devvit new <your-app-name> --template=image-uploads
```

This will create a template that uses `Devvit.addMenuItem` to allow the user reply to a comment with the defined gif.

## Start from scratch

If you’re starting from scratch, configure Devvit to allow media, and then use `devvit.addMenuItem` to design your image upload.

1. From the terminal, navigate to a directory where you'd like to store your code.
2. Enter the following command to create the app.

```ts
devvit new <your-app-name>
```

3. Add this snippet to main.ts.

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

## Test your app

Use `devvit upload` to check your app in a test subreddit (image uploads won’t work in Developer Studio).
