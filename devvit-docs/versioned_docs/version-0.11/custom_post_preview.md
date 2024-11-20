# Customize the post preview

After your app has been created, you can use `setCustomPostPreview` to update your post preview and customize the loading screen with actual content.

For example, if your post has information about a future event, you could set the preview/loading screen to say how many days away the event is.

```ts
// creation of the post
const daysAwayFromEvent = 3; // would actually be done by checking the date diff, but just hardcoding for this example
const post = await reddit.submitPost({
  title: 'A Countdown post',
  subredditName: subreddit.name,
  preview: (
    <zstack height="100%" width="100%" alignment="center middle">
      <text>The event will start in {daysAwayFromEvent} days</text>
    </zstack>
  ),
});
```

Then you'd create a [scheduler](./capabilities/scheduler.md) to run when the days away count changes:

```ts
Devvit.addSchedulerJob({
  name: 'UpdatePostPreview',
  onRun: async (event, context) => {
    const { reddit } = context;
    const { postId } = event.data!;

    if (!postId) {
      console.error('No post ID provided');
      return;
    }

    const post = await reddit.getPostById(postId);
    const daysAwayFromEvent = 2; // would actually be done by checking the date diff, but just hardcoding for this example
    const newPreview = (
      <vstack height="100%" width="100%" alignment="center middle">
        <text>The event will start in {daysAwayFromEvent} days</text>
      </vstack>
    );

    await post.setCustomPostPreview(() => newPreview);
  },
});
```

How you customize your loading screen is up to you!
