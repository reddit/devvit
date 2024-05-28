# Caching helper

Create a short-term cache in your app.

:::note
This feature is experimental, which means the design not final but it's still available for you to use.
:::

The cache helper will let you cache JSON objects in your devvit apps for a limited amount of time. Under the covers, It's Redis plus a local in-memory write-through cache. This provides a pattern for e.g. fetching data without involving a scheduler, and allows granular, small TTLs (like 1 second).

This is probably a better fit for your in-app caching needs than using scheduler or interval to fetch!

```tsx
let component = (context) => {
  let cached = context.cache(
    async () => {
      let rsp = await fetch('https://example.com');
      return rsp.body;
    },
    {
      key: 'some-fetch',
      ttl: 10_000, // millis
    }
  );

  doSomethingWith(cached);
  return <text>yay</text>;
};
```

There are only two properties:

`key` is used to specify a specific item to be cached (i.e. if you have two function calls to cache that share a key, they will return the same value with the same lifetime).

`ttl` specifies "time-to-live", the duration of how long the cached item is retained for.
