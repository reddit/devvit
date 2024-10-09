# HTTP fetch

Make requests to allow-listed external domains.

Your Devvit app can make network requests to access allow-listed external domains using HTTP Fetch. This enables your app to leverage webhooks, personal servers, and other third-party integrations asynchronously across the network.

## Devvit configure

```ts
import { Devvit } from '@devvit/public-api';

Devvit.configure({
  http: true,
  // other capabilities
});
```

## Limitations

- Access is only allowed to https URIs.
- Supported HTTP methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS` and `PATCH`.
- HTTP timeout limit is 30 seconds.

To request a domain to the allow-list, [please contact us via r/devvit modmail](https://www.reddit.com/message/compose/?to=r%2Fdevvit) or fill out [this form](https://forms.gle/Pn8Eq3RoPcmH1ZJJ7).

## Example

```ts
import { Devvit } from '@devvit/public-api';

Devvit.configure({ http: true });

Devvit.addMenuItem({
  location: 'comment',
  label: 'Sample HTTP request',
  onPress: async (_, context) => {
    console.log(`Comment ID:  ${context.commentId}`);
    const response = await fetch('https://example.com', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: context.commentId }),
    });
    context.ui.showToast(
      `Invoked HTTP request on comment: ${context.commentId}. Completed with status: ${response.status}`
    );
  },
});

export default Devvit;
```

## Troubleshooting

If you see the following error, it means HTTP Fetch requests are hitting the internal timeout limits. To resolve this:

- Use a queue or kick off an async request in your back end. You can use [Scheduler](/docs/capabilities/scheduler.md) to monitor the result.
- Optimize the overall HTTP request latency if you have a self-hosted server.

```ts
HTTP request to domain: <domain> timed out with error: context deadline exceeded.
```

### Terms and Conditions

Any app that uses `fetch` must upload Terms and Conditions and a Privacy Policy. Links to each of these documents must be saved in the app details form.

![App configuration form](../assets/capabilities/http-fetch/http-fetch-legal-links.png)
