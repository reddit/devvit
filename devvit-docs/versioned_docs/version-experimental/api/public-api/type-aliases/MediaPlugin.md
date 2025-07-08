[**@devvit/public-api v0.11.18-dev**](../README.md)

---

# Type Alias: MediaPlugin

> **MediaPlugin** = `object`

## Methods

<a id="upload"></a>

### upload()

> **upload**(`opts`): `Promise`\<[`MediaAsset`](MediaAsset.md)\>

Uploads media from external URL to Reddit

#### Parameters

##### opts

[`UploadMediaOptions`](UploadMediaOptions.md)

#### Returns

`Promise`\<[`MediaAsset`](MediaAsset.md)\>

A Promise that resolves to a MediaAsset object.

#### Example

```ts
const response = await context.media.upload({
  url: 'https://media2.giphy.com/media/xTiN0CNHgoRf1Ha7CM/giphy.gif',
  type: 'gif',
});
await context.reddit.submitPost({
  subredditName: subreddit.name,
  title: 'Hello World with Media',
  richtext: new RichTextBuilder()
    .image({ mediaId: response.mediaId })
    .codeBlock({}, (cb) => cb.rawText('This post was created from a Devvit App')),
});
```
