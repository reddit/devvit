import { Devvit } from '@devvit/public-api';

export const App = (context: Devvit.Context): JSX.Element => {
  return (
    <vstack padding="medium" cornerRadius="medium" gap="medium" alignment="middle">
      <text style="heading" size="xxlarge">
        Hello, world! 👋
      </text>
      <button appearance="primary" onPress={() => context.ui.showToast('Thank you!')}>
        Click me!
      </button>
    </vstack>
  );
};
