import { Devvit } from '@devvit/public-api';
import CustomPostComponent = Devvit.CustomPostComponent;

export const Preview: CustomPostComponent = (): JSX.Element => {
  return (
    <blocks height={'tall'}>
      <vstack alignment={'center middle'} grow>
        <image url={'Snoo_Keychain.png'} imageWidth={64} imageHeight={64} />
        <text style={'heading'}>Icon Gallery</text>
      </vstack>
    </blocks>
  );
};
