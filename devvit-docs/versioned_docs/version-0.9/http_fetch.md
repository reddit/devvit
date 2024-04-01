# HTTP fetch

Your Devvit app can make network requests to access allow-listed external domains using HTTP Fetch. This enables your app to leverage webhooks, personal servers, and other third-party integrations asynchronously across the network.

## Global type

```ts
import { Devvit } from '@devvit/public-api';

Devvit.use(Devvit.Types.HTTP);
```

## Limitations

- Access is only allowed to https URIs.
- Supported HTTP methods: GET, POST, PUT, DELETE, OPTIONS and PATCH.
- Fetching from domains that do not have CORS mode enabled will not work in Developer Studio.

To request a domain to the allow-list, [please contact us via r/devvit modmail](https://www.reddit.com/message/compose/?to=r%2Fdevvit) or fill out [this form](https://forms.gle/Pn8Eq3RoPcmH1ZJJ7).

## Before you begin

Make sure you have the latest Devvit CLI version.

```ts
// Get the latest CLI version

npm install -g devvit

```

## Example

```ts
import { Context, Devvit } from '@devvit/public-api';
Devvit.use(Devvit.Types.HTTP);

Devvit.addAction({
  context: Context.COMMENT,
  name: 'Sample HTTP request',
  description: 'Sending request to example.com',
  handler: async (event) => {
    const { comment } = event;
    console.log(`Comment text:  ${comment?.body}`);
    const response = await fetch('https://example.com', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: comment?.body }),
    });
    return {
      success: true,
      message: `Invoked HTTP request on comment: ${comment?.body}. Completed with status: ${response.status}`,
    };
  },
});

export default Devvit;
```
