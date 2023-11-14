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
  label: 'New Image Example Post',
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

    // Your custom post layout goes here!
    return (
      <vstack padding="medium" cornerRadius="medium" gap="medium" alignment="middle">
        <text style="heading" size="xxlarge">
          Hello, {currentUsername ?? 'stranger'}! 👋
        </text>
        <hstack padding="medium" gap="medium" alignment="middle">
          <vstack>
            <text style="heading" size="large">
              Image
            </text>
            <image
              url="https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png"
              imageHeight={100}
              imageWidth={100}
            ></image>
          </vstack>
          <vstack>
            <text style="heading" size="large">
              SVG URL
            </text>
            <image
              url='data:image/svg+xml,  
              <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
              <circle fill="gold" stroke="maroon" stroke-width="2px" cx="5" cy="5" r="4" />
            </svg>
            '
              imageHeight={100}
              imageWidth={100}
            ></image>
          </vstack>
          <vstack>
            <text style="heading" size="large">
              SVG Base64
            </text>
            <image
              url="data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAgMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICAgICAgICAgICAgPGNpcmNsZSBmaWxsPSJnb2xkIiBzdHJva2U9Im1hcm9vbiIgc3Ryb2tlLXdpZHRoPSIycHgiIGN4PSI1IiBjeT0iNSIgcj0iNCIgLz4KICAgICAgICAgICAgPC9zdmc+"
              imageHeight={100}
              imageWidth={100}
            ></image>
          </vstack>
          <vstack>
            <text style="heading" size="large">
              SVG URL Encoded
            </text>
            <image
              url="data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2010%2010%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Ccircle%20fill%3D%22gold%22%20stroke%3D%22maroon%22%20stroke-width%3D%222px%22%20cx%3D%225%22%20cy%3D%225%22%20r%3D%224%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2Fsvg%3E"
              imageHeight={100}
              imageWidth={100}
            ></image>
          </vstack>
        </hstack>
      </vstack>
    );
  },
});

export default Devvit;
