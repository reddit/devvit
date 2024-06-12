{{&mainSrc}}

// Define what packages you want to use here
// Others include:
// kvStore: a simple key value store for persisting data across sessions within this installation
// media: used for importing and posting images
Devvit.configure({
  redditAPI: true, // context.reddit will now be available
});

/*
 * Use a menu action to create a new post
 */
Devvit.addMenuItem({
  label: 'New experience',
  location: 'subreddit',
  /*
   * _ tells Typescript we don't care about the first argument
   * The second argument is a Context object--here we use object destructuring to
   * pull just the parts we need. The code below is equivalient
   * to using context.reddit and context.ui
   */
  onPress: async (_, { reddit, ui }) => {
    const subreddit = await reddit.getCurrentSubreddit();

    /*
     * Submits the post to the specified subreddit
     */
    await reddit.submitPost({
      // This will show while your post is loading
      preview: (
        <vstack padding="medium" cornerRadius="medium">
          <text style="heading" size="medium">
            Loading hello world post...
          </text>
        </vstack>
      ),
      title: `${subreddit.name} Hello World`,
      subredditName: subreddit.name,
    });

    ui.showToast({
      text: `Successfully created a Hello World post!`,
      appearance: 'success',
    });
  },
});
