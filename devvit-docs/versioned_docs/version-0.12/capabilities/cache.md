# Cache helper

Cache helper lets you build a more performant app by reducing the number of server side calls for the same data. You can create a short-term cache that stores JSON objects in your Devvit app for a limited amount of time. This is valuable when you have many clients trying to get the same data for example with a stock ticker value or with a sports score.

Under the covers, it's Redis plus a local in-memory write-through cache. This provides a pattern for fetching data without involving a scheduler and allows granular, small TTLs (1 second~). Cache helper lets the app make one request for the data, save the response, and provide this response to all users requesting the same data.

:::warning
**Do not cache sensitive information**. Cache helper randomly selects one user to make the real request and saves the response to the cache for others to use. You should only use cache helper for non-personalized fetches, since the same response is available to all users.
:::

## Usage

You need to enable [Redis](./redis.md) in order to use Cache helper.

```tsx
Devvit.configure({
  redis: true,
  // other capabilities
});
```

## Parameters

| **Parameters** | **Description**                                                                                                                                                                                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`          | This is a string that identifies a cached response. Instead of making a real request, the app gets the cached response with the key you provide. Make sure to use different keys for different data. For example, if you’re saving post-specific data, add the postId to the cache key, like this: `post_data_${postId})`. |
| `ttl`          | Time to live is the number of milliseconds the cached response is expected to be relevant.                                                                                                                                                                                                                                 |

Once it expires, the cached response will be voided and a real request is made to populate the cache again. You can treat it as a threshold, where ttl of 30000 would mean that a request is done no more than once per 30 seconds. |

## Example

Here’s a way to set up in-app caching instead of using scheduler or interval to fetch.

```tsx
import { Devvit, useState } from '@devvit/public-api';

Devvit.configure({
  redis: true,
  http: true, // to use `fetch()`
  // other capabilities
});

Devvit.addCustomPostType({
  name: 'Name',
  render: (context) => {
    const [data, setData] = useState({});

    async function getData() {
      const result = await context.cache(
        async () => {
          const response = await fetch('https://example.com');
          if (!response.ok) {
            throw Error(`HTTP error ${response.status}: ${response.statusText}`);
          }
          return await response.json();
        },
        {
          key: context.userId!,
          ttl: 10_000, // millis
        }
      );

      setData(result);
    }

    return (
      <blocks>
        <button
          onPress={() => {
            getData();
          }}
        >
          Load data
        </button>

        <text>{data.something}</text>
      </blocks>
    );
  },
});

export default Devvit;
```
