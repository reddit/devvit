# Image Uploads

You can upload an image via Devvit and embed it in a post or comment using rich-text builder.

## Devvit configure

```ts
import { Devvit } from '@devvit/public-api-old';

const media = Devvit.use(Devvit.Types.MediaService);
```

## Limitations

- Images must be 20 MB or less.
- Image uploads don’t work in Developer Studio, but you can use `devvit upload` to check your app in a test subreddit.

## Example

```ts
import { Devvit, Context } from '@devvit/public-api-old';

const media = Devvit.use(Devvit.Types.MediaService);
const links = Devvit.use(Devvit.Types.RedditAPI.LinksAndComments);

Devvit.addAction({
  context: Context.SUBREDDIT,
  name: 'Post with Media',
  description: 'Uploads external image and creates a post with media',
  handler: async (event, metadata) => {
    const { subreddit } = event;
    try {
      const response = await media.Upload(
        {
          url: 'https://media2.giphy.com/media/xTiN0CNHgoRf1Ha7CM/giphy.gif',
          type: 'gif',
        },
        metadata
      );
      await links.Submit(
        {
          richtextJson: JSON.stringify({
            document: [
              {
                c: [
                  {
                    e: 'text',
                    t: 'Hello World!',
                  },
                ],
                e: 'par',
              },
              {
                e: 'img',
                id: response.mediaId,
              },
            ],
          }),
          sr: subreddit!.displayName!,
          kind: 'self',
          title: 'Post with Embedded Media',
        },
        metadata
      );
      return {
        success: true,
        message: `created post with media: ${response.mediaId}`,
      };
    } catch (err) {
      throw new Error(`Error uploading media: ${err}`);
    }
  },
});

export default Devvit;
```
