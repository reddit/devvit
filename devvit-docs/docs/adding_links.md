# Adding links

Add links to Reddit content or other websites.

Use the `navigateTo` function to create a link in Blocks that directs a user to internal Reddit content or an external website. This works across both mobile clients and desktop browsers.

## Linking to Reddit content

To link your users to a specific subreddit, post, or comment, you can link to the reddit URL of the content. Alternatively, if you need to link to fetched reddit content, you can pass the object to the `navigateTo` parameter. This example links to a specific comment.

#### Example

```tsx
import { Devvit } from '@devvit/public-api';

Devvit.addCustomPostType({
  name: 'Name',
  render: (context) => {
    return (
      <vstack gap={'small'} padding={'small'}>
        <text>Reddit Comment:</text>
        <button
          onPress={async () =>
            context.ui.navigateTo(await context.reddit.getCommentById('t1_k3bcwn6'))
          }
        >
          Comment: r/blockstesting: Scoreboard - Comment
        </button>
      </vstack>
    );
  },
});

export default Devvit;
```

The next example links using a comment object.

:::note
The app account may not have access to the content, so we recommend checking if the object exists before linking.
:::

## Linking to external content

To link your users to an external URL (like a YouTube video), you’ll include this URL. Users will see a confirmation dialog before going to the external URL.

![Confirmation dialog for external links](./assets/capabilities/adding-links/adding-links-external-link-dialog.png)

#### Example

```tsx
import { Devvit } from '@devvit/public-api';

Devvit.addCustomPostType({
  name: 'Name',
  render: (context) => {
    const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    return (
      <vstack gap={'small'} padding={'small'}>
        <text>Offsite Links:</text>
        <button onPress={() => context.ui.navigateTo(YOUTUBE_URL)}>Youtube</button>
      </vstack>
    );
  },
});

export default Devvit;
```

## Limitations

`navigateTo` is not supported in [playground](https://developers.reddit.com/play).
