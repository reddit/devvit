import { Devvit } from '@devvit/public-api-next';

Devvit.configure({
  redditAPI: true,
});

Devvit.addCustomPostType({
  name: 'Hello Blocks',
  initialState: async ({ reddit }) => {
    const currentUser = await reddit.getCurrentUser();

    return {
      username: currentUser.username,
      counter: 0,
    };
  },
  render: ({ state }) => {
    return (
      <vstack padding="medium" gap="medium" backgroundColor="#FFBEA6" cornerRadius="medium">
        <text style="heading" size="xxlarge">
          Hello, {state.username ?? 'stranger'}! 👋
        </text>
        <text size="large">{`Click counter: ${state.counter}`}</text>
        <button
          onPress={() => {
            state.counter += 1;
          }}
        >
          Click me!
        </button>
      </vstack>
    );
  },
});

export default Devvit;
