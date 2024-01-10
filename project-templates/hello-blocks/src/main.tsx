import { Devvit } from '@devvit/public-api';

// Define what packages you want to use here
// Others include:
// kvStore: a simple key value store for persisting data across sessions within this installation
// media: used for importing and posting images
Devvit.configure({
  redditAPI: true, // context.reddit will now be available
});

/*
 * Use a menu action to create a custom post
 */
Devvit.addMenuItem({
  label: 'New custom post',
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
     * Submits the custom post to the specified subreddit
     */
    await reddit.submitPost({
      // This will show while your custom post is loading
      preview: (
        <vstack padding="medium" cornerRadius="medium">
          <text style="heading" size="medium">
            Loading custom post hello world...
          </text>
        </vstack>
      ),
      title: `${subreddit.name} Hello Custom Post`,
      subredditName: subreddit.name,
    });

    ui.showToast({
      text: `Successfully created a Hello World custom post!`,
      appearance: 'success',
    });
  },
});

Devvit.addCustomPostType({
  name: 'Hello Blocks',
  /**
   * You can optionally set the height of your post between 'regular' (320px) and 'tall' (512px)
   */
  height: 'regular',
  /*
   * The render function defines the custom post layout during rendering.
   * It is called on load and after every user interaction (e.g. button click)
   *
   * Here, we simply use the context object directly, as opposed to how we
   * handled it above in `onPress`.
   */
  render: (context) => {
    /*
     * context.useState allows you to create local variables that persist between renders
     * This data will reset on eaech page refresh. If you want to persist data across sessions,
     * you can use the Context.kVStore.
     */

    const [currentUsername] = context.useState(async () => {
      // Use the reddit API wrapper to get the current user name
      const currentUser = await context.reddit.getCurrentUser();
      return currentUser.username;
    });

    /*
     * Calls to useState return the variable and a setter function
     * you can use to update the value between renders.
     * Below, we will use setCounter to increment the counter on every button press
     */
    const [counter, setCounter] = context.useState(0);

    // Your custom post layout goes here!
    return (
      <vstack padding="medium" cornerRadius="medium" gap="medium" alignment="middle">
        <text style="heading" size="xxlarge">
          Hello, {currentUsername ?? 'stranger'}! 👋
        </text>
        <text size="large">{`Click counter: ${counter}`}</text>
        <button appearance="primary" onPress={() => setCounter((counter) => counter + 1)}>
          Click me!
        </button>
      </vstack>
    );
  },
});

export default Devvit;
