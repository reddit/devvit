import { Devvit } from '@devvit/public-api-next';

Devvit.configure({
  redditAPI: true,
});

Devvit.addCustomPostType({
  name: 'Hello Blocks',
  render: ({ reddit, useState }) => {
    const [currentUsername] = useState(async () => {
      const currentUser = await reddit.getCurrentUser();
      return currentUser.username;
    });

    const [counter, setCounter] = useState(0);

    return (
      <vstack padding="medium" gap="medium" backgroundColor="#FFBEA6" cornerRadius="medium">
        <text style="heading" size="xxlarge">
          Hello, {currentUsername ?? 'stranger'}! 👋
        </text>
        <text size="large">{`Click counter: ${counter}`}</text>
        <button onPress={() => setCounter(counter + 1)}>Click me!</button>
      </vstack>
    );
  },
});

export default Devvit;
