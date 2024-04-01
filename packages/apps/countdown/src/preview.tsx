import { Devvit } from '@devvit/public-api';

export const Preview = (): JSX.Element => {
  return (
    <blocks height={'regular'}>
      <vstack alignment={'center middle'} grow>
        <image url={'Snoo_Keychain.png'} imageWidth={64} imageHeight={64} />
        <text style={'heading'}>Countdown</text>
      </vstack>
    </blocks>
  );
};
