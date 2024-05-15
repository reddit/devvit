## DevvTools
Developer tools for your Devvit app.

### Capabilities
 - Actions toolbar
 - Mock API requests
 - Dev/Prod switch


### Installation

Add the line `import { DevvTools } from '@devvit/kit';` in the beginning of your root component.

### Actions toolbar
Create the wrapper component with `DevvTools.toolbar`.
```typescript jsx
  const ActionToolbarWrapper = DevvTools.toolbar({
  context,
  mode: DevvToolsMode.Dev, // change that to DevvToolsMode.Prod when app is ready be published  
});
```

Create actions for your app with `devAction`.
```typescript jsx
  const developerActions = [
    devAction('Reset data', async () => {
      await context.redis.set('gameData', '');
    }),
];
```

Wrap your root element with `ActionToolbarWrapper`.
```typescript jsx
<ActionToolbarWrapper actions={developerActions}>
  ... // your root app element
</ActionToolbarWrapper>
```

### API mocks
With custom handler functions, you can override the response for any API call, such as 
Redis, RedditAPI, or HTTP request.  
- In Dev mode (`DevvToolsMode.Dev`), handlers are applied for all requests with the matching method and ID (if available).  
- In Prod mode (`DevvToolsMode.Prod`), handlers are ignored.

#### Setup
Create devv versions for the API you're using.

```typescript
const { devvRedis, devvRedditApi, devvFetch } = DevvTools.api({
  context,
  mode: DevvToolsMode.Dev,
  handlers: [
    redisHandler.get('mocked_key', () => 'Value from mocks!'),
    httpHandler.get('https://example.com', () => httpResponse.ok({ fetched: 'mock' })),
    redditApiHandler.getSubredditById((id: string) => ({ name: `mock_${id}` })),
  ],
});
```

Use devv versions in your app.
```typescript
const redisValue = await devvRedis.get('mocked_key'); // "Value from mocks!"
const fetchedValue = await (await devvFetch('https://example.com')).json(); // {fetched: "mock"}
const redditApiValue = (await devvRedditApi.getSubredditById('t5_123')).name; // "mock_t5_123"
```
